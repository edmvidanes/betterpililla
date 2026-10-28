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
    date: '1639',
    dateTime: '1639',
    title: 'historyUprising',
    narrative: 'historyUprisingNarrative',
    source: 'https://en.wikipedia.org/wiki/Cavinti_Church',
  },
  {
    date: '1824–1851',
    dateTime: '1824',
    title: 'historyEarthquake',
    narrative: 'historyEarthquakeNarrative',
    source: 'https://en.wikipedia.org/wiki/Cavinti_Church',
  },
  {
    date: '1880',
    dateTime: '1880',
    title: 'historyEarthquake1880',
    narrative: 'historyEarthquake1880Narrative',
    source: 'https://en.wikipedia.org/wiki/Cavinti_Church',
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
  {
    date: '1939–1942',
    dateTime: '1939',
    title: 'historyCaliraya',
    narrative: 'historyCalirayaNarrative',
    source: 'https://en.wikipedia.org/wiki/Caliraya_Dam',
  },
  {
    date: '2024',
    dateTime: '2024',
    title: 'historyPopulation',
    narrative: 'historyPopulationNarrative',
    source: 'https://psa.gov.ph/classification/psgc/barangays/0403407000',
  },
  {
    date: '2026',
    dateTime: '2026',
    title: 'historyData',
    narrative: 'historyDataNarrative',
    source: 'https://rsso04a.psa.gov.ph/content/2024-community-based-monitoring-system-cbms-data-turnover-cavinti-laguna',
  },
] as const

const notes = [
  { key: 'historyMarker', source: churchSource },
  { key: 'historyWeaving', source: 'https://pia.gov.ph/features/sambalilo-festival-breathes-new-life-to-cavintis-pandan-weaving-tradition/' },
  { key: 'historyFalls', source: 'https://www.cavinti-egov.com/aboutUs' },
  { key: 'historyCaves', source: 'https://cavintiunderground.wixsite.com/cavinticave/about' },
] as const

export default function History({ locale }: { locale: Locale }) {
  const t = catalogs[locale]

  return <section className="atlas-inner atlas-history" aria-labelledby="atlas-history-title">
    <header className="atlas-history-heading">
      <h1 id="atlas-history-title">{t.historyTitle}</h1>
      <p>{t.historyIntro}</p>
    </header>
    <div className="atlas-history-layout">
      <ol className="atlas-history-timeline">
        {records.map(record => <li key={record.dateTime}>
          <details className="atlas-history-event">
            <summary>
              <time dateTime={record.dateTime}>{record.date}</time>
              <svg className="atlas-history-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {record.dateTime < '1900' ? <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6M12 4V2M10 3h4" /> : record.dateTime < '1939' ? <path d="M3 10h18M5 10v9m5-9v9m4-9v9m5-9v9M3 21h18M12 3l9 5H3l9-5Z" /> : record.dateTime < '2024' ? <path d="M3 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0M12 3 8 10h4l-1 4 5-7h-4l1-4Z" /> : <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />}
              </svg>
              <span>{t[record.title]}</span>
              <svg className="atlas-history-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </summary>
            <div className="atlas-history-detail">
              <p>{t[record.narrative]}</p>
              <a href={record.source} target="_blank" rel="noreferrer">
                {t.historySourcesLabel}
                <svg className="atlas-history-external" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg>
              </a>
            </div>
          </details>
        </li>)}
      </ol>
      <aside className="atlas-history-notes" aria-label={t.historyTitle}>
        {notes.map(note => <article key={note.key} className="atlas-history-note">
          <h3>{t[`${note.key}Title`]}</h3>
          <p>{t[`${note.key}Body`]}</p>
          <a href={note.source} target="_blank" rel="noreferrer">
            {t.historySourcesLabel}
            <svg className="atlas-history-external" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg>
          </a>
        </article>)}
      </aside>
    </div>
  </section>
}

