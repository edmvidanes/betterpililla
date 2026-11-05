import CheckedLink from '../../components/CheckedLink'
import type { DataRecord } from '../../data/loaders'
import { lgu } from '../../config/lgu'
import { catalogs, formatNumber, type Locale } from '../../i18n/locales'

export default function Demographics({ locale, href, municipality }: { locale: Locale; href: (path: string) => string; municipality: DataRecord }) {
  const t = catalogs[locale]
  const facts = Array.isArray(municipality.populationFacts) ? municipality.populationFacts : []
  const populations = facts.flatMap(fact => {
    if (!fact || typeof fact !== 'object' || Array.isArray(fact)) return []
    if (fact.indicator !== 'total_population' || typeof fact.value !== 'number' || typeof fact.referenceYear !== 'number' || typeof fact.sourceUrl !== 'string' || fact.referenceYear < 2015 || !['indexed-primary-direct-fetch-blocked', 'published-secondary-needs-PSA-crosscheck'].includes(String(fact.verificationStatus))) return []
    return [{ year: fact.referenceYear, value: fact.value, source: fact.sourceUrl, status: fact.verificationStatus }]
  }).sort((a, b) => b.year - a.year)
  const max = Math.max(0, ...populations.map(fact => fact.value))

  return <section className="atlas-inner atlas-demographics" aria-labelledby="demographics-title">
    <div className="atlas-demographics-data">
      <h2 id="demographics-title">{t.homeDemographicsTitle}</h2>
      <p>{t.homeDemographicsIntro}</p>
      {populations.length > 0 && <div className="population-chart" aria-label={t.homePopulationChart}>
        {populations.map(fact => <div className="population-row" key={`${fact.year}-${fact.source}`}>
          <CheckedLink href={fact.source}>{fact.year}</CheckedLink>
          <div className="population-track" aria-hidden="true"><span style={{ width: `${max ? fact.value / max * 100 : 0}%` }} /></div>
          <strong>{formatNumber(fact.value, locale)}</strong>
          <small>{fact.status === 'indexed-primary-direct-fetch-blocked' ? t.homeIndexedSource : t.homeSecondarySource}</small>
        </div>)}
      </div>}
      <CheckedLink className="population-more" href={href('statistics/demographics')}>{t.homeExploreDemographics} <span aria-hidden="true">→</span></CheckedLink>
    </div>
    <figure className="demographics-photos">
      <div className="demographics-photo-strip">{lgu.demographicsPhotos.map(photo => <CheckedLink href={photo.source} key={photo.src}><img src={`${import.meta.env.BASE_URL}${photo.src}`} alt={photo.alt[locale]} width={photo.width} height={photo.height} loading="lazy" /></CheckedLink>)}</div>
      <figcaption><details className="atlas-credits"><summary>{t.photoCredits}</summary><div className="atlas-credits-panel"><ul>{lgu.demographicsPhotos.map(photo => <li key={photo.src}><CheckedLink href={photo.source}>{photo.title}</CheckedLink> · {photo.author} · {photo.licenseUrl ? <CheckedLink href={photo.licenseUrl}>{photo.license}</CheckedLink> : t.photoPermission}</li>)}</ul></div></details></figcaption>
    </figure>
  </section>
}
