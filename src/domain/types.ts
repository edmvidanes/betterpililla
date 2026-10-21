export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type VerificationStatus = 'primary-direct' | 'primary-index-only' | 'secondary-only' | 'machine-extracted-unreviewed' | 'conflicted' | 'not-reviewed';
export type AvailabilityStatus = 'available' | 'access-blocked' | 'not-published' | 'empty-in-capture' | 'not-found-in-checked-source' | 'unknown';
export type FreshnessStatus = 'current-at-capture' | 'stale' | 'not-checked' | 'not-applicable';
export interface EvidenceStatus { verificationStatus: VerificationStatus; availabilityStatus: AvailabilityStatus; freshnessStatus: FreshnessStatus; }
export interface EvidenceRef extends EvidenceStatus { sourceId: string; sourceUrl: string; retrievedAt: string; verificationNote: string; sourceRecordKey?: string; contentHash?: string; }
export interface SourceRecord { id: string; name: string; tier: string; url: string; formats: string[]; retrievalStatus: string; coverage: string; dataUrl?: string; adapter?: 'municipal-legislation-datatables/v1'; refreshCheck?: SourceCheck; [key: string]: unknown; }
export interface NormalizedSource extends SourceRecord { sourceId: string; publisher: string; canonicalUrl: string; lastCheckedAt: string; coverageNote: string; sourceTier: string; status: EvidenceStatus; originalFormats: string[]; }
export interface DownloadEntry { id: string; jsonUrl: string; csvUrl: string; schemaUrl: string; rowCount: number; capturedAt: string; sha256: string; sourceIds: string[]; coverage: string; rights: string; sourceResponseHashes?: string[]; csvNestedColumns?: string[]; }
export interface SearchRow { id: string; title: string; path: string; sourceIds: string[]; text: string; type: string; }
export interface Portal { schemaVersion: 'portal/v1'; capturedAt: string; sources: NormalizedSource[]; datasets: DownloadEntry[]; search: SearchRow[]; }
export interface LegislationRecord { recordId: string; documentType: 'ordinance' | 'resolution'; documentNumber: string; publicationStatus: string | null; title: string; authorText: string; committeeText: string | null; sourceDateLabel: string; sourceDate: string; documentUrl: string; sourceRecordOrder: number; sourceId: string; verificationStatus: string; [key: string]: unknown; }
export interface SourceResponse { url: string; finalUrl: string; status: number; contentType: string; sourceDate: string | null; retrievedAt: string; sha256: string; rowCount: number; }
export interface LegislationSet { schemaVersion: string; documentType: 'ordinance' | 'resolution'; municipality: string; retrievedAt: string; sourceIndexUrl: string; sourceFeedUrl: string; sourceId: string; sourceFeedSha256: string; sourceResponses?: SourceResponse[]; sourceHashScope?: string; recordsTotal: number; recordsFiltered: number; recordCount: number; recordScope: string; records: LegislationRecord[]; [key: string]: unknown; }
export interface ServiceRecord {
  recordId: string;
  name: string;
  office: string | null;
  eligibility: string[] | null;
  requirements: string[] | null;
  steps: { order: number; description: string }[] | null;
  fee: { amount: number | null; currency: string | null; sourceText: string } | null;
  timeframe: string | null;
  forms: { title: string; url: string }[] | null;
  sourceId: string;
  sourceUrl: string;
  effectiveAt: string | null;
  reviewedAt: string | null;
  language: string | null;
  verificationStatus: string;
}
export interface SourceCheck {
  sourceId: string;
  retrievedAt: string;
  availabilityStatus: AvailabilityStatus;
  freshnessStatus: FreshnessStatus;
  note: string;
}
