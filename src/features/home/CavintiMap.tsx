import { useEffect, useRef, useState } from 'react'
import { catalogs, type Locale } from '../../i18n/locales'
import type { Map as MapLibreMap } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import './cavinti-map.css'

export default function CavintiMap({ locale, center, zoom }: {
  locale: Locale
  center: readonly [number, number]
  zoom: number
}) {
  const t = catalogs[locale]
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
          if (layer.type === 'background') map!.setPaintProperty(layer.id, 'background-color', '#f8fbff')
          if (layer.type === 'fill') {
            const source = layer['source-layer']
            const color = source === 'water' ? '#1d4ed8' : source === 'building' ? '#d6e2f7' : '#eaf1ff'
            map!.setPaintProperty(layer.id, 'fill-color', color)
          }
          if (layer.type === 'line' && layer['source-layer'] === 'waterway') map!.setPaintProperty(layer.id, 'line-color', '#1d4ed8')
          if (layer.type === 'symbol' && layer.layout?.['text-field']) {
            const waterLabel = layer['source-layer'] === 'water_name'
            map!.setPaintProperty(layer.id, 'text-color', waterLabel ? '#ffffff' : '#172b4d')
            map!.setPaintProperty(layer.id, 'text-halo-color', waterLabel ? '#1d4ed8' : '#ffffff')
            map!.setPaintProperty(layer.id, 'text-halo-width', 1.5)
          }
        }
      })
      map.once('load', () => {
        loaded = true
        if (!cancelled) {
          setReady(true)
          setFailed(false)
        }
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
  }, [visible, center, zoom])

  return <section className="atlas-map-section atlas-inner" aria-labelledby="atlas-map-title" aria-describedby="atlas-map-description">
    <h2 id="atlas-map-title" className="sr-only">{t.mapSection}</h2>
    <p id="atlas-map-description" className="sr-only">{t.mapDescription}</p>
    <div className="atlas-map-frame">
      <div ref={mapElement} className="atlas-map-canvas" role="application" aria-label={t.mapDescription} />
      <div className="atlas-map-controls" role="group" aria-label={t.mapSection}>
        <button type="button" aria-label={t.mapZoomIn} disabled={!ready || failed} onClick={() => mapRef.current?.zoomIn()}>+</button>
        <button type="button" aria-label={t.mapZoomOut} disabled={!ready || failed} onClick={() => mapRef.current?.zoomOut()}>−</button>
        <button type="button" aria-label={t.mapReset} disabled={!ready || failed} onClick={() => mapRef.current?.jumpTo({ center: [...center], zoom })}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8m0-5v5h5" /></svg>
        </button>
      </div>
      {!visible && <p className="atlas-map-status">{t.mapLoading}</p>}
      {visible && !ready && !failed && <p className="atlas-map-status" role="status">{t.mapLoading}</p>}
      {failed && <p className="atlas-map-status atlas-map-error" role="alert">{t.mapUnavailable}</p>}
    </div>
    <p className="atlas-map-attribution">{t.mapAttribution}</p>
  </section>
}
