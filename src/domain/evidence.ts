import { normalizeStatus } from './status.ts';
import type { EvidenceRef, NormalizedSource, SourceRecord } from './types.ts';

export function normalizeSource(source: SourceRecord, capturedAt: string): NormalizedSource {
  const formats = source.formats.map((format) => {
    const value = format.toLowerCase();
    if (/html|web portal|tables|catalog metadata|dataset listing/.test(value)) return 'html';
    if (/json/.test(value)) return 'json';
    if (/markdown/.test(value)) return 'markdown';
    if (/pdf/.test(value)) return 'pdf';
    if (/map/.test(value)) return 'map';
    if (/social/.test(value)) return 'social';
    if (/image/.test(value)) return 'image';
    return 'other';
  });
  const status = normalizeStatus(source.retrievalStatus, source.tier, source.coverage);
  if (source.refreshCheck) {
    status.availabilityStatus = source.refreshCheck.availabilityStatus;
    status.freshnessStatus = source.refreshCheck.availabilityStatus === 'available' ? source.refreshCheck.freshnessStatus : 'stale';
  }
  return { ...source, originalFormats: source.formats, formats: [...new Set(formats)], sourceId: source.id,
    // The source register does not separately identify the legal publisher. Keep its cited label,
    // rather than guessing the owner of an official-looking domain.
    publisher: typeof source.publisher === 'string' ? source.publisher : source.name,
    canonicalUrl: source.url, lastCheckedAt: typeof source.lastCheckedAt === 'string' ? source.lastCheckedAt : capturedAt,
    coverageNote: source.coverage, sourceTier: source.tier, status };
}

export function evidenceFor(source: NormalizedSource, note: string, options: Partial<EvidenceRef> = {}): EvidenceRef {
  return { sourceId: source.sourceId, sourceUrl: source.canonicalUrl, retrievedAt: source.lastCheckedAt,
    verificationNote: note, ...normalizeStatus(note, source.sourceTier), ...options };
}
