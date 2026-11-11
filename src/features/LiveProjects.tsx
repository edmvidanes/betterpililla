import CheckedLink from '../components/CheckedLink'
import WorkInProgress from '../components/WorkInProgress'
import { useEffect, useState } from 'react'
import { catalogs, formatNumber } from '../i18n/locales'
import { lgu } from '../config/lgu'
import { Pagination, usePagination } from '../components/Pagination'
import { PageIntro, type CivicProps } from './Civic'
import { fetchPilillaProjects, fetchTransparencyRecord, type DpwhDoc } from './transparency-live'

type State =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ready'; docs: DpwhDoc[]; total: number }

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })

export default function LiveProjects(props: CivicProps & { recordId?: string }) {
  const { locale, href, recordId } = props
  const t = catalogs[locale]
  const fil = locale === 'fil'
  const [state, setState] = useState<State>({ kind: 'loading' })
  const [detail, setDetail] = useState<DpwhDoc | null | 'loading' | 'error'>('loading')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    if (recordId) {
      fetchTransparencyRecord(true, recordId)
        .then(doc => { if (!cancelled) setDetail(doc as DpwhDoc | null) })
        .catch(() => { if (!cancelled) setDetail('error') })
    } else {
      fetchPilillaProjects(100)
        .then(result => { if (!cancelled) setState({ kind: 'ready', docs: result.hits, total: result.total }) })
        .catch(() => { if (!cancelled) setState({ kind: 'error' }) })
    }
    return () => { cancelled = true }
  }, [recordId])

  const docs = state.kind === 'ready' ? state.docs : []
  const matching = docs.filter(doc => [doc.description, doc.contractId, doc.status, doc.category, doc.contractor].join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase()))
  const page = usePagination(matching, query)
  const unavailable = fil
    ? 'Hindi maabot ang BetterGov PH search ngayon. Walang ipinapakitang proyekto — subukang muli mamaya.'
    : 'The BetterGov PH search index is unreachable right now. No projects are shown — try again later.'

  if (recordId) {
    if (detail === 'loading') return <><PageIntro title={t.projects} /><p role="status">{fil ? 'Kinukuha ang rekord…' : 'Loading record…'}</p></>
    if (detail === 'error') return <><PageIntro title={t.projects} /><WorkInProgress locale={locale} status="unavailable">{unavailable}</WorkInProgress><p><CheckedLink href={lgu.transparency.dpwhDashboard}>BetterGov PH DPWH dashboard</CheckedLink></p></>
    if (!detail) return <><h1>{t.notFound}</h1><p>{t.notFoundText}</p><CheckedLink href={href('transparency/projects')}>{t.projects}</CheckedLink></>
    const facts: [string, string][] = [
      [fil ? 'Kontrata' : 'Contract', detail.contractId || '—'],
      [fil ? 'Katayuan (ayon sa tala)' : 'Status (as recorded)', detail.status || '—'],
      [fil ? 'Badyet (ayon sa tala)' : 'Budget (as recorded)', typeof detail.budget === 'number' ? peso.format(detail.budget) : '—'],
      [fil ? 'Kontratista' : 'Contractor', detail.contractor || '—'],
      [fil ? 'Taon' : 'Year', detail.infraYear || '—'],
      [fil ? 'Programa' : 'Program', detail.programName || '—'],
      [fil ? 'Simula' : 'Start', detail.startDate || '—'],
      [fil ? 'Pagtatapos' : 'Completion', detail.completionDate || '—'],
    ]
    return <>
      <header className="service-detail-header"><h1 lang="en">{detail.description}</h1><p>{t.projects}</p></header>
      <div className="service-detail-layout"><div>
        <section className="service-detail-section"><h2>{fil ? 'Mga detalye sa tala' : 'Record details'}</h2>
          <dl>{facts.map(([label, value]) => <div key={label}><dt className="directory-role">{label}</dt><dd lang="en">{value}</dd></div>)}</dl>
        </section>
        <section className="service-detail-section"><h2>{fil ? 'Paano basahin ang rekord' : 'How to read this record'}</h2>
          <p>{fil ? 'Live itong kinukuha mula sa DPWH index ng BetterGov PH; napili dahil binabanggit ng paglalarawan ang Pililla. Maaaring sumaklaw ang proyekto sa karatig-bayan, at hindi nito pinatutunayan ang kasalukuyang kondisyon o gastos ng munisipyo.' : 'Fetched live from the BetterGov PH DPWH index; selected because its description mentions Pililla. A project may span neighboring towns, and this does not verify current condition or municipal expenditure.'}</p>
        </section>
      </div><aside className="civic-aside"><h2>{fil ? 'Pinagmulan' : 'Source'}</h2>
        <p>{fil ? 'BetterGov PH Transparency (DPWH).' : 'BetterGov PH Transparency (DPWH).'}</p>
        <p><CheckedLink href={lgu.transparency.dpwhDashboard}>{fil ? 'Tingnan sa DPWH dashboard' : 'View on the DPWH dashboard'}</CheckedLink></p>
      </aside></div>
      <p><CheckedLink href={href('transparency/projects')}>{t.projects}</CheckedLink></p>
    </>
  }

  return <>
    <PageIntro title={t.projects}>{fil
      ? 'Mga proyektong DPWH na binabanggit ang Pililla sa paglalarawan, live mula sa BetterGov PH search. Maaaring sumaklaw ang ilan sa karatig-bayan.'
      : 'DPWH projects whose description mentions Pililla, live from the BetterGov PH search index. Some may span neighboring towns.'}</PageIntro>
    <p><CheckedLink href={lgu.transparency.dpwhDashboard}>{fil ? 'Pinagmulan: BetterGov PH Transparency (DPWH)' : 'Source: BetterGov PH Transparency (DPWH)'}</CheckedLink></p>
    {state.kind === 'loading' && <p role="status">{fil ? 'Kinukuha ang mga rekord…' : 'Loading records…'}</p>}
    {state.kind === 'error' && <WorkInProgress locale={locale} status="unavailable">{unavailable}</WorkInProgress>}
    {state.kind === 'ready' && !docs.length && <WorkInProgress locale={locale} />}
    {state.kind === 'ready' && <>
      <div className="directory-tools"><label htmlFor="live-project-query">{fil ? 'Maghanap' : 'Search'}<input id="live-project-query" type="search" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
      <p className="civic-meta" role="status">{formatNumber(matching.length, locale)} / {formatNumber(state.total, locale)} {t.records}</p>
      {!matching.length && <p>{t.noResults}</p>}
      <ul className="record-list">{page.visible.map(doc => <li key={doc.contractId}>
        <h2 lang="en"><CheckedLink href={href(`transparency/projects/${encodeURIComponent(doc.contractId)}`)}>{doc.description}</CheckedLink></h2>
        <dl>
          <div><dt>{fil ? 'Kontrata' : 'Contract'}</dt><dd>{doc.contractId || '—'}</dd></div>
          <div><dt>{fil ? 'Taon' : 'Year'}</dt><dd>{doc.infraYear || '—'}</dd></div>
          <div><dt>{fil ? 'Badyet' : 'Budget'}</dt><dd>{typeof doc.budget === 'number' ? peso.format(doc.budget) : '—'}</dd></div>
          <div><dt>{fil ? 'Katayuan' : 'Status'}</dt><dd lang="en">{doc.status || '—'}</dd></div>
        </dl>
      </li>)}</ul>
      <Pagination {...page} locale={locale} label={t.projects} />
    </>}
  </>
}
