import { lgu } from '../config/lgu'
import type { DataRecord } from '../data/loaders'
import { catalogs } from '../i18n/locales'
import { civicCatalogs } from '../i18n/civic'
import CavintiMap from './home/CavintiMap'
import { PageIntro, RawRecord, SourceNote, type CivicProps } from './Civic'

export default function Geography(props: CivicProps) {
  const { data, locale, href } = props
  const t = catalogs[locale], c = civicCatalogs[locale]
  const geography = data.municipality.geography as DataRecord
  const coordinates = geography.officialAboutPageCoordinatesText as DataRecord
  const neighbors = geography.neighborsAsPublished as string[]
  return <>
    <PageIntro title={t.map} />
    <div className="geography-map">
      <CavintiMap locale={locale} center={lgu.mapView.center} zoom={lgu.mapView.zoom} />
    </div>
    <p className="civic-meta">{c.mapPrivacy} <a href={href('privacy')}>{t.privacy}</a></p>
    <section aria-labelledby="geography-facts-title">
      <h2 id="geography-facts-title">{c.geographyFacts}</h2>
      <div className="civic-split">
        <div><h3>{c.geographyNeighbors}</h3><ul className="geography-neighbors">{neighbors.map(neighbor => <li key={neighbor} lang="en">{neighbor}</li>)}</ul></div>
        <div className="civic-aside"><h3>{c.geographyCoordinates}</h3>
          <dl className="geography-coordinates">
            <div><dt>{c.latitude}</dt><dd>{String(coordinates.latitudeRange)}</dd></div>
            <div><dt>{c.longitude}</dt><dd>{String(coordinates.longitudeRange)}</dd></div>
          </dl>
          <p>{c.geographyCoordinateNote}</p>
        </div>
      </div>
      <SourceNote {...props} id={lgu.sourceIds.about} />
    </section>
    <RawRecord {...props} value={geography} />
  </>
}
