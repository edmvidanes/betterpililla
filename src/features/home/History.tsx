import { catalogs, type Locale } from '../../i18n/locales'
import './history.css'

const records = [
  {
    date: '1619',
    title: 'historyChurch',
    narrative: 'historyChurchNarrative',
    source: 'https://philhistoricsites.nhcp.gov.ph/registry_database/church-of-cavinti/',
  },
  {
    date: '1904-10-05',
    title: 'historyAct1240',
    narrative: 'historyAct1240Narrative',
    source: 'https://issuances-library.senate.gov.ph/legislative-issuance/act-no-1240',
  },
  {
    date: '1907-09-12',
    title: 'historyAct1712',
    narrative: 'historyAct1712Narrative',
    source: 'https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/28/16606',
  },
] as const

export default function History({ locale }: { locale: Locale }) {
  const t = catalogs[locale]

  return <section className="atlas-inner atlas-history" aria-labelledby="atlas-history-title">
    <header className="atlas-history-heading">
      <h2 id="atlas-history-title">{t.historyTitle}</h2>
      <p>{t.historyIntro}</p>
    </header>
    <ol className="atlas-history-timeline">
      {records.map(record => <li key={record.date}>
        <time dateTime={record.date}>{t[record.title]}</time>
        <p>{t[record.narrative]}</p>
        <a href={record.source} target="_blank" rel="noreferrer">
          {t.historySourcesLabel}<span className="atlas-history-source-title"> · {t[record.title]}</span>
          <svg className="atlas-history-external" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg>
        </a>
      </li>)}
    </ol>
  </section>
}
