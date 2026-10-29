import { createHash } from 'node:crypto';
import { barangayId } from '../../src/domain/ids.ts';
import type { SearchRow } from '../../src/domain/types.ts';

export type Document = Record<string, any>;
export const sha256 = (bytes: string | Uint8Array): string => createHash('sha256').update(bytes).digest('hex');
export const schemaName = (id: string): string => id === 'ordinances' || id === 'resolutions' ? 'legislation' : id;

/** CSV rows retain nested evidence as JSON, never flattened into lossy display strings. */
export function datasetRows(id: string, data: Document): Document[] {
  switch (id) {
    case 'source-register': return data.sources;
    case 'dataset-manifest': return data.datasets;
    case 'research-updates': return data.observations;
    case 'barangays': return data.secondaryPopulationTable.rows.map((row: Document) => ({ ...row,
      sourceId: data.secondaryPopulationTable.sourceId, referenceYears: data.secondaryPopulationTable.referenceYears,
      verificationStatus: data.secondaryPopulationTable.verificationStatus, canonicalRoster: data.canonicalRoster,
      sourceClaims: data.sourceClaims, discrepancies: data.discrepancies }));
    case 'sector-inventory': return data.sectors;
    case 'officials': return [...data.records.map((row: Document) => ({ rowType: 'official-directory', ...row })),
      ...(data.historicalElectionWinners ?? []).map((row: Document) => ({ rowType: 'historical-election-winner', sourceId: data.historicalElectionSource.sourceId, ...row })),
      ...(data.dilgDirectory ?? []).map((row: Document) => ({ rowType: 'dilg-directory', sourceId: data.dilgDirectorySource.sourceId, coverage: data.dilgDirectorySource.coverage, ...row })),
      ...(data.electionReturns ?? []).map((row: Document) => ({ rowType: 'unofficial-election-return', sourceId: data.electionReturnsSource.sourceId, electionYear: 2025, reportedAt: data.electionReturnsSource.reportedAt, coverage: data.electionReturnsSource.coverage, ...row }))];
    case 'transparency': return [...data.sourceChecks.map((row: Document) => ({ rowType: 'source-check', ...row })),
      ...data.officialLocalDocumentLeads.map((row: Document) => ({ rowType: 'document-lead', ...row })),
      ...(data.dpwhProjectSnapshot ?? []).map((row: Document) => ({ rowType: 'project-snapshot', ...row })),
      ...(data.betterGovProcurementLeads ?? []).map((row: Document) => ({ rowType: 'procurement-lead', ...row }))];
    case 'services': return data.services;
    default: return Array.isArray(data.records) ? data.records : [data];
  }
}

export function toCsv(rows: Document[]): { csv: string; nestedColumns: string[] } {
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const nestedColumns = columns.filter((key) => rows.some((row) => row[key] !== null && typeof row[key] === 'object'));
  const cell = (value: unknown): string => {
    const text = value === undefined ? '' : value !== null && typeof value === 'object' || value === null ? JSON.stringify(value) : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };
  return { csv: [columns.map(cell).join(','), ...rows.map((row) => columns.map((key) => cell(row[key])).join(','))].join('\r\n') + '\r\n', nestedColumns };
}

export function collectSourceIds(value: unknown, result = new Set<string>()): string[] {
  if (Array.isArray(value)) for (const child of value) collectSourceIds(child, result);
  else if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) {
    if (key === 'proposedSources') continue; // Explicitly unregistered discovery metadata, never a citation.
    if ((key === 'sourceId' || key === 'profileSourceId') && typeof child === 'string') result.add(child);
    else if (key === 'sourceIds' && Array.isArray(child)) {
      for (const id of child) if (typeof id === 'string') result.add(id);
    } else collectSourceIds(child, result);
  }
  return [...result].sort();
}

export function buildSearch(data: Record<string, Document>): SearchRow[] {
  const rows: SearchRow[] = [];
  const add = (id: string, title: string, path: string, sourceIds: string[], text: string, type: string) => rows.push({ id, title, path, sourceIds, text, type });
  for (const source of data['source-register'].sources) add(`source:${source.id}`, source.name, `/sources/${encodeURIComponent(source.id)}`, [source.id], `${source.coverage} ${source.retrievalStatus}`, 'source');
  for (const kind of ['ordinances', 'resolutions']) for (const record of data[kind].records) add(record.recordId, record.title,
    `/open-lgu/legislation/${encodeURIComponent(record.recordId)}`, [record.sourceId],
    [record.documentNumber, record.documentType, record.authorText, record.committeeText, record.sourceDateLabel, record.publicationStatus].filter((value: unknown): value is string => typeof value === 'string').join(' '), 'legislation');
  for (const record of data.officials.records) add(record.recordId, record.displayName, `/government/officials/${encodeURIComponent(record.recordId)}`,
    collectSourceIds(record), [record.directorySection, record.roleLabel, record.committeeLabel].filter(Boolean).join(' '), 'official');
  const names = new Map<string, Set<string>>();
  for (const claim of data.barangays.sourceClaims) for (const name of claim.namesAsPublished ?? []) {
    if (!names.has(name)) names.set(name, new Set());
    names.get(name)!.add(claim.sourceId);
  }
  for (const [name, sources] of names) add(barangayId(name), name, `/government/barangays/${encodeURIComponent(barangayId(name))}`,
    [...sources], 'Source-specific barangay name; current canonical roster unresolved', 'barangay');
  for (const contact of data['emergency-contacts'].records) add(`contact:${contact.category}`, contact.service, `/government/offices/${encodeURIComponent(contact.category)}`,
    [contact.sourceId ?? data['emergency-contacts'].sourceId], [contact.numbersAsPublished.join(' '), contact.addressAsPublished, ...(contact.emailsAsPublished ?? []), contact.capturedAt ?? data['emergency-contacts'].capturedAt, contact.verificationStatus].filter(Boolean).join(' '), 'contact');
  for (const service of data.services.services) add(service.recordId, service.name, `/services/${encodeURIComponent(service.recordId)}`, collectSourceIds(service), service.office ?? '', 'service');
  const routes: Record<string, string> = { municipality: '/about', services: '/services', transparency: '/transparency/finance', 'sector-inventory': '/places' };
  for (const [id, path] of Object.entries(routes)) add(`dataset:${id}`, id === 'municipality' ? data.municipality.name : id,
    path, collectSourceIds(data[id]), [data[id].importantLimit, data[id].catalogueStatus, data[id].summary?.notes,
      ...(data[id].sectors ?? []).map((sector: Document) => `${sector.sector} ${sector.availability}`)].filter(Boolean).join(' '), 'coverage');
  const ids = new Set<string>();
  for (const row of rows) {
    if (ids.has(row.id)) throw new Error(`Search ID collision requires explicit source-specific resolution: ${row.id}`);
    ids.add(row.id);
  }
  return rows;
}
