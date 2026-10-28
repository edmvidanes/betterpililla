import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '@bettergov/kapwa/button'
import { lgu } from '../config/lgu'
import { catalogs, formatDate, formatNumber, type Locale, type MessageKey } from '../i18n/locales'
import { loadData, type DataPack, type DataRecord, type EvidenceValue } from '../data/loaders'
import { EvidenceTree, ExternalDocumentLink, SourceCitation } from '../components/Evidence'
import SearchPalette from '../components/SearchPalette'
import Legislation, { type LegislationRecord } from '../features/legislation/Legislation'
import Home from '../features/home/Home'
import Services from '../features/Services'
import ServiceDetail from '../features/ServiceDetail'
import { Places, Advisories } from '../features/Places'
import { Government, Officials, OfficialDetail, Contacts } from '../features/Government'
import Demographics from '../features/Demographics'
import Competitiveness from '../features/Competitiveness'
import Finance from '../features/Finance'
import ProjectProcurement from '../features/ProjectProcurement'
import { Downloads, Sources } from '../features/Catalogues'
import Barangays from '../features/Barangays'
import News, { NewsDetail } from '../features/News'
import Geography from '../features/Geography'
import { routes } from './route-manifest'
import { searchPortal } from './search'

const base = import.meta.env.BASE_URL
const githubIcon = <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.32-3.79-1.32-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.64 1.22 3.28.93.1-.73.39-1.22.7-1.5-2.5-.28-5.12-1.25-5.12-5.56 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.16a10.8 10.8 0 0 1 5.64 0c2.15-1.46 3.1-1.16 3.1-1.16.61 1.55.23 2.7.11 2.98.72.79 1.16 1.8 1.16 3.03 0 4.32-2.63 5.27-5.13 5.55.4.35.76 1.03.76 2.08v3.1c0 .3.21.65.78.54A11.25 11.25 0 0 0 12 .75Z" /></svg>
function App() {
  const pathname = location.pathname.startsWith(base) ? location.pathname.slice(base.length) : location.pathname.slice(1)
  const segments = pathname.replace(/\/$/, '').split('/').filter(Boolean)
  const explicitLocale = segments[0] === 'en' || segments[0] === 'fil'
  const locale: Locale = explicitLocale ? segments[0] as Locale : lgu.defaultLocale
  const route = (explicitLocale ? segments.slice(1) : segments).map(s => { try { return decodeURIComponent(s) } catch { return s } }).join('/')
  const t = catalogs[locale]
  const href = (path: string) => `${base}${locale}${path ? `/${path.replace(/^\//, '')}` : '/'}`
  const sourceHref = (id: string) => href(`sources/${encodeURIComponent(id)}`)
  const correctionLink = (id: string, template = 'data-correction.yml') => `${lgu.repository}/issues/new?${new URLSearchParams({ template, record: id, title: `[Data] ${id}`, 'source-page': location.href })}`
  const [data, setData] = useState<DataPack | null>(null)
  const [error, setError] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [pastHero, setPastHero] = useState(false)
  const searchDialog = useRef<HTMLDialogElement>(null)
  const openSearch = () => {
    if (!searchDialog.current?.open) searchDialog.current?.showModal()
    searchDialog.current?.querySelector<HTMLInputElement>('input')?.focus()
  }
  const navigationGroups: { label: string; keys: MessageKey[] }[] = [
    { label: t.services, keys: ['services', 'places', 'advisories', 'news'] },
    { label: t.government, keys: ['government', 'officials', 'offices', 'committees', 'barangays', 'map'] },
    { label: t.statistics, keys: ['demographics', 'competitiveness', 'income'] },
    { label: 'OpenLGU', keys: ['legislation', 'terms', 'downloads'] },
    { label: t.transparency, keys: ['finance', 'procurement', 'projects', 'sources'] },
  ]
  useEffect(() => {
    const closeMenus = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && searchDialog.current?.open) return
      if (event instanceof KeyboardEvent && event.key !== 'Escape') return
      document.querySelectorAll<HTMLDetailsElement>('.nav-group[open]').forEach(group => {
        if (event instanceof MouseEvent && group.contains(event.target as Node)) return
        group.open = false
        if (event instanceof KeyboardEvent) group.querySelector('summary')?.focus()
      })
      if (event instanceof KeyboardEvent) {
        const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle')
        if (toggle?.getAttribute('aria-expanded') === 'true') toggle.focus()
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', closeMenus)
    document.addEventListener('keydown', closeMenus)
    return () => {
      document.removeEventListener('click', closeMenus)
      document.removeEventListener('keydown', closeMenus)
    }
  }, [])
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        openSearch()
      }
    }
    document.addEventListener('keydown', shortcut)
    return () => document.removeEventListener('keydown', shortcut)
  }, [])
  useEffect(() => { loadData().then(setData).catch(() => setError(true)) }, [])
  useEffect(() => {
    if (route !== '' || !data) return
    const update = () => setPastHero((document.querySelector('.atlas-place')?.getBoundingClientRect().bottom ?? 1) <= 0)
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [route, data])
  useEffect(() => {
    document.documentElement.lang = locale
    const heading = document.querySelector('#main h1')?.textContent?.trim()
    const label = heading || t[routes.find(([path]) => path === route)?.[1] ?? 'notFound']
    document.title = route === '' && !error ? `Better${lgu.name} · ${t.communityPortal}` : `${label} · Better${lgu.name}`
    if (!segments.length) location.replace(`${base}${locale}/${location.search}${location.hash}`)
  }, [locale, route, t, segments.length, data, error])
  const evidence = (value: EvidenceValue) => <EvidenceTree value={value} locale={locale} sources={data?.portal.sources ?? []} sourceHref={sourceHref} />
  const original = <p className="original-label">{t.original}</p>
  const cite = (id: string) => {
    const source = data?.portal.sources.find(s => (s.id || s.sourceId) === id)
    return source ? <SourceCitation key={id} source={source} href={sourceHref(id)} locale={locale} /> : null
  }
  const tree = (value: EvidenceValue) => <section className="panel">{original}{evidence(value)}</section>
  const records = (value: EvidenceValue | undefined): DataRecord[] => Array.isArray(value) ? value as DataRecord[] : []
  const notFound = () => <><h1>{t.notFound}</h1><p>{t.notFoundText}</p><code className="requested-url">{location.pathname}</code><p><a href={href('search')}>{t.search}</a></p></>
  const officialRows = data ? records(data.officials.records) : []
  const allLegislation: LegislationRecord[] = data ? [data.ordinances, data.resolutions].flatMap(feed => records(feed.records).map(row => ({ ...row, sourceIndexUrl: feed.sourceIndexUrl, sourceFeedUrl: feed.sourceFeedUrl, retrievedAt: feed.retrievedAt, sourceFeedSha256: feed.sourceFeedSha256 } as unknown as LegislationRecord))) : []
  let content: ReactNode
  if (error) content = <><h1>{t.loadError}</h1><Button onClick={() => location.reload()}>{t.retry}</Button><p><ExternalDocumentLink url={lgu.officialUrl} /></p></>
  else if (!data) content = <p role="status">{t.loading}</p>
  else if (route === '') content = <Home locale={locale} capturedAt={data.portal.capturedAt} href={href} search={<SearchForm locale={locale} href={href} />} contacts={data.contacts} municipality={data.municipality} />
  else if (route === 'services') content = <Services data={data} locale={locale} href={href} />
  else if (route.startsWith('services/')) {
    const recordId = route.slice('services/'.length)
    const row = records(data.services.services).find(r => r.recordId === recordId)
    const lead = records(data.services.serviceLegislationLeads).find(r => r.recordId === recordId && records(data.ordinances.records).some(o => o.recordId === r.recordId && o.sourceId === r.sourceId))
    content = row || lead ? <ServiceDetail data={data} locale={locale} href={href} recordId={recordId} /> : notFound()
  }
  else if (route === 'government') content = <Government data={data} locale={locale} href={href} />
  else if (route === 'government/officials') content = <Officials data={data} locale={locale} href={href} />
  else if (route.startsWith('government/officials/')) {
    const row = officialRows.find(r => r.recordId === route.slice('government/officials/'.length))
    content = row ? <OfficialDetail data={data} locale={locale} href={href} recordId={String(row.recordId)} correctionLink={correctionLink} /> : notFound()
  }
  else if (route === 'government/offices' || route.startsWith('government/offices/')) content = <Contacts data={data} locale={locale} href={href} officeId={route === 'government/offices' ? undefined : route.slice('government/offices/'.length)} />
  else if (route === 'government/committees') content = <><h1>{t.committees}</h1>{original}<ul className="record-list">{officialRows.filter(row => row.committeeLabel).map(row => <li key={String(row.recordId)}><h2>{String(row.committeeLabel)}</h2><a href={href(`government/officials/${encodeURIComponent(String(row.recordId))}`)}>{String(row.displayName)}</a>{cite(String(row.sourceId))}</li>)}</ul></>
  else if (route === 'government/barangays' || route.startsWith('government/barangays/')) content = <Barangays data={data} locale={locale} href={href} recordId={route === 'government/barangays' ? undefined : route.slice('government/barangays/'.length)} correctionLink={correctionLink} />
  else if (route === 'open-lgu/legislation' || route.startsWith('open-lgu/legislation/')) content = <Legislation locale={locale} records={allLegislation} recordId={route === 'open-lgu/legislation' ? undefined : route.slice('open-lgu/legislation/'.length)} href={href} sourceLink={sourceHref} correctionLink={correctionLink} />
  else if (route === 'open-lgu/terms') content = <><h1>{t.terms}</h1>{cite(lgu.sourceIds.legislative)}</>
  else if (route.startsWith('open-lgu/terms/')) content = notFound()
  else if (route === 'statistics/demographics') content = <Demographics data={data} locale={locale} href={href} />
  else if (route === 'statistics/competitiveness') content = <Competitiveness data={data} locale={locale} href={href} />
  else if (route === 'statistics/municipal-income' || route === 'transparency/finance') content = <Finance data={data} locale={locale} href={href} income={route.startsWith('statistics')} />
  else if (route === 'transparency/procurement' || route === 'transparency/projects') content = <ProjectProcurement data={data} locale={locale} href={href} correctionLink={correctionLink} projects={route.endsWith('projects')} />
  else if (route === 'map') content = <Geography data={data} locale={locale} href={href} />
  else if (route === 'places') content = <Places data={data} locale={locale} href={href} />
  else if (route === 'advisories') content = <Advisories data={data} locale={locale} href={href} />
  else if (route === 'news') content = <News data={data} locale={locale} href={href} />
  else if (route.startsWith('news/')) content = <NewsDetail data={data} locale={locale} href={href} recordId={route.slice('news/'.length)} />
  else if (route === 'open-data') content = <Downloads data={data} locale={locale} href={href} />
  else if (route === 'sources') content = <Sources data={data} locale={locale} href={href} />
  else if (route.startsWith('sources/')) {
    const id = route.slice('sources/'.length)
    const source = data.portal.sources.find(s => (s.id || s.sourceId) === id)
    const related = data.portal.search.filter(row => row.sourceIds?.includes(id) && row.type !== 'source')
    content = source ? <><h1>{source.name || source.publisher}</h1>{cite(id)}{tree(source as unknown as EvidenceValue)}<h2>{t.affected}</h2><SearchResults rows={related} href={href} locale={locale} /><p><a href={correctionLink(id)}>{t.correction}</a></p></> : notFound()
  }
  else if (route === 'search') content = <SearchPage data={data} locale={locale} href={href} />
  else if (route === 'report-data') content = <><h1>{t.corrections}</h1><p className="measure">{t.correctionText}</p><ul className="topic-list"><li><a href={correctionLink(new URLSearchParams(location.search).get('record') || '')}>{t.correction}</a></li><li><a href={correctionLink('', 'missing-record.yml')}>{t.missing}</a></li><li><a href={correctionLink('', 'project-observation.yml')}>{t.observation}</a></li></ul></>
  else if (route === 'about') content = <><h1>{t.about}</h1><p>{t.community}</p><p>{t.description}</p><p><a href={lgu.repository}>GitHub</a> · <a href={lgu.officialUrl}>{lgu.name}</a></p>{tree(data.municipality.publishedDescription)}<p>{t.licensePolicy}</p></>
  else if (route === 'accessibility') content = <><h1>{t.accessibility}</h1><p>{t.accessibilityPolicy}</p><a href={href('report-data')}>{t.corrections}</a></>
  else if (route === 'privacy') content = <><h1>{t.privacy}</h1><p>{t.privacyPolicy}</p></>
  else content = notFound()
  return <>
    <a className="skip-link" href="#main">{t.skip}</a>
    <div className={`community-bar${route === '' ? ' atlas-utility' : ''}`}><div className="utility-inner">
      <p>{t.community}</p>
      <nav aria-label={t.projectLinks}>
        <a className="initiative-link" href="https://lgu.bettergov.ph/">{t.joinInitiative}</a>
        <a href={href('about')}>{t.about}</a>
        <a href={lgu.officialUrl}>{t.officialWebsite}</a>
        <a href={href('government/offices')}>{t.hotlines}</a>
        <a href={`${base}${locale === 'en' ? 'fil' : 'en'}/${route.split('/').map(encodeURIComponent).join('/')}${location.search}${location.hash}`} lang={locale === 'en' ? 'fil' : 'en'} hrefLang={locale === 'en' ? 'fil' : 'en'}>{locale === 'en' ? 'Filipino' : 'English'}</a>
      </nav>
    </div></div>
    <header className={`site-header${route === '' ? ' atlas-header' : ''}${pastHero ? ' is-sticky' : ''}`}><div className="header-inner">
      <a className="brand" href={href('')} aria-label={`Better${lgu.name} · ${t.home}`}>
        <img className="brand-mark" src={`${base}logo.webp`} width="48" height="48" alt="" />
        <div className="brand-wordmark">Better<span>{lgu.name}</span></div>
      </a>
      <button className="menu-toggle" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? t.closeMenu : t.menuLabel}</button>
      <nav id="primary-navigation" className={`primary-navigation${menuOpen ? ' is-open' : ''}`} aria-label={t.navigation}>
        {navigationGroups.map(group => <details key={group.label} className="nav-group" name="primary-navigation">
          <summary className={group.keys.some(key => {
            const path = routes.find(([, label]) => label === key)![0]
            return route === path || route.startsWith(`${path}/`)
          }) ? 'is-active' : undefined}>{group.label}<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg></summary>
          <div className="nav-dropdown">{group.keys.map(key => {
            const path = routes.find(([, label]) => label === key)![0]
            return <a key={key} href={href(path)} aria-current={route === path ? 'page' : undefined}>{t[key]}</a>
          })}</div>
        </details>)}
        <a className="header-search" href={href('search')} aria-label={t.search} aria-keyshortcuts="Control+K Meta+K" onClick={event => { event.preventDefault(); openSearch() }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><span>{t.search}</span></a>
      </nav>
    </div></header>
    <SearchPalette dialog={searchDialog} data={data} error={error} locale={locale} href={href} />
    <div className={`site-layout${route === '' ? ' home-layout' : ''}`}>
      <main id="main" tabIndex={-1}>{content}</main>
    </div>
    {route === '' ? <footer className="atlas-footer">
      <div className="atlas-footer-main">
        <div className="atlas-footer-intro">
          <a className="atlas-footer-brand" href={href('')}>Better{lgu.name}<small>{t.communityPortal} · {lgu.name}, {lgu.province}</small></a>
          <p>{t.footerDescription.replace('{place}', lgu.name)}</p>
        </div>
        <nav aria-label={t.footer}>
          {(['about', 'accessibility', 'privacy', 'corrections', 'sources', 'downloads'] as MessageKey[]).map(key => <a key={key} href={href(routes.find(([, k]) => k === key)![0])}>{t[key]}</a>)}
        </nav>
      </div>
      <p>{locale === 'fil' ? 'Petsa ng pagkakatala' : 'Date recorded'}: {data ? formatDate(data.portal.capturedAt, locale) : t.loading}. {locale === 'fil' ? 'Suriin muli ang mga sanggunian; maaaring luma na ang datos mula sa mga ito.' : 'Double-check sources; sourced data may be stale.'}</p>
      <div className="atlas-footer-statement"><span>{t.footerCommunity}</span><strong>{t.footerCost.replace('{place}', lgu.name)} <span>₱0</span></strong></div>
      <div className="atlas-footer-bottom"><a href={lgu.repository} aria-label="GitHub">{githubIcon}</a></div>
    </footer> : <footer><p>{t.community}</p>
      <p>{locale === 'fil' ? 'Petsa ng pagkakatala' : 'Date recorded'}: {data ? formatDate(data.portal.capturedAt, locale) : t.loading}. {locale === 'fil' ? 'Suriin muli ang mga sanggunian; maaaring luma na ang datos mula sa mga ito.' : 'Double-check sources; sourced data may be stale.'}</p>
      <nav aria-label={t.footer}>
        {(['about', 'accessibility', 'privacy', 'corrections', 'sources', 'downloads'] as MessageKey[]).map(key => <a key={key} href={href(routes.find(([, k]) => k === key)![0])}>{t[key]}</a>)}
        <a href={lgu.repository} aria-label="GitHub">{githubIcon}</a>
      </nav></footer>}
  </>
}

