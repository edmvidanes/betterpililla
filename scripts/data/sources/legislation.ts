import { parseFragment } from 'parse5';
import type { DefaultTreeAdapterTypes } from 'parse5';
import type { LegislationRecord, LegislationSet, SourceRecord } from '../../../src/domain/types.ts';
import { sha256 } from '../normalize.ts';
import { validateLegislation } from '../validate.ts';
import { SourceClient } from './http.ts';

type Node = DefaultTreeAdapterTypes.Node;
function textOf(node: Node): string {
  if (node.nodeName === '#text') return (node as DefaultTreeAdapterTypes.TextNode).value;
  return 'childNodes' in node ? node.childNodes.map(textOf).join(' ') : '';
}
function elements(node: Node, tag: string): DefaultTreeAdapterTypes.Element[] {
  const matches: DefaultTreeAdapterTypes.Element[] = [];
  if ('tagName' in node && node.tagName === tag) matches.push(node);
  if ('childNodes' in node) for (const child of node.childNodes) matches.push(...elements(child, tag));
  return matches;
}
function clean(node: Node): string { return textOf(node).replace(/\s+/g, ' ').trim(); }
const months: Record<string, string> = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
export function sourceDate(label: string): string {
  const match = /^([A-Z][a-z]{2}) (\d{1,2}), (\d{4})$/.exec(label);
  if (!match || !months[match[1]]) throw new Error(`Unsupported source date label: ${label}`);
  const date = `${match[3]}-${months[match[1]]}-${match[2].padStart(2, '0')}`;
  if (new Date(date).toISOString().slice(0, 10) !== date) throw new Error(`Invalid source date: ${label}`);
  return date;
}

