import { useState } from 'react'
import { rows } from '../data/loaders'
import { catalogs, formatNumber } from '../i18n/locales'
import { PageIntro, SourceNote, type CivicProps } from './Civic'

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
    note: projects ? 'Na-download ang sekundaryang snapshot noong Oktubre 27, 2026; hindi alam ang orihinal na petsa ng pagkuha at maaaring luma na ang mga status. Hindi kumpleto ang paghahanap sa teksto, at may mga proyektong sumasaklaw sa maraming munisipalidad. Ang badyet ay hindi katumbas ng paggasta para lamang sa Cavinti. Hindi ito independiyenteng napatunayan o kumpletong talaan.' : 'Dalawampung nakikitang hanay ang nakuha noong Oktubre 27, 2026. Hindi alam ang kahulugan ng petsa; ang halagang ipinakita sa buong piso ay rounded at hindi eksaktong halaga. Hindi napatunayan sa pangunahing notice ang mga rekord. Maaaring luma na ang status; hindi ito patunay ng pagbabayad o pagkumpleto, at hindi ito kumpletong talaan.',
    source: 'Tingnan ang pinagmulang BetterGov PH dataset', search: 'Hanapin sa mga rekord', contract: 'Contract ID', year: 'Taon ng imprastraktura', budget: 'Badyet', status: 'Status sa snapshot', id: 'ID sa source', awardee: 'Awardee', amount: 'Halagang ipinakita', date: 'Petsa sa source (hindi alam ang kahulugan)', empty: 'Walang snapshot na available.'
  } : {
    intro: projects ? 'Projects with “Cavinti” in their descriptions in the BetterGov PH snapshot.' : 'Procurement leads from BetterGov PH’s PhilGEPS Contract Browser.',
    note: projects ? 'The secondary snapshot was downloaded October 27, 2026; its original capture date is unknown and statuses may be stale. Text matching is incomplete, and some projects span multiple municipalities. Budgets are not Cavinti-only expenditure. This is not an independently verified or complete register.' : 'Twenty visible rows were retrieved October 27, 2026. The meaning of the date is unknown; displayed whole-peso amounts are rounded, not exact. The records have not been verified against primary notices. Source statuses may be stale; these leads are not proof of payment or completion and are not a complete register.',
    source: 'View the BetterGov PH source dataset', search: 'Search records', contract: 'Contract ID', year: 'Infrastructure year', budget: 'Budget', status: 'Snapshot-reported status', id: 'Source ID', awardee: 'Awardee', amount: 'Displayed amount', date: 'Source date (meaning unknown)', empty: 'No snapshot is available.'
  }
  const currency = new Intl.NumberFormat(locale === 'fil' ? 'fil-PH' : 'en-PH', { style: 'currency', currency: 'PHP' })
  return <>
    <PageIntro title={projects ? t.projects : t.procurement}>{labels.intro}</PageIntro>
    <p className="measure">{labels.note}</p>
    {sourceUrl && <p><a href={sourceUrl}>{labels.source}</a></p>}
    <SourceNote {...props} id={sourceId} />
    {records.length > 0 ? <>
      <div className="directory-tools"><label htmlFor="project-procurement-query">{labels.search}<input id="project-procurement-query" type="search" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
      <p className="civic-meta" role="status">{formatNumber(matching.length, locale)} / {formatNumber(records.length, locale)} {t.records}</p>
      {!matching.length && <p>{t.noResults}</p>}
      <ul className="record-list">{matching.map((row, index) => <li key={`${String(projects ? row.contractId : row.id || row.title)}-${index}`}>
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
