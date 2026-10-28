import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Document } from './normalize.ts';

/** Publish lightweight route data alongside the unchanged canonical downloads. */
export async function writeLegislationData(documents: Record<string, Document>, staging: string): Promise<void> {
  const directory = join(staging, 'legislation');
  const details = join(directory, 'records');
  await mkdir(details, { recursive: true });
  const records = [];
  const serviceRecords = [];
  const leads = new Set(((documents.services.serviceLegislationLeads ?? []) as Document[]).map(lead => JSON.stringify([lead.recordId, lead.sourceId])));
  for (const feed of [documents.ordinances, documents.resolutions]) {
    for (const row of feed.records as Document[]) {
      const { recordId, documentType, documentNumber, title, authorText, committeeText, sourceDateLabel, sourceDate, documentUrl, sourceRecordOrder, sourceId } = row;
      const compact = { recordId, documentType, documentNumber, title, authorText, committeeText, sourceDateLabel, sourceDate, documentUrl, sourceRecordOrder, sourceId };
      records.push(compact);
      if (documentType === 'ordinance' && leads.has(JSON.stringify([recordId, sourceId]))) serviceRecords.push(compact);
      const detail = { ...row, sourceIndexUrl: feed.sourceIndexUrl, sourceFeedUrl: feed.sourceFeedUrl, retrievedAt: feed.retrievedAt, sourceFeedSha256: feed.sourceFeedSha256 };
      await writeFile(join(details, `${documentType}-${sourceRecordOrder}.json`), JSON.stringify(detail) + '\n');
    }
  }
  await writeFile(join(directory, 'index.json'), JSON.stringify({ records }) + '\n');
  await writeFile(join(directory, 'service-index.json'), JSON.stringify({ records: serviceRecords }) + '\n');
}
