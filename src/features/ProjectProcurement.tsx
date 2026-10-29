import { useState } from 'react'
import { rows } from '../data/loaders'
import { transparencyRecordId } from '../domain/transparency-record'
import { catalogs, formatNumber } from '../i18n/locales'
import { PageIntro, SourceNote, type CivicProps } from './Civic'
import './records-polish.css'

export default function ProjectProcurement(props: CivicProps & { projects: boolean; correctionLink: (recordId: string, template?: string) => string; recordId?: string }) {
  const { data, locale, projects, correctionLink, recordId, href } = props
  const t = catalogs[locale]
  const [query, setQuery] = useState('')
  const records = rows(projects ? data.transparency.dpwhProjectSnapshot : data.transparency.betterGovProcurementLeads)
  const matching = records.filter(row => (projects
    ? [row.description, row.contractId, row.infraYear, row.budget, row.status]
    : [row.title, row.id, row.awardee, row.amountDisplayed, row.dateDisplayed, row.statusDisplayed]
  ).join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase())).sort((a, b) => projects
    ? Number(b.infraYear) - Number(a.infraYear)
    : (Date.parse(String(b.dateDisplayed)) || 0) - (Date.parse(String(a.dateDisplayed)) || 0))
  const sourceId = String(records[0]?.sourceId || (projects ? 'dpwh-bettergov-snapshot' : 'bettergov-cavinti-procurement'))
  const source = data.portal.sources.find(item => (item.id || item.sourceId) === sourceId)
  const sourceUrl = source?.url || source?.canonicalUrl
  const labels = locale === 'fil' ? {
    intro: projects ? 'Mga proyektong may “Cavinti” sa paglalarawan sa snapshot ng BetterGov PH.' : 'Mga procurement lead mula sa PhilGEPS Contract Browser ng BetterGov PH.',
    source: 'Tingnan ang pinagmulang BetterGov PH dataset', search: 'Hanapin sa mga rekord', contract: 'Contract ID', year: 'Taon ng imprastraktura', budget: 'Badyet', status: 'Status sa snapshot', id: 'ID sa source', awardee: 'Awardee', amount: 'Halagang ipinakita', date: 'Petsa sa source', empty: 'Walang snapshot na available.'
  } : {
    intro: projects ? 'Projects with “Cavinti” in their descriptions in the BetterGov PH snapshot.' : 'Procurement leads from BetterGov PH’s PhilGEPS Contract Browser.',
    source: 'View the BetterGov PH source dataset', search: 'Search records', contract: 'Contract ID', year: 'Infrastructure year', budget: 'Budget', status: 'Snapshot-reported status', id: 'Source ID', awardee: 'Awardee', amount: 'Displayed amount', date: 'Source date', empty: 'No snapshot is available.'
  }
  const currency = new Intl.NumberFormat(locale === 'fil' ? 'fil-PH' : 'en-PH', { style: 'currency', currency: 'PHP' })
  const path = `transparency/${projects ? 'projects' : 'procurement'}`
  if (recordId) {
    const row = records.find(item => transparencyRecordId(item) === recordId)
    if (!row) return <><h1>{t.notFound}</h1><p>{t.notFoundText}</p><a href={href(path)}>{projects ? t.projects : t.procurement}</a></>
    const location = row.location && typeof row.location === 'object' && !Array.isArray(row.location) ? row.location : null
    const value = (item: unknown) => item === null || item === undefined || item === '' ? (locale === 'fil' ? 'Hindi nakasaad' : 'Not stated') : String(item)
    const facts = projects ? [
      [labels.contract, value(row.contractId)], [labels.year, value(row.infraYear)],
      [labels.budget, typeof row.budget === 'number' ? currency.format(row.budget) : value(row.budget)],
      [labels.status, value(row.status)], [locale === 'fil' ? 'Tanggapan / probinsya sa source' : 'Office / province as reported', value(location?.province)],
      [locale === 'fil' ? 'Rehiyon' : 'Region', value(location?.region)]
    ] : [
      [labels.id, value(row.id)], [labels.awardee, value(row.awardee)], [labels.amount, value(row.amountDisplayed)],
      [labels.date, value(row.dateDisplayed)], [labels.status, value(row.statusDisplayed)]
    ]
    return <>
      <a className="service-back" href={href(path)}>{locale === 'fil' ? '← Lahat ng rekord' : '← All records'}</a>
      <header className="service-detail-header"><h1 lang="en">{value(projects ? row.description : row.title)}</h1><p>{projects ? t.projects : t.procurement}</p></header>
      <div className="service-detail-layout"><div>
        <section className="service-detail-section"><h2>{locale === 'fil' ? 'Mga detalye sa snapshot' : 'Snapshot details'}</h2>
          <dl>{facts.map(([label, fact]) => <div key={label}><dt className="directory-role">{label}</dt><dd lang="en">{fact}</dd></div>)}</dl>
        </section>
        <section className="service-detail-section"><h2>{locale === 'fil' ? 'Paano basahin ang rekord' : 'How to read this record'}</h2>
          <p>{projects
            ? (locale === 'fil' ? 'Sekundaryang snapshot ito ng mga proyektong may “Cavinti” sa paglalarawan. Maaaring saklaw ng isang proyekto ang ibang lugar; hindi nito pinatutunayan ang kasalukuyang status o gastos ng munisipyo.' : 'This secondary snapshot matches “Cavinti” in project descriptions. A project may cover other areas; the record does not verify its current status or municipal expenditure.')
            : (locale === 'fil' ? 'Bahagyang makasaysayang listahan ito na iniuugnay sa PhilGEPS. Ang halaga ay ni-round sa buong piso; hindi beripikado ang kahulugan ng petsa at status. Hindi ito patunay ng bayad o pagkumpleto.' : 'This is a partial historical listing attributed to PhilGEPS. Amounts are rounded to whole pesos; the meanings of the displayed date and status are unverified. This is not proof of payment or completion.')}</p>
        </section>
      </div><aside className="civic-aside"><h2>{locale === 'fil' ? 'Pinagmulan' : 'Source'}</h2>
        <p>{projects ? (locale === 'fil' ? 'BetterGov PH compilation na iniuugnay sa DPWH; hindi alam ang petsa ng orihinal na capture.' : 'BetterGov PH compilation attributed to DPWH; the upstream capture date is unknown.') : (locale === 'fil' ? 'BetterGov PH listing; hindi nasuri ang orihinal na PhilGEPS notices.' : 'BetterGov PH listing; the original PhilGEPS notices were not checked.')}</p>
        {sourceUrl && <p><a href={sourceUrl}>{labels.source}</a></p>}
      </aside></div>
      <SourceNote {...props} id={sourceId} />
    </>
  }
  return <>
    <PageIntro title={projects ? t.projects : t.procurement}>{labels.intro}</PageIntro>
    {sourceUrl && <p><a href={sourceUrl}>{labels.source}</a></p>}
    <SourceNote {...props} id={sourceId} />
    {records.length > 0 ? <>
      <div className="directory-tools"><label htmlFor="project-procurement-query">{labels.search}<input id="project-procurement-query" type="search" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
      <p className="civic-meta" role="status">{formatNumber(matching.length, locale)} / {formatNumber(records.length, locale)} {t.records}</p>
      {!matching.length && <p>{t.noResults}</p>}
      <ul className="record-list project-procurement-list">{matching.map((row, index) => <li key={`${String(projects ? row.contractId : row.id || row.title)}-${index}`}>
        <h2 lang="en"><a href={href(`${path}/${transparencyRecordId(row)}`)}>{String((projects ? row.description : row.title) || '—')}</a></h2>
        <dl>
          {projects ? <>
            <div><dt>{labels.contract}</dt><dd>{String(row.contractId || '—')}</dd></div>
            <div><dt>{labels.year}</dt><dd>{String(row.infraYear || '—')}</dd></div>
            <div><dt>{labels.budget}</dt><dd>{typeof row.budget === 'number' ? currency.format(row.budget) : '—'}</dd></div>
            <div><dt>{labels.status}</dt><dd lang="en">{String(row.status || '—')}</dd></div>
          </> : <>
            <div><dt>{labels.id}</dt><dd lang="en">{String(row.id || '—')}</dd></div>
            <div><dt>{labels.awardee}</dt><dd lang="en">{String(row.awardee || '—')}</dd></div>
            <div><dt>{labels.amount}</dt><dd>{String(row.amountDisplayed || '—')}</dd></div>
            <div><dt>{labels.date}</dt><dd lang="en">{String(row.dateDisplayed || '—')}</dd></div>
            <div><dt>{labels.status}</dt><dd lang="en">{String(row.statusDisplayed || '—')}</dd></div>
          </>}
        </dl>
      </li>)}</ul>
    </> : <p>{labels.empty}</p>}
    {projects && <p><a href={correctionLink('', 'project-observation.yml')}>{t.observation}</a></p>}
  </>
}
