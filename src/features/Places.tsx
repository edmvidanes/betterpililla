import { lgu } from '../config/lgu'
import { catalogs } from '../i18n/locales'
import { civicCatalogs } from '../i18n/civic'
import { LinkArrow, PageIntro, RawRecord, SourceNote, type CivicProps } from './Civic'
import { rows } from '../data/loaders'

export function Places(props: CivicProps) {
  const { data, locale, href } = props
  const t = catalogs[locale], c = civicCatalogs[locale]
  const sectors = rows(data.sectors.sectors)
  const sectorTitles: Record<string, string> = c
  const education = sectors.find(row => row.sector === 'education')
  const health = rows(data.contacts.records).find(row => row.category === 'health-emergency')
  return <>
    <PageIntro title={t.places}>{c.facilitiesIntro}</PageIntro>
    <div className="civic-split"><section><h2>{c.education}</h2><p className="measure">{c.schoolLimit}</p>
      <ul className="record-list">{rows(education?.directoryLeads).map(school => <li key={String(school.schoolId)}><h3 lang="en">{String(school.schoolNameAsPublished)}</h3><p className="civic-meta">{c.schoolId}: {String(school.schoolId)}</p><SourceNote {...props} id={String(school.sourceId)} /></li>)}</ul>
    </section><aside className="civic-aside"><h2>{c.health}</h2><p>{c.healthLimit}</p>{health && <ul className="civic-links"><li><a lang="en" href={href(`government/offices/${health.category}`)}>{String(health.service)}<LinkArrow /></a></li></ul>}<p className="civic-meta">{c.contactTitle}</p><SourceNote {...props} id={lgu.sourceIds.about} /></aside></div>
    <h2>{c.otherCoverage}</h2><p>{c.coverageMissing}</p>
    {sectors.filter(row => row.sector !== 'education' && row.sector !== 'health').map(row => <details key={String(row.sector)} className="civic-disclosure"><summary>{sectorTitles[String(row.sector)] || String(row.sector)}</summary><p>{c.coverageMissing}</p><h3>{c.missingData}</h3><ul>{rowsOfStrings(row.missingData).map(value => <li key={value} lang="en">{value}</li>)}</ul><RawRecord {...props} value={row} /></details>)}
  </>
}
function rowsOfStrings(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [] }

export function Advisories(props: CivicProps) {
  const { data, locale, href } = props
  const t = catalogs[locale], c = civicCatalogs[locale]
  const disaster = rows(data.sectors.sectors).find(row => row.sector === 'disaster-and-hazards')
  const plan = disaster?.knownRecord as Record<string, unknown> | undefined
  return <>
    <PageIntro title={t.advisories}>{c.advisoriesIntro}</PageIntro>
    <div className="notice" role="note"><strong>{c.noLiveAlerts}</strong><p>{c.noLiveAlertsText}</p></div>
    <div className="civic-split"><section><h2>{c.officialResources}</h2><ul className="civic-links">
      <li><a href="https://www.pagasa.dost.gov.ph/">{c.pagasa}<LinkArrow /></a></li>
      <li><a href="https://www.phivolcs.dost.gov.ph/gis-web-hazard-maps">{c.phivolcs}<LinkArrow /></a></li>
      <li><a href="https://hazardhunter.georisk.gov.ph/map">{c.hazardhunter}<LinkArrow /></a></li>
    </ul><p className="civic-meta">{c.hazardLimit}</p><a href={href('government/offices')}>{c.publishedContacts}</a></section>
    <aside className="civic-aside"><h2>{c.planReference}</h2>{plan && <><p lang="en">{String(plan.documentNumber)}</p><h3 lang="en">{String(plan.title)}</h3></>}<p>{c.planLimit}</p><SourceNote {...props} id={lgu.sourceIds.legislative} /></aside></div>
    {rows(data.sectors.sectors).filter(row => /weather|disaster/.test(String(row.sector))).map(row => <RawRecord key={String(row.sector)} {...props} value={row} />)}
  </>
}
