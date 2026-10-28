import { useState } from 'react'
import { rows } from '../data/loaders'
import { catalogs, formatNumber } from '../i18n/locales'
import { PageIntro, SourceNote, type CivicProps } from './Civic'
import './records-polish.css'

export default function ProjectProcurement(props: CivicProps & { projects: boolean; correctionLink: (recordId: string, template?: string) => string }) {
  const { data, locale, projects, correctionLink } = props
  const t = catalogs[locale]
  const [query, setQuery] = useState('')
  const records = rows(projects ? data.transparency.dpwhProjectSnapshot : data.transparency.betterGovProcurementLeads)
  const matching = records.filter(row => (projects
    ? [row.description, row.contractId, row.infraYear, row.budget, row.status]
    : [row.title, row.id, row.awardee, row.amountDisplayed, row.dateDisplayed, row.statusDisplayed]
  ).join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase()))
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
  return <>
    <PageIntro title={projects ? t.projects : t.procurement}>{labels.intro}</PageIntro>
    {sourceUrl && <p><a href={sourceUrl}>{labels.source}</a></p>}
    <SourceNote {...props} id={sourceId} />
    {records.length > 0 ? <>
      <div className="directory-tools"><label htmlFor="project-procurement-query">{labels.search}<input id="project-procurement-query" type="search" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
      <p className="civic-meta" role="status">{formatNumber(matching.length, locale)} / {formatNumber(records.length, locale)} {t.records}</p>
      {!matching.length && <p>{t.noResults}</p>}
      <ul className="record-list project-procurement-list">{matching.map((row, index) => <li key={`${String(projects ? row.contractId : row.id || row.title)}-${index}`}>
        <h2 lang="en">{String((projects ? row.description : row.title) || '—')}</h2>
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
