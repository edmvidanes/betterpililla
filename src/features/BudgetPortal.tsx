import { useEffect, useRef, useState } from 'react'
import { catalogs, type Locale } from '../i18n/locales'
import WorkInProgress from '../components/WorkInProgress'
import './budget-portal.css'

const prefix = 'transparency/budget'
function portalPath(route: string) {
  return '/' + route.slice(prefix.length).split('/').filter(Boolean).map(encodeURIComponent).join('/') + location.search + location.hash
}
export default function BudgetPortal({ locale, route }: { locale: Locale; route: string }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const currentPath = useRef(portalPath(route))
  const [source, setSource] = useState(`${import.meta.env.BASE_URL}budget-portal${currentPath.current}`)
  const [height, setHeight] = useState(720)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const t = catalogs[locale]
  useEffect(() => {
    const next = portalPath(route)
    if (next !== currentPath.current) {
      currentPath.current = next
      setSource(`${import.meta.env.BASE_URL}budget-portal${next}`)
      setReady(false)
    }
  }, [route])
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow || event.data?.type !== 'betterpililla-budget') return
      const { path, height: size } = event.data
      if (typeof path !== 'string' || !/^\/(?:[?#]|$|gaa(?:[?#]|$)|about(?:[?#]|$)|projects\/(dpwh|fmr|hfep|nia)\/)/.test(path)) return
      if (typeof size === 'number' && Number.isFinite(size)) setHeight(Math.min(30000, Math.max(320, size)))
      window.clearTimeout(timeout)
      setReady(true); setFailed(false)
      currentPath.current = path
      const destination = `${import.meta.env.BASE_URL}${locale}/${prefix}${path === '/' ? '' : path}`
      if (location.pathname + location.search + location.hash !== destination) {
        history.replaceState(null, '', destination)
        window.dispatchEvent(new PopStateEvent('popstate'))
      }
    }
    window.addEventListener('message', receive)
    const timeout = window.setTimeout(() => setFailed(true), 20000)
    return () => { window.removeEventListener('message', receive); window.clearTimeout(timeout) }
  }, [locale, source])
  return <section className="budget-portal">
    <h1>{route.endsWith('/gaa') ? t.enactedBudgets : route.endsWith('/about') ? t.budgetSources : t.budgetPortal}</h1>
    <p className="civic-intro">{locale === 'fil' ? 'Mga rekord ng badyet na binabanggit ang Pililla. Nasa English ang orihinal na datos at nakabinbin ang pagsusuri; maaaring kasama ang mga karatig-bayan.' : 'Budget source records naming Pililla. Original records are in English and await review; title matches may include neighboring towns.'}</p>
    {!ready && !failed && <p role="status">{locale === 'fil' ? 'Kinakarga ang mga rekord ng badyet…' : 'Loading budget records…'}</p>}
    {failed && !ready && <WorkInProgress locale={locale} />}
    <iframe ref={frame} className="budget-portal-frame" src={source} height={height} title={locale === 'fil' ? 'Mga rekord ng badyet ng Pililla (English)' : 'Pililla budget source records (English)'} sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox" />
  </section>
}
