import Ajv from 'ajv';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { lgu } from '../../src/config/lgu.ts';
import { collectSourceIds, datasetRows, schemaName, sha256 } from './normalize.ts';
import type { Document } from './normalize.ts';

export const defaultDataRoot = resolve('data', lgu.slug);
export interface DataPack { root: string; documents: Record<string, Document>; files: Record<string, string>; schema: Document; }
export function isDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}(?:T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d))?$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.valueOf()) && new Date(`${value.slice(0, 10)}T00:00:00Z`).toISOString().slice(0, 10) === value.slice(0, 10);
}
export function isUrl(value: string): boolean {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password; } catch { return false; }
}
export function createValidator(schema: Document) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  ajv.addFormat('uri', { type: 'string', validate: isUrl });
  ajv.addFormat('date', { type: 'string', validate: (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && isDate(value) });
  ajv.addFormat('capture-date', { type: 'string', validate: isDate });
  ajv.addSchema(schema);
  return (name: string, value: unknown) => {
    const validate = ajv.getSchema(`${schema.$id}#/$defs/${name}`);
    if (!validate) throw new Error(`Missing schema definition: ${name}`);
    if (!validate(value)) throw new Error(`${name}: ${ajv.errorsText(validate.errors, { separator: '; ' })}`);
  };
}
function requireCondition(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

/** Null is unavailable, not zero; only an explicit quoted source zero permits numeric zero. */
export function validateStatistic(value: Document, label = 'statistic'): void {
  requireCondition(value.derived !== true && value.published !== false && value.calculatedByThisProject !== true, `${label}: derived statistics cannot be published`);
  requireCondition(typeof value.unit === 'string' && value.unit.trim(), `${label}: missing unit`);
  requireCondition(typeof value.geography === 'string' && value.geography.trim(), `${label}: missing geography`);
  requireCondition(value.period || Number.isInteger(value.referenceYear), `${label}: missing reference period`);
  requireCondition(value.sourceId && isUrl(value.sourceUrl), `${label}: missing cited source`);
  requireCondition(typeof value.verificationStatus === 'string' && value.verificationStatus.trim(), `${label}: missing verification status`);
  if (value.value === null) requireCondition(typeof value.availabilityStatus === 'string' && value.availabilityStatus !== 'available' && value.verificationNote,
    `${label}: null requires an unavailable status and explanation`);
  if (value.value === 0) requireCondition(value.zeroPublishedBySource === true && typeof value.quotedText === 'string' && /\b0(?:\.0+)?\b|\bzero\b/i.test(value.quotedText), `${label}: zero requires explicit source-published zero evidence`);
}

export function validateLegislation(data: Document): void {
  const rows = data.records;
  requireCondition(Array.isArray(rows), 'legislation: missing records');
  requireCondition(rows.length === data.recordCount && rows.length === data.recordsTotal && rows.length === data.recordsFiltered,
    'legislation: incomplete feed (recordsTotal, recordsFiltered, recordCount and rows must agree)');
  if (data.sourceResponses !== undefined) {
    requireCondition(Array.isArray(data.sourceResponses) && data.sourceResponses.length > 0, 'legislation: sourceResponses must contain captured pages');
    const hashes: string[] = [];
    let capturedRows = 0;
    for (const value of data.sourceResponses) {
      requireCondition(value && typeof value === 'object', 'legislation: malformed source response metadata');
      const response = value as Record<string, unknown>;
      requireCondition(typeof response.sha256 === 'string' && /^[a-f0-9]{64}$/.test(response.sha256), 'legislation: invalid source response sha256');
      requireCondition(typeof response.url === 'string' && isUrl(response.url) && typeof response.finalUrl === 'string' && isUrl(response.finalUrl), 'legislation: invalid source response URL');
      requireCondition(response.status === 200 && typeof response.contentType === 'string' && /json/i.test(response.contentType), 'legislation: source response was not successful JSON');
      requireCondition(typeof response.retrievedAt === 'string' && isDate(response.retrievedAt), 'legislation: invalid source response retrieval date');
      requireCondition(response.sourceDate === null || typeof response.sourceDate === 'string' && isDate(response.sourceDate), 'legislation: invalid source response date');
      requireCondition(typeof response.rowCount === 'number' && Number.isInteger(response.rowCount) && response.rowCount >= 0, 'legislation: invalid source response row count');
      hashes.push(response.sha256);
      capturedRows += response.rowCount;
    }
    requireCondition(capturedRows === rows.length, 'legislation: source response row counts differ from captured records');
    requireCondition(data.sourceResponses[0].url === data.sourceFeedUrl, 'legislation: first source response URL differs from sourceFeedUrl');
    const expectedHash = hashes.length === 1 ? hashes[0] : sha256(JSON.stringify(hashes));
    requireCondition(data.sourceFeedSha256 === expectedHash, 'legislation: source response hashes do not match the ordered combined feed digest');
    const expectedScope = hashes.length === 1 ? 'SHA-256 of exact source-response bytes' : 'SHA-256 of JSON array of ordered page-response SHA-256 strings; each exact response-byte hash retained in sourceResponses';
    requireCondition(data.sourceHashScope === expectedScope, 'legislation: source response hash scope differs from its documented digest');
  }
  const ids = new Set<string>();
  const orders = new Set<number>();
  for (const row of rows) {
    requireCondition(!ids.has(row.recordId), `legislation: duplicate row ID ${row.recordId}`); ids.add(row.recordId);
    requireCondition(row.documentType === data.documentType && row.sourceId === data.sourceId, `legislation: source/type mismatch ${row.recordId}`);
    requireCondition(Number.isInteger(row.sourceRecordOrder) && row.sourceRecordOrder >= 1 && row.sourceRecordOrder <= rows.length && !orders.has(row.sourceRecordOrder), `legislation: missing/duplicate row ordinal ${row.recordId}`); orders.add(row.sourceRecordOrder);
    requireCondition(row.sourceDate <= data.retrievedAt.slice(0, 10), `legislation: future published date ${row.recordId}`);
  }
}

export async function loadDataPack(root = defaultDataRoot): Promise<DataPack> {
  const documents: Record<string, Document> = {};
  const files: Record<string, string> = {};
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) { if (entry.name !== 'schemas') await visit(path); continue; }
      if (!entry.name.endsWith('.json')) continue;
      const id = entry.name.slice(0, -5);
      requireCondition(!documents[id], `Ambiguous dataset filename: ${id}`);
      documents[id] = JSON.parse(await readFile(path, 'utf8'));
      files[id] = relative(root, path).replaceAll('\\', '/');
    }
  }
  await visit(root);
  return { root, documents, files, schema: JSON.parse(await readFile(join(root, 'schemas/canonical.schema.json'), 'utf8')) };
}

