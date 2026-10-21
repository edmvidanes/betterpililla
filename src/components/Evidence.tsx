import type { ReactNode } from 'react'
import type { EvidenceValue } from '../data/loaders'
import type { NormalizedSource as SourceRecord } from '../domain/types'
import { catalogs, type Locale } from '../i18n/locales'
import { normalizeStatus } from '../domain/status'

export function ExternalDocumentLink({ url, children }: { url: string; children?: ReactNode }) {
  if (!/^https?:\/\//.test(url)) return <span>{url}</span>
  return <a href={url} rel="noreferrer">{children ?? url}</a>
}
export function SourceCitation({ source, href, locale }: { source: SourceRecord; href: string; locale: Locale }) {
  const status = Object.values(source.status)
  return <div className="citation"><a href={href}>{source.name || source.publisher}</a><span className="badge">{source.tier}</span><p><ExternalDocumentLink url={source.url || source.canonicalUrl || ''} /></p><p>{catalogs[locale].status}: <span lang="en">{source.retrievalStatus}</span></p>{status.length > 0 && <p>{status.map(code => <span key={code} className="badge" lang="en">{code}</span>)}</p>}{source.lastCheckedAt && <p>{catalogs[locale].checked}: {source.lastCheckedAt}</p>}</div>
}
export function DataStatus({ children }: { children: ReactNode }) {
  return <div className="notice" role="note">{children}</div>
}
export function EvidenceTree({ value, locale, sources, sourceHref }: { value: EvidenceValue; locale: Locale; sources: SourceRecord[]; sourceHref: (id: string) => string }) {
  if (value == null) return <span className="muted">{catalogs[locale].unknown}</span>
  if (typeof value === 'boolean') return <span lang="en">{String(value)}</span>
  if (typeof value === 'string') {
    const source = sources.find(s => s.id === value || s.sourceId === value)
    return source ? <a href={sourceHref(source.id || source.sourceId!)}>{source.name || source.publisher}</a> : /^https?:\/\//.test(value) ? <ExternalDocumentLink url={value} /> : <span className="source-text">{value}</span>
  }
  if (typeof value === 'number') return <span className="tabular-nums">{value.toLocaleString(locale === 'fil' ? 'fil-PH' : 'en-PH')}</span>
  if (Array.isArray(value)) return <ul className="evidence-list">{value.map((entry, i) => <li key={i}><EvidenceTree value={entry} locale={locale} sources={sources} sourceHref={sourceHref} /></li>)}</ul>
  const source = sources.find(s => (s.id || s.sourceId) === value.sourceId)
  const explicitStatus = typeof value.verificationStatus === 'string'
    && typeof value.availabilityStatus === 'string' && typeof value.freshnessStatus === 'string'
  const status = explicitStatus
    ? { verificationStatus: value.verificationStatus as string, availabilityStatus: value.availabilityStatus as string, freshnessStatus: value.freshnessStatus as string }
    : typeof value.verificationStatus === 'string'
      ? normalizeStatus(value.verificationStatus, String(value.sourceTier || source?.tier || ''), String(value.notes || value.verificationNote || ''))
      : null
  return <dl className="evidence-tree">{status && <div><dt>{catalogs[locale].status}</dt><dd>{Object.values(status).map(code => <span key={code} className="badge" lang="en">{code}</span>)}</dd></div>}{Object.entries(value).filter(([key]) => key !== 'searchOnlyElementaryLeads').map(([key, entry]) => <div key={key}><dt lang="en">{key.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_', ' ')}</dt><dd><EvidenceTree value={entry} locale={locale} sources={sources} sourceHref={sourceHref} /></dd></div>)}</dl>
}
