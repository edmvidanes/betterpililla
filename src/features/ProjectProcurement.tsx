import { useState } from 'react'
import { rows, type DataRecord } from '../data/loaders'
import { transparencyRecordId } from '../domain/transparency-record'
import { catalogs, formatNumber } from '../i18n/locales'
import { EvidenceTree, ExternalDocumentLink } from '../components/Evidence'
import { Pagination, usePagination } from '../components/Pagination'
import { PageIntro, RawRecord, SourceNote, type CivicProps } from './Civic'
import './records-polish.css'

function DpwhDetails({ details, ...props }: CivicProps & { details: DataRecord }) {
  const fil = props.locale === 'fil'
  const api = details.data && typeof details.data === 'object' && !Array.isArray(details.data) ? details.data : null
  const currency = new Intl.NumberFormat(fil ? 'fil-PH' : 'en-PH', { style: 'currency', currency: 'PHP' })
  const groups: [string, string, [string, string, string][]][] = [
    ['Project and progress', 'Proyekto at progreso', [
      ['contractId', 'Contract ID', 'Contract ID'], ['description', 'Description', 'Paglalarawan'],
      ['category', 'Category', 'Kategorya'], ['status', 'Reported status', 'Iniulat na status'],
      ['progress', 'Reported progress', 'Iniulat na progreso'], ['contractor', 'Contractor', 'Kontratista'],
      ['infraType', 'Infrastructure type', 'Uri ng imprastraktura'], ['infraYear', 'Infrastructure year', 'Taon ng imprastraktura'],
      ['nysReason', 'Not-yet-started reason', 'Dahilan kung hindi pa nasisimulan'],
    ]],
    ['Amounts, program and funds', 'Mga halaga, programa at pondo', [
      ['budget', 'Budget', 'Badyet'], ['amountPaid', 'Amount paid as reported', 'Iniulat na halagang nabayaran'],
      ['programName', 'Program', 'Programa'], ['sourceOfFunds', 'Source of funds', 'Pinagmulan ng pondo'],
    ]],
    ['Dates', 'Mga petsa', [
      ['startDate', 'Start date', 'Petsa ng simula'], ['completionDate', 'Completion date', 'Petsa ng pagkumpleto'],
      ['contractEffectivityDate', 'Contract effectivity date', 'Petsa ng bisa ng kontrata'], ['expiryDate', 'Expiry date', 'Petsa ng pagtatapos ng bisa'],
    ]],
    ['Location and verification', 'Lokasyon at beripikasyon', [
      ['location', 'Location', 'Lokasyon'], ['latitude', 'Latitude', 'Latitude'], ['longitude', 'Longitude', 'Longitude'],
      ['coordinates', 'Coordinates', 'Mga coordinate'], ['isVerifiedByDpwh', 'Verified by DPWH (as reported)', 'Beripikado ng DPWH (ayon sa source)'],
      ['isVerifiedByPublic', 'Verified by public (as reported)', 'Beripikado ng publiko (ayon sa source)'],
    ]],
    ['Components', 'Mga bahagi', [['components', 'Components', 'Mga bahagi']]],
    ['Procurement and bidders', 'Procurement at mga bidder', [
      ['procurement', 'Procurement', 'Procurement'], ['winnerNames', 'Winner names', 'Mga pangalan ng nanalo'],
      ['bidders', 'Bidders', 'Mga bidder'],
    ]],
    ['Documents and media', 'Mga dokumento at media', [
      ['links', 'Document links', 'Mga link ng dokumento'], ['imageSummary', 'Image summary', 'Buod ng mga larawan'],
      ['isLive', 'Live (as reported)', 'Live (ayon sa source)'], ['livestreamUrl', 'Livestream URL', 'Livestream URL'],
      ['livestreamVideoId', 'Livestream video ID', 'Livestream video ID'], ['livestreamDetectedAt', 'Livestream detected at', 'Petsa ng pagtuklas ng livestream'],
    ]],
  ]
  return <section className="project-report">
    <header className="project-report-intro">
      <h2>{fil ? 'Detalye ng proyekto' : 'Project details'}</h2>
      <p>{fil ? 'Hiwalay itong capture sa makasaysayang snapshot; maaaring magkaiba ang mga halaga at status. Hindi nito pinatutunayan ang kasalukuyang kondisyon, bayad o pagkumpleto. Ang zero ay iniulat na halaga, hindi patunay ng bayad o pagkumpleto.' : 'This capture is separate from the historical snapshot; values and status may differ. It does not verify current conditions, payment or completion. A zero is a reported value, not proof of payment or completion.'}</p>
      <p className="civic-meta">{fil ? 'Nakuha noong' : 'Retrieved'}: {typeof details.retrievedAt === 'string' && details.retrievedAt ? details.retrievedAt : (fil ? 'Hindi alam' : 'Unknown')}. {typeof details.sourceUrl === 'string' && details.sourceUrl && <ExternalDocumentLink url={details.sourceUrl}>{fil ? 'Pinagmulang DPWH API' : 'DPWH API source'}</ExternalDocumentLink>}</p>
    </header>
    {api ? <>
      {groups.map(([english, filipino, fields], index) => {
        const content = <dl className="project-report-facts">{fields.map(([key, en, tl]) => {
          const value = api[key]
          const missing = value == null || value === '' || (Array.isArray(value) && value.length === 0)
          const formatted = typeof value === 'number' && (key === 'budget' || key === 'amountPaid') ? currency.format(value)
            : typeof value === 'number' && key === 'progress' ? `${value.toLocaleString(fil ? 'fil-PH' : 'en-PH')}%`
            : typeof value === 'boolean' && (key === 'isVerifiedByDpwh' || key === 'isVerifiedByPublic') ? (value ? (fil ? 'Oo' : 'Yes') : (fil ? 'Hindi' : 'No'))
            : null
          return <div key={key} className={typeof value === 'object' && value !== null ? 'project-report-complex' : undefined}><dt>{fil ? tl : en}</dt><dd>{missing
            ? (fil ? 'Hindi nakasaad / walang rekord' : 'Not stated / no records')
            : formatted ?? <EvidenceTree value={value} locale={props.locale} sources={props.data.portal.sources} sourceHref={id => props.href(`sources/${encodeURIComponent(id)}`)} />}</dd></div>
        })}</dl>
        return index < 3 ? <section className="project-report-group" key={english}><h3>{fil ? filipino : english}</h3>{content}</section>
          : <details className="project-report-disclosure" key={english}><summary>{fil ? filipino : english}</summary>
            {index === 3 && <p className="civic-meta">{fil ? 'Hindi independiyenteng beripikado ang mga coordinate.' : 'Coordinates are not independently verified.'}</p>}{content}</details>
      })}
      <RawRecord {...props} value={api} />
    </> : <p>{fil ? 'Walang detalye ng API na available.' : 'API details are unavailable.'}</p>}
  </section>
}
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
  const listingPage = usePagination(matching, JSON.stringify([projects, query]))
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
    const details = row.dpwhDetails && typeof row.dpwhDetails === 'object' && !Array.isArray(row.dpwhDetails) ? row.dpwhDetails : null
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
      <header className={`service-detail-header${projects ? ' project-detail-header' : ''}`}><h1 lang="en">{value(projects ? row.description : row.title)}</h1><p>{projects ? t.projects : t.procurement}</p></header>
      <div className="service-detail-layout"><div>
        {projects && (details ? <DpwhDetails {...props} details={details} /> : <section className="service-detail-section"><h2>{locale === 'fil' ? 'Detalye mula sa DPWH API' : 'DPWH API details'}</h2><p>{locale === 'fil' ? 'Walang nakuhang detalye mula sa DPWH API para sa rekord na ito.' : 'No DPWH API details were captured for this record.'}</p></section>)}
        {projects ? <details className="project-report-disclosure project-report-snapshot"><summary>{locale === 'fil' ? 'Naunang BetterGov snapshot' : 'Earlier BetterGov snapshot'}</summary>
          <dl className="project-report-facts">{facts.map(([label, fact]) => <div key={label}><dt>{label}</dt><dd lang="en">{fact}</dd></div>)}</dl>
        </details> : <section className="service-detail-section"><h2>{locale === 'fil' ? 'Mga detalye sa snapshot' : 'Snapshot details'}</h2>
          <dl>{facts.map(([label, fact]) => <div key={label}><dt className="directory-role">{label}</dt><dd lang="en">{fact}</dd></div>)}</dl>
        </section>}
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
      <ul className="record-list project-procurement-list">{listingPage.visible.map((row, index) => <li key={`${String(projects ? row.contractId : row.id || row.title)}-${index}`}>
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
      <Pagination {...listingPage} locale={locale} label={projects ? t.projects : t.procurement} />
    </> : <p>{labels.empty}</p>}
    {projects && <p><a href={correctionLink('', 'project-observation.yml')}>{t.observation}</a></p>}
  </>
}
