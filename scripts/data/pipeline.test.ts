import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { publish } from './build-public.ts';
import { loadDataPack, validatePack, validateStatistic, validateLegislation, createValidator } from './validate.ts';
import { refresh } from './refresh.ts';
import { buildSearch, collectSourceIds, sha256, toCsv } from './normalize.ts';
import { normalizeSource } from '../../src/domain/evidence.ts';
import { normalizeStatus } from '../../src/domain/status.ts';
import type { SourceRecord, LegislationSet, SearchRow } from '../../src/domain/types.ts';
import { SourceClient } from './sources/http.ts';
import type { Capture } from './sources/http.ts';
import { parseLegislationRow, refreshLegislation } from './sources/legislation.ts';
import { saveRefreshStatus } from './refresh-status.ts';
import { routes as applicationRoutes } from '../../src/app/route-manifest.ts';

const source: SourceRecord = { id: 'cavinti-ordinances-index', name: 'Official ordinances', tier: 'primary-lgu', url: 'https://example.test/ordinances', dataUrl: 'https://example.test/ordinancesData', adapter: 'municipal-legislation-datatables/v1', formats: ['HTML', 'JSON', 'PDF'], retrievalStatus: 'public endpoint returned HTTP 200', coverage: 'Metadata only; attachments not reviewed.' };
const cells = ['<div><span>No. 001-2026</span><span>Public</span></div>', '<span>EXACT &amp; ORIGINAL “TITLE”</span>', '<span>By: HON. A</span>', '<span>FINANCE</span><span>RULES</span>', '<span>Jan 1, 2026</span>', '<a href="/001.pdf">Download</a>'];
const oldRow = { ...parseLegislationRow(cells, 'ordinance', source, 1), recordId: 'ordinance:old-source-row:1' };
const previous: LegislationSet = { schemaVersion: 'civic-legislation-record-set/v1', documentType: 'ordinance', municipality: 'Test municipality', retrievedAt: '2026-01-01', sourceIndexUrl: source.url, sourceFeedUrl: source.dataUrl!, sourceId: source.id, sourceFeedSha256: 'a'.repeat(64), recordsTotal: 1, recordsFiltered: 1, recordCount: 1, recordScope: 'Complete metadata capture; attachments unreviewed', records: [oldRow] };
class FixtureClient extends SourceClient {
  private responder: (url: string, method: 'GET' | 'HEAD') => Capture;
  constructor(responder: (url: string, method: 'GET' | 'HEAD') => Capture) { super(); this.responder = responder; }
  override async capture(url: string, method: 'GET' | 'HEAD' = 'GET'): Promise<Capture> { return this.responder(url, method); }
}
function capture(url: string, payload: unknown, contentType = 'application/json'): Capture {
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return { url, finalUrl: url, status: 200, contentType, retrievedAt: '2026-10-21T12:00:00Z', sourceDate: null, sha256: sha256(body), body };
}

