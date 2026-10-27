import type { ReactNode } from 'react'
import { lgu } from '../../config/lgu'
import { catalogs, formatDate, type Locale, type MessageKey } from '../../i18n/locales'
import { routes } from '../../app/route-manifest'
import './home.css'

function Arrow() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
}

export default function Home({ locale, capturedAt, href, search }: {
  locale: Locale
  capturedAt: string
  href: (path: string) => string
  search: ReactNode
}) {
  const t = catalogs[locale]
  const links = (keys: MessageKey[]) => <ul className="atlas-links">{keys.map(key =>
    <li key={key}><a href={href(routes.find(([, label]) => label === key)![0])}><span>{t[key]}</span><Arrow /></a></li>,
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

    <section className="atlas-inner atlas-search" aria-labelledby="atlas-intro">
      <h2 id="atlas-intro">{t.intro}</h2>
      <p>{t.description}</p>
      {search}
    </section>

    <section className="atlas-inner atlas-browse" aria-labelledby="atlas-browse-title">
      <h2 id="atlas-browse-title">{t.atlasBrowse}</h2>
      <div className="atlas-index">
        <section><h3>{t.atlasGovernment}</h3>{links(['government', 'officials', 'barangays', 'services'])}</section>
        <section><h3>{t.atlasRecords}</h3>{links(['finance', 'procurement', 'projects', 'legislation', 'downloads'])}</section>
        <section className="atlas-local"><h3>{t.atlasLocal}</h3>{links(['demographics', 'competitiveness', 'map', 'places', 'advisories'])}</section>
      </div>
    </section>

    <section className="atlas-shortcuts" aria-labelledby="atlas-shortcuts-title">
      <div className="atlas-inner">
        <h2 id="atlas-shortcuts-title">{t.atlasShortcuts}</h2>
        {links(['services', 'officials', 'legislation', 'downloads'])}
      </div>
    </section>

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
