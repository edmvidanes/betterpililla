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
          <a href={fact.source}>{fact.year}</a>
          <div className="population-track" aria-hidden="true"><span style={{ width: `${max ? fact.value / max * 100 : 0}%` }} /></div>
          <strong>{formatNumber(fact.value, locale)}</strong>
          <small>{fact.status === 'indexed-primary-direct-fetch-blocked' ? t.homeIndexedSource : t.homeSecondarySource}</small>
        </div>)}
      </div>}
      <a className="population-more" href={href('statistics/demographics')}>{t.homeExploreDemographics} <span aria-hidden="true">→</span></a>
    </div>
    <figure className="demographics-photos">
      <div className="demographics-photo-strip">{lgu.demographicsPhotos.map(photo => <a href={photo.source} key={photo.src}><img src={`${import.meta.env.BASE_URL}${photo.src}`} alt={photo.alt[locale]} width={photo.width} height={photo.height} loading="lazy" /></a>)}</div>
      <figcaption><details className="atlas-credits"><summary>{t.photoCredits}</summary><div className="atlas-credits-panel"><p>{t.photoChanges}</p><ul>{lgu.demographicsPhotos.map(photo => <li key={photo.src}><a href={photo.source}>{photo.title}</a> · {photo.author} · {photo.licenseUrl ? <a href={photo.licenseUrl}>{photo.license}</a> : t.photoPermission}</li>)}</ul></div></details></figcaption>
    </figure>
  </section>
}
