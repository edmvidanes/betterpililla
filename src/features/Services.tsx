import { useState } from 'react'
import { lgu } from '../config/lgu'
import { catalogs, formatDate } from '../i18n/locales'
import { civicCatalogs } from '../i18n/civic'
import { LinkArrow, PageIntro, RawRecord, SourceNote, type CivicProps } from './Civic'
import { rows } from '../data/loaders'

export default function Services(props: CivicProps) {
  const { data, locale, href } = props
  const t = catalogs[locale], c = civicCatalogs[locale]
  const [query, setQuery] = useState(new URLSearchParams(location.search).get('q') || '')
  const services = rows(data.services.services)
  const matching = services.filter(row => String(row.name).toLocaleLowerCase().includes(query.toLocaleLowerCase()))
  return <>
    <PageIntro title={t.services}>{c.servicesIntro}</PageIntro>
    <div className="civic-split"><section>
      {services.length ? <><label>{c.filterDirectory}<input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label><ul className="record-list">{matching.map(row => <li key={String(row.recordId)}><h2><a href={href(`services/${encodeURIComponent(String(row.recordId))}`)}>{String(row.name)}</a></h2><SourceNote {...props} id={String(row.sourceId)} /></li>)}</ul>{!matching.length && <p role="status">{t.noResults}</p>}</> : <div className="civic-empty"><h2>{c.serviceMissing}</h2><p>{c.serviceMissingText}</p></div>}
      <ul className="civic-links"><li><a href={String(data.services.sourceUrl)}>{c.officialCharter}<LinkArrow /></a></li><li><a href={href('government/offices')}>{c.contactOffice}<LinkArrow /></a></li></ul>
      <p className="civic-meta">{t.capture}: {formatDate(String(data.services.capturedAt), locale)}</p>
      <SourceNote {...props} id={lgu.sourceIds.charter} />
    </section><aside className="civic-aside"><h2>{c.beforeVisit}</h2><p>{c.beforeVisitText}</p><h3>{c.publishedContacts}</h3><ul className="civic-links">{rows(data.contacts.records).map(row => <li key={String(row.category)}><a href={href(`government/offices/${row.category}`)} lang="en">{String(row.service)}<LinkArrow /></a></li>)}</ul></aside></div>
    <RawRecord {...props} value={data.services} />
  </>
}
