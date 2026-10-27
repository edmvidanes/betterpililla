import { catalogs } from '../i18n/locales'
import { civicCatalogs } from '../i18n/civic'
import { PageIntro, RawRecord, SourceNote, type CivicProps } from './Civic'
import { rows } from '../data/loaders'

export default function Finance(props: CivicProps & { income?: boolean }) {
  const { data, locale, income } = props
  const t = catalogs[locale], c = civicCatalogs[locale]
  const categories = [c.financeCategory, c.procurementCategory, c.projectsCategory]
  return <><PageIntro title={income ? t.income : t.finance}>{c.financeIntro}</PageIntro>
    <div className="civic-empty"><h2>{c.financeMissing}</h2><p>{c.financeMissingText}</p></div>
    <div className="civic-split"><section><h2>{c.documentLeads}</h2><p className="measure">{c.documentLimit}</p><ul className="record-list">{rows(data.transparency.officialLocalDocumentLeads).map(row => <li key={String(row.documentNumber)}><p className="civic-meta" lang="en">{String(row.documentNumber)}</p><h3><a lang="en" href={String(row.documentUrl)}>{String(row.titleAsIndexed)}</a></h3>{row.scopeWarning && <p lang="en">{String(row.scopeWarning)}</p>}<SourceNote {...props} id={String(row.sourceId)} /></li>)}</ul></section>
      <aside className="civic-aside"><h2>{c.coverageHeading}</h2><dl>{categories.map(category => <div key={category}><dt className="directory-role">{category}</dt><dd style={{ margin: '0 0 1rem' }}>{c.coverageMissing}</dd></div>)}</dl></aside></div>
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
