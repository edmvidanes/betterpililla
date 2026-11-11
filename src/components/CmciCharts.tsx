import { useState } from 'react'
import CheckedLink from './CheckedLink'
import cmci from '../data/cmci-pililla-2024.json'
import { formatDate, formatNumber, type Locale } from '../i18n/locales'
import './cmci-charts.css'

export default function CmciCharts({ locale }: { locale: Locale }) {
  const fil = locale === 'fil'
  const [selected, setSelected] = useState(0)
  const [showData, setShowData] = useState(false)
  const names = fil ? ['Dinamismo ng ekonomiya', 'Kahusayan ng pamahalaan', 'Imprastraktura', 'Katatagan', 'Inobasyon'] : ['Economic dynamism', 'Government efficiency', 'Infrastructure', 'Resiliency', 'Innovation']
  const pillar = cmci.pillars[selected]
  const score = (value: number, decimals = 4) => new Intl.NumberFormat(fil ? 'fil-PH' : 'en-PH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
  return <section className="cmci-charts" aria-labelledby="cmci-chart-title">
    <header className="cmci-heading"><div><p className="cmci-kicker">2024 · Cities and Municipalities Competitiveness Index</p><h2 id="cmci-chart-title">{fil ? 'Competitiveness ng Pililla' : 'Pililla’s competitiveness'}</h2><p>{fil ? 'Mga ranggo at markang inilathala ng DTI. Piliin ang isang haligi upang makita ang mga indicator nito.' : 'Ranks and scores published by DTI. Select a pillar to explore its indicators.'}</p></div><span className="cmci-archive-label">{fil ? 'Datos mula sa archive' : 'Archived data'}</span></header>
    <div className="cmci-overview">
      <div className="cmci-totals"><div><span>{fil ? 'Kabuuang ranggo' : 'Overall rank'}</span><strong>{formatNumber(cmci.overallRank, locale)}</strong></div><div><span>{fil ? 'Kabuuang marka' : 'Overall score'}</span><strong>{score(cmci.overallScore, 2)}</strong></div><p>{fil ? 'Ranggo at marka para sa 2024, ayon sa profile ng DTI.' : '2024 rank and score as displayed on the DTI profile.'}</p></div>
      <div className="cmci-bars" role="group" aria-label={fil ? 'Mga marka ng limang haligi' : 'Five pillar scores'}>
        <div className="cmci-scale" aria-hidden="true"><span>0</span><span>4</span><span>8</span><span>12</span></div>
        {cmci.pillars.map((item, index) => <button className="cmci-bar-row" type="button" key={item.id} aria-pressed={selected === index} aria-controls="cmci-indicator-data" onClick={() => { setSelected(index); setShowData(true) }}>
          <span className="cmci-bar-name">{names[index]}<small>{fil ? 'Ranggo' : 'Rank'} {formatNumber(item.rank, locale)}</small></span>
          <span className="cmci-bar-track" aria-hidden="true"><span style={{ width: `${item.score / 12 * 100}%` }} /></span><strong>{score(item.score)}</strong>
        </button>)}
        <p className="cmci-weight">{fil ? 'Bawat haligi ay may 20% timbang sa index. Mas mataas na marka at mas mababang bilang ng ranggo ang mas mahusay.' : 'Each pillar carries a 20% weight. Higher scores and lower rank numbers indicate better performance.'}</p>
      </div>
    </div>
    <details className="cmci-indicators" id="cmci-indicator-data" open={showData} onToggle={event => setShowData(event.currentTarget.open)}>
      <summary>{fil ? 'Tingnan ang datos ng indicator' : 'View indicator data'} · {names[selected]}</summary>
      <div className="cmci-table-scroll" role="region" tabIndex={0} aria-label={`${names[selected]} — ${fil ? 'datos ng indicator' : 'indicator data'}`}><table><thead><tr><th scope="col">{fil ? 'Indicator sa DTI' : 'DTI indicator'}</th><th scope="col">{fil ? 'Ranggo' : 'Rank'}</th><th scope="col">{fil ? 'Marka' : 'Score'}</th></tr></thead><tbody>{pillar.indicators.map(item => <tr key={item.name}><th scope="row" lang="en">{item.name}</th><td>{formatNumber(item.rank, locale)}</td><td>{score(item.score)}</td></tr>)}</tbody></table></div>
    </details>
    <footer className="cmci-provenance"><p>{fil ? 'Sanggunian: DTI CMCI · Taon ng assessment: 2024 · Snapshot sa archive:' : 'Source: DTI CMCI · Assessment year: 2024 · Archive snapshot:'} <time dateTime={cmci.archiveCapturedAt}>{formatDate(cmci.archiveCapturedAt, locale)}</time>. {fil ? 'Hindi ito ranggo para sa 2026.' : 'This is not a 2026 ranking.'}</p><CheckedLink href={cmci.sourceUrl}>{fil ? 'Tingnan ang profile sa CMCI archive' : 'View the archived CMCI profile'} ↗</CheckedLink></footer>
  </section>
}