function SearchForm({ locale, href, initial = '' }: { locale: Locale; href: (path: string) => string; initial?: string }) {
  const t = catalogs[locale]
  return <form className="search-form" action={href('search')}><label htmlFor="portal-search">{t.query}</label><div><input id="portal-search" name="q" type="search" defaultValue={initial} /><Button type="submit">{t.submit}</Button></div></form>
}
function SearchResults({ rows, href, locale }: { rows: DataPack['portal']['search']; href: (path: string) => string; locale: Locale }) {
  const [page, setPage] = useState(0)
  const pageCount = Math.ceil(rows.length / 25)
  const t = catalogs[locale]
  return <><p role="status">{formatNumber(rows.length, locale)} {t.records}</p>{!rows.length && <p>{t.noResults}</p>}<ul className="record-list">{rows.slice(page * 25, (page + 1) * 25).map(row => <li key={`${row.type}:${row.id}`}><h2><a href={href(row.path)}>{row.title}</a></h2><p className="badge">{row.type}</p><p>{row.sourceIds?.join(' · ')}</p></li>)}</ul>{pageCount > 1 && <div className="pagination"><Button variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>{t.previous}</Button><span>{page + 1} / {pageCount}</span><Button variant="outline" disabled={page + 1 >= pageCount} onClick={() => setPage(p => p + 1)}>{t.next}</Button></div>}</>
}
function SearchPage({ data, locale, href }: { data: DataPack; locale: Locale; href: (path: string) => string }) {
  const query = new URLSearchParams(location.search).get('q') || ''
  const matching = searchPortal(data.portal.search, query, locale)
  return <><h1>{catalogs[locale].search}</h1><SearchForm locale={locale} href={href} initial={query} /><SearchResults key={query} rows={matching} href={href} locale={locale} /></>
}
export default App
