import { lgu } from '../config/lgu'
import { catalogs } from '../i18n/locales'
import { civicCatalogs } from '../i18n/civic'
import { LinkArrow, PageIntro, RawRecord, SourceNote, type CivicProps } from './Civic'
import { rows, type DataRecord } from '../data/loaders'

export function Places(props: CivicProps) {
  const { data, locale, href } = props
  const t = catalogs[locale], c = civicCatalogs[locale]
  const sectors = rows(data.sectors.sectors)
  const sectorTitles: Record<string, string> = c
  const education = sectors.find(row => row.sector === 'education')
  const elementary = education?.elementaryDirectory as DataRecord | undefined
  const copy = locale === 'fil' ? {
    elementary: 'Mga paaralang elementarya', integrated: 'Mga integrated high school',
    directory: 'Direktoryo ng DepEd Laguna (walang petsa); tiningnan noong 27 Oktubre 2026. Sekondaryang sanggunian ito, hindi kumpletong kasalukuyang masterlist.',
    source: 'Tingnan ang direktoryo ng mga paaralang elementarya',
    topics: 'Mga sanggunian at kakulangan sa bawat paksa. Ang petsa ng snapshot ay 21 Oktubre 2026; maaaring mas luma ang mga sanggunian.',
    references: 'Mga sanggunian', record: 'Naitalang dokumento', indexOnly: 'Pamagat sa opisyal na index lamang; hindi pa nasusuri ang buong dokumento.',
  } : {
    elementary: 'Elementary schools', integrated: 'Integrated high schools',
    directory: 'DepEd Laguna directory (undated), accessed 27 October 2026. This secondary reference is not a complete current masterlist.',
    source: 'View the elementary school directory',
    topics: 'References and gaps by topic. The snapshot is dated 21 October 2026; underlying sources may be older.',
    references: 'Sources', record: 'Recorded document', indexOnly: 'Official index title only; the full document has not been reviewed.',
  }
  const health = rows(data.contacts.records).find(row => row.category === 'health-emergency')
  return <>
    <PageIntro title={t.places} />
    <div className="civic-split"><section><h2>{c.education}</h2>
      <p className="civic-meta">{copy.directory}</p>
      <h3>{copy.elementary}</h3>
      <ul className="record-list">{rows(elementary?.records).map(school => <li key={String(school.schoolId)}><h3 lang="en">{String(school.schoolNameAsPublished)}</h3><p className="civic-meta">{c.schoolId}: {String(school.schoolId)}</p></li>)}</ul>
      <p className="civic-meta">{locale === 'fil' ? 'Ang direktoryong ito ay gumagamit ng ID 164517 para sa Layasin; ang naunang search lead na 164526 ay tumutukoy sa ibang paaralan sa hiwalay na listahan ng DepEd.' : 'This directory lists Layasin as ID 164517; an earlier search lead, 164526, identifies a different school in a separate DepEd list.'}</p>
      {typeof elementary?.sourceUrl === 'string' && <p><a href={elementary.sourceUrl}>{copy.source}</a></p>}
      <h3>{copy.integrated}</h3>
      <ul className="record-list">{rows(education?.directoryLeads).map(school => <li key={String(school.schoolId)}><h3 lang="en">{String(school.schoolNameAsPublished)}</h3><p className="civic-meta">{c.schoolId}: {String(school.schoolId)}</p><SourceNote {...props} id={String(school.sourceId)} /></li>)}</ul>
    </section><aside className="civic-aside"><h2>{c.health}</h2>{health && <ul className="civic-links"><li><a lang="en" href={href(`government/offices/${health.category}`)}>{String(health.service)}<LinkArrow /></a></li></ul>}<SourceNote {...props} id={lgu.sourceIds.about} /></aside></div>
    <h2>{c.otherCoverage}</h2>
    <p className="civic-meta">{copy.topics}</p>
    {sectors.filter(row => row.sector !== 'education' && row.sector !== 'health').map(row => {
      const record = row.knownRecord as Record<string, unknown> | undefined
      const sources = rowsOfStrings(row.discoverySources)
      return <details key={String(row.sector)} className="civic-disclosure"><summary>{sectorTitles[String(row.sector)] || String(row.sector)}</summary>
        {typeof row.context === 'string' && <p lang="en">{row.context}</p>}
        {typeof row.notes === 'string' && <p lang="en">{row.notes}</p>}
        {record && <><h3>{copy.record}</h3><p lang="en">{String(record.documentNumber)}: {String(record.title)}</p><p>{copy.indexOnly}</p>{typeof record.attachmentUrl === 'string' && <a href={record.attachmentUrl}>{String(record.documentNumber)}</a>}</>}
        {rowsOfStrings(row.missingData).length > 0 && <><h3>{c.missingData}</h3><ul>{rowsOfStrings(row.missingData).map(value => <li key={value} lang="en">{value}</li>)}</ul></>}
        {sources.length > 0 && <><h3>{copy.references}</h3><ul>{sources.map(url => <li key={url}><a href={url}>{new URL(url).hostname}</a></li>)}</ul></>}
        {typeof row.sourceId === 'string' && <SourceNote {...props} id={row.sourceId} />}
        {rowsOfStrings(row.sourceIds).map(id => <SourceNote key={id} {...props} id={id} />)}
        <RawRecord {...props} value={row} /></details>
    })}
  </>
}
function rowsOfStrings(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [] }

export function Advisories(props: CivicProps) {
  const { data, locale, href } = props
  const t = catalogs[locale], c = civicCatalogs[locale]
  const disaster = rows(data.sectors.sectors).find(row => row.sector === 'disaster-and-hazards')
  const plan = disaster?.knownRecord as Record<string, unknown> | undefined
  return <>
    <PageIntro title={t.advisories} />
    <div className="civic-split"><section><h2>{c.officialResources}</h2><ul className="civic-links">
      <li><a href="https://www.pagasa.dost.gov.ph/">{c.pagasa}<LinkArrow /></a></li>
      <li><a href="https://www.phivolcs.dost.gov.ph/gis-web-hazard-maps">{c.phivolcs}<LinkArrow /></a></li>
      <li><a href="https://hazardhunter.georisk.gov.ph/map">{c.hazardhunter}<LinkArrow /></a></li>
    </ul><p className="civic-meta">{c.hazardLimit}</p><a href={href('government/offices')}>{c.publishedContacts}</a></section>
    <aside className="civic-aside"><h2>{c.planReference}</h2>{plan && <><p lang="en">{String(plan.documentNumber)}</p><h3 lang="en">{String(plan.title)}</h3></>}<p>{c.planLimit}</p><SourceNote {...props} id={lgu.sourceIds.legislative} /></aside></div>
    {rows(data.sectors.sectors).filter(row => /weather|disaster/.test(String(row.sector))).map(row => <RawRecord key={String(row.sector)} {...props} value={row} />)}
  </>
}