test('full reviewed snapshot publishes every JSON byte, all 4898 legislative rows, schemas and CSVs', async () => {
  const pack = await loadDataPack();
  const directory = await mkdtemp(join(tmpdir(), 'civic-publication-'));
  try {
    const portal = await publish(pack, join(directory, 'data'));
    const search: SearchRow[] = JSON.parse(await readFile(join(directory, 'data', 'search-index.json'), 'utf8'));
    assert.equal('search' in portal, false);
    const legislation = search.filter((row) => row.type === 'legislation');
    assert.equal(legislation.length, 4898);
    assert.equal(new Set(legislation.map((row) => row.id)).size, 4898);
    for (const row of legislation) assert.equal(row.path, `/open-lgu/legislation/${encodeURIComponent(row.id)}`);
    const index = JSON.parse(await readFile(join(directory, 'data', 'legislation', 'index.json'), 'utf8')).records;
    const serviceIndex = JSON.parse(await readFile(join(directory, 'data', 'legislation', 'service-index.json'), 'utf8')).records;
    const feeds = [pack.documents.ordinances, pack.documents.resolutions];
    assert.equal(index.length, feeds.reduce((count, feed) => count + feed.records.length, 0));
    for (const feed of feeds) {
      const row = feed.records[0];
      const compact = index.find((item: { recordId: string }) => item.recordId === row.recordId);
      assert.equal(compact.title, row.title);
      assert.equal(compact.documentUrl, row.documentUrl);
      assert.equal('rawSourceCells' in compact, false);
      const detail = JSON.parse(await readFile(join(directory, 'data', 'legislation', 'records', `${row.documentType}-${row.sourceRecordOrder}.json`), 'utf8'));
      assert.deepEqual(detail, { ...row, sourceIndexUrl: feed.sourceIndexUrl, sourceFeedUrl: feed.sourceFeedUrl, retrievedAt: feed.retrievedAt, sourceFeedSha256: feed.sourceFeedSha256 });
    }
    const leads = pack.documents.services.serviceLegislationLeads ?? [];
    const expectedLeads = pack.documents.ordinances.records.filter((row: { recordId: string; sourceId: string }) => leads.some((lead: { recordId: string; sourceId: string }) => lead.recordId === row.recordId && lead.sourceId === row.sourceId));
    assert.deepEqual(serviceIndex.map((row: { recordId: string }) => row.recordId), expectedLeads.map((row: { recordId: string }) => row.recordId));
    for (const entry of portal.datasets) {
      const relative = entry.jsonUrl.slice('data/'.length);
      const original = await readFile(join(pack.root, relative));
      assert.deepEqual(await readFile(join(directory, 'data', relative)), original);
      assert.equal(entry.sha256, sha256(original));
      assert.ok(entry.schemaUrl.endsWith(entry.id === 'ordinances' || entry.id === 'resolutions' ? '/legislation.schema.json' : `/${entry.id}.schema.json`));
      assert.ok((await readFile(join(directory, entry.schemaUrl))).length > 0);
      assert.ok((await readFile(join(directory, entry.csvUrl))).length > 0);
    }
    assert.equal(portal.sources[0].id, pack.documents['source-register'].sources[0].id);
    assert.ok(search.some((row) => row.path.includes('barangay%3Amahipon-lumot')));
    assert.ok(search.some((row) => row.path.includes('barangay%3Amahipon') && !row.path.includes('lumot')));
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('runtime schema rejects malformed evidence, dates, URLs and hashes', async () => {
  const pack = await loadDataPack();
  const validate = createValidator(pack.schema);
  const evidence = { sourceId: source.id, sourceUrl: source.url, retrievedAt: '2026-10-21', verificationNote: 'Attachment unreviewed', verificationStatus: 'machine-extracted-unreviewed', availabilityStatus: 'available', freshnessStatus: 'not-checked' };
  assert.doesNotThrow(() => validate('evidence', evidence));
  for (const update of [{ sourceUrl: 'javascript:alert(1)' }, { retrievedAt: '2026-02-30' }, { contentHash: 'not-a-sha256' }, { verificationNote: '' }, { verificationStatus: 'verified-ish' }]) assert.throws(() => validate('evidence', { ...evidence, ...update }));
});

test('incomplete feed and unknown record provenance reject the entire data pack', async () => {
  const original = await loadDataPack();
  const incomplete = structuredClone(original);
  incomplete.documents.resolutions.records.pop();
  assert.throws(() => validatePack(incomplete), /count|incomplete/i);
  const invalid = structuredClone(original);
  invalid.documents.officials.records[0].profileSourceId = 'nonexistent-source';
  assert.throws(() => validatePack(invalid), /source/i);
  const duplicate = structuredClone(original);
  duplicate.documents.ordinances.records[1].recordId = duplicate.documents.ordinances.records[0].recordId;
  assert.throws(() => validatePack(duplicate), /duplicate row ID/i);
});

test('statistics distinguish zero, missing, periods, geography and source-published values', () => {
  const statistic = { indicator: 'total_population', value: 42, unit: 'persons', geography: 'municipality', referenceYear: 2020, sourceId: source.id, sourceUrl: source.url, verificationStatus: 'secondary-only' };
  assert.doesNotThrow(() => validateStatistic(statistic));
  for (const update of [{ value: 0 }, { value: null }, { unit: '' }, { geography: '' }, { referenceYear: undefined }, { derived: true }, { sourceUrl: '' }]) assert.throws(() => validateStatistic({ ...statistic, ...update }));
  assert.doesNotThrow(() => validateStatistic({ ...statistic, value: 0, zeroPublishedBySource: true, quotedText: 'The source reports 0 persons.' }));
  assert.doesNotThrow(() => validateStatistic({ ...statistic, value: null, availabilityStatus: 'access-blocked', verificationNote: 'Primary table access blocked' }));
});

test('CSV preserves nested JSON, exact quotes, null and duplicate source rows', () => {
  const row = { title: 'EXACT, “TITLE” "quoted"', nested: { source: ['a', 'b'] }, missing: null };
  const result = toCsv([row, row]);
  assert.equal(result.csv.split('\r\n').length, 4);
  assert.deepEqual(result.nestedColumns, ['nested']);
  assert.ok(result.csv.includes('"{""source"":['));
  assert.ok(result.csv.includes('"null"'));
});

test('normalization retains source notes, formats and separate evidence dimensions', () => {
  const normalized = normalizeSource(source, '2026-10-21');
  assert.equal(normalized.retrievalStatus, source.retrievalStatus);
  assert.deepEqual(normalized.originalFormats, source.formats);
  assert.equal(normalized.coverageNote, source.coverage);
  assert.equal(normalizeStatus('metadata-extracted-from-official-index; attachment-content-not-reviewed', 'primary-lgu').verificationStatus, 'machine-extracted-unreviewed');
  assert.equal(normalizeStatus('indexed-primary-direct-fetch-blocked', 'primary-government').availabilityStatus, 'access-blocked');
  assert.equal(normalizeStatus('official-source-published; freshness-unverified', 'primary-lgu').freshnessStatus, 'not-checked');
  assert.deepEqual(collectSourceIds({ sourceIds: ['a'], nested: { sourceId: 'b' }, proposedSources: [{ sourceId: 'unregistered-discovery' }] }), ['a', 'b']);
});

test('known structured pagination preserves duplicate occurrences and old stable IDs', async () => {
  const client = new FixtureClient((url) => capture(url, { draw: Number(new URL(url).searchParams.get('draw')), recordsTotal: 2, recordsFiltered: 2, data: [cells] }));
  const result = await refreshLegislation(source, previous, client, 1);
  assert.equal(result.records.length, 2);
  assert.equal(result.records[0].recordId, oldRow.recordId);
  assert.notEqual(result.records[0].recordId, result.records[1].recordId);
  assert.equal(result.records[0].title, 'EXACT & ORIGINAL “TITLE”');
  assert.equal(result.records[0].committeeText, 'FINANCE RULES');
  assert.deepEqual(result.records[0].rawSourceCells, cells);
});

test('known structured adapter rejects filtered/partial feeds, changing totals and missing attachments', async () => {
  await assert.rejects(refreshLegislation(source, previous, new FixtureClient((url) => capture(url, { recordsTotal: 2, recordsFiltered: 1, data: [cells] })), 1), /filtered|incomplete/);
  await assert.rejects(refreshLegislation(source, previous, new FixtureClient((url) => capture(url, { recordsTotal: 2, recordsFiltered: 2, data: [] })), 1), /incomplete/);
  await assert.rejects(refreshLegislation(source, previous, new FixtureClient((url) => capture(url, { recordsTotal: 0, recordsFiltered: 0, data: [] })), 1), /archive shrank/);
  await assert.rejects(refreshLegislation(source, previous, new FixtureClient((url) => capture(url, { recordsTotal: new URL(url).searchParams.get('start') === '0' ? 2 : 3, recordsFiltered: new URL(url).searchParams.get('start') === '0' ? 2 : 3, data: [cells] })), 1), /totals changed/);
  assert.throws(() => parseLegislationRow([...cells.slice(0, 5), '<div>No attachment</div>'], 'ordinance', source, 1), /document link/);
});

test('optional source metadata remains null and a published copy-request URL is not rejected as a non-PDF', async () => {
  const nullableCells = [...cells];
  nullableCells[0] = '<div><span>No. 001-2026</span><span></span></div>';
  nullableCells[2] = '<span>By: N/A</span>';
  nullableCells[3] = '<div></div>';
  nullableCells[5] = '<a href="/contact">Request a Copy</a>';
  const row = parseLegislationRow(nullableCells, 'ordinance', source, 1);
  assert.equal(row.publicationStatus, null);
  assert.equal(row.committeeText, null);
  assert.equal(row.authorText, 'N/A');
  assert.equal(row.documentUrl, 'https://example.test/contact');
  assert.equal(row.attachmentLinkLabel, 'Request a Copy');
  assert.equal(row.documentLinkKind, 'request-copy-link');
  const pack = await loadDataPack();
  assert.doesNotThrow(() => createValidator(pack.schema)('legislationRecord', { ...row, recordId: 'ordinance:nullable-source-row:1' }));
  assert.equal(toCsv([row]).csv.includes('"null"'), true);
});

test('invalid publication does not overwrite last good output', async () => {
  const pack = await loadDataPack();
  const directory = await mkdtemp(join(tmpdir(), 'civic-retain-'));
  try {
    const target = join(directory, 'last-good');
    await writeFile(target, 'last good capture');
    pack.documents.ordinances.recordsTotal++;
    await assert.rejects(publish(pack, target), /incomplete/);
    assert.equal(await readFile(target, 'utf8'), 'last good capture');
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('manual refresh checks all registered sources but incomplete feeds retain canonical/public captures', async () => {
  const original = await loadDataPack();
  const directory = await mkdtemp(join(tmpdir(), 'civic-refresh-'));
  try {
    const root = join(directory, 'pack');
    await cp(original.root, root, { recursive: true });
    const before = await readFile(join(root, 'legislation/ordinances.json'));
    const target = join(directory, 'last-good');
    await writeFile(target, 'last good publication');
    const reportPath = join(directory, 'report.json');
    const client = new FixtureClient((url) => /(?:ordinances|resolutions)Data/.test(url)
      ? capture(url, { recordsTotal: 2, recordsFiltered: 2, data: [] })
      : capture(url, '<html><title>Coverage only</title><body>Cavinti Executive Office Council Document Service Name Office &amp; Contact</body></html>', 'text/html'));
    await assert.rejects(refresh({ root, destination: target, reportPath, client }), /Incomplete structured/);
    assert.deepEqual(await readFile(join(root, 'legislation/ordinances.json')), before);
    assert.equal(await readFile(target, 'utf8'), 'last good publication');
    const report = JSON.parse(await readFile(reportPath, 'utf8'));
    assert.equal(report.checks.length, original.documents['source-register'].sources.length);
    assert.equal(report.outcome, 'retained-last-good');
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('public refresh failure metadata marks stale sources without changing captured records', async () => {
  const pack = await loadDataPack();
  const directory = await mkdtemp(join(tmpdir(), 'civic-refresh-status-'));
  try {
    const destination = join(directory, 'data');
    const portal = await publish(pack, destination);
    const canonicalBefore = await readFile(join(destination, 'legislation/ordinances.json'));
    await saveRefreshStatus({ schemaVersion: 'refresh-report/v1', checkedAt: '2099-10-22T12:00:00Z', outcome: 'retained-last-good',
      checks: [{ sourceId: 'cavinti-ordinances-index', retrievedAt: '2099-10-22T12:00:00Z', availabilityStatus: 'access-blocked', freshnessStatus: 'stale', note: 'Structured capture blocked; previous complete feed retained' }] },
    join(directory, 'cache/report.json'), destination);
    const refreshed = JSON.parse(await readFile(join(destination, 'portal.json'), 'utf8'));
    const checkedSource = refreshed.sources.find((entry: { sourceId: string }) => entry.sourceId === 'cavinti-ordinances-index');
    assert.equal(checkedSource.status.freshnessStatus, 'stale');
    assert.equal(checkedSource.status.availabilityStatus, 'access-blocked');
    assert.equal(checkedSource.lastCheckedAt, '2099-10-22T12:00:00Z');
    assert.equal('search' in refreshed, false);
    assert.deepEqual(refreshed.datasets, portal.datasets);
    assert.deepEqual(await readFile(join(destination, 'legislation/ordinances.json')), canonicalBefore);
    assert.equal(JSON.parse(await readFile(join(destination, 'refresh-status.json'), 'utf8')).outcome, 'retained-last-good');
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('populated service schema accepts explicitly unknown fields and rejects invented incomplete cards', async () => {
  const pack = await loadDataPack();
  const validate = createValidator(pack.schema);
  const service = { recordId: 'service:source-row', name: 'Exact published service', office: null, eligibility: null, requirements: null,
    steps: null, fee: null, timeframe: null, forms: null, sourceId: source.id, sourceUrl: source.url,
    effectiveAt: null, reviewedAt: null, language: null, verificationStatus: 'machine-extracted-unreviewed' };
  assert.doesNotThrow(() => validate('service', service));
  assert.throws(() => validate('service', { recordId: service.recordId, name: service.name }), /required/);
  assert.throws(() => validate('service', { ...service, forms: [{ title: 'Official form', url: 'javascript:bad' }] }), /uri|pattern/);
});

test('a second LGU source uses its registered structured adapter, not Cavinti identifiers', async () => {
  const newSource: SourceRecord = { ...source, id: 'san-isidro-local-laws', name: 'San Isidro local laws',
    url: 'https://san-isidro.example/ordinances', dataUrl: 'https://san-isidro.example/lawsData' };
  const newPrevious: LegislationSet = { ...previous, municipality: 'San Isidro', sourceId: newSource.id,
    sourceIndexUrl: newSource.url, sourceFeedUrl: newSource.dataUrl!,
    records: [{ ...oldRow, sourceId: newSource.id, documentUrl: 'https://san-isidro.example/001.pdf' }] };
  const client = new FixtureClient((url) => capture(url, { recordsTotal: 1, recordsFiltered: 1, data: [cells] }));
  const result = await refreshLegislation(newSource, newPrevious, client);
  assert.equal(result.sourceId, newSource.id);
  assert.equal(result.sourceIndexUrl, newSource.url);
  assert.equal(result.records[0].sourceId, newSource.id);
  assert.equal(result.records[0].recordId, oldRow.recordId);
  assert.doesNotThrow(() => validateLegislation(result));
  const pack = await loadDataPack();
  assert.doesNotThrow(() => createValidator(pack.schema)('source', newSource));
  await assert.rejects(refreshLegislation({ ...newSource, adapter: undefined }, newPrevious, client), /No registered structured adapter/);
});

test('a same-total mutation on a later page rejects a mixed snapshot even when page one is unchanged', async () => {
  const requests = new Map<string, number>();
  const client = new FixtureClient((url) => {
    const count = (requests.get(url) ?? 0) + 1;
    requests.set(url, count);
    const changed = new URL(url).searchParams.get('start') === '1' && count > 1;
    const row = [...cells];
    if (changed) row[1] = '<span>A later page changed without a total change</span>';
    return capture(url, { recordsTotal: 2, recordsFiltered: 2, data: [row] });
  });
  await assert.rejects(refreshLegislation(source, previous, client, 1), /feed page changed/);
  const laterPage = [...requests.entries()].find(([url]) => new URL(url).searchParams.get('start') === '1');
  assert.equal(laterPage?.[1], 2);
});

test('source page hashes are validated against their ordered aggregate and documented scope', async () => {
  const result = await refreshLegislation(source, previous, new FixtureClient((url) => capture(url, {
    draw: Number(new URL(url).searchParams.get('draw')), recordsTotal: 2, recordsFiltered: 2, data: [cells],
  })), 1);
  assert.equal(result.sourceResponses?.length, 2);
  assert.doesNotThrow(() => validateLegislation(result));
  const malformed = structuredClone(result);
  malformed.sourceResponses![0].sha256 = 'invalid-lowercase-page-hash';
  assert.throws(() => validateLegislation(malformed), /sha256/);
  const changed = structuredClone(result);
  changed.sourceResponses![1].sha256 = 'b'.repeat(64);
  assert.throws(() => validateLegislation(changed), /ordered combined feed digest/);
  const reordered = structuredClone(result);
  reordered.sourceResponses!.reverse();
  reordered.sourceFeedUrl = reordered.sourceResponses![0].url;
  assert.throws(() => validateLegislation(reordered), /ordered combined feed digest/);
  const changedScope = { ...result, sourceHashScope: 'unrelated checksum interpretation' };
  assert.throws(() => validateLegislation(changedScope), /documented digest/);
});

test('page hash edits cannot bypass the feed digest or the dataset manifest', async () => {
  const pack = await loadDataPack();
  const feed = pack.documents.ordinances;
  feed.sourceResponses = [{ url: feed.sourceFeedUrl, finalUrl: feed.sourceFeedUrl, status: 200,
    contentType: 'application/json', retrievedAt: feed.retrievedAt, sourceDate: null, sha256: 'a'.repeat(64), rowCount: feed.recordCount }];
  feed.sourceHashScope = 'SHA-256 of exact source-response bytes';
  feed.sourceFeedSha256 = 'a'.repeat(64);
  const declaration = pack.documents['dataset-manifest'].datasets.find((entry: { id: string }) => entry.id === 'ordinances');
  declaration.sourceFeedSha256 = feed.sourceFeedSha256;
  assert.doesNotThrow(() => validatePack(pack));
  feed.sourceResponses[0].sha256 = 'b'.repeat(64);
  assert.throws(() => validatePack(pack), /ordered combined feed digest/);
  feed.sourceFeedSha256 = 'b'.repeat(64);
  assert.throws(() => validatePack(pack), /manifest source hash differs/);
});

test('lowercase sha256 fields in retained source evidence are validated', async () => {
  const pack = await loadDataPack();
  pack.documents['research-updates'].observations[0].retrieval.sha256 = 'not-a-valid-checksum';
  assert.throws(() => validatePack(pack), /invalid SHA-256/);
});

test('generated contact and coverage search links target application routes and actual contact categories', async () => {
  const pack = await loadDataPack();
  const rows = buildSearch(pack.documents);
  const registeredPaths = new Set(applicationRoutes.map(([path]) => `/${path}`));
  const officePath = applicationRoutes.find(([, key]) => key === 'offices')?.[0];
  assert.ok(officePath);
  const officePrefix = `/${officePath}/`;
  const contacts = rows.filter((row) => row.type === 'contact');
  assert.equal(contacts.length, pack.documents['emergency-contacts'].records.length);
  for (const row of contacts) {
    assert.ok(row.path.startsWith(officePrefix));
    const category = decodeURIComponent(row.path.slice(officePrefix.length));
    assert.ok(pack.documents['emergency-contacts'].records.some((contact: { category: string }) => contact.category === category));
  }
  for (const row of rows.filter((entry) => entry.type === 'coverage')) assert.ok(registeredPaths.has(row.path), `${row.id}: ${row.path}`);
  assert.equal(rows.find((row) => row.id === 'dataset:transparency')?.path, '/transparency/finance');
  assert.equal(rows.find((row) => row.id === 'dataset:sector-inventory')?.path, '/places');
});
