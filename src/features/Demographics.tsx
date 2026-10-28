import { useState } from 'react'
import { lgu } from '../config/lgu'
import { catalogs, formatNumber } from '../i18n/locales'
import { civicCatalogs } from '../i18n/civic'
import { PageIntro, SourceNote, type CivicProps } from './Civic'
import { rows } from '../data/loaders'

export default function Demographics(props: CivicProps) {
  const { data, locale } = props
  const t = catalogs[locale], c = civicCatalogs[locale]
  const facts = rows(data.municipality.populationFacts)
  const population = facts.filter(row => row.indicator === 'total_population' && typeof row.value === 'number' && typeof row.referenceYear === 'number').sort((a, b) => Number(a.referenceYear) - Number(b.referenceYear))
  const [allYears, setAllYears] = useState(false)
  const [selectedYear, setSelectedYear] = useState(Number(population.at(-1)?.referenceYear))
  const visible = population.filter(row => allYears || Number(row.referenceYear) >= 2015)
  const selected = visible.find(row => row.referenceYear === selectedYear) ?? visible.at(-1)
  const rate = facts.find(row => row.indicator === 'population_growth_rate_annualized')
  const minYear = Number(visible[0]?.referenceYear)
  const maxYear = Number(visible.at(-1)?.referenceYear)
  const ceiling = Math.ceil(Math.max(...visible.map(row => Number(row.value))) / 5000) * 5000
  const x = (year: number) => 65 + (year - minYear) / (maxYear - minYear || 1) * 660
  const y = (value: number) => 240 - value / (ceiling || 1) * 210
  const points = visible.map(row => `${x(Number(row.referenceYear))},${y(Number(row.value))}`).join(' ')
  return <><PageIntro title={t.demographics} />
    {selected && <section className="population-chart" aria-labelledby="population-title">
      <header><div><h2 id="population-title">{c.populationTrend}</h2><p className="civic-meta">{c.populationUnit} · {t.geography}: {lgu.name}</p></div><label htmlFor="population-range">{t.period}<select id="population-range" value={String(allYears)} onChange={event => setAllYears(event.target.value === 'true')}><option value="false">{c.recentYears}</option><option value="true">{c.allYears}</option></select></label></header>
      <svg className="chart-plot" viewBox="0 0 760 280" role="img" aria-labelledby="population-chart-description"><title id="population-chart-description">{c.chartDescription}</title>
        {[0, 1, 2, 3, 4, 5].map(step => { const value = ceiling * step / 5; return <g key={step}><line className="chart-grid" x1="65" x2="725" y1={y(value)} y2={y(value)} /><text x="52" y={y(value) + 4} textAnchor="end">{formatNumber(value, locale)}</text></g> })}
        <polyline className="chart-line" points={points} />
        {visible.map(row => <g key={Number(row.referenceYear)} onMouseEnter={() => setSelectedYear(Number(row.referenceYear))}><circle cx={x(Number(row.referenceYear))} cy={y(Number(row.value))} r="16" fill="transparent" /><circle cx={x(Number(row.referenceYear))} cy={y(Number(row.value))} r={row === selected ? 7 : 5} fill={row === selected ? '#172b4d' : '#1d4ed8'} stroke="white" strokeWidth="2" />{(!allYears || row === visible[0] || row === visible.at(-1)) && <text x={x(Number(row.referenceYear))} y="265" textAnchor="middle">{String(row.referenceYear)}</text>}</g>)}
      </svg>
      <div className="chart-years" role="group" aria-label={c.selectYear}>{visible.map(row => <button key={Number(row.referenceYear)} type="button" aria-pressed={row === selected} onClick={() => setSelectedYear(Number(row.referenceYear))}>{String(row.referenceYear)}</button>)}</div>
      <div aria-live="polite" aria-atomic="true"><p className="chart-selection">{formatNumber(Number(selected.value), locale)} <small>{c.populationUnit} · {String(selected.referenceYear)}</small></p><p className="chart-note">{selected.sourceTier === 'primary-government' ? c.indexedValue : c.secondaryValue}</p></div>
      <SourceNote {...props} id={String(selected.sourceId)} />
      <p className="chart-note">{c.chartNoInterpolation}</p>
    </section>}
    {rate && <section><h2>{c.publishedRate}</h2><p><strong>{formatNumber(Number(rate.value), locale)}%</strong> · {String(rate.period)}</p><p className="muted">{c.rateNote}</p><SourceNote {...props} id={String(rate.sourceId)} /></section>}
    <details className="civic-disclosure"><summary>{c.dataTable}</summary><div className="table-wrap"><table><thead><tr><th>{t.period}</th><th>{t.value}</th><th>{t.unit}</th><th>{t.evidence}</th></tr></thead><tbody>{facts.map((fact, index) => <tr key={index}><td>{String(fact.period || fact.referenceYear)}</td><td>{formatNumber(Number(fact.value), locale)}</td><td lang="en">{String(fact.unit)}</td><td><SourceNote {...props} id={String(fact.sourceId)} /><p lang="en">{String(fact.verificationStatus)}</p>{fact.notes && <p lang="en">{String(fact.notes)}</p>}</td></tr>)}</tbody></table></div></details>
  </>
}
