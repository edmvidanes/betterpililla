import type { EvidenceStatus } from './types.ts';

/** Conservative mapping of research vocabulary; the original note is never replaced. */
export function normalizeStatus(note: string, tier = '', context = ''): EvidenceStatus {
  const text = `${note} ${context}`.toLowerCase();
  const verificationStatus = /conflict|disput|inconsisten/.test(text) ? 'conflicted'
    : /secondary|regional-directory/.test(tier) || /secondary/.test(text) ? 'secondary-only'
    : /metadata.extracted|machine.extracted|text.not.review|text-not-review|attachment.content.not.review/.test(text) ? 'machine-extracted-unreviewed'
    : /index|search.result|snippet/.test(text) && /blocked|403|401|failed|lead|not.retriev|not.check|incomplete/.test(text) ? 'primary-index-only'
    : /observed|source.published|readable|http 200|primary.document/.test(text) ? 'primary-direct' : 'not-reviewed';
  const availabilityStatus = /403|401|blocked|challenge|token required|tls|access failed/.test(text) ? 'access-blocked'
    : /no-rows-rendered|empty.in.capture|(?:no (?:service )?rows|zero rows) (?:were )?(?:observed|rendered|returned)/.test(text) ? 'empty-in-capture'
    : /not.published/.test(text) ? 'not-published'
    : /not.found/.test(text) ? 'not-found-in-checked-source'
    : /readable|observed|http 200|source.published|metadata.extracted/.test(text) ? 'available' : 'unknown';
  return { verificationStatus, availabilityStatus, freshnessStatus: /stale/.test(text) ? 'stale' : /not.live.valid|freshness.unverified|not.established|not.checked|not.collected|catalogued/.test(text) ? 'not-checked' : availabilityStatus === 'available' ? 'current-at-capture' : 'not-checked' };
}
