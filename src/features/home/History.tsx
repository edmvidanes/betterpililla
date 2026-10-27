import { catalogs, type Locale } from '../../i18n/locales'
import './history.css'

const churchSource = 'https://philhistoricsites.nhcp.gov.ph/registry_database/church-of-cavinti/'
const records = [
  {
    date: '1619–1621',
    dateTime: '1619',
    title: 'historyChurch',
    narrative: 'historyChurchNarrative',
    source: churchSource,
  },
  {
    date: '1904',
    dateTime: '1904-10-05',
    title: 'historyAct1240',
    narrative: 'historyAct1240Narrative',
    source: 'https://issuances-library.senate.gov.ph/legislative-issuance/act-no-1240',
  },
  {
    date: '1907',
    dateTime: '1907-09-12',
    title: 'historyAct1712',
    narrative: 'historyAct1712Narrative',
    source: 'https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/28/16606',
  },
] as const

const notes = ['historyRebuilding', 'historyMarker'] as const

export default function History({ locale }: { locale: Locale }) {
  const t = catalogs[locale]

  return <section className="atlas-inner atlas-history" aria-labelledby="atlas-history-title">
    <header className="atlas-history-heading">
      <h2 id="atlas-history-title">{t.historyTitle}</h2>
      <p>{t.historyIntro}</p>
    </header>
    <div className="atlas-history-layout">
      <ol className="atlas-history-timeline">
        {records.map(record => <li key={record.dateTime}>
          <time dateTime={record.dateTime}>{record.date}</time>
          <div className="atlas-history-event">
            <h3>{t[record.title]}</h3>
            <p>{t[record.narrative]}</p>
            <a href={record.source} target="_blank" rel="noreferrer">
              {t.historySourcesLabel}
              <svg className="atlas-history-external" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg>
            </a>
          </div>
        </li>)}
      </ol>
      <aside className="atlas-history-notes" aria-label={t.historyTitle}>
        {notes.map(note => <article key={note} className="atlas-history-note">
          <h3>{t[`${note}Title`]}</h3>
          <p>{t[`${note}Body`]}</p>
          <a href={churchSource} target="_blank" rel="noreferrer">
            {t.historySourcesLabel}
            <svg className="atlas-history-external" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg>
          </a>
        </article>)}
      </aside>
    </div>
  </section>
}

