import { useState } from 'react'
import { catalogs, formatNumber } from '../i18n/locales'
import { civicCatalogs } from '../i18n/civic'
import { PageIntro, RawRecord, SourceNote, type CivicProps } from './Civic'
import { rows } from '../data/loaders'

export default function Finance(props: CivicProps & { income?: boolean }) {
  const { data, locale, income } = props
  const t = catalogs[locale], c = civicCatalogs[locale]
  const categories = [c.financeCategory, c.procurementCategory, c.projectsCategory]
  const [query, setQuery] = useState('')
  const projects = rows(data.transparency.dpwhProjectSnapshot)
  const matching = projects.filter(row => [row.description, row.contractId, row.infraYear, row.status, row.budget].join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase()))
  const labels = locale === 'fil' ? {
    heading: 'Mga proyektong DPWH sa sekundaryang snapshot',
    note: 'Mga rekord na may “Cavinti” sa paglalarawan mula sa sekundaryang snapshot ng BetterGov PH, na na-download noong Oktubre 27, 2026. Hindi alam ang petsa ng orihinal na pagkuha; maaaring luma na ang mga status. Hindi kumpleto ang paghahanap sa teksto, at may mga proyektong sumasaklaw sa maraming munisipalidad. Ang badyet ay hindi katumbas ng paggasta para lamang sa Cavinti. Hindi ito independiyenteng napatunayan o kumpletong talaan.',
    search: 'Hanapin ang pamagat, contract ID, taon, badyet o status', title: 'Orihinal na pamagat', contract: 'Contract ID', year: 'Taon', budget: 'Badyet (₱)', status: 'Status sa snapshot', source: 'Tingnan ang pinagmulang dataset'
  } : {
    heading: 'DPWH projects in a secondary snapshot',
    note: 'Records whose descriptions contain “Cavinti” from a BetterGov PH secondary snapshot downloaded October 27, 2026. The underlying capture date is unknown and statuses may be stale. Text matching is incomplete, and some projects span multiple municipalities. Budgets are not Cavinti-only expenditure. This is not an independently verified or complete register.',
    search: 'Search title, contract ID, year, budget or status', title: 'Original title', contract: 'Contract ID', year: 'Year', budget: 'Budget (₱)', status: 'Snapshot-reported status', source: 'View source dataset'
  }
  const projectSource = data.portal.sources.find(source => source.id === projects[0]?.sourceId)
  const datasetUrl = projectSource?.url || projectSource?.canonicalUrl || ''
  return <><PageIntro title={income ? t.income : t.finance}>{c.financeIntro}</PageIntro>
    <div className="civic-empty"><h2>{c.financeMissing}</h2><p>{c.financeMissingText}</p></div>
    <div className="civic-split"><section><h2>{c.documentLeads}</h2><p className="measure">{c.documentLimit}</p><ul className="record-list">{rows(data.transparency.officialLocalDocumentLeads).map(row => <li key={String(row.documentNumber)}><p className="civic-meta" lang="en">{String(row.documentNumber)}</p><h3><a lang="en" href={String(row.documentUrl)}>{String(row.titleAsIndexed)}</a></h3>{row.scopeWarning && <p lang="en">{String(row.scopeWarning)}</p>}<SourceNote {...props} id={String(row.sourceId)} /></li>)}</ul></section>
      <aside className="civic-aside"><h2>{c.coverageHeading}</h2><dl>{categories.map(category => <div key={category}><dt className="directory-role">{category}</dt><dd style={{ margin: '0 0 1rem' }}>{c.coverageMissing}</dd></div>)}</dl></aside></div>
    {projects.length > 0 && <section><h2>{labels.heading}</h2><p className="measure">{labels.note}</p>
      <p><a href={datasetUrl}>{labels.source}</a></p><SourceNote {...props} id={String(projects[0].sourceId)} />
      <div className="directory-tools"><label htmlFor="dpwh-query">{labels.search}<input id="dpwh-query" type="search" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
      <p className="civic-meta" role="status">{formatNumber(matching.length, locale)} / {formatNumber(projects.length, locale)} {t.records}</p>
      {!matching.length && <p>{t.noResults}</p>}
      <div className="table-wrap"><table className="coverage-table"><thead><tr><th scope="col">{labels.title}</th><th scope="col">{labels.contract}</th><th scope="col">{labels.year}</th><th scope="col">{labels.budget}</th><th scope="col">{labels.status}</th></tr></thead><tbody>
        {matching.map(row => <tr key={String(row.contractId)}><td lang="en"><a href={datasetUrl}>{String(row.description)}</a></td><td>{String(row.contractId)}</td><td>{String(row.infraYear)}</td><td>{typeof row.budget === 'number' ? new Intl.NumberFormat(locale === 'fil' ? 'fil-PH' : 'en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.budget) : '—'}</td><td lang="en">{String(row.status)}</td></tr>)}
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
    <h2>{c.sourceChecks}</h2><div className="table-wrap"><table className="coverage-table"><thead><tr><th>{t.sources}</th><th>{c.availability}</th></tr></thead><tbody>{rows(data.transparency.sourceChecks).map(check => <tr key={String(check.sourceId)}><td><SourceNote {...props} id={String(check.sourceId)} /></td><td lang="en">{String(check.retrievalStatus)}</td></tr>)}</tbody></table></div>
    <RawRecord {...props} value={data.transparency} />
  </>
}
