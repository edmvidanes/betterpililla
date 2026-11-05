import CheckedLink from '../components/CheckedLink'
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '@bettergov/kapwa/button'
import { lgu } from '../config/lgu'
import { catalogs, formatDate, formatNumber, type Locale, type MessageKey } from '../i18n/locales'
import { loadData, loadSearch, type DataPack, type DataRecord, type EvidenceValue } from '../data/loaders'
import { EvidenceTree, ExternalDocumentLink, SourceCitation } from '../components/Evidence'
import { Pagination, usePagination } from '../components/Pagination'
import SearchPalette from '../components/SearchPalette'
import { routes } from './route-manifest'
import PageMotion from './PageMotion'
import Home from '../features/home/Home'
import { searchPortal } from './search'
import WorkInProgress from '../components/WorkInProgress'

const Services = lazy(() => import('../features/Services'))
const ServiceDetail = lazy(() => import('../features/ServiceDetail'))
const WaterDistrict = lazy(() => import('../features/WaterDistrict'))
const PublicHelp = lazy(() => import('../features/PublicHelp'))
const Places = lazy(() => import('../features/Places').then(module => ({ default: module.Places })))
const Advisories = lazy(() => import('../features/Places').then(module => ({ default: module.Advisories })))
const Government = lazy(() => import('../features/Government').then(module => ({ default: module.Government })))
const Officials = lazy(() => import('../features/Government').then(module => ({ default: module.Officials })))
const OfficialDetail = lazy(() => import('../features/Government').then(module => ({ default: module.OfficialDetail })))
const Contacts = lazy(() => import('../features/Government').then(module => ({ default: module.Contacts })))
const Demographics = lazy(() => import('../features/Demographics'))
const Competitiveness = lazy(() => import('../features/Competitiveness'))
const Finance = lazy(() => import('../features/Finance'))
const TransparencyHub = lazy(() => import('../features/TransparencyHub'))
const BudgetPortal = lazy(() => import('../features/BudgetPortal'))
const LiveProcurement = lazy(() => import('../features/LiveProcurement'))
const LiveProjects = lazy(() => import('../features/LiveProjects'))
const Downloads = lazy(() => import('../features/Catalogues').then(module => ({ default: module.Downloads })))
const Sources = lazy(() => import('../features/Catalogues').then(module => ({ default: module.Sources })))
const Barangays = lazy(() => import('../features/Barangays'))
const Geography = lazy(() => import('../features/Geography'))

