import CheckedLink from '../components/CheckedLink'
import { lgu } from '../config/lgu'
import { rows, type DataRecord } from '../data/loaders'
import { catalogs, formatNumber } from '../i18n/locales'
import { SourceNote, type CivicProps } from './Civic'
import { Pagination, usePagination } from '../components/Pagination'
import './competitiveness.css'
import CmciCharts from '../components/CmciCharts'

export default function Competitiveness(props: CivicProps) {
  const { data, locale, href } = props
  const fil = locale === 'fil'
  const facts = rows(data.municipality.populationFacts)
  const populations = facts.filter(row => row.indicator === 'total_population' && typeof row.value === 'number' && [2015, 2020, 2024].includes(Number(row.referenceYear))).sort ( (a, b) => Number(b.referenceYear) - Number(a.referenceYear))
  const growth = facts.find(row => row.indicator === 'population_growth_rate_annualized')
  const incomeClass = data.municipality.incomeClass as DataRecord | undefined
  const income = data.municipality.annualRegularIncome as DataRecord | undefined
  const incomeRows = rows(income?.records).slice().reverse()
  const incomePages = usePagination(incomeRows)
  const money = (value: number) => new Intl.NumberFormat(locale === 'fil' ? 'fil-PH' : 'en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  const pillars = fil
    ? [['Dinamismo ng ekonomiya', 'Negosyo at lokal na ekonomiya'], ['Kahusayan ng pamahalaan', 'Pamamahala at mga serbisyo'], ['Imprastraktura', 'Pasilidad at koneksyon'], ['Katatagan', 'Paghahanda sa mga panganib'], ['Inobasyon', 'Teknolohiya at pag-unlad']]
    : [['Economic dynamism', 'Business and the local economy'], ['Government efficiency', 'Governance and public services'], ['Infrastructure', 'Facilities and connectivity'], ['Resiliency', 'Preparedness for risks'], ['Innovation', 'Technology and development']]

  return <div className="competitiveness-page">
    <header className="comp-header"><h1>{catalogs[locale].competitiveness}</h1><p>{fil ? 'Mga datos at sanggunian para maunawaan ang lokal na ekonomiya at ang competitiveness index ng Pililla.' : 'Data and sources for understanding Pililla’s local economy and competitiveness index.'}</p></header>
    <CmciCharts locale={locale} />
    <section className="comp-section" aria-labelledby="pillars-heading"><div className="comp-heading"><div><h2 id="pillars-heading">{fil ? 'Limang haligi ng index' : 'Five pillars of the index'}</h2></div><CheckedLink href="https://cmci.dti.gov.ph/about-indicators.php">{fil ? 'Mga indicator ng DTI' : 'DTI indicator definitions'} →</CheckedLink></div><div className="comp-pillars">{pillars.map(([name, description], i) => <div className="comp-pillar" key={name}><span>{String(i + 1).padStart(2, '0')}</span><h3>{name}</h3><p>{description}</p></div>)}</div></section>
    <section className="comp-section" aria-labelledby="context-heading"><div className="comp-heading"><div><h2 id="context-heading">{fil ? 'Konteksto ng munisipalidad' : 'Municipal context'}</h2><p>{fil ? 'Mga kaugnay na datos, hindi mga marka sa CMCI.' : 'Related local data, not CMCI scores.'}</p></div><CheckedLink href={href('statistics/demographics')}>{fil ? 'Tingnan ang demograpiya' : 'Explore demographics'} →</CheckedLink></div>
      <div className="comp-context"><div className="comp-populations"><h3>{fil ? 'Populasyon' : 'Population'}</h3>{populations.map(row => <div className="comp-pop-row" key={String(row.referenceYear)}><span>{String(row.referenceYear)}</span><strong>{formatNumber(Number(row.value), locale)}</strong><small>PSA OpenSTAT</small></div>)}</div><div className="comp-facts">{incomeClass?.value === 2 && <div><span>{fil ? 'Klase ng kita' : 'Income class'}</span><strong>{fil ? 'Ikalawa' : 'Second class'}</strong><small>PSA · search index</small></div>}{growth && <div><span>{fil ? 'Taunang paglaki ng populasyon' : 'Annual population growth'}</span><strong>{formatNumber(Number(growth.value), locale)}%</strong><small>2015–2020 · PhilAtlas</small></div>}</div></div>
      <p className="comp-footnote">{fil ? 'Mga bilang sa sensus ng PSA para sa 2015, 2020 at 2024. Ang pinakahuli ay may petsang batayan na 1 Hulyo 2024. Hindi kasama rito ang kasalukuyang klase ng kita o tinatayang populasyon para sa 2026.' : 'PSA census counts for 2015, 2020 and 2024. The latest reference date is 1 July 2024. Current income classification and a 2026 population estimate are not supplied here.'}</p>
      <SourceNote {...props} id={lgu.sourceIds.population} />
    </section>
    {incomeRows.length > 0 && <section className="comp-section" aria-labelledby="income-heading"><div className="comp-heading"><div><h2 id="income-heading">{fil ? 'Makasaysayang regular na kita' : 'Historical annual regular income'}</h2><p>{fil ? 'Inilathala ng PhilAtlas, mula sa datos na iniuugnay nito sa BLGF.' : 'Published by PhilAtlas, attributed to BLGF data.'}</p></div><CheckedLink href={href('statistics/municipal-income')}>{fil ? 'Tingnan ang pananalapi' : 'Explore municipal finance'} →</CheckedLink></div><p className="comp-footnote">{fil ? 'Mga lumang datos ito, hindi kasalukuyang kita o marka sa CMCI. Hindi pa direktang nasuri ang mga talahanayan ng BLGF.' : 'These are historical figures, not current revenue or CMCI scores. The BLGF tables have not been checked directly.'}</p><div className="comp-income-table"><table><thead><tr><th scope="col">{fil ? 'Taong piskal' : 'Fiscal year'}</th><th scope="col">{fil ? 'Regular na kita' : 'Annual regular income'}</th></tr></thead><tbody>{incomePages.visible.map(row => <tr key={String(row.year)}><th scope="row">{String(row.year)}</th><td>₱{money(Number(row.value))}</td></tr>)}</tbody></table></div><Pagination {...incomePages} locale={locale} label={fil ? 'Makasaysayang regular na kita' : 'Historical annual regular income'} /><p className="comp-footnote">{fil ? 'Kasama sa regular na kita ang lokal na kita, IRA, at iba pang bahagi mula sa pambansang buwis, ayon sa PhilAtlas.' : 'PhilAtlas defines regular income as locally sourced revenue, current-year IRA and other shares from national tax collection.'}</p><SourceNote {...props} id="philatlas-pililla" /></section>}
    <section className="comp-sources"><h2>{fil ? 'Tungkol sa mga sanggunian' : 'About the sources'}</h2><p>{fil ? 'Hiwalay ang konteksto ng munisipalidad sa opisyal na ranggo ng DTI. Suriin ang taon at limitasyon ng bawat datos bago ihambing.' : 'Municipal context is separate from the official DTI ranking. Check each figure’s year and limitations before comparing.'}</p><SourceNote {...props} id={lgu.sourceIds.competitiveness} /></section>
  </div>
}
