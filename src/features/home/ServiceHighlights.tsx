import type { DataRecord } from '../../data/loaders'
import { catalogs, type Locale } from '../../i18n/locales'

const groups = [
  { category: 'health-emergency', label: 'serviceHealth' },
  { category: 'social-welfare', label: 'serviceSocial' },
  { category: 'disaster-response', label: 'serviceDisaster' },
  { category: 'police', label: 'servicePolice' },
] as const

export default function ServiceHighlights({ locale, href, contacts }: {
  locale: Locale
  href: (path: string) => string
  contacts: DataRecord
}) {
  const t = catalogs[locale]
  const contactRows = Array.isArray(contacts.records) ? contacts.records.filter(
    (row): row is DataRecord => row !== null && typeof row === 'object' && !Array.isArray(row),
  ) : []

  return <ul className="atlas-service-badges" aria-label={t.serviceHighlightTitle}>{groups.map(group =>
    contactRows.some(row => row.category === group.category) && <li key={group.category}>
      <a href={href(`government/offices/${group.category}`)}>{t[group.label]}</a>
    </li>,
  )}</ul>
}
