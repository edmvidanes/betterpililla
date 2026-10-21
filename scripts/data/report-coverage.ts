import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { lgu } from '../../src/config/lgu.ts';
import { normalizeSource } from '../../src/domain/evidence.ts';
import type { SourceRecord } from '../../src/domain/types.ts';
import { collectSourceIds, datasetRows } from './normalize.ts';
import { loadDataPack, validatePack } from './validate.ts';
import type { DataPack } from './validate.ts';
import type { Document } from './normalize.ts';

/** Technical completeness counts are not civic totals or deduplication instructions. */
export function coverageReport(pack: DataPack): Document {
  validatePack(pack);
  const register = pack.documents['source-register'];
  const manifest = pack.documents['dataset-manifest'];
  return { schemaVersion: 'coverage-report/v1', capturedAt: register.capturedAt,
    scope: register.scope, limitations: manifest.globalLimitations,
    sources: register.sources.map((source: SourceRecord) => {
      const normalized = normalizeSource(source, register.capturedAt);
      return { sourceId: normalized.sourceId, url: normalized.canonicalUrl, lastCheckedAt: normalized.lastCheckedAt,
        tier: normalized.sourceTier, originalRetrievalStatus: normalized.retrievalStatus, status: normalized.status,
        coverage: normalized.coverageNote, latestRefreshCheck: source.refreshCheck ?? null };
    }),
    datasets: manifest.datasets.map((entry: Document) => {
      const data = pack.documents[entry.id];
      const rows = datasetRows(entry.id, data);
      const duplicates = new Map<string, string[]>();
      for (const row of data.records ?? []) {
        if (!row.documentNumber) continue;
        const key = JSON.stringify([row.documentNumber, row.title, row.documentUrl]);
        if (!duplicates.has(key)) duplicates.set(key, []);
        duplicates.get(key)!.push(row.recordId);
      }
      return { id: entry.id, capturedAt: data.capturedAt ?? data.retrievedAt ?? data.asOf,
        rowCount: rows.length, declaredCount: entry.recordCount, sourceIds: [...new Set([...(entry.sourceIds ?? [entry.sourceId]), ...collectSourceIds(data)])],
        coverage: entry.status, dateRange: entry.dateRange ?? null,
        sourceResponseSha256: data.sourceFeedSha256 ?? null,
        ...(data.recordsTotal !== undefined ? { completeness: { recordsTotal: data.recordsTotal, recordsFiltered: data.recordsFiltered, captured: rows.length },
          exactRepeatedMetadataGroups: [...duplicates.values()].filter((ids) => ids.length > 1), duplicatePolicy: 'All source rows retained with distinct IDs; matching metadata is not evidence of an erroneous row.' } : {}) };
    }),
    roster: pack.documents.barangays.canonicalRoster,
    researchLimits: pack.documents['research-updates']?.collectionLimits ?? [],
    extractionLimits: 'Known municipal legislation JSON cells only. Other registered sources are non-mutating coverage checks. No universal PDF/OCR/social parser or blanket attachment mirror. Research-only school IDs are not a current roster. Empty observed Charter rows do not establish that the municipality offers no services.' };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const slug = args.length === 0 ? lgu.slug : args[1];
  if (!(args.length === 0 || args.length === 2 && args[0] === '--lgu') || !slug || !/^[a-z0-9-]+$/.test(slug)) throw new Error('Usage: report-coverage.ts [--lgu municipality-slug]');
  const report = coverageReport(await loadDataPack(resolve('data', slug)));
  try { report.latestRefresh = JSON.parse(await readFile(resolve('.cache/data-refresh', `${slug}-latest.json`), 'utf8')); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  console.log(JSON.stringify(report, null, 2));
}
