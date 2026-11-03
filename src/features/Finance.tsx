import { useState } from 'react'
import { catalogs, formatNumber } from '../i18n/locales'
import { civicCatalogs } from '../i18n/civic'
import { PageIntro, RawRecord, SourceNote, type CivicProps } from './Civic'
import { rows } from '../data/loaders'
import { transparencyRecordId } from '../domain/transparency-record'
import { Pagination, usePagination } from '../components/Pagination'
import sreDataset from '../data/pililla-sre.json'

const regularIncome: [number, number][] = [
  
]

export default function Finance(props: CivicProps & { income?: boolean }) {
  const { data, locale, income, href } = props
  const t = catalogs[locale], c = civicCatalogs[locale]
  const categories = [c.financeCategory, c.procurementCategory, c.projectsCategory]
  const [query, setQuery] = useState('')
  const projects = rows(data.transparency.dpwhProjectSnapshot)
  const matching = projects.filter(row => [row.description, row.contractId, row.infraYear, row.status, row.budget].join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase())).sort((a, b) => Number(b.infraYear) - Number(a.infraYear))
  const [procurementQuery, setProcurementQuery] = useState('')
  const procurement = rows(data.transparency.betterGovProcurementLeads)
  const matchingProcurement = procurement.filter(row => [row.title, row.id, row.awardee, row.amountDisplayed, row.dateDisplayed, row.statusDisplayed].join(' ').toLocaleLowerCase().includes(procurementQuery.toLocaleLowerCase())).sort((a, b) => (Date.parse(String(b.dateDisplayed)) || 0) - (Date.parse(String(a.dateDisplayed)) || 0))
  const incomePage = usePagination(regularIncome)
  const documentPage = usePagination(rows(data.transparency.officialLocalDocumentLeads))
  const projectPage = usePagination(matching, query)
  const procurementPage = usePagination(matchingProcurement, procurementQuery)
  const borrowingPage = usePagination([...rows(data.transparency.bspProposedBorrowingOpinions)].sort((a, b) => String(b.resolutionDate).localeCompare(String(a.resolutionDate))))
  const sourceChecksPage = usePagination(rows(data.transparency.sourceChecks))
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
    heading: 'Pananalapi ng Pililla - hindi pa nakokolekta (tingnan ang opisyal na portal)',
    year: 'Taong pinansyal', amount: 'Regular na kita (₱)', source: 'Tingnan ang datos at depinisyon sa PhilAtlas'
  } : {
    heading: 'Pililla finance - not yet collected (see official portals)',
    year: 'Fiscal year', amount: 'Regular income (₱)', source: 'Commission on Audit - Annual Audit Reports for LGUs (search Pililla, Rizal)'
  }
  return <><PageIntro title={income ? t.income : t.finance} />
    <section><h2>{incomeLabels.heading}</h2>
      <p><a href="https://www.coa.gov.ph/reports/annual-audit-reports/aar-local-government-units/">{incomeLabels.source}</a></p>
      <div className="table-wrap" role="region" aria-label={incomeLabels.heading} tabIndex={0}><table className="coverage-table"><thead><tr><th scope="col">{incomeLabels.year}</th><th scope="col">{incomeLabels.amount}</th></tr></thead><tbody>
        {incomePage.visible.map(([year, amount]) => <tr key={year}><td>{year}</td><td>{new Intl.NumberFormat(locale === 'fil' ? 'fil-PH' : 'en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}</td></tr>)}
      </tbody></table></div>
      <Pagination {...incomePage} locale={locale} label={incomeLabels.heading} />
    </section>
    <section><h2>{locale === 'fil' ? 'Statement of Receipts and Expenditures (SRE)' : 'Statement of Receipts and Expenditures (SRE)'}</h2>
      {(sreDataset.records as { period: string; sourceUrl: string; capturedAt: string }[]).length === 0
        ? <><p>{locale === 'fil' ? 'Wala pang panahong SRE ng Pililla ang nakukuha at nabeberipika. Ang nawawalang panahon ay hindi zero — tingnan ang mga opisyal na pinagmulan:' : 'No Pililla SRE period has been captured and verified yet. A missing period is not zero — see the official sources:'}</p>
          <ul className="record-list">{sreDataset.expectedSources.map(source => <li key={source.url}><a href={source.url}>{source.name}</a></li>)}</ul></>
        : <ul className="record-list">{(sreDataset.records as { period: string; sourceUrl: string; capturedAt: string }[]).map(record => <li key={record.period}><h3>{record.period}</h3><p className="civic-meta">{record.capturedAt} · <a href={record.sourceUrl}>{locale === 'fil' ? 'Pinagmulan' : 'Source'}</a></p></li>)}</ul>}
    </section>
    <div className="civic-split"><section><h2>{c.documentLeads}</h2><p className="measure">{c.documentLimit}</p><ul className="record-list">{documentPage.visible.map(row => <li key={String(row.documentNumber)}><p className="civic-meta" lang="en">{String(row.documentNumber)}</p><h3><a lang="en" href={String(row.documentUrl)}>{String(row.titleAsIndexed)}</a></h3>{row.scopeWarning && <p lang="en">{String(row.scopeWarning)}</p>}<SourceNote {...props} id={String(row.sourceId)} /></li>)}</ul><Pagination {...documentPage} locale={locale} label={c.documentLeads} /></section>
      <aside className="civic-aside"><h2>{c.coverageHeading}</h2><dl>{categories.map((category, index) => <div key={category}><dt className="directory-role">{category}</dt><dd style={{ margin: '0 0 1rem' }}>{index === 0 ? 'Not yet collected' : c.coverageMissing}</dd></div>)}</dl></aside></div>
    {projects.length > 0 && <section><h2>{labels.heading}</h2>
      <p><a href={datasetUrl}>{labels.source}</a></p><SourceNote {...props} id={String(projects[0].sourceId)} />
      <div className="directory-tools"><label htmlFor="dpwh-query">{labels.search}<input id="dpwh-query" type="search" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
      <p className="civic-meta" role="status">{formatNumber(matching.length, locale)} / {formatNumber(projects.length, locale)} {t.records}</p>
      {!matching.length && <p>{t.noResults}</p>}
      <div className="table-wrap" role="region" aria-label={labels.heading} tabIndex={0}><table className="coverage-table"><thead><tr><th scope="col">{labels.title}</th><th scope="col">{labels.contract}</th><th scope="col">{labels.year}</th><th scope="col">{labels.budget}</th><th scope="col">{labels.status}</th></tr></thead><tbody>
        {projectPage.visible.map(row => <tr key={transparencyRecordId(row)}><td lang="en"><a href={href(`transparency/projects/${transparencyRecordId(row)}`)}>{String(row.description)}</a></td><td>{String(row.contractId)}</td><td>{String(row.infraYear)}</td><td>{typeof row.budget === 'number' ? new Intl.NumberFormat(locale === 'fil' ? 'fil-PH' : 'en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.budget) : '—'}</td><td lang="en">{String(row.status)}</td></tr>)}
      </tbody></table></div>
      <Pagination {...projectPage} locale={locale} label={labels.heading} />
    </section>}
    {procurement.length > 0 && <section><h2>{procurementLabels.heading}</h2>
      <p><a href={procurementUrl}>{procurementLabels.source}</a></p><SourceNote {...props} id={String(procurement[0].sourceId)} />
      <div className="directory-tools"><label htmlFor="procurement-query">{procurementLabels.search}<input id="procurement-query" type="search" value={procurementQuery} onChange={event => setProcurementQuery(event.target.value)} /></label></div>
      <p className="civic-meta" role="status">{formatNumber(matchingProcurement.length, locale)} / {formatNumber(procurement.length, locale)} {t.records}</p>
      {!matchingProcurement.length && <p>{t.noResults}</p>}
      <div className="table-wrap" role="region" aria-label={procurementLabels.heading} tabIndex={0}><table className="coverage-table"><thead><tr><th scope="col">{procurementLabels.title}</th><th scope="col">{procurementLabels.id}</th><th scope="col">{procurementLabels.awardee}</th><th scope="col">{procurementLabels.amount}</th><th scope="col">{procurementLabels.date}</th><th scope="col">{procurementLabels.status}</th></tr></thead><tbody>
        {procurementPage.visible.map(row => <tr key={transparencyRecordId(row)}><td lang="en"><a href={href(`transparency/procurement/${transparencyRecordId(row)}`)}>{String(row.title)}</a></td><td lang="en">{row.id ? String(row.id) : '—'}</td><td lang="en">{String(row.awardee)}</td><td>{String(row.amountDisplayed)}</td><td lang="en">{String(row.dateDisplayed)}</td><td lang="en">{String(row.statusDisplayed)}</td></tr>)}
      </tbody></table></div>
      <Pagination {...procurementPage} locale={locale} label={procurementLabels.heading} />
    </section>}
    {borrowingPage.visible.length > 0 && <section lang="en"><h2>BSP opinions on proposed municipal borrowing</h2>
      <p>These Monetary Board opinions concern proposed domestic borrowing by the Municipality of Pililla, Rizal, Region IV-A (CALABARZON). The amounts are proposals, not loan drawdowns or outstanding debt; the records do not establish that the proposed projects were completed.</p>
      <ul className="record-list">{borrowingPage.visible.map(row => <li key={String(row.resolutionNumber)}>
        <h3>₱{Number(row.proposedLoanAmountPhpMillion).toFixed(2)} million proposed</h3>
        <p>{String(row.reportPeriod)} · Monetary Board resolution {String(row.resolutionNumber)}, dated {String(row.resolutionDate)}</p>
        <p>{String(row.purposeAsReported)}</p>
        <p><a href={`${String(row.sourceUrl)}#page=${String(row.sourcePage)}`}>BSP report, page {String(row.sourcePage)}</a></p>
        <SourceNote {...props} id={String(row.sourceId)} />
      </li>)}</ul>
    </section>}
    <Pagination {...borrowingPage} locale={locale} label={locale === 'fil' ? 'Mga opinyon ng BSP sa iminungkahing pangungutang ng munisipyo' : 'BSP opinions on proposed municipal borrowing'} />
    {sourceChecksPage.visible.length > 0 && <><h2>{c.sourceChecks}</h2><div className="table-wrap" role="region" aria-label={c.sourceChecks} tabIndex={0}><table className="coverage-table"><thead><tr><th scope="col">{t.sources}</th><th scope="col">{c.availability}</th></tr></thead><tbody>{sourceChecksPage.visible.map(check => <tr key={String(check.sourceId)}><td><SourceNote {...props} id={String(check.sourceId)} /></td><td lang="en">{String(check.retrievalStatus)}</td></tr>)}</tbody></table></div>
    <Pagination {...sourceChecksPage} locale={locale} label={c.sourceChecks} /></>}
    <RawRecord {...props} value={data.transparency} />
  </>
}