export function parseLegislationRow(cells: unknown, documentType: 'ordinance' | 'resolution', source: SourceRecord, order: number): LegislationRecord {
  if (!Array.isArray(cells) || cells.length !== 6 || cells.some((cell) => typeof cell !== 'string')) throw new Error(`Malformed ${documentType} row ${order}: expected six HTML cells`);
  const fragments = cells.map((cell: string) => parseFragment(cell));
  const numbers = elements(fragments[0], 'span').map(clean);
  const title = clean(fragments[1]);
  const sourceDateLabel = clean(fragments[4]);
  const links = elements(fragments[5], 'a').map((node) => node.attrs.find((attribute) => attribute.name === 'href')?.value).filter(Boolean) as string[];
  if (numbers.length !== 2 || !numbers[0] || !title || links.length !== 1) throw new Error(`Malformed ${documentType} row ${order}: missing number/title/unique source document link`);
  const documentUrl = new URL(links[0], source.url).href;
  if (!/^https?:\/\//.test(documentUrl)) throw new Error(`Unexpected document URL in ${documentType} row ${order}`);
  const attachmentLinkLabel = clean(fragments[5]);
  return { documentType, documentNumber: numbers[0], publicationStatus: numbers[1] || null, title,
    authorText: clean(fragments[2]).replace(/^By:\s*/, ''), committeeText: clean(fragments[3]) || null, sourceDateLabel,
    sourceDate: sourceDate(sourceDateLabel), documentUrl, sourceRecordOrder: order, sourceId: source.id,
    verificationStatus: 'metadata-extracted-from-official-index; attachment-content-not-reviewed', recordId: '', rawSourceCells: cells,
    attachmentLinkLabel, documentLinkKind: /\.pdf(?:\?|$)/i.test(documentUrl) ? 'pdf-link' : /request a copy/i.test(attachmentLinkLabel) ? 'request-copy-link' : 'other-source-link' };
}

/** Exact source metadata identity; duplicate occurrences are matched independently, never deduplicated. */
function identity(record: LegislationRecord): string {
  return JSON.stringify([record.documentType, record.documentNumber, record.publicationStatus, record.title,
    record.authorText, record.committeeText, record.sourceDateLabel, record.sourceDate, record.documentUrl]);
}

export async function refreshLegislation(source: SourceRecord, previous: LegislationSet, client: SourceClient, pageSize = 250): Promise<LegislationSet> {
  if (!source.dataUrl || source.adapter !== 'municipal-legislation-datatables/v1') throw new Error(`No registered structured adapter for ${source.id}`);
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 5000) throw new Error('Invalid structured page size');
  const rows: LegislationRecord[] = [];
  const captures: { url: string; finalUrl: string; status: number; contentType: string; sourceDate: string | null; retrievedAt: string; sha256: string; rowCount: number }[] = [];
  let expected: number | undefined;
  let retrievedAt = '';
  let start = 0;
  do {
    const url = new URL(source.dataUrl);
    url.searchParams.set('draw', String(captures.length + 1)); url.searchParams.set('start', String(start)); url.searchParams.set('length', String(pageSize));
    const capture = await client.capture(url.href);
    if (capture.status !== 200 || !/json/i.test(capture.contentType)) throw new Error(`${source.id}: structured feed HTTP/content type failure ${capture.status} ${capture.contentType}`);
    const payload = JSON.parse(capture.body);
    if (!Number.isInteger(payload.recordsTotal) || payload.recordsTotal < 0 || payload.recordsFiltered !== payload.recordsTotal || !Array.isArray(payload.data)) throw new Error(`${source.id}: malformed totals or filtered/incomplete feed`);
    if (expected === undefined) expected = payload.recordsTotal;
    if (expected < previous.recordCount) throw new Error(`${source.id}: archive shrank from ${previous.recordCount} to ${expected}; possible source truncation requires manual review before replacing historical rows`);
    if (payload.recordsTotal !== expected) throw new Error(`${source.id}: totals changed while paginating`);
    const required = Math.min(pageSize, expected - start);
    if (payload.data.length !== required) throw new Error(`${source.id}: incomplete/overlapping page at ${start}: expected ${required}, received ${payload.data.length}`);
    for (const cells of payload.data) rows.push(parseLegislationRow(cells, previous.documentType, source, rows.length + 1));
    retrievedAt = capture.retrievedAt;
    const { body: _body, ...metadata } = capture;
    captures.push({ ...metadata, sha256: capture.sha256!, rowCount: payload.data.length });
    start += payload.data.length;
    if (captures.length > 10000) throw new Error(`${source.id}: pagination safety limit reached`);
  } while (start < expected!);
  // The feed has no snapshot/version token. Recheck every page, not merely the first:
  // later-page edits with unchanged totals must not publish a mixed capture.
  for (const capture of captures) {
    const guard = await client.capture(capture.url);
    if (guard.status !== 200 || !/json/i.test(guard.contentType) || guard.sha256 !== capture.sha256) throw new Error(`${source.id}: feed page changed during capture (${capture.url}); retry manually with the previous capture retained`);
  }
  const old = new Map<string, LegislationRecord[]>();
  for (const record of previous.records) {
    const key = identity(record);
    if (!old.has(key)) old.set(key, []);
    old.get(key)!.push(record);
  }
  const ids = new Set(previous.records.map((record) => record.recordId));
  const used = new Map<string, number>();
  const records = rows.map((row) => {
    const key = identity(row);
    const match = old.get(key)?.shift();
    if (match) return { ...match, ...row, recordId: match.recordId };
    let occurrence = (used.get(key) ?? 0) + 1;
    let recordId = `${row.documentType}:${sha256(key).slice(0, 20)}:${occurrence}`;
    while (ids.has(recordId)) { occurrence++; recordId = `${row.documentType}:${sha256(key).slice(0, 20)}:${occurrence}`; }
    used.set(key, occurrence); ids.add(recordId);
    return { ...row, recordId };
  });
  const result: LegislationSet = { ...previous, retrievedAt, sourceIndexUrl: source.url, sourceFeedUrl: captures[0].url,
    sourceFeedSha256: captures.length === 1 ? captures[0].sha256 : sha256(JSON.stringify(captures.map((capture) => capture.sha256))),
    sourceHashScope: captures.length === 1 ? 'SHA-256 of exact source-response bytes' : 'SHA-256 of JSON array of ordered page-response SHA-256 strings; each exact response-byte hash retained in sourceResponses',
    sourceResponses: captures, recordsTotal: expected!, recordsFiltered: expected!, recordCount: records.length, records };
  validateLegislation(result);
  return result;
}
