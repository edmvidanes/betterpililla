import { cp, mkdtemp, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { lgu } from '../../src/config/lgu.ts';
import type { LegislationSet, SourceRecord } from '../../src/domain/types.ts';
import { publish } from './build-public.ts';
import { datasetRows, toCsv } from './normalize.ts';
import { loadDataPack, validatePack } from './validate.ts';
import type { DataPack } from './validate.ts';
import { SourceClient } from './sources/http.ts';
import { checkCoverage } from './sources/coverage.ts';
import type { CoverageCheck } from './sources/coverage.ts';
import { refreshLegislation } from './sources/legislation.ts';
import { saveRefreshStatus } from './refresh-status.ts';

export interface RefreshOptions { root?: string; destination?: string; reportPath?: string; client?: SourceClient; publishSnapshot?: typeof publish; }
export interface RefreshReport { schemaVersion: 'refresh-report/v1'; checkedAt: string; outcome: 'published' | 'retained-last-good'; checks: CoverageCheck[]; structured: { sourceId: string; previousCount: number; capturedCount?: number; error?: string }[]; limits: string; }

/** Stage every structured dataset and validate the entire pack before replacing either capture. */
export async function refresh(options: RefreshOptions = {}): Promise<RefreshReport> {
  const root = options.root ?? resolve('data', lgu.slug);
  const original = await loadDataPack(root);
  validatePack(original);
  const client = options.client ?? new SourceClient();
  const report: RefreshReport = { schemaVersion: 'refresh-report/v1', checkedAt: new Date().toISOString(), outcome: 'retained-last-good', checks: [], structured: [],
    limits: 'Manual invocation only. Explicitly registered municipal-legislation-datatables/v1 adapters parse strict pagination and recheck every captured page for changes; other source families receive HTTP/HTML coverage checks only. No attachment text, legal interpretation, directory roles, source aggregates or services are inferred. PDFs/social channels receive HEAD metadata only. Robots/access controls are respected. Failed structured updates leave canonical and public captures untouched.' };
  const changes = new Map<string, LegislationSet>();
  const register = original.documents['source-register'];
  for (const source of register.sources as SourceRecord[]) {
    const previous = Object.entries(original.documents).find(([, data]) => data.schemaVersion === 'civic-legislation-record-set/v1' && data.sourceId === source.id);
    if (source.adapter || previous) {
      const result: RefreshReport['structured'][number] = { sourceId: source.id, previousCount: previous?.[1].records.length ?? 0 };
      try {
        if (!previous) throw new Error(`${source.id}: registered structured adapter requires a canonical legislation dataset with its source ID`);
        const [id, document] = previous;
        const capture = await refreshLegislation(source, document as LegislationSet, client);
        changes.set(id, capture); result.capturedCount = capture.records.length;
        report.checks.push({ sourceId: source.id, adapter: source.adapter!, requestedUrl: source.dataUrl!, finalUrl: capture.sourceFeedUrl,
          retrievedAt: capture.retrievedAt, httpStatus: 200, contentType: 'application/json', sourceDate: null,
          responseSha256: capture.sourceFeedSha256, availabilityStatus: 'available', freshnessStatus: 'not-checked',
          note: `Complete metadata capture: ${capture.recordCount} rows; previous capture ${document.records.length}. Attachment contents not reviewed.` });
      } catch (error) {
        result.error = error instanceof Error ? error.message : String(error);
        report.checks.push({ sourceId: source.id, adapter: source.adapter ?? 'unregistered-structured-source', requestedUrl: source.dataUrl ?? source.url, finalUrl: null,
          retrievedAt: new Date().toISOString(), httpStatus: null, contentType: null, sourceDate: null,
          availabilityStatus: 'unknown', freshnessStatus: 'stale', note: result.error });
      }
      report.structured.push(result);
    } else report.checks.push(await checkCoverage(source, client));
  }
  const reportPath = options.reportPath ?? resolve('.cache/data-refresh', `${lgu.slug}-latest.json`);
  const destination = options.destination ?? resolve('public/data');
  if (report.structured.some((result) => result.error)) {
    await saveRefreshStatus(report, reportPath, destination);
    throw new Error(`Incomplete structured refresh rejected. Canonical/public snapshots unchanged. Report: ${reportPath}`);
  }
  const staging = await mkdtemp(join(dirname(root), '.data-refresh-'));
  const backup = `${staging}-previous`;
  let replaced = false;
  try {
    await cp(root, staging, { recursive: true });
    const staged = await loadDataPack(staging);
    const manifest = staged.documents['dataset-manifest'];
    for (const [id, capture] of changes) {
      staged.documents[id] = capture;
      const declaration = manifest.datasets.find((entry: { id: string }) => entry.id === id);
      if (!declaration) throw new Error(`Structured dataset ${id} missing from manifest`);
      const dates = capture.records.map((record) => record.sourceDate).sort();
      Object.assign(declaration, { recordCount: capture.recordCount, sourceFeedUrl: capture.sourceFeedUrl, sourceFeedSha256: capture.sourceFeedSha256,
        dateRange: dates.length ? { from: dates[0], to: dates.at(-1) } : null });
      await writeFile(join(staging, staged.files[id]), JSON.stringify(capture, null, 2) + '\n');
      await writeFile(join(staging, staged.files[id].replace(/\.json$/, '.csv')), toCsv(datasetRows(id, capture)).csv);
    }
    const stagedRegister = staged.documents['source-register'];
    for (const source of stagedRegister.sources) {
      const check = report.checks.find((entry) => entry.sourceId === source.id)!;
      source.lastCheckedAt = check.retrievedAt;
      source.refreshCheck = check; // Original retrievalStatus/coverage remain immutable capture notes.
    }
    manifest.generatedAt = report.checkedAt;
    await writeFile(join(staging, staged.files['source-register']), JSON.stringify(stagedRegister, null, 2) + '\n');
    await writeFile(join(staging, staged.files['dataset-manifest']), JSON.stringify(manifest, null, 2) + '\n');
    validatePack(staged);
    await rename(root, backup);
    try { await rename(staging, root); replaced = true; } catch (error) { await rename(backup, root); throw error; }
    const committed: DataPack = { ...staged, root };
    try { await (options.publishSnapshot ?? publish)(committed, options.destination); }
    catch (error) { await rm(root, { recursive: true, force: true }); await rename(backup, root); replaced = false; throw error; }
    report.outcome = 'published';
    await rm(backup, { recursive: true, force: true });
    await saveRefreshStatus(report, reportPath, destination);
    return report;
  } catch (error) {
    if (!replaced) await rm(staging, { recursive: true, force: true });
    await saveRefreshStatus(report, reportPath, destination);
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const slug = args.length === 0 ? lgu.slug : args[1];
  if (!(args.length === 0 || args.length === 2 && args[0] === '--lgu') || !slug || !/^[a-z0-9-]+$/.test(slug)) throw new Error('Usage: refresh.ts [--lgu municipality-slug]');
  const report = await refresh({ root: resolve('data', slug), reportPath: resolve('.cache/data-refresh', `${slug}-latest.json`) });
  console.log(`Manual refresh ${report.outcome}: ${report.checks.length} registered sources checked. Full report: .cache/data-refresh/${slug}-latest.json`);
}
