import { lgu } from '../../config/lgu'
import type { DataRecord } from '../../data/loaders'
import { catalogs, formatDate, type Locale } from '../../i18n/locales'
import './service-highlights.css'

const groups = [
  { category: 'health-emergency', label: 'serviceHealth', icon: <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z" /> },
  { category: 'social-welfare', label: 'serviceSocial', icon: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3.5 20c.3-3.5 2.2-5.5 5.5-5.5s5.2 2 5.5 5.5m.5-5c3.4-.3 5.2 1.4 5.5 4.5" /></> },
  { category: 'disaster-response', label: 'serviceDisaster', icon: <><path d="M12 3 22 20H2L12 3Z" /><path d="M12 9v5m0 3v.01" /></> },
  { category: 'police', label: 'servicePolice', icon: <><path d="m12 3 8 3v5c0 5-3.4 8-8 10-4.6-2-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></> },
] as const

export default function ServiceHighlights({ locale, href, contacts, capturedAt }: {
  locale: Locale
  href: (path: string) => string
  contacts: DataRecord
  capturedAt: string
}) {
  const t = catalogs[locale]
  const contactRows = Array.isArray(contacts.records) ? contacts.records.filter(
    (row): row is DataRecord => row !== null && typeof row === 'object' && !Array.isArray(row),
  ) : []

  return <section className="atlas-services" aria-labelledby="atlas-services-title">
    <div className="atlas-inner atlas-services-inner">
      <h2 className="atlas-visually-hidden" id="atlas-services-title">{t.serviceHighlightTitle}</h2>
      <ul className="atlas-service-list">{groups.map(group => {
        const record = contactRows.find(row => row.category === group.category)
        return record && <li key={group.category}>
          <a href={href(`government/offices/${group.category}`)}>
            <svg className="atlas-service-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{group.icon}</svg>
            <h3>{t[group.label]}</h3>
            <p lang="en">{String(record.service)}</p>
            <span>{t.serviceOfficeLink}</span>
          </a>
        </li>
      })}</ul>
      <footer className="atlas-service-footer">
        <p className="atlas-service-coverage">{t.serviceCoverageNote}</p>
        <p className="atlas-service-source"><a href={href('services')}>{t.serviceCharterLink}</a> · <a href={new URL('aboutUs', lgu.officialUrl).href}>{t.source}</a> · {t.capture}: <time dateTime={capturedAt}>{formatDate(capturedAt, locale)}</time></p>
      </footer>
    </div>
  </section>
}