const base = import.meta.env.BASE_URL
const githubIcon = <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.32-3.79-1.32-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.64 1.22 3.28.93.1-.73.39-1.22.7-1.5-2.5-.28-5.12-1.25-5.12-5.56 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.16a10.8 10.8 0 0 1 5.64 0c2.15-1.46 3.1-1.16 3.1-1.16.61 1.55.23 2.7.11 2.98.72.79 1.16 1.8 1.16 3.03 0 4.32-2.63 5.27-5.13 5.55.4.35.76 1.03.76 2.08v3.1c0 .3.21.65.78.54A11.25 11.25 0 0 0 12 .75Z" /></svg>
function App({ initialPath }: { initialPath?: string }) {
  const [browserPath, setBrowserPath] = useState(initialPath ?? location.pathname + location.search + location.hash)
  const currentPath = browserPath.split(/[?#]/)[0]
  const pathname = initialPath ?? (currentPath.startsWith(base) ? currentPath.slice(base.length) : currentPath.slice(1))
  const segments = pathname.replace(/\/$/, '').split('/').filter(Boolean)
  const explicitLocale = segments[0] === 'en' || segments[0] === 'fil'
  const locale: Locale = explicitLocale ? segments[0] as Locale : lgu.defaultLocale
  const route = (explicitLocale ? segments.slice(1) : segments).map(s => { try { return decodeURIComponent(s) } catch { return s } }).join('/')
  const t = catalogs[locale]
  const href = (path: string) => `${base}${locale}${path ? `/${path.replace(/^\//, '')}` : '/'}`
  const sourceHref = (id: string) => href(`sources/${encodeURIComponent(id)}`)
  const correctionLink = (id: string, template = 'data-correction.yml') => lgu.repository ? `${lgu.repository}/issues/new?${new URLSearchParams({ template, record: id, title: `[Data] ${id}`, 'source-page': location.href })}` : href('report-data')
  const [data, setData] = useState<DataPack | null>(null)
  const [error, setError] = useState(false)
  const [paletteSearch, setPaletteSearch] = useState<DataPack['search'] | null>(null)
  const [paletteError, setPaletteError] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [headerState, setHeaderState] = useState<'normal' | 'sticky' | 'exiting'>('normal')
  const [homeSuffix, setHomeSuffix] = useState('')
  const searchDialog = useRef<HTMLDialogElement>(null)
  const openSearch = () => {
    setPaletteError(false)
    loadSearch().then(setPaletteSearch).catch(() => setPaletteError(true))
    if (!searchDialog.current?.open) searchDialog.current?.showModal()
    searchDialog.current?.querySelector<HTMLInputElement>('input')?.focus()
  }
  const navigationGroups: { label: string; keys: MessageKey[] }[] = [
    { label: t.services, keys: ['services', 'waterDistrict', 'publicContacts', 'places', 'advisories'] },
    { label: t.government, keys: ['government', 'officials', 'offices', 'committees', 'barangays', 'map', 'history'] },
    { label: t.statistics, keys: ['demographics', 'competitiveness', 'income'] },
    { label: 'OpenLGU', keys: ['legislation', 'terms', 'downloads'] },
    { label: t.transparency, keys: ['transparency', 'budgetPortal', 'enactedBudgets', 'budgetSources', 'procurement', 'projects', 'finance'] },
  ]
  useEffect(() => {
    const update = () => setBrowserPath(location.pathname + location.search + location.hash)
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])
  useEffect(() => {
    const closeMenus = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && searchDialog.current?.open) return
      if (event instanceof KeyboardEvent && event.key !== 'Escape') return
      document.querySelectorAll<HTMLDetailsElement>('.nav-group[open]').forEach(group => {
        if (event instanceof MouseEvent && group.contains(event.target as Node)) return
        group.open = false
        if (event instanceof KeyboardEvent) group.querySelector('summary')?.focus()
      })
      if (event instanceof MouseEvent && !(event.target as Element).closest('.primary-navigation, .menu-toggle')) setMenuOpen(false)
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
  useEffect(() => { if (route === '') setHomeSuffix(location.search + location.hash) }, [route])
  useEffect(() => { loadData(route).then(setData).catch(() => setError(true)) }, [route])
  useEffect(() => {
    if (route !== '') return
    const update = () => {
      const pastHero = (document.querySelector('.atlas-place')?.getBoundingClientRect().bottom ?? 1) <= 0
      setHeaderState(state => pastHero ? 'sticky' : state === 'sticky' ? (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'normal' : 'exiting') : state)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [route])
  useEffect(() => {
    document.documentElement.lang = locale
    if (!segments.length) location.replace(`${base}${locale}/${location.search}${location.hash}`)
  }, [locale, segments.length])
  const evidence = (value: EvidenceValue) => <EvidenceTree value={value} locale={locale} sources={data?.portal.sources ?? []} sourceHref={sourceHref} />
  const original = <p className="original-label">{t.original}</p>
  const cite = (id: string) => {
    const source = data?.portal.sources.find(s => (s.id || s.sourceId) === id)
    return source ? <SourceCitation key={id} source={source} href={sourceHref(id)} locale={locale} /> : null
  }
  const tree = (value: EvidenceValue) => <section className="panel">{original}{evidence(value)}</section>
  const records = (value: EvidenceValue | undefined): DataRecord[] => Array.isArray(value) ? value as DataRecord[] : []
  const notFound = () => <><h1>{t.notFound}</h1><p>{t.notFoundText}</p><code className="requested-url">{location.pathname}</code><p><CheckedLink href={href('search')}>{t.search}</CheckedLink></p></>
  const officialRows = data ? records(data.officials.records) : []
  const { visible: visibleCommittees, page: committeePage, pages: committeePages, setPage: setCommitteePage } = usePagination(officialRows.filter(row => row.committeeLabel))
  let content: ReactNode
  const dataStatus = error
    ? <><h2>{t.loadError}</h2><Button onClick={() => location.reload()}>{t.retry}</Button><p><ExternalDocumentLink url={lgu.officialUrl} /></p></>
    : <p role="status">{t.loading}</p>
  if (route === '') content = <Home locale={locale} data={data} href={href} search={<SearchForm locale={locale} href={href} />} dataStatus={dataStatus} />
  else if (error) content = <><h1>{t.loadError}</h1><Button onClick={() => location.reload()}>{t.retry}</Button><p><ExternalDocumentLink url={lgu.officialUrl} /></p></>
  else if (!data) content = <p role="status">{t.loading}</p>
  else if (route === 'services') content = <Services data={data} locale={locale} href={href} />
  else if (route === 'services/water-district') content = <WaterDistrict data={data} locale={locale} href={href} />
  else if (route === 'services/public-contacts') content = <PublicHelp data={data} locale={locale} href={href} />
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
  else if (route === 'government/committees') content = <><h1>{t.committees}</h1>{original}<ul className="record-list">{visibleCommittees.map(row => <li key={String(row.recordId)}><h2>{String(row.committeeLabel)}</h2><CheckedLink href={href(`government/officials/${encodeURIComponent(String(row.recordId))}`)}>{String(row.displayName)}</CheckedLink>{cite(String(row.sourceId))}</li>)}</ul><Pagination page={committeePage} pages={committeePages} setPage={setCommitteePage} locale={locale} label={locale === 'fil' ? 'Mga pahina ng mga komite' : 'Committee pages'} /></>
  else if (route === 'government/barangays' || route.startsWith('government/barangays/')) content = <Barangays data={data} locale={locale} href={href} recordId={route === 'government/barangays' ? undefined : route.slice('government/barangays/'.length)} correctionLink={correctionLink} />
  else if (route === 'open-lgu/legislation' || route.startsWith('open-lgu/legislation/')) content = <><h1>{t.legislation}</h1><p>{locale === 'fil' ? 'Hindi pa nakokolekta ang mga ordinansa at resolusyon ng Pililla para sa portal na ito. Inalis ang dating listahan dahil hindi ito mga tala ng Pililla; ilalathala lamang ito kapag may naberipikang dokumento ng Pililla na may pinagmulang URL at petsa ng pagkuha. Pansamantala, tingnan ang opisyal na website ng munisipyo.' : 'Pililla ordinances and resolutions have not been collected for this portal yet. The previous listing did not contain Pililla records, so it was withdrawn; records will appear only after verified Pililla documents are captured with a source URL and capture date. In the meantime, please refer to the official municipal website.'}</p><p><ExternalDocumentLink url={lgu.officialUrl} /></p>{cite(lgu.sourceIds.legislative)}</>
  else if (route === 'open-lgu/terms') content = <><h1>{t.terms}</h1>{cite(lgu.sourceIds.legislative)}</>
  else if (route.startsWith('open-lgu/terms/')) content = notFound()
  else if (route === 'statistics/demographics') content = <Demographics data={data} locale={locale} href={href} />
  else if (route === 'statistics/competitiveness') content = <Competitiveness data={data} locale={locale} href={href} />
  else if (route === 'transparency') content = <TransparencyHub data={data} locale={locale} href={href} />
  else if (route === 'transparency/budget' || route.startsWith('transparency/budget/')) content = <BudgetPortal locale={locale} route={route} />
  else if (route === 'statistics/municipal-income' || route === 'transparency/finance') content = <Finance data={data} locale={locale} href={href} income={route.startsWith('statistics')} />
  else if (route === 'transparency/procurement') content = <LiveProcurement data={data} locale={locale} href={href} />
  else if (route === 'transparency/projects') content = <LiveProjects data={data} locale={locale} href={href} />
  else if (route.startsWith('transparency/projects/') || route.startsWith('transparency/procurement/')) {
    const projects = route.startsWith('transparency/projects/')
    const recordId = route.slice(`transparency/${projects ? 'projects' : 'procurement'}/`.length)
    content = projects ? <LiveProjects data={data} locale={locale} href={href} recordId={recordId} /> : <LiveProcurement data={data} locale={locale} href={href} recordId={recordId} />
  }
  else if (route === 'map') content = <Geography data={data} locale={locale} href={href} />
  else if ((route === 'places' || route === 'advisories') && data.sectors.publicationStatus === 'not-collected') content = <><h1>{route === 'places' ? t.places : t.advisories}</h1><p>{locale === 'fil' ? 'Hindi pa nakokolekta ang mga sanggunian ng Pililla para sa seksyong ito. Tingnan ang opisyal na website para sa kasalukuyang impormasyon.' : 'Pililla sources for this section have not been collected yet. Check the official website for current information.'}</p><CheckedLink href={lgu.officialUrl}>{t.officialWebsite}</CheckedLink></>
  else if (route === 'places') content = <Places data={data} locale={locale} href={href} />
  else if (route === 'advisories') content = <Advisories data={data} locale={locale} href={href} />
  else if (route === 'history') content = <><h1>{t.historyTitle}</h1><p>{t.historyIntro}</p><CheckedLink href={lgu.officialUrl}>{t.officialWebsite}</CheckedLink></>
  else if (route === 'open-data') content = <Downloads data={data} locale={locale} href={href} />
  else if (route === 'sources') content = <Sources data={data} locale={locale} href={href} />
  else if (route.startsWith('sources/')) {
    const id = route.slice('sources/'.length)
    const source = data.portal.sources.find(s => (s.id || s.sourceId) === id)
    const related = data.search.filter(row => row.sourceIds?.includes(id) && row.type !== 'source')
    content = source ? <><h1>{source.name || source.publisher}</h1>{cite(id)}{tree(source as unknown as EvidenceValue)}<h2>{t.affected}</h2><SearchResults rows={related} href={href} locale={locale} /><p><CheckedLink href={correctionLink(id)}>{t.correction}</CheckedLink></p></> : notFound()
  }
  else if (route === 'search') content = <SearchPage data={data} locale={locale} href={href} />
  else if (route === 'report-data') content = <><h1>{t.corrections}</h1>{lgu.repository ? <><p className="measure">{t.correctionText}</p><ul className="topic-list"><li><CheckedLink href={correctionLink(new URLSearchParams(location.search).get('record') || '')}>{t.correction}</CheckedLink></li><li><CheckedLink href={correctionLink('', 'missing-record.yml')}>{t.missing}</CheckedLink></li><li><CheckedLink href={correctionLink('', 'project-observation.yml')}>{t.observation}</CheckedLink></li></ul></> : <><p>{locale === 'fil' ? 'Lokal na preview pa lamang ito. Bubuksan ang pag-uulat kapag na-set up na ang pampublikong repository. Para sa ngayon, makikita rito ang mga sanggunian at kakulangan ng datos.' : 'This is a local preview. Reporting will open once the public repository is set up. You can review sources and data gaps here in the meantime.'}</p><CheckedLink href={href('sources')}>{t.sources}</CheckedLink></>}</>
  else if (route === 'about') content = <article className="about-page">
    <header className="about-intro">
      <h1>{t.about}</h1>
      <p className="about-statement">{locale === 'fil' ? 'Dapat madaling mahanap ang impormasyon tungkol sa sarili mong bayan.' : 'Information about your own town should be easy to find.'}</p>
      <p className="about-description">{locale === 'fil' ? 'Kapag kailangan mong mag-asikaso ng dokumento o alamin kung saan napupunta ang pondo ng bayan, mahalagang makita ang tamang impormasyon at ang pinagmulan nito. Mahirap iyon kung magkakahiwalay ang mga tala sa iba’t ibang website at PDF.' : 'When you need to apply for a document or find out how town funds are spent, you need clear information and a source you can check. That gets harder when the records are scattered across websites and PDFs.'}</p>
      <p>{locale === 'fil' ? <>Ang <CheckedLink href="https://about.bettergov.ph/">BetterGov.ph</CheckedLink> ay isang kilusang pinapatakbo ng mga boluntaryo para mas madaling mahanap at maunawaan ang datos ng pamahalaan. Sa antas ng mga lungsod at munisipalidad, hinihikayat ng <CheckedLink href="https://lgu.bettergov.ph/">BetterLGU</CheckedLink> ang mga komunidad na gumawa at mag-ambag sa sarili nilang mga portal.</> : <><CheckedLink href="https://about.bettergov.ph/">BetterGov.ph</CheckedLink> is a volunteer-driven movement making government data easier to access and understand. <CheckedLink href="https://lgu.bettergov.ph/">BetterLGU</CheckedLink> brings that work to cities and municipalities, encouraging communities to build local portals and contribute to existing ones.</>}</p>
      <p>{locale === 'fil' ? 'Ginawa ang BetterPililla para sa inisyatibong ito. Dito, makikita ang mga pampublikong tala ng Pililla kasama ang mga orihinal na dokumento at sanggunian. Nakasaad din kung may kulang o hindi pa nakukumpirma, para alam mo kung ano ang maaari mong asahan at kung ano ang kailangan pang itanong.' : 'BetterPililla was built for that initiative. It brings Pililla’s public records together with original documents and sources you can follow. Gaps and unresolved claims stay visible, so you can see what is known and what still needs an answer.'}</p>
      <p>{t.community}</p>
      <nav className="about-links" aria-label={t.projectLinks}>
        {lgu.repository && <CheckedLink href={lgu.repository}>GitHub</CheckedLink>}
        <CheckedLink href={lgu.officialUrl}>{lgu.name}</CheckedLink>
      </nav>
    </header>
    <div className="about-details">
      <section className="panel">{evidence(data.municipality.publishedDescription)}</section>
      <p className="about-license">{t.licensePolicy}</p>
    </div>
  </article>
  else if (route === 'accessibility') content = <><h1>{t.accessibility}</h1><p>{t.accessibilityPolicy}</p><CheckedLink href={href('report-data')}>{t.corrections}</CheckedLink></>
  else if (route === 'privacy') content = <><h1>{t.privacy}</h1><p>{t.privacyPolicy}</p></>
  else content = notFound()
  const unavailableSections: [string, MessageKey][] = [
    ['government/officials', 'officials'], ['government/offices', 'offices'],
    ['government/committees', 'committees'], ['open-lgu/terms', 'terms'],
    ['statistics/competitiveness', 'competitiveness'], ['statistics/municipal-income', 'income'],
    ['transparency/finance', 'finance'],
  ]
  const unavailableSection = unavailableSections.find(([path]) => route === path || route.startsWith(path + '/'))
  if (data && unavailableSection) content = <><h1>{t[unavailableSection[1]]}</h1><WorkInProgress locale={locale} /></>
  else if (data && ['services', 'open-lgu/legislation', 'places', 'advisories', 'history', 'statistics/demographics'].includes(route)) content = <>{content}<WorkInProgress locale={locale} /></>
  return <>
    <CheckedLink className="skip-link" href="#main">{t.skip}</CheckedLink>
    <div className={`community-bar${route === '' ? ' atlas-utility' : ''}`}><div className="utility-inner">
      <p>{t.community}</p>
      <nav aria-label={t.projectLinks}>
        <CheckedLink className="initiative-link" href="https://lgu.bettergov.ph/">{t.joinInitiative}</CheckedLink>
        <CheckedLink href={href('about')}>{t.about}</CheckedLink>
        <CheckedLink href={lgu.officialUrl}>{t.officialWebsite}</CheckedLink>
        <CheckedLink href={href('services/public-contacts')}>{t.hotlines}</CheckedLink>
        <CheckedLink href={`${base}${locale === 'en' ? 'fil' : 'en'}/${route.split('/').map(encodeURIComponent).join('/')}${route === '' ? homeSuffix : location.search + location.hash}`} lang={locale === 'en' ? 'fil' : 'en'} hrefLang={locale === 'en' ? 'fil' : 'en'}>{locale === 'en' ? 'Filipino' : 'English'}</CheckedLink>
      </nav>
    </div></div>
    <header className={`site-header${route === '' ? ' atlas-header' : ''}${headerState !== 'normal' ? ' is-sticky' : ''}${headerState === 'exiting' ? ' is-exiting' : ''}`} onAnimationEnd={event => { if (event.target === event.currentTarget && event.animationName === 'header-exit') setHeaderState(state => state === 'exiting' ? 'normal' : state) }}><div className="header-inner">
      <CheckedLink className="brand" href={href('')} aria-label={`Better${lgu.name} · ${t.home}`}>
        <img className="brand-mark" src={`${base}logo.webp`} width="48" height="48" alt="" />
        <div className="brand-wordmark">Better<span>{lgu.name}</span></div>
      </CheckedLink>
      <button className="menu-toggle" aria-label={menuOpen ? t.closeMenu : t.menuLabel} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}><span className="menu-icon" aria-hidden="true"><span /><span /><span /></span></button>
      <nav id="primary-navigation" className={`primary-navigation${menuOpen ? ' is-open' : ''}`} aria-label={t.navigation}>
        {navigationGroups.map(group => <details key={group.label} className="nav-group" name="primary-navigation">
          <summary className={group.keys.some(key => {
            const path = routes.find(([, label]) => label === key)![0]
            return route === path || route.startsWith(`${path}/`)
          }) ? 'is-active' : undefined}>{group.label}<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg></summary>
          <div className="nav-dropdown">{group.keys.map(key => {
            const path = routes.find(([, label]) => label === key)![0]
            return <CheckedLink key={key} href={href(path)} aria-current={route === path ? 'page' : undefined}>{t[key]}{key === 'finance' && <span className="work-in-progress-label">WorkInProgress</span>}</CheckedLink>
          })}</div>
        </details>)}
        <CheckedLink className="header-search" href={href('search')} aria-label={t.search} aria-keyshortcuts="Control+K Meta+K" onClick={event => { event.preventDefault(); openSearch() }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><span>{t.search}</span></CheckedLink>
        <div className="mobile-project-links">
          <CheckedLink href={href('about')}>{t.about}</CheckedLink>
          <CheckedLink href={lgu.officialUrl}>{t.officialWebsite}</CheckedLink>
          <CheckedLink href={href('services/public-contacts')}>{t.hotlines}</CheckedLink>
          <CheckedLink href={`${base}${locale === 'en' ? 'fil' : 'en'}/${route.split('/').map(encodeURIComponent).join('/')}${route === '' ? homeSuffix : location.search + location.hash}`} lang={locale === 'en' ? 'fil' : 'en'} hrefLang={locale === 'en' ? 'fil' : 'en'}>{locale === 'en' ? 'Filipino' : 'English'}</CheckedLink>
        </div>
      </nav>
    </div></header>
    <SearchPalette dialog={searchDialog} search={paletteSearch} error={paletteError} locale={locale} href={href} />
    <div className={`site-layout${route === '' ? ' home-layout' : ''}`}>
      <main id="main" tabIndex={-1}><PageMotion ready={!!data || error} /><Suspense fallback={<p role="status">{t.loading}</p>}><PageContent locale={locale} route={route} error={error} ready={!!data || error} officeName={data && route.startsWith('government/offices/') ? String(records(data.contacts.records).find(row => row.category === route.slice('government/offices/'.length))?.service || '') : ''}>{content}</PageContent></Suspense></main>
    </div>
    {route === '' ? <footer className="atlas-footer">
      <div className="atlas-footer-main">
        <div className="atlas-footer-intro">
          <CheckedLink className="atlas-footer-brand" href={href('')}>Better{lgu.name}<small>{t.communityPortal} · {lgu.name}, {lgu.province}</small></CheckedLink>
          <p>{t.footerDescription.replace('{place}', lgu.name)}</p>
        </div>
        <nav aria-label={t.footer}>
          {(['about', 'accessibility', 'privacy', 'corrections', 'sources', 'downloads'] as MessageKey[]).map(key => <CheckedLink key={key} href={href(routes.find(([, k]) => k === key)![0])}>{t[key]}</CheckedLink>)}
        </nav>
      </div>
      <p>{locale === 'fil' ? 'Petsa ng pagkakatala' : 'Date recorded'}: {data ? formatDate(data.portal.capturedAt, locale) : t.loading}. {locale === 'fil' ? 'Suriin muli ang mga sanggunian; maaaring luma na ang datos mula sa mga ito.' : 'Double-check sources; sourced data may be stale.'}</p>
      <div className="atlas-footer-statement"><span>{t.footerCommunity}</span><strong>{t.footerCost.replace('{place}', lgu.name)} <span>₱0</span></strong></div>
      {lgu.repository && <div className="atlas-footer-bottom"><CheckedLink href={lgu.repository} aria-label="GitHub">{githubIcon}</CheckedLink></div>}
    </footer> : <footer><p>{t.community}</p>
      <p>{locale === 'fil' ? 'Petsa ng pagkakatala' : 'Date recorded'}: {data ? formatDate(data.portal.capturedAt, locale) : t.loading}. {locale === 'fil' ? 'Suriin muli ang mga sanggunian; maaaring luma na ang datos mula sa mga ito.' : 'Double-check sources; sourced data may be stale.'}</p>
      <nav aria-label={t.footer}>
        {(['about', 'accessibility', 'privacy', 'corrections', 'sources', 'downloads'] as MessageKey[]).map(key => <CheckedLink key={key} href={href(routes.find(([, k]) => k === key)![0])}>{t[key]}</CheckedLink>)}
        {lgu.repository && <CheckedLink href={lgu.repository} aria-label="GitHub">{githubIcon}</CheckedLink>}
      </nav></footer>}
  </>
}

function PageContent({ children, locale, route, error, ready, officeName }: { children: ReactNode; locale: Locale; route: string; error: boolean; ready: boolean; officeName: string }) {
  useEffect(() => {
    if (!ready && route !== '') return
    const heading = document.querySelector('#main h1')?.textContent?.trim()
    const label = officeName || heading || catalogs[locale][routes.find(([path]) => path === route)?.[1] ?? 'notFound']
    document.title = route === '' && !error ? `Better${lgu.name} · ${catalogs[locale].communityPortal}` : `${label} · Better${lgu.name}`
  })
  return children
}

function SearchForm({ locale, href, initial = '' }: { locale: Locale; href: (path: string) => string; initial?: string }) {
  const t = catalogs[locale]
  return <form className="search-form" action={href('search')}><label htmlFor="portal-search">{t.query}</label><div><input id="portal-search" name="q" type="search" defaultValue={initial} /><Button type="submit">{t.submit}</Button></div></form>
}
function SearchResults({ rows, href, locale }: { rows: DataPack['search']; href: (path: string) => string; locale: Locale }) {
  const [page, setPage] = useState(0)
  const pageCount = Math.ceil(rows.length / 25)
  const t = catalogs[locale]
  return <><p role="status">{formatNumber(rows.length, locale)} {t.records}</p>{!rows.length && <p>{t.noResults}</p>}<ul className="record-list">{rows.slice(page * 25, (page + 1) * 25).map(row => <li key={`${row.type}:${row.id}`}><h2><CheckedLink href={href(row.path)}>{row.title}</CheckedLink></h2><p className="badge">{row.type}</p><p>{row.sourceIds?.join(' · ')}</p></li>)}</ul>{pageCount > 1 && <div className="pagination"><Button variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>{t.previous}</Button><span>{page + 1} / {pageCount}</span><Button variant="outline" disabled={page + 1 >= pageCount} onClick={() => setPage(p => p + 1)}>{t.next}</Button></div>}</>
}
function SearchPage({ data, locale, href }: { data: DataPack; locale: Locale; href: (path: string) => string }) {
  const query = new URLSearchParams(location.search).get('q') || ''
  const matching = searchPortal(data.search, query, locale)
  return <><h1>{catalogs[locale].search}</h1><SearchForm locale={locale} href={href} initial={query} /><SearchResults key={query} rows={matching} href={href} locale={locale} /></>
}
export default App
