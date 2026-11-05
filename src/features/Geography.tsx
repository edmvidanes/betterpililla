import CheckedLink from '../components/CheckedLink'
import { lgu } from '../config/lgu'
import { catalogs } from '../i18n/locales'
import { civicCatalogs } from '../i18n/civic'
import PilillaMap from './home/PilillaMap'
import WorkInProgress from '../components/WorkInProgress'
import { PageIntro, SourceNote, type CivicProps } from './Civic'

export default function Geography(props: CivicProps) {
  const { locale, href } = props
  const t = catalogs[locale], c = civicCatalogs[locale]
  return <>
    <PageIntro title={t.map} />
    <div className="geography-map">
      <PilillaMap locale={locale} center={lgu.mapView.center} zoom={lgu.mapView.zoom} />
    </div>
    <p className="civic-meta">{c.mapPrivacy} <CheckedLink href={href('privacy')}>{t.privacy}</CheckedLink></p>
    <section aria-labelledby="geography-facts-title">
      <h2 id="geography-facts-title">{c.geographyFacts}</h2>
      <WorkInProgress locale={locale} path="map" />
      <SourceNote {...props} id={lgu.sourceIds.about} />
    </section>
  </>
}
