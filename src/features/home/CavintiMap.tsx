import { useEffect, useRef, useState } from 'react'
import type { Locale } from '../../i18n/locales'
import type { Map as MapLibreMap } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import './cavinti-map.css'
type MapMessages = {
  mapSection: string
  mapDescription: string
  mapLoading: string
  mapUnavailable: string
  mapZoomIn: string
  mapZoomOut: string
  mapReset: string
  mapAttribution: string
}

const messages: Record<Locale, MapMessages> = {
  en: {
    mapSection: 'Explore Cavinti',
    mapDescription: 'A view of Cavinti and the surrounding lake landscape. Pan and zoom to explore; no municipal boundary is shown.',
    mapLoading: 'Loading the map…',
    mapUnavailable: 'The map could not be loaded. Check your connection and reload the page to try again.',
    mapZoomIn: 'Zoom in', mapZoomOut: 'Zoom out', mapReset: 'Reset map view',
    mapAttribution: 'Map data © OpenStreetMap contributors · © OpenMapTiles · OpenFreeMap',
  },
  fil: {
    mapSection: 'Tuklasin ang Cavinti',
    mapDescription: 'Tanawin ng Cavinti at ng mga lawa sa paligid nito. Igalaw at i-zoom ang mapa para mag-explore; walang ipinapakitang hangganan ng bayan.',
    mapLoading: 'Iniloload ang mapa…',
    mapUnavailable: 'Hindi ma-load ang mapa. Suriin ang koneksyon at i-reload ang pahina upang subukan muli.',
    mapZoomIn: 'Palakihin ang mapa', mapZoomOut: 'Paliitin ang mapa', mapReset: 'Ibalik ang orihinal na tanawin',
    mapAttribution: 'Datos ng mapa © OpenStreetMap contributors · © OpenMapTiles · OpenFreeMap',
  },
}

export default function CavintiMap({ locale, center, zoom }: {
  locale: Locale
  center: readonly [number, number]
  zoom: number
}) {
  const t = messages[locale]
  const mapElement = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const [visible, setVisible] = useState(false)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const element = mapElement.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: '240px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || !mapElement.current || mapRef.current) return
    let cancelled = false
    let map: MapLibreMap | undefined
    let loaded = false
    void Promise.all([
      import('maplibre-gl'),
      import('maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'),
    ]).then(([maplibre, worker]) => {
      if (cancelled || !mapElement.current) return
      maplibre.setWorkerUrl(worker.default)
      map = new maplibre.Map({
        container: mapElement.current,
        style: 'https://tiles.openfreemap.org/styles/positron',
        center: [...center],
        zoom,
        minZoom: 8,
        maxZoom: 17,
        cooperativeGestures: true,
        attributionControl: false,
        canvasContextAttributes: { antialias: true },
      })
      mapRef.current = map
      map.addControl(new maplibre.AttributionControl({ compact: true }), 'bottom-right')
      map.on('style.load', () => {
        for (const layer of map!.getStyle().layers) {
          if (layer.id === 'background') map!.setPaintProperty(layer.id, 'background-color', '#EAF1FF')
          if (layer.id === 'water' || layer.id.startsWith('waterway')) {
            map!.setPaintProperty(layer.id, layer.type === 'fill' ? 'fill-color' : 'line-color', '#B8D6F5')
          }
          if (layer.type === 'symbol' && layer.layout?.['text-field']) {
            map!.setPaintProperty(layer.id, 'text-color', '#172B4D')
          }
        }
      })
      map.once('load', () => {
        loaded = true
        if (!cancelled) setReady(true)
      })
      map.on('error', (event) => {
        if (event.error && !loaded) setFailed(true)
      })
    }).catch(() => { if (!cancelled) setFailed(true) })
    return () => {
      cancelled = true
      map?.remove()
      mapRef.current = null
    }
  // Map instance is intentionally initialized once with its supplied location.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  return <section className="atlas-map-section atlas-inner" aria-labelledby="atlas-map-title">
    <div className="atlas-map-heading">
      <div>
        <h2 id="atlas-map-title">{t.mapSection}</h2>
        <p>{t.mapDescription}</p>
      </div>
      <div className="atlas-map-controls" aria-label={t.mapSection}>
        <button type="button" aria-label={t.mapZoomIn} disabled={!ready || failed} onClick={() => mapRef.current?.zoomIn()}>+</button>
        <button type="button" aria-label={t.mapZoomOut} disabled={!ready || failed} onClick={() => mapRef.current?.zoomOut()}>−</button>
        <button type="button" aria-label={t.mapReset} disabled={!ready || failed} onClick={() => mapRef.current?.jumpTo({ center: [...center], zoom })}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8m0-5v5h5" /></svg>
        </button>
      </div>
    </div>
    <div className="atlas-map-frame">
      <div ref={mapElement} className="atlas-map-canvas" role="application" aria-label={t.mapDescription} />
      {!visible && <p className="atlas-map-status">{t.mapLoading}</p>}
      {visible && !ready && !failed && <p className="atlas-map-status" role="status">{t.mapLoading}</p>}
      {failed && <p className="atlas-map-status atlas-map-error" role="alert">{t.mapUnavailable}</p>}
    </div>
    <p className="atlas-map-attribution">{t.mapAttribution}</p>
  </section>
}
