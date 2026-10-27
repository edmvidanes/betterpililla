import type { ReactNode } from 'react'
import type { DataRecord } from '../../data/loaders'
import { lgu } from '../../config/lgu'
import { catalogs, formatDate, type Locale, type MessageKey } from '../../i18n/locales'
import { routes } from '../../app/route-manifest'
import History from './History'
import ServiceHighlights from './ServiceHighlights'
import CavintiMap from './CavintiMap'
import Demographics from './Demographics'
import './home.css'

function Arrow() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
}

const browseIcons: Partial<Record<MessageKey, string>> = {
  government: 'M3 10h18M5 10v9m5-9v9m4-9v9m5-9v9M3 21h18M12 3l9 5H3l9-5Z',
  officials: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0',
  barangays: 'M3 11 12 4l9 7M5 10v10h14V10M9 20v-6h6v6',
  services: 'M12 3v18M3 12h18M7 7h10v10H7z',
  finance: 'M4 7h16v13H4zM4 7l2-3h12l2 3M15 13h5M16 13h.01',
  procurement: 'M4 7h16l-1 13H5L4 7ZM9 7V5a3 3 0 0 1 6 0v2',
  projects: 'M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6',
  legislation: 'M6 3h12v18H6zM9 7h6M9 11h6M9 15h6',
  downloads: 'M12 3v12m-4-4 4 4 4-4M4 17v3h16v-3',
  demographics: 'M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8m2 3a6 6 0 0 1 4 6',
  competitiveness: 'M4 20V12h4v8M10 20V8h4v12M16 20V4h4v16M3 20h18',
  map: 'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15',
  places: 'M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0ZM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  advisories: 'M12 3 2 20h20L12 3Zm0 6v5m0 3h.01',
}


export default function Home({ locale, capturedAt, href, search, contacts, municipality }: {
  locale: Locale
  capturedAt: string
  href: (path: string) => string
  search: ReactNode
  contacts: DataRecord
  municipality: DataRecord
}) {
  const t = catalogs[locale]
  const links = (keys: MessageKey[], icons = false) => <ul className="atlas-links">{keys.map(key =>
    <li key={key}><a href={href(routes.find(([, label]) => label === key)![0])}><span className="atlas-link-label">{icons && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={browseIcons[key]} /></svg>}{t[key]}</span><Arrow /></a></li>,
  )}</ul>

  return <div className="atlas">
    <section className="atlas-place" aria-labelledby="place-title">
      <div className="atlas-inner"><h1 id="place-title">{lgu.name}, {lgu.province}</h1></div>
      <figure className="atlas-photos">
        <div className="atlas-photo-strip">{lgu.homepagePhotos.map((photo, index) =>
          <img key={photo.src} src={`${import.meta.env.BASE_URL}${photo.src}`} alt={photo.alt[locale]}
            width={photo.width} height={photo.height} fetchPriority={index === 0 ? 'high' : 'auto'} />,
        )}</div>
        <figcaption className="atlas-inner">
          <details className="atlas-credits">
            <summary>{t.photoCredits}</summary>
            <p>{t.photoChanges}</p>
            <ul>{lgu.homepagePhotos.map(photo => <li key={photo.src}>
              <a href={photo.source}>{photo.title}</a> · {photo.author} · <a href={photo.licenseUrl}>{photo.license}</a>
            </li>)}</ul>
          </details>
        </figcaption>
      </figure>
    </section>

    <section className="atlas-inner atlas-search" aria-label={t.query}>
      {search}
      <ServiceHighlights locale={locale} href={href} contacts={contacts} />
    </section>

    <section className="atlas-shortcuts" aria-labelledby="atlas-shortcuts-title">
      <div className="atlas-inner">
        <h2 id="atlas-shortcuts-title">{t.atlasShortcuts}</h2>
        {links(['services', 'officials', 'legislation', 'downloads'])}
      </div>
    </section>

    <section className="atlas-inner atlas-browse" aria-labelledby="atlas-browse-title">
      <h2 id="atlas-browse-title">{t.atlasBrowse}</h2>
      <div className="atlas-index">
        <section><h3>{t.atlasGovernment}</h3>{links(['government', 'officials', 'barangays', 'services'], true)}</section>
        <section><h3>{t.atlasRecords}</h3>{links(['finance', 'procurement', 'projects', 'legislation', 'downloads'], true)}</section>
        <section className="atlas-local"><h3>{t.atlasLocal}</h3>{links(['demographics', 'competitiveness', 'map', 'places', 'advisories'], true)}</section>
      </div>
    </section>

    <Demographics locale={locale} href={href} municipality={municipality} />

    <History locale={locale} />
    <CavintiMap locale={locale} center={lgu.mapView.center} zoom={lgu.mapView.zoom} />

    <section className="atlas-inner atlas-sources" aria-labelledby="atlas-sources-title">
      <div><h2 id="atlas-sources-title">{t.atlasSources}</h2><p>{t.atlasLimits}</p></div>
      <div className="atlas-source-links">
        <ul className="atlas-links">
          <li><a href={href('sources')}><span>{t.sources}</span><Arrow /></a></li>
          <li><a href={href('sources')}><span>{t.viewCoverage}</span><Arrow /></a></li>
          <li><a href={href('report-data')}><span>{t.corrections}</span><Arrow /></a></li>
        </ul>
        <p>{t.capture}: <time dateTime={capturedAt}>{formatDate(capturedAt, locale)}</time></p>
      </div>
    </section>
  </div>
}
