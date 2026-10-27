import type { ReactNode } from 'react'
import { EvidenceTree, SourceCitation } from '../components/Evidence'
import type { DataPack, EvidenceValue } from '../data/loaders'
import { catalogs, type Locale } from '../i18n/locales'
import { civicCatalogs } from '../i18n/civic'
import './civic.css'

export interface CivicProps { data: DataPack; locale: Locale; href: (path: string) => string }
export function SourceNote({ data, locale, href, id }: CivicProps & { id: string }) {
  const source = data.portal.sources.find(source => (source.id || source.sourceId) === id)
  return source ? <SourceCitation source={source} locale={locale} href={href(`sources/${encodeURIComponent(id)}`)} /> : null
}
export function RawRecord({ value, data, locale, href }: CivicProps & { value: EvidenceValue }) {
  return <details className="civic-disclosure"><summary>{civicCatalogs[locale].originalRecord}</summary><p className="original-label">{catalogs[locale].original}</p><EvidenceTree value={value} locale={locale} sources={data.portal.sources} sourceHref={id => href(`sources/${encodeURIComponent(id)}`)} /></details>
}
export function PageIntro({ title, children }: { title: string; children: ReactNode }) {
  return <><h1>{title}</h1><p className="civic-intro">{children}</p></>
}
export function LinkArrow() {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>
}
