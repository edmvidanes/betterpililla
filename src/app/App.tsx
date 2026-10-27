import { useEffect, useState, type ReactNode } from 'react'
import { Button } from '@bettergov/kapwa/button'
import { lgu } from '../config/lgu'
import { catalogs, formatDate, formatNumber, type Locale, type MessageKey } from '../i18n/locales'
import { loadData, type DataPack, type DataRecord, type EvidenceValue } from '../data/loaders'
import { DataStatus, EvidenceTree, ExternalDocumentLink, SourceCitation } from '../components/Evidence'
import Legislation, { type LegislationRecord } from '../features/legislation/Legislation'
import Home from '../features/home/Home'
import { routes } from './route-manifest'
import { barangayId } from '../domain/ids'

const base = import.meta.env.BASE_URL
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
  const navigationGroups: { label: string; keys: MessageKey[] }[] = [
    { label: t.services, keys: ['services', 'places', 'advisories'] },
    { label: t.government, keys: ['government', 'officials', 'offices', 'committees', 'barangays', 'map'] },
    { label: t.statistics, keys: ['demographics', 'competitiveness', 'income'] },
    { label: 'OpenLGU', keys: ['legislation', 'terms', 'downloads'] },
    { label: t.transparency, keys: ['finance', 'procurement', 'projects', 'sources'] },
  ]
  useEffect(() => {
    const closeMenus = (event: MouseEvent | KeyboardEvent) => {
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
  useEffect(() => { loadData().then(setData).catch(() => setError(true)) }, [])
  useEffect(() => {
    document.documentElement.lang = locale
    let label = t.notFound
    for (const [path, key] of routes) {
      if (route === path || path && route.startsWith(`${path}/`)) label = t[key]
    }
    const record = data?.portal.search.find(row => decodeURIComponent(row.path.replace(/^\//, '')) === route)
    document.title = `${record?.title || label} · ${lgu.name}`
    if (!segments.length) location.replace(`${base}${locale}/${location.search}${location.hash}`)
  }, [locale, route, t, segments.length, data])
  const evidence = (value: EvidenceValue) => <EvidenceTree value={value} locale={locale} sources={data?.portal.sources ?? []} sourceHref={sourceHref} />
  const original = <p className="original-label">{t.original}</p>
  const cite = (id: string) => {
    const source = data?.portal.sources.find(s => (s.id || s.sourceId) === id)
    return source ? <SourceCitation key={id} source={source} href={sourceHref(id)} locale={locale} /> : null
  }
  const gap = (text = t.gapText) => <DataStatus><strong>{t.gap}</strong><p>{text}</p></DataStatus>
  const tree = (value: EvidenceValue) => <section className="panel">{original}{evidence(value)}</section>
  const records = (value: EvidenceValue | undefined): DataRecord[] => Array.isArray(value) ? value as DataRecord[] : []
  const notFound = () => <><h1>{t.notFound}</h1><p>{t.notFoundText}</p><code className="requested-url">{location.pathname}</code><p><a href={href('search')}>{t.search}</a></p></>
  const navLinks = (keys: string[]) => <ul className="topic-list">{routes.filter(([, key]) => keys.includes(key)).map(([path, key]) => <li key={key}><a href={href(path)}>{t[key]}</a></li>)}</ul>
  const officialRows = data ? records(data.officials.records) : []
  const allLegislation: LegislationRecord[] = data ? [data.ordinances, data.resolutions].flatMap(feed => records(feed.records).map(row => ({ ...row, sourceIndexUrl: feed.sourceIndexUrl, sourceFeedUrl: feed.sourceFeedUrl, retrievedAt: feed.retrievedAt, sourceFeedSha256: feed.sourceFeedSha256 } as unknown as LegislationRecord))) : []
  const showContacts = (officeId?: string) => {
    const contacts = data ? records(data.contacts.records) : []
    const visible = officeId ? contacts.filter(row => row.category === officeId) : contacts
    if (officeId && !visible.length) return notFound()
    return <><h1>{t.offices}</h1><DataStatus>{t.contactWarning}</DataStatus><p>{t.checked}: {data && formatDate(String(data.contacts.capturedAt), locale)} · {t.lastValidation}: {t.unvalidated}</p><ul className="record-list">{visible.map(row => <li key={String(row.category)}><h2><a href={href(`government/offices/${encodeURIComponent(String(row.category))}`)}>{String(row.service)}</a></h2><p className="badge">{t.unvalidated}</p><ul>{(row.numbersAsPublished as string[]).map(number => <li key={number}><a href={`tel:${number.replace(/[^+\d]/g, '')}`}>{number}</a></li>)}</ul></li>)}</ul>{cite(String(data?.contacts.sourceId))}</>
  }
  let content: ReactNode
  if (error) content = <><h1>{t.loadError}</h1><Button onClick={() => location.reload()}>{t.retry}</Button><p><ExternalDocumentLink url={lgu.officialUrl} /></p></>
  else if (!data) content = <p role="status">{t.loading}</p>
  else if (route === '') content = <Home locale={locale} capturedAt={data.portal.capturedAt} href={href} search={<SearchForm locale={locale} href={href} />} contacts={data.contacts} />
  else if (route === 'services') {
    const query = new URLSearchParams(location.search).get('q') || ''
    const serviceRows = records(data.services.services)
    const matching = serviceRows.filter(row => JSON.stringify(row).toLocaleLowerCase().includes(query.toLocaleLowerCase()))
    content = <><h1>{t.services}</h1><SearchForm locale={locale} href={() => href('services')} initial={query} />{serviceRows.length ? <ul className="record-list">{matching.map(row => <li key={String(row.recordId)}><h2><a href={href(`services/${encodeURIComponent(String(row.recordId))}`)}>{String(row.name)}</a></h2>{cite(String(row.sourceId))}</li>)}</ul> : <>{gap(t.charterGap)}{tree(data.services)}</>}{serviceRows.length > 0 && !matching.length && <p>{t.noResults}</p>}{cite(lgu.sourceIds.charter)}</>
  }
  else if (route.startsWith('services/')) {
    const row = records(data.services.services).find(r => r.recordId === route.slice('services/'.length))
    content = row ? <><h1>{String(row.name)}</h1>{tree(row)}{cite(String(row.sourceId))}<a href={correctionLink(String(row.recordId))}>{t.correction}</a></> : notFound()
  }
  else if (route === 'government') content = <><h1>{t.government}</h1>{navLinks(['officials', 'offices', 'committees', 'barangays', 'terms'])}<p>{t.unknown}: {t.term}</p>{cite(lgu.sourceIds.executive)}{cite(lgu.sourceIds.legislative)}</>
  else if (route === 'government/officials') content = <><h1>{t.officials}</h1>{original}<ul className="record-list">{officialRows.map(row => <li key={String(row.recordId)}><h2><a href={href(`government/officials/${encodeURIComponent(String(row.recordId))}`)}>{String(row.displayName)}</a></h2><p>{String(row.directorySection)}</p><p>{t.role}: {row.roleLabel ? String(row.roleLabel) : t.unknown}</p><p>{t.term}: {t.unknown}</p><p className="muted">{row.verificationStatus ? String(row.verificationStatus) : t.unknown}</p>{cite(String(row.sourceId || row.profileSourceId))}</li>)}</ul></>
  else if (route.startsWith('government/officials/')) {
    const row = officialRows.find(r => r.recordId === route.slice('government/officials/'.length))
    content = row ? <><h1>{String(row.displayName)}</h1><DataStatus>{t.term}: {t.unknown}</DataStatus>{tree(row)}<a href={correctionLink(String(row.recordId))}>{t.correction}</a>{cite(String(row.sourceId || row.profileSourceId))}</> : notFound()
  }
  else if (route === 'government/offices' || route.startsWith('government/offices/')) content = showContacts(route === 'government/offices' ? undefined : route.slice('government/offices/'.length))
  else if (route === 'government/committees') content = <><h1>{t.committees}</h1>{original}<DataStatus>{t.unknown}: {t.term}</DataStatus><ul className="record-list">{officialRows.filter(row => row.committeeLabel).map(row => <li key={String(row.recordId)}><h2>{String(row.committeeLabel)}</h2><a href={href(`government/officials/${encodeURIComponent(String(row.recordId))}`)}>{String(row.displayName)}</a>{cite(String(row.sourceId))}</li>)}</ul></>
  else if (route === 'government/barangays' || route.startsWith('government/barangays/')) {
    const claims = records(data.barangays.sourceClaims)
    const names = [...new Set(claims.flatMap(claim => Array.isArray(claim.namesAsPublished) ? claim.namesAsPublished as string[] : []))]
    const id = route.slice('government/barangays/'.length)
    const name = names.find(n => barangayId(n) === id)
    if (route !== 'government/barangays' && !name) content = notFound()
    else {
      const selectedClaims = name ? claims.filter(claim => (claim.namesAsPublished as string[] | null)?.includes(name)) : claims
      const population = data.barangays.secondaryPopulationTable as DataRecord
      const populationRows = records(population.rows).filter(row => !name || row.sourceName === name)
      content = <><h1>{name || t.barangays}</h1><DataStatus>{t.rosterWarning}</DataStatus>{!name && <ul className="topic-list">{names.map(n => <li key={n}><a href={href(`government/barangays/${encodeURIComponent(barangayId(n))}`)}>{n}</a></li>)}</ul>}{selectedClaims.map(claim => <section key={String(claim.sourceId)} className="panel">{tree(claim)}{cite(String(claim.sourceId))}</section>)}{populationRows.length > 0 && <section><h2>{t.population}</h2><p>{t.secondary}</p>{tree(populationRows)}{cite(String(population.sourceId))}</section>}{name && <a href={correctionLink(id)}>{t.correction}</a>}</>
    }
  }
  else if (route === 'open-lgu/legislation' || route.startsWith('open-lgu/legislation/')) content = <Legislation locale={locale} records={allLegislation} recordId={route === 'open-lgu/legislation' ? undefined : route.slice('open-lgu/legislation/'.length)} href={href} sourceLink={sourceHref} correctionLink={correctionLink} />
  else if (route === 'open-lgu/terms') content = <><h1>{t.terms}</h1>{gap()}<p>{t.term}: {t.unknown}</p>{cite(lgu.sourceIds.legislative)}</>
  else if (route.startsWith('open-lgu/terms/')) content = notFound()
  else if (route === 'statistics/demographics') content = <><h1>{t.demographics}</h1><DataStatus>{t.secondary} · PSA: primary-index-only / access-blocked</DataStatus><h2>{t.population}</h2><div className="table-wrap"><table><thead><tr><th>{t.period}</th><th>{t.value}</th><th>{t.unit}</th><th>{t.geography}</th><th>{t.evidence}</th></tr></thead><tbody>{records(data.municipality.populationFacts).map((fact, i) => <tr key={i}><td>{String(fact.period || fact.referenceYear)}</td><td>{typeof fact.value === 'number' ? formatNumber(fact.value, locale) : t.unknown}</td><td>{String(fact.unit)}</td><td>{String(fact.geography)} · {lgu.name}</td><td><a href={String(fact.sourceUrl)}>{String(fact.sourceId)}</a><p className="muted">{String(fact.verificationStatus)}</p>{fact.notes && <p>{String(fact.notes)}</p>}</td></tr>)}</tbody></table></div>{cite(lgu.sourceIds.psgc)}{cite(lgu.sourceIds.population)}<a href={href('government/barangays')}>{t.barangays}</a></>
  else if (route === 'statistics/competitiveness') content = <><h1>{t.competitiveness}</h1>{gap()}{cite(lgu.sourceIds.competitiveness)}</>
  else if (route === 'statistics/municipal-income' || route === 'transparency/finance') content = <><h1>{route.startsWith('statistics') ? t.income : t.finance}</h1>{gap()}{tree(data.transparency)}{cite(lgu.sourceIds.fdp)}{cite(lgu.sourceIds.fiscal)}{cite(lgu.sourceIds.audit)}</>
  else if (route === 'transparency/procurement' || route === 'transparency/projects') content = <><h1>{route.endsWith('projects') ? t.projects : t.procurement}</h1>{gap()}{tree(data.transparency.procurementAndProjectCoverage)}{records(data.transparency.sourceChecks).filter(r => r.sourceId === lgu.sourceIds.procurement).map(r => <section key={String(r.sourceId)}>{tree(r)}</section>)}{cite(lgu.sourceIds.procurement)}{route.endsWith('projects') && <p><a href={correctionLink('', 'project-observation.yml')}>{t.observation}</a></p>}</>
  else if (route === 'map') content = <><h1>{t.map}</h1><DataStatus>{t.noGeometry}</DataStatus>{tree(data.municipality.geography)}{cite(lgu.sourceIds.about)}</>
  else if (route === 'places') content = <><h1>{t.places}</h1>{gap()}{records(data.sectors.sectors).map(sector => <section key={String(sector.sector)} className="panel"><h2 lang="en">{String(sector.sector)}</h2>{tree(sector)}</section>)}</>
  else if (route === 'advisories') content = <><h1>{t.advisories}</h1><DataStatus>{t.noAdvisory}</DataStatus>{records(data.sectors.sectors).filter(row => /weather|disaster/.test(String(row.sector))).map(row => <section key={String(row.sector)}>{tree(row)}</section>)}{data.portal.sources.filter(s => /pagasa|phivolcs|hazard/.test(s.id || '')).map(s => cite(s.id))}</>
  else if (route === 'open-data') content = <><h1>{t.downloads}</h1><p className="measure">{t.downloadDescription}</p><ul className="record-list">{data.portal.datasets.map(dataset => <li key={dataset.id}><h2>{dataset.id}</h2><p>{t.capture}: {dataset.capturedAt} · {t.records}: {formatNumber(dataset.rowCount, locale)}</p><p className="download-links">{(['jsonUrl', 'csvUrl', 'schemaUrl'] as const).map(key => <a key={key} href={downloadUrl(dataset[key])} download>{key === 'schemaUrl' ? 'JSON Schema' : key === 'csvUrl' ? 'CSV' : 'JSON'}</a>)}</p><p className="hash">SHA-256: {dataset.sha256}</p>{evidence(dataset.coverage as EvidenceValue)}<h3>{t.rights}</h3>{evidence(dataset.rights as EvidenceValue)}{dataset.sourceIds.map(id => cite(id))}</li>)}</ul></>
  else if (route === 'sources') content = <><h1>{t.sources}</h1><p>{t.sourceDescription}</p><p>{t.capture}: {formatDate(data.portal.capturedAt, locale)}</p><ul className="record-list">{data.portal.sources.map(s => <li key={s.id || s.sourceId}>{cite(s.id || s.sourceId!)}<p lang="en">{s.coverage || s.coverageNote as string}</p></li>)}</ul>{data.research && <section><h2>{t.checked}</h2>{tree(data.research)}</section>}</>
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
  else if (route === 'privacy') content = <><h1>{t.privacy}</h1><p>{t.privacyPolicy}</p><p>{t.downloadDescription}</p></>
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
    <header className={`site-header${route === '' ? ' atlas-header' : ''}`}><div className="header-inner">
      <a className="brand" href={href('')} aria-label={`Better${lgu.name} · ${t.home}`}>Better<span>{lgu.name}</span><small>{t.communityPortal} · {lgu.name}, {lgu.province}</small></a>
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
        <a className="header-search" href={href('search')} aria-label={t.search}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><span>{t.search}</span></a>
      </nav>
    </div></header>
    <div className={`site-layout${route === '' ? ' home-layout' : ''}`}>
      <main id="main" tabIndex={-1}>{content}</main>
    </div>
    {route === '' ? <footer className="atlas-footer">
      <div className="atlas-footer-main">
        <div className="atlas-footer-intro">
          <a className="atlas-footer-brand" href={href('')}>Better{lgu.name}<small>{t.communityPortal} · {lgu.name}, {lgu.province}</small></a>
          <p>{t.description}</p>
        </div>
        <nav aria-label={t.footer}>
          {(['about', 'accessibility', 'privacy', 'corrections', 'sources', 'downloads'] as MessageKey[]).map(key => <a key={key} href={href(routes.find(([, k]) => k === key)![0])}>{t[key]}</a>)}
        </nav>
      </div>
      <div className="atlas-footer-bottom"><p>{t.community}</p><a href={lgu.repository}>GitHub</a></div>
    </footer> : <footer><p>{t.community}</p><nav aria-label={t.footer}>
      {(['about', 'accessibility', 'privacy', 'corrections', 'sources', 'downloads'] as MessageKey[]).map(key => <a key={key} href={href(routes.find(([, k]) => k === key)![0])}>{t[key]}</a>)}
      <a href={lgu.repository}>GitHub</a>
    </nav></footer>}
  </>
}

function downloadUrl(url: string) {
  return `${base}${url.replace(/^\//, '')}`
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
  const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean)
  const matching = data.portal.search.filter(row => terms.every(term => `${row.title} ${row.text} ${row.sourceIds?.join(' ')}`.toLocaleLowerCase().includes(term)))
  return <><h1>{catalogs[locale].search}</h1><SearchForm locale={locale} href={href} initial={query} /><SearchResults key={query} rows={matching} href={href} locale={locale} /></>
}
export default App
