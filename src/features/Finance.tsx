import { useState } from 'react'
import { catalogs, formatNumber } from '../i18n/locales'
import { civicCatalogs } from '../i18n/civic'
import { PageIntro, RawRecord, SourceNote, type CivicProps } from './Civic'
import { rows } from '../data/loaders'

const regularIncome = [
  [2009, 62148017.68], [2010, 69931486.50], [2011, 83392149.52], [2012, 80379224.83],
  [2013, 92741110.78], [2014, 94283213.10], [2015, 105721576.59], [2016, 111913255.20]
]

export default function Finance(props: CivicProps & { income?: boolean }) {
  const { data, locale, income } = props
  const t = catalogs[locale], c = civicCatalogs[locale]
  const categories = [c.financeCategory, c.procurementCategory, c.projectsCategory]
  const [query, setQuery] = useState('')
  const projects = rows(data.transparency.dpwhProjectSnapshot)
  const matching = projects.filter(row => [row.description, row.contractId, row.infraYear, row.status, row.budget].join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase()))
  const [procurementQuery, setProcurementQuery] = useState('')
  const procurement = rows(data.transparency.betterGovProcurementLeads)
  const matchingProcurement = procurement.filter(row => [row.title, row.id, row.awardee, row.amountDisplayed, row.dateDisplayed, row.statusDisplayed].join(' ').toLocaleLowerCase().includes(procurementQuery.toLocaleLowerCase()))
  const procurementLabels = locale === 'fil' ? {
    heading: 'Mga procurement lead mula sa BetterGov PH',
    search: 'Hanapin ang pamagat, ID, awardee, halaga, petsa o status', title: 'Pamagat sa source', id: 'ID sa source', awardee: 'Awardee', amount: 'Halagang ipinakita', date: 'Petsa sa source', status: 'Status sa source', source: 'Tingnan ang pahina ng BetterGov PH'
  } : {
    heading: 'Procurement leads from BetterGov PH',
    search: 'Search title, ID, awardee, amount, date or status', title: 'Source title', id: 'Source ID', awardee: 'Awardee', amount: 'Displayed amount', date: 'Source date', status: 'Source status', source: 'View BetterGov PH page'
  }
  const procurementSource = data.portal.sources.find(source => source.id === procurement[0]?.sourceId)
  const procurementUrl = procurementSource?.url || procurementSource?.canonicalUrl || ''
  const labels = locale === 'fil' ? {
    heading: 'Mga proyektong DPWH sa sekundaryang snapshot',
    search: 'Hanapin ang pamagat, contract ID, taon, badyet o status', title: 'Orihinal na pamagat', contract: 'Contract ID', year: 'Taon', budget: 'Badyet (₱)', status: 'Status sa snapshot', source: 'Tingnan ang pinagmulang dataset'
  } : {
    heading: 'DPWH projects in a secondary snapshot',
    search: 'Search title, contract ID, year, budget or status', title: 'Original title', contract: 'Contract ID', year: 'Year', budget: 'Budget (₱)', status: 'Snapshot-reported status', source: 'View source dataset'
  }
  const projectSource = data.portal.sources.find(source => source.id === projects[0]?.sourceId)
  const datasetUrl = projectSource?.url || projectSource?.canonicalUrl || ''
  const incomeLabels = locale === 'fil' ? {
    heading: 'Makasaysayang regular na kita ng munisipyo',
    year: 'Taong pinansyal', amount: 'Regular na kita (₱)', source: 'Tingnan ang datos at depinisyon sa PhilAtlas'
  } : {
    heading: 'Historical municipal regular income',
    year: 'Fiscal year', amount: 'Regular income (₱)', source: 'View the data and definition on PhilAtlas'
  }
  return <><PageIntro title={income ? t.income : t.finance} />
    <section><h2>{incomeLabels.heading}</h2>
      <p><a href="https://www.philatlas.com/luzon/r04a/laguna/cavinti.html">{incomeLabels.source}</a></p>
      <div className="table-wrap" role="region" aria-label={incomeLabels.heading} tabIndex={0}><table className="coverage-table"><thead><tr><th scope="col">{incomeLabels.year}</th><th scope="col">{incomeLabels.amount}</th></tr></thead><tbody>
        {regularIncome.map(([year, amount]) => <tr key={year}><td>{year}</td><td>{new Intl.NumberFormat(locale === 'fil' ? 'fil-PH' : 'en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}</td></tr>)}
      </tbody></table></div>
    </section>
    <div className="civic-split"><section><h2>{c.documentLeads}</h2><p className="measure">{c.documentLimit}</p><ul className="record-list">{rows(data.transparency.officialLocalDocumentLeads).map(row => <li key={String(row.documentNumber)}><p className="civic-meta" lang="en">{String(row.documentNumber)}</p><h3><a lang="en" href={String(row.documentUrl)}>{String(row.titleAsIndexed)}</a></h3>{row.scopeWarning && <p lang="en">{String(row.scopeWarning)}</p>}<SourceNote {...props} id={String(row.sourceId)} /></li>)}</ul></section>
      <aside className="civic-aside"><h2>{c.coverageHeading}</h2><dl>{categories.map((category, index) => <div key={category}><dt className="directory-role">{category}</dt><dd style={{ margin: '0 0 1rem' }}>{index === 0 ? '2009–2016' : c.coverageMissing}</dd></div>)}</dl></aside></div>
    {projects.length > 0 && <section><h2>{labels.heading}</h2>
      <p><a href={datasetUrl}>{labels.source}</a></p><SourceNote {...props} id={String(projects[0].sourceId)} />
      <div className="directory-tools"><label htmlFor="dpwh-query">{labels.search}<input id="dpwh-query" type="search" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
      <p className="civic-meta" role="status">{formatNumber(matching.length, locale)} / {formatNumber(projects.length, locale)} {t.records}</p>
      {!matching.length && <p>{t.noResults}</p>}
      <div className="table-wrap" role="region" aria-label={labels.heading} tabIndex={0}><table className="coverage-table"><thead><tr><th scope="col">{labels.title}</th><th scope="col">{labels.contract}</th><th scope="col">{labels.year}</th><th scope="col">{labels.budget}</th><th scope="col">{labels.status}</th></tr></thead><tbody>
        {matching.map(row => <tr key={String(row.contractId)}><td lang="en"><a href={datasetUrl}>{String(row.description)}</a></td><td>{String(row.contractId)}</td><td>{String(row.infraYear)}</td><td>{typeof row.budget === 'number' ? new Intl.NumberFormat(locale === 'fil' ? 'fil-PH' : 'en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.budget) : '—'}</td><td lang="en">{String(row.status)}</td></tr>)}
      </tbody></table></div>
    </section>}
    {procurement.length > 0 && <section><h2>{procurementLabels.heading}</h2>
      <p><a href={procurementUrl}>{procurementLabels.source}</a></p><SourceNote {...props} id={String(procurement[0].sourceId)} />
      <div className="directory-tools"><label htmlFor="procurement-query">{procurementLabels.search}<input id="procurement-query" type="search" value={procurementQuery} onChange={event => setProcurementQuery(event.target.value)} /></label></div>
      <p className="civic-meta" role="status">{formatNumber(matchingProcurement.length, locale)} / {formatNumber(procurement.length, locale)} {t.records}</p>
      {!matchingProcurement.length && <p>{t.noResults}</p>}
      <div className="table-wrap" role="region" aria-label={procurementLabels.heading} tabIndex={0}><table className="coverage-table"><thead><tr><th scope="col">{procurementLabels.title}</th><th scope="col">{procurementLabels.id}</th><th scope="col">{procurementLabels.awardee}</th><th scope="col">{procurementLabels.amount}</th><th scope="col">{procurementLabels.date}</th><th scope="col">{procurementLabels.status}</th></tr></thead><tbody>
        {matchingProcurement.map((row, index) => <tr key={`${String(row.id || row.title)}-${index}`}><td lang="en">{String(row.title)}</td><td lang="en">{row.id ? String(row.id) : '—'}</td><td lang="en">{String(row.awardee)}</td><td>{String(row.amountDisplayed)}</td><td lang="en">{String(row.dateDisplayed)}</td><td lang="en">{String(row.statusDisplayed)}</td></tr>)}
      </tbody></table></div>
    </section>}
    <section lang="en"><h2>BSP opinions on proposed municipal borrowing</h2>
      <p>These Monetary Board opinions concern proposed domestic borrowing by the Municipality of Cavinti, Laguna, Region IV-A (CALABARZON). The amounts are proposals, not loan drawdowns or outstanding debt; the records do not establish that the proposed projects were completed.</p>
      <ul className="record-list">{rows(data.transparency.bspProposedBorrowingOpinions).map(row => <li key={String(row.resolutionNumber)}>
        <h3>₱{Number(row.proposedLoanAmountPhpMillion).toFixed(2)} million proposed</h3>
        <p>{String(row.reportPeriod)} · Monetary Board resolution {String(row.resolutionNumber)}, dated {String(row.resolutionDate)}</p>
        <p>{String(row.purposeAsReported)}</p>
        <p><a href={`${String(row.sourceUrl)}#page=${String(row.sourcePage)}`}>BSP report, page {String(row.sourcePage)}</a></p>
        <SourceNote {...props} id={String(row.sourceId)} />
      </li>)}</ul>
    </section>
    <h2>{c.sourceChecks}</h2><div className="table-wrap" role="region" aria-label={c.sourceChecks} tabIndex={0}><table className="coverage-table"><thead><tr><th scope="col">{t.sources}</th><th scope="col">{c.availability}</th></tr></thead><tbody>{rows(data.transparency.sourceChecks).map(check => <tr key={String(check.sourceId)}><td><SourceNote {...props} id={String(check.sourceId)} /></td><td lang="en">{String(check.retrievalStatus)}</td></tr>)}</tbody></table></div>
    <RawRecord {...props} value={data.transparency} />
  </>
}
