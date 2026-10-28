import { useEffect, useRef, useState, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { DataRecord } from '../../data/loaders'
import { lgu } from '../../config/lgu'
import { catalogs, formatDate, type Locale, type MessageKey } from '../../i18n/locales'
import { routes } from '../../app/route-manifest'
import History from './History'
import ServiceHighlights from './ServiceHighlights'
import CavintiMap from './CavintiMap'
import Demographics from './Demographics'
import OfficialChannels from './OfficialChannels'
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
  news: 'M4 4h16v16H4zM7 8h10M7 12h10M7 16h6',
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
  const atlasRef = useRef<HTMLDivElement>(null)
  const [photosVisible, setPhotosVisible] = useState(false)
  const photos = [...lgu.homepagePhotos, ...lgu.demographicsPhotos.slice(1)]
  useEffect(() => {
    const strip = atlasRef.current?.querySelector('.atlas-photo-strip')
    if (!strip) return
    let visible = false
    const sync = () => setPhotosVisible(visible && !document.hidden)
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync() })
    observer.observe(strip)
    document.addEventListener('visibilitychange', sync)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])
  useEffect(() => {
    const atlas = atlasRef.current
    if (!atlas) return
    gsap.registerPlugin(ScrollTrigger)
    const motion = gsap.matchMedia()
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const intro = gsap.timeline()
      intro.fromTo(atlas.querySelector('h1'), { y: 20, opacity: .7 }, { y: 0, opacity: 1, duration: 1.4, ease: 'power3.out' })
        .fromTo(atlas.querySelector('.atlas-photo-strip'), { clipPath: 'inset(0 0 0 12%)' }, { clipPath: 'inset(0)', duration: 1.8, ease: 'power3.out' }, 0)
      atlas.querySelectorAll<HTMLElement>('.atlas-index > section').forEach(group => {
        gsap.fromTo(group, { y: 36, opacity: .65 }, {
          y: 0, opacity: 1, ease: 'none', immediateRender: false,
          scrollTrigger: { trigger: group, start: 'top 95%', end: 'top 55%', scrub: 1.2 },
        })
      })
      const demographics = atlas.querySelector<HTMLElement>('.atlas-demographics-data')
      if (demographics) {
        gsap.fromTo(demographics, { x: -36, opacity: .7 }, {
          x: 0, opacity: 1, ease: 'none', immediateRender: false,
          scrollTrigger: { trigger: demographics, start: 'top 95%', end: 'top 50%', scrub: 1.2 },
        })
      }
      const chart = atlas.querySelector<HTMLElement>('.population-chart')
      if (chart) {
        gsap.fromTo(chart.querySelectorAll('.population-track span'), { scaleX: 0, transformOrigin: 'left center' }, {
          scaleX: 1, ease: 'none', immediateRender: false,
          scrollTrigger: { trigger: chart, start: 'top 90%', end: 'bottom 55%', scrub: 1.2 },
        })
      }
      atlas.querySelectorAll<HTMLElement>('.atlas-history-heading, .atlas-history-layout').forEach(part => {
        gsap.fromTo(part, { y: 40, opacity: .65 }, {
          y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', immediateRender: false,
          scrollTrigger: { trigger: part, start: 'top 88%', once: true },
        })
      })


      atlas.querySelectorAll<HTMLElement>('.demographics-photo-strip img').forEach(image => {
        gsap.fromTo(image, { scale: 1.2 }, {
          scale: 1, ease: 'none', immediateRender: false,
          scrollTrigger: { trigger: image.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
        })
      })
      const map = atlas.querySelector<HTMLElement>('.atlas-map-frame')
      if (map) {
        gsap.fromTo(map, { clipPath: 'inset(0% 18% 0% 18%)' }, {
          clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', immediateRender: false,
          scrollTrigger: { trigger: map, start: 'top bottom', end: 'top 40%', scrub: 1.2 },
        })
      }
    })
    return () => motion.revert()
  }, [])
  const t = catalogs[locale]
  const links = (keys: MessageKey[], icons = false) => <ul className="atlas-links">{keys.map(key =>
    <li key={key}><a href={href(routes.find(([, label]) => label === key)![0])}><span className="atlas-link-label">{icons && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={browseIcons[key]} /></svg>}{t[key]}</span><Arrow /></a></li>,
  )}</ul>

  return <div className="atlas" ref={atlasRef}>
    <section className="atlas-place" aria-labelledby="place-title">
      <div className="atlas-inner"><h1 id="place-title">{lgu.name}, {lgu.province}</h1></div>
      <figure className="atlas-photos">
        <div className={`atlas-photo-strip${photosVisible ? ' is-visible' : ''}`}><div className="atlas-photo-track"
          style={{ animationDuration: `${photos.length * 5}s` }}>
          {[0, 1].map(copy => <div className="atlas-photo-group" key={copy} aria-hidden={copy === 1}>
            {photos.map((photo, index) =>
              <img key={photo.src} src={`${import.meta.env.BASE_URL}${photo.src}`} alt={copy ? '' : photo.alt[locale]}
                width={photo.width} height={photo.height} fetchPriority={index === 0 && copy === 0 ? 'high' : 'auto'} />,
            )}
          </div>)}
        </div></div>
        <figcaption className="atlas-inner">
          <details className="atlas-credits">
            <summary>{t.photoCredits}</summary>
            <p>{t.photoChanges}</p>
            <ul>{photos.map(photo => <li key={photo.src}>
              <a href={photo.source}>{photo.title}</a> · {photo.author} · {photo.licenseUrl ? <a href={photo.licenseUrl}>{photo.license}</a> : t.photoPermission}
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
      <div className="atlas-browse-intro">
        <h2 id="atlas-browse-title">{t.atlasBrowse}</h2>
        <figure className="atlas-hall-photo">
          <img src={`${import.meta.env.BASE_URL}cavinti-municipal-hall.webp`} alt={locale === 'fil' ? 'Bahay pamahalaan ng Cavinti noong 2013' : 'Cavinti municipal hall in 2013'} width="1000" height="1333" loading="lazy" />
          <figcaption><a href="https://commons.wikimedia.org/wiki/File:Cavinti,Lagunajf8166_03.JPG">Ramon FVelasquez</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a></figcaption>
        </figure>
      </div>
      <div className="atlas-index">
        <section><h3>{t.atlasGovernment}</h3>{links(['government', 'officials', 'barangays', 'services'], true)}</section>
        <section><h3>{t.atlasRecords}</h3>{links(['finance', 'procurement', 'projects', 'legislation', 'downloads'], true)}</section>
        <section className="atlas-local"><h3>{t.atlasLocal}</h3>{links(['demographics', 'competitiveness', 'map', 'places', 'advisories', 'news'], true)}</section>
      </div>
    </section>

    <Demographics locale={locale} href={href} municipality={municipality} />

    <History locale={locale} />
    <CavintiMap locale={locale} center={lgu.mapView.center} zoom={lgu.mapView.zoom} />
    <OfficialChannels locale={locale} />

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
