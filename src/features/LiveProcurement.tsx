import CheckedLink from '../components/CheckedLink'
import WorkInProgress from '../components/WorkInProgress'
import { useEffect, useState } from 'react'
import { catalogs, formatNumber } from '../i18n/locales'
import { lgu } from '../config/lgu'
import { Pagination, usePagination } from '../components/Pagination'
import { PageIntro, type CivicProps } from './Civic'
import { fetchPilillaProcurement, fetchTransparencyRecord, type PhilgepsDoc } from './transparency-live'

type State =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ready'; docs: PhilgepsDoc[]; total: number }

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })
function amount(value: number | string | undefined) {
  const parsed = typeof value === 'string' ? Number(value) : value
  return typeof parsed === 'number' && Number.isFinite(parsed) ? peso.format(parsed) : '—'
}
function day(value?: string) { return value ? value.slice(0, 10) : '—' }

export default function LiveProcurement(props: CivicProps & { recordId?: string }) {
  const { locale, href, recordId } = props
  const t = catalogs[locale]
  const fil = locale === 'fil'
  const [state, setState] = useState<State>({ kind: 'loading' })
  const [detail, setDetail] = useState<PhilgepsDoc | null | 'loading' | 'error'>('loading')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    if (recordId) {
      fetchTransparencyRecord(false, recordId)
        .then(doc => { if (!cancelled) setDetail(doc as PhilgepsDoc | null) })
        .catch(() => { if (!cancelled) setDetail('error') })
    } else {
      fetchPilillaProcurement(100)
        .then(result => { if (!cancelled) setState({ kind: 'ready', docs: result.hits, total: result.total }) })
        .catch(() => { if (!cancelled) setState({ kind: 'error' }) })
    }
    return () => { cancelled = true }
  }, [recordId])

  const docs = state.kind === 'ready' ? state.docs : []
  const matching = docs.filter(doc => [doc.award_title, doc.notice_title, doc.awardee_name, doc.reference_id, doc.business_category].join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase()))
  const page = usePagination(matching, query)
  const dashboard = `${lgu.transparency.procurementDashboard}${encodeURIComponent(lgu.transparency.procurementOrganization)}`
  const unavailable = fil
    ? 'Hindi maabot ang BetterGov PH search ngayon. Walang ipinapakitang rekord — subukang muli mamaya o tingnan ang opisyal na dashboard.'
    : 'The BetterGov PH search index is unreachable right now. No records are shown — try again later or check the official dashboard.'

  if (recordId) {
    if (detail === 'loading') return <><PageIntro title={t.procurement} /><p role="status">{fil ? 'Kinukuha ang rekord…' : 'Loading record…'}</p></>
    if (detail === 'error') return <><PageIntro title={t.procurement} /><WorkInProgress locale={locale}>{unavailable}</WorkInProgress><p><CheckedLink href={dashboard}>BetterGov PH dashboard</CheckedLink></p></>
    if (!detail) return <><h1>{t.notFound}</h1><p>{t.notFoundText}</p><CheckedLink href={href('transparency/procurement')}>{t.procurement}</CheckedLink></>
    const facts: [string, string][] = [
      [fil ? 'Sanggunian' : 'Reference', detail.reference_id || '—'],
      [fil ? 'Nanalo / supplier' : 'Awardee', detail.awardee_name || '—'],
      [fil ? 'Halaga ng kontrata (ayon sa tala)' : 'Contract amount (as recorded)', amount(detail.contract_amount)],
      [fil ? 'Petsa ng award' : 'Award date', day(detail.award_date)],
      [fil ? 'Katayuan (ayon sa tala)' : 'Status (as recorded)', detail.award_status || '—'],
      [fil ? 'Kategorya' : 'Category', detail.business_category || '—'],
      ['Organization', detail.organization_name],
    ]
    return <>
      <header className="service-detail-header"><h1 lang="en">{detail.award_title}</h1><p>{t.procurement}</p></header>
      <div className="service-detail-layout"><div>
        <section className="service-detail-section"><h2>{fil ? 'Mga detalye sa tala' : 'Record details'}</h2>
          <dl>{facts.map(([label, value]) => <div key={label}><dt className="directory-role">{label}</dt><dd lang="en">{value}</dd></div>)}</dl>
        </section>
        <section className="service-detail-section"><h2>{fil ? 'Paano basahin ang rekord' : 'How to read this record'}</h2>
          <p>{fil ? 'Live itong kinukuha mula sa PhilGEPS index ng BetterGov PH para sa MUNICIPALITY OF PILILLA, RIZAL lamang. Ang halaga at katayuan ay ayon sa tala ng pinagmulan; hindi ito patunay ng bayad o pagkumpleto.' : 'Fetched live from the BetterGov PH PhilGEPS index for MUNICIPALITY OF PILILLA, RIZAL only. Amount and status are as recorded by the source; this is not proof of payment or completion.'}</p>
        </section>
      </div><aside className="civic-aside"><h2>{fil ? 'Pinagmulan' : 'Source'}</h2>
        <p>{fil ? 'BetterGov PH Transparency dashboard (PhilGEPS).' : 'BetterGov PH Transparency dashboard (PhilGEPS).'}</p>
        <p><CheckedLink href={dashboard}>{fil ? 'Tingnan ang organisasyon sa dashboard' : 'View this organization on the dashboard'}</CheckedLink></p>
      </aside></div>
      <p><CheckedLink href={href('transparency/procurement')}>{t.procurement}</CheckedLink></p>
    </>
  }

  return <>
    <PageIntro title={t.procurement}>{fil
      ? 'Mga procurement award ng MUNICIPALITY OF PILILLA, RIZAL mula sa PhilGEPS, live mula sa BetterGov PH search. Hindi kasama ang mga paaralan at ibang ahensyang nasa Pililla.'
      : 'Procurement awards of MUNICIPALITY OF PILILLA, RIZAL from PhilGEPS, live from the BetterGov PH search index. Schools and other agencies located in Pililla are not included.'}</PageIntro>
    <p><CheckedLink href={dashboard}>{fil ? 'Pinagmulan: BetterGov PH Transparency dashboard' : 'Source: BetterGov PH Transparency dashboard'}</CheckedLink></p>
    {state.kind === 'loading' && <p role="status">{fil ? 'Kinukuha ang mga rekord…' : 'Loading records…'}</p>}
    {state.kind === 'error' && <WorkInProgress locale={locale}>{unavailable}</WorkInProgress>}
    {state.kind === 'ready' && !docs.length && <WorkInProgress locale={locale} />}
    {state.kind === 'ready' && <>
      <div className="directory-tools"><label htmlFor="live-procurement-query">{fil ? 'Maghanap' : 'Search'}<input id="live-procurement-query" type="search" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
      <p className="civic-meta" role="status">{formatNumber(matching.length, locale)} / {formatNumber(state.total, locale)} {t.records}{state.total > docs.length ? (fil ? ` (unang ${docs.length} ang ipinapakita)` : ` (showing first ${docs.length})`) : ''}</p>
      {!matching.length && <p>{t.noResults}</p>}
      <ul className="record-list">{page.visible.map(doc => <li key={doc.id}>
        <h2 lang="en"><CheckedLink href={href(`transparency/procurement/${encodeURIComponent(doc.id)}`)}>{doc.award_title}</CheckedLink></h2>
        <dl>
          <div><dt>{fil ? 'Sanggunian' : 'Reference'}</dt><dd lang="en">{doc.reference_id || '—'}</dd></div>
          <div><dt>{fil ? 'Nanalo / supplier' : 'Awardee'}</dt><dd lang="en">{doc.awardee_name || '—'}</dd></div>
          <div><dt>{fil ? 'Halaga' : 'Amount'}</dt><dd>{amount(doc.contract_amount)}</dd></div>
          <div><dt>{fil ? 'Petsa' : 'Date'}</dt><dd>{day(doc.award_date)}</dd></div>
          <div><dt>{fil ? 'Katayuan' : 'Status'}</dt><dd lang="en">{doc.award_status || '—'}</dd></div>
        </dl>
      </li>)}</ul>
      <Pagination {...page} locale={locale} label={t.procurement} />
    </>}
  </>
}
