import { cp, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { resolve, join, dirname, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { normalizeSource } from '../../src/domain/evidence.ts';
import type { DownloadEntry, Portal, SourceRecord } from '../../src/domain/types.ts';
import { buildSearch, collectSourceIds, datasetRows, schemaName, sha256, toCsv } from './normalize.ts';
import { loadDataPack, validatePack } from './validate.ts';
import type { DataPack } from './validate.ts';
import { applyRefreshStatus, readRefreshStatus } from './refresh-status.ts';
import { writeLegislationData } from './build-legislation.ts';

/** Validate before touching publication; a failed build leaves the last good directory intact. */
export async function publish(pack: DataPack, destination = resolve('public/data')): Promise<Portal> {
  validatePack(pack);
  const { documents, files } = pack;
  const manifest = documents['dataset-manifest'];
  const register = documents['source-register'];
  const sources = register.sources.map((source: SourceRecord) => normalizeSource(source, register.capturedAt));
  const entries: DownloadEntry[] = [];
  await mkdir(dirname(destination), { recursive: true });
  const staging = await mkdtemp(join(dirname(destination), '.data-stage-'));
  const backup = `${staging}-previous`;
  let movedPrevious = false;
  try {
    await cp(join(pack.root, 'schemas'), join(staging, 'schemas'), { recursive: true });
    for (const [id, data] of Object.entries(documents)) {
      const file = files[id];
      const bytes = await readFile(join(pack.root, file));
      const output = join(staging, file);
      await mkdir(dirname(output), { recursive: true });
      await writeFile(output, bytes);
      const rows = datasetRows(id, data);
      const { csv, nestedColumns } = toCsv(rows);
      const csvFile = file.replace(/\.json$/, '.csv');
      await writeFile(join(staging, csvFile), rows.length ? csv : '"recordId","name","office","sourceId","sourceUrl","verificationStatus"\r\n');
      const declaration = manifest.datasets.find((entry: { id: string }) => entry.id === id);
      const sourceIds = new Set<string>(collectSourceIds(data));
      for (const sourceId of declaration?.sourceIds ?? (declaration?.sourceId ? [declaration.sourceId] : [])) sourceIds.add(sourceId);
      if (id === 'source-register') for (const source of register.sources) sourceIds.add(source.id);
      entries.push({ id, jsonUrl: `data/${file}`, csvUrl: `data/${csvFile}`,
        schemaUrl: `data/schemas/${schemaName(id)}.schema.json`,
        rowCount: rows.length, capturedAt: data.capturedAt ?? data.retrievedAt ?? data.asOf ?? data.generatedAt,
        sha256: sha256(bytes), sourceIds: [...sourceIds].sort(),
        coverage: declaration?.status ?? (id === 'source-register' ? register.scope : manifest.globalLimitations.join(' ')),
        rights: `${manifest.license.projectAuthoredMetadata}. ${manifest.license.upstreamContent}${declaration?.rights ? ` ${declaration.rights}` : ''}`,
        ...(data.sourceFeedSha256 ? { sourceResponseHashes: [data.sourceFeedSha256] } : {}),
        csvNestedColumns: nestedColumns });
    }
    entries.sort((a, b) => a.id.localeCompare(b.id));
    const capturedAt = Object.values(documents).map((data) => data.capturedAt ?? data.retrievedAt ?? data.asOf ?? data.generatedAt).sort().at(-1);
    const search = buildSearch(documents);
    const portal: Portal = { schemaVersion: 'portal/v1', capturedAt, sources, datasets: entries };
    const refreshStatus = await readRefreshStatus(basename(pack.root));
    if (refreshStatus) {
      applyRefreshStatus(portal, refreshStatus);
      await writeFile(join(staging, 'refresh-status.json'), JSON.stringify(refreshStatus, null, 2) + '\n');
    }
    const downloadIndex = { schemaVersion: 'download-index/v1', capturedAt, datasets: entries,
      csvEncoding: 'UTF-8, RFC 4180 quoting, CRLF. Nested object/array columns contain JSON; null is the literal null and missing fields are empty. CSVs are convenience views: canonical JSON retains all document-level context, exact source strings and research notes. Spreadsheet software must import columns as text (source text may begin with a formula character).',
      extractionLimits: 'Only known structured municipal legislation feeds are automatically parsed. Other registered sources receive non-mutating HTTP/HTML coverage checks, not universal extraction. PDF and social archives are not mirrored; linked PDFs are not verified legal text. Research-only school leads remain research notes, not current directory records.',
      validation: 'passed: runtime JSON Schema, source references, URLs, dates, hashes, record counts, row IDs, full feed completeness, statistics and roster conflict rules' };
    await writeFile(join(staging, 'download-index.json'), JSON.stringify(downloadIndex, null, 2) + '\n');
    await writeFile(join(staging, 'portal.json'), JSON.stringify(portal) + '\n');
    await writeFile(join(staging, 'search-index.json'), JSON.stringify(search) + '\n');
    const services = documents.services;
    await writeFile(join(staging, 'services-index.json'), JSON.stringify({
      sourceUrl: services.sourceUrl, capturedAt: services.capturedAt,
      serviceLegislationLeads: services.serviceLegislationLeads,
      services: services.services.map((row: Record<string, any>) => ({
        recordId: row.recordId, name: row.name, office: row.office, description: row.description,
        classification: row.classification, transactionType: row.transactionType,
        needsClarification: Array.isArray(row.discrepancies) && row.discrepancies.length > 0,
      })),
    }) + '\n');
    await writeLegislationData(documents, staging);
    try { await rename(destination, backup); movedPrevious = true; } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    try { await rename(staging, destination); } catch (error) { if (movedPrevious) await rename(backup, destination); throw error; }
    if (movedPrevious) await rm(backup, { recursive: true, force: true });
    return portal;
  } catch (error) { await rm(staging, { recursive: true, force: true }); throw error; }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const portal = await publish(await loadDataPack(process.argv[2] ? resolve(process.argv[2]) : undefined));
  console.log(`Published ${portal.datasets.length} datasets to public/data.`);
}
