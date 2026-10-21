import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import type { AvailabilityStatus, FreshnessStatus, Portal, SourceCheck } from '../../src/domain/types.ts';
import { isDate } from './validate.ts';

export interface RefreshStatus { schemaVersion: 'refresh-report/v1'; outcome: 'published' | 'retained-last-good'; checkedAt: string; checks: SourceCheck[]; }
const availability: readonly AvailabilityStatus[] = ['available', 'access-blocked', 'not-published', 'empty-in-capture', 'not-found-in-checked-source', 'unknown'];
const freshness: readonly FreshnessStatus[] = ['current-at-capture', 'stale', 'not-checked', 'not-applicable'];
export async function readRefreshStatus(slug: string): Promise<RefreshStatus | null> {
  let value: unknown;
  try { value = JSON.parse(await readFile(resolve('.cache/data-refresh', `${slug}-latest.json`), 'utf8')); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error; }
  if (!value || typeof value !== 'object' || !('schemaVersion' in value) || value.schemaVersion !== 'refresh-report/v1' || !('outcome' in value) || !['published', 'retained-last-good'].includes(String(value.outcome)) || !('checkedAt' in value) || typeof value.checkedAt !== 'string' || !isDate(value.checkedAt) || !('checks' in value) || !Array.isArray(value.checks)) throw new Error('Malformed cached refresh status');
  for (const check of value.checks) {
    if (!check || typeof check !== 'object' || typeof check.sourceId !== 'string' || typeof check.retrievedAt !== 'string' || !isDate(check.retrievedAt) || !availability.includes(check.availabilityStatus) || !freshness.includes(check.freshnessStatus) || typeof check.note !== 'string') throw new Error('Malformed cached source check');
  }
  // Every consumed field has been checked above; extra response metadata is preserved.
  return value as RefreshStatus;
}

export function applyRefreshStatus(portal: Portal, report: RefreshStatus): void {
  for (const source of portal.sources) {
    const check = report.checks.find((entry) => entry.sourceId === source.sourceId);
    if (!check || check.retrievedAt < source.lastCheckedAt) continue;
    source.lastCheckedAt = check.retrievedAt;
    source.latestCheck = check;
    source.status = { ...source.status, availabilityStatus: check.availabilityStatus,
      freshnessStatus: check.availabilityStatus !== 'available' ? 'stale' : check.freshnessStatus };
  }
}

/** Publish retrieval metadata even when the complete canonical snapshot must be retained. */
export async function saveRefreshStatus(report: RefreshStatus, reportPath: string, destination: string): Promise<void> {
  await mkdir(dirname(reportPath), { recursive: true });
  const bytes = JSON.stringify(report, null, 2) + '\n';
  await writeFile(reportPath, bytes);
  let portal: Portal;
  try { portal = JSON.parse(await readFile(join(destination, 'portal.json'), 'utf8')); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT' || (error as NodeJS.ErrnoException).code === 'ENOTDIR') return; throw error; }
  applyRefreshStatus(portal, report);
  for (const [file, content] of [['refresh-status.json', bytes], ['portal.json', JSON.stringify(portal) + '\n']]) {
    const pending = join(destination, `.${file}.pending-${process.pid}`);
    await writeFile(pending, content);
    await rename(pending, join(destination, file));
  }
}
