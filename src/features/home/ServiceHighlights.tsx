import { catalogs, type Locale } from '../../i18n/locales'

const groups = [
  { category: 'health-emergency', label: 'serviceHealth' },
  { category: 'social-welfare', label: 'serviceSocial' },
  { category: 'disaster-response', label: 'serviceDisaster' },
  { category: 'police', label: 'servicePolice' },
] as const

export default function ServiceHighlights({ locale, href }: {
  locale: Locale
  href: (path: string) => string
}) {
  const t = catalogs[locale]

  return <ul className="atlas-service-badges" aria-label={t.serviceHighlightTitle}>{groups.map(group =>
    <li key={group.category}>
      <a href={href(`government/offices/${group.category}`)}>{t[group.label]}</a>
    </li>,
  )}</ul>
}
