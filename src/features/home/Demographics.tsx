import CheckedLink from '../../components/CheckedLink'
import type { DataRecord } from '../../data/loaders'
import { lgu } from '../../config/lgu'
import { catalogs, formatDate, formatNumber, type Locale } from '../../i18n/locales'

export default function Demographics({ locale, href, municipality }: { locale: Locale; href: (path: string) => string; municipality: DataRecord }) {
  const t = catalogs[locale]
  const facts = Array.isArray(municipality.populationFacts) ? municipality.populationFacts : []
  const populations = facts.flatMap(fact => {
    if (!fact || typeof fact !== 'object' || Array.isArray(fact)) return []
    if (fact.indicator !== 'total_population' || typeof fact.value !== 'number' || typeof fact.referenceYear !== 'number' || fact.verificationStatus !== 'primary-direct' || typeof fact.referenceDate !== 'string') return []
    return [{ year: fact.referenceYear, value: fact.value, date: fact.referenceDate, period: fact.period, sourceId: fact.sourceId }]
  }).sort((a, b) => b.year - a.year)
  const latest = populations[0]
  if (!latest) return null

  return <section className="atlas-inner atlas-demographics" aria-labelledby="demographics-title">
    <div className="atlas-demographics-data">
      <h2 id="demographics-title">{t.homeDemographicsTitle}</h2>
      <p>{t.homeDemographicsIntro}</p>
      <div className="population-summary">
        <p className="population-total"><strong>{formatNumber(latest.value, locale)}</strong><span>{t.homePopulationUnit} · {String(latest.period || latest.year)}</span></p>
        <p>{t.homeCensusReference} <time dateTime={latest.date}>{formatDate(latest.date, locale)}</time></p>
        <CheckedLink href={href(`sources/${encodeURIComponent(String(latest.sourceId))}`)}>PSA OpenSTAT</CheckedLink>
      </div>
      <CheckedLink className="population-more" href={href('statistics/demographics')}>{t.homeExploreDemographics} <span aria-hidden="true">→</span></CheckedLink>
    </div>
    <figure className="demographics-photos">
      <div className="demographics-photo-strip">{lgu.demographicsPhotos.map(photo => <CheckedLink href={photo.source} key={photo.src}><img src={`${import.meta.env.BASE_URL}${photo.src}`} alt={photo.alt[locale]} width={photo.width} height={photo.height} loading="lazy" /></CheckedLink>)}</div>
      <figcaption><details className="atlas-credits"><summary>{t.photoCredits}</summary><div className="atlas-credits-panel"><ul>{lgu.demographicsPhotos.map(photo => <li key={photo.src}><CheckedLink href={photo.source}>{photo.title}</CheckedLink> · {photo.author} · {photo.licenseUrl ? <CheckedLink href={photo.licenseUrl}>{photo.license}</CheckedLink> : t.photoPermission}</li>)}</ul></div></details></figcaption>
    </figure>
  </section>
}