export function validatePack(pack: DataPack): void {
  const { documents, files, schema } = pack;
  const validate = createValidator(schema);
  for (const [id, data] of Object.entries(documents)) validate(schemaName(id), data);
  const register = documents['source-register'];
  const manifest = documents['dataset-manifest'];
  requireCondition(register && manifest, 'Data pack requires source register and dataset manifest');
  const sources = new Map<string, Document>();
  for (const source of register.sources) {
    requireCondition(!sources.has(source.id), `Duplicate source ID: ${source.id}`);
    sources.set(source.id, source);
  }
  const declared = new Set<string>();
  for (const entry of manifest.datasets) {
    requireCondition(!declared.has(entry.id), `Duplicate manifest dataset: ${entry.id}`); declared.add(entry.id);
    const data = documents[entry.id];
    requireCondition(data && files[entry.id] === entry.canonicalJson, `Missing canonical dataset: ${entry.canonicalJson}`);
    requireCondition(data.schemaVersion === entry.schemaVersion, `${entry.id}: schema version differs from manifest`);
    requireCondition(datasetRows(entry.id, data).length === entry.recordCount, `${entry.id}: manifest count differs from captured rows`);
    const refs = entry.sourceIds ?? [entry.sourceId];
    requireCondition(refs.length && refs.every((id: unknown) => typeof id === 'string' && sources.has(id)), `${entry.id}: invalid/missing manifest sources`);
    if (data.sourceFeedSha256) requireCondition(entry.sourceFeedSha256 === data.sourceFeedSha256, `${entry.id}: manifest source hash differs from capture`);
    for (const sourceId of collectSourceIds(data)) requireCondition(refs.includes(sourceId), `${entry.id}: source ${sourceId} omitted from manifest`);
  }
  for (const [id, data] of Object.entries(documents)) {
    requireCondition(['source-register', 'dataset-manifest'].includes(id) || declared.has(id), `${id}: dataset missing from manifest`);
    const capturedAt = data.capturedAt ?? data.retrievedAt ?? data.asOf ?? data.generatedAt;
    requireCondition(isDate(capturedAt), `${id}: missing/invalid capture date`);
    for (const source of collectSourceIds(data)) requireCondition(sources.has(source), `${id}: unknown source reference ${source}`);
    if (id === 'ordinances' || id === 'resolutions') validateLegislation(data);
    const inspect = (value: unknown, path: string): void => {
      if (Array.isArray(value)) { value.forEach((child, index) => inspect(child, `${path}[${index}]`)); return; }
      if (!value || typeof value !== 'object') return;
      const row = value as Document;
      if ('indicator' in row && 'value' in row) { validate('statistic', row); validateStatistic(row, path); }
      if ('availabilityStatus' in row && 'sourceId' in row && 'retrievedAt' in row && 'verificationNote' in row) validate('evidence', row);
      if (row.refreshCheck) {
        validate('source-check', row.refreshCheck);
        requireCondition(row.refreshCheck.sourceId === row.id, `${path}: refresh check source mismatch`);
      }
      if (row.hashAlgorithm === 'sha256') requireCondition(typeof row.sourceOriginalText === 'string' && row.hash === sha256(row.sourceOriginalText), `${path}: excerpt hash does not match exact UTF-8 source text`);
      if (row.page !== null && row.page !== undefined) requireCondition(Number.isInteger(row.page) && row.page >= 1, `${path}: evidence page must be a positive integer`);
      for (const [key, child] of Object.entries(row)) {
        if (child !== null && child !== undefined && /(?:Url|url)$/.test(key)) requireCondition(typeof child === 'string' && isUrl(child), `${path}.${key}: invalid HTTP(S) URL`);
        if (child !== null && /(?:[Ss]ha256|contentHash|sourceContentHash)$/.test(key)) requireCondition(typeof child === 'string' && /^[a-f0-9]{64}$/.test(child), `${path}.${key}: invalid SHA-256`);
        if (child !== null && /^(capturedAt|retrievedAt|asOf|generatedAt|lastCheckedAt|sourcePublishedAt|sourceDate)$/.test(key)) requireCondition(typeof child === 'string' && isDate(child), `${path}.${key}: invalid date`);
        inspect(child, `${path}.${key}`);
      }
    };
    inspect(data, id);
  }
  const barangays = documents.barangays;
  if (barangays) {
    for (const claim of barangays.sourceClaims) if (claim.namesAsPublished) requireCondition(claim.count === claim.namesAsPublished.length, 'barangays: source count does not match names');
    if (barangays.discrepancies.some((row: Document) => row.resolution.startsWith('unresolved'))) requireCondition(barangays.canonicalRoster.count === null && barangays.canonicalRoster.sourceId === null, 'barangays: unresolved conflicting roster cannot be canonical');
    for (const row of barangays.secondaryPopulationTable.rows) for (const year of barangays.secondaryPopulationTable.referenceYears) {
      validateStatistic({ indicator: 'total_population', value: row[`population${year}`], unit: 'persons', geography: row.sourceName, referenceYear: year,
        sourceId: barangays.secondaryPopulationTable.sourceId, sourceUrl: sources.get(barangays.secondaryPopulationTable.sourceId)!.url,
        verificationStatus: barangays.secondaryPopulationTable.verificationStatus }, `barangay ${row.sourceName} ${year}`);
    }
  }
  requireCondition(documents.services.observedServiceRows === documents.services.services.length, 'services: observed count differs from service records');
  for (const service of documents.services.services) {
    if (service.fee?.amount !== null && service.fee?.amount !== undefined) {
      requireCondition(service.fee.currency, `service ${service.recordId}: numeric fee requires currency`);
      if (service.fee.amount === 0) requireCondition(/\b0(?:\.0+)?\b|\bfree\b|no fee|walang bayad/i.test(service.fee.sourceText), `service ${service.recordId}: zero fee requires explicit source wording`);
    }
    if (service.steps) requireCondition(service.steps.every((step: { order: number }, index: number) => step.order === index + 1), `service ${service.recordId}: source steps must have complete sequential order`);
  }
  for (const [id, data] of Object.entries(documents)) for (const row of data.records ?? data.services ?? []) {
    if (id === 'emergency-contacts') continue; // Parent document supplies the citation and date.
    requireCondition(collectSourceIds(row).length, `${id}: record missing provenance`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const pack = await loadDataPack(process.argv[2] ? resolve(process.argv[2]) : undefined);
  validatePack(pack);
  console.log(`Validated ${Object.keys(pack.documents).length} canonical JSON files; source duplicates preserved.`);
}
