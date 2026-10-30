import { useState } from 'react'
import { lgu } from '../config/lgu'
import { catalogs, formatDate } from '../i18n/locales'
import { civicCatalogs } from '../i18n/civic'
import { LinkArrow, PageIntro, SourceNote, type CivicProps } from './Civic'
import './records-polish.css'
import { rows } from '../data/loaders'

const topics = [
  { id: 'civil', en: 'Civil records', fil: 'Mga rekord sibil', match: /civil registry|birth|marriage|death/i },
  { id: 'health', en: 'Health & welfare', fil: 'Kalusugan at kapakanan', match: /health|welfare|yakap|philhealth/i },
  { id: 'education', en: 'Education & employment', fil: 'Edukasyon at trabaho', match: /employment|human resource|scholarship|academic/i },
  { id: 'business', en: 'Business & finance', fil: 'Negosyo at pananalapi', match: /treasurer|accountant|business/i },
  { id: 'environment', en: 'Environment & agriculture', fil: 'Kapaligiran at agrikultura', match: /environment|agricultur/i },
  { id: 'community', en: 'Community & infrastructure', fil: 'Komunidad at imprastraktura', match: /water office|planning|engineer|assessor|disaster|tourism/i },
  { id: 'other', en: 'Other services', fil: 'Iba pang serbisyo', match: /$^/ },
]
const serviceTopic = (text: string) => topics.find(topic => topic.match.test(text))?.id ?? 'other'
const PAGE_SIZE = 12

const categoryPaths: Record<string, string> = {
  all: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  civil: 'M6 3h8l4 4v14H6zM14 3v5h5M9 12h6M9 16h6',
  health: 'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',
  education: 'M3 9 12 4l9 5-9 5zM6 11v5c3 3 9 3 12 0v-5M21 9v7',
  business: 'M4 8h16v12H4zM8 8V5h8v3M4 13h16M10 13v2h4v-2',
  environment: 'M20 4C10 4 5 8 5 14c0 3 2 5 5 5 6 0 10-5 10-15ZM4 21c3-5 6-8 12-11',
  community: 'M3 20h18M5 20v-9l7-5 7 5v9M9 20v-6h6v6M9 9V4h6v5',
  other: 'M5 5h14v14H5zM8 12h.01M12 12h.01M16 12h.01',
}
const categoryOptions = [{ id: 'all', en: 'All services', fil: 'Lahat ng serbisyo' }, ...topics]
function ServiceIcon({ category, className = 'service-directory-icon' }: { category: string; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={categoryPaths[category] ?? categoryPaths.other} /></svg>
}

export default function Services(props: CivicProps) {
  const { data, locale, href } = props
  const t = catalogs[locale], c = civicCatalogs[locale]
  const [query, setQuery] = useState(new URLSearchParams(location.search).get('q') || '')
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const services = rows(data.services.services)
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const matching = services.filter(row => (category === 'all' || serviceTopic(`${row.office} ${row.name}`) === category) && [row.name, row.office, row.description, row.classification, row.transactionType].some(value => typeof value === 'string' && value.toLocaleLowerCase().includes(normalizedQuery)))
  const ordinances = rows(data.ordinances.records)
  const leads = rows(data.services.serviceLegislationLeads).flatMap(lead => {
    const record = ordinances.find(row => row.recordId === lead.recordId && row.sourceId === lead.sourceId)
    const topic = lead.topic && typeof lead.topic === 'object' && !Array.isArray(lead.topic) ? lead.topic[locale] : null
    return record ? [{ record, topic: typeof topic === 'string' ? topic : String(record.title) }] : []
  })
  const matchingLeads = leads.filter(({ record, topic }) => (category === 'all' || serviceTopic(`${topic} ${record.title}`) === category) && `${topic} ${record.title}`.toLocaleLowerCase().includes(normalizedQuery))
  const total = matching.length + matchingLeads.length
  const pages = Math.ceil(total / PAGE_SIZE)
  const start = (page - 1) * PAGE_SIZE
  const visibleServices = matching.slice(start, start + PAGE_SIZE)
  const visibleLeads = matchingLeads.slice(Math.max(0, start - matching.length), Math.max(0, start + PAGE_SIZE - matching.length))
  const categoryButtons = () => categoryOptions.map(topic => <button type="button" key={topic.id} aria-pressed={category === topic.id} onClick={event => { setCategory(topic.id); setPage(1); event.currentTarget.closest('details')?.removeAttribute('open') }}><ServiceIcon category={topic.id} className="service-category-icon" />{topic[locale]}</button>)
  return <>
    <PageIntro title={t.services}>{locale === 'fil' ? 'Maghanap ng mga serbisyong nakatala sa Citizens’ Charter at mga kaugnay na tala sa indeks ng ordinansa.' : 'Find services recorded in the Citizens’ Charter and related leads in the ordinance index.'}</PageIntro>
    <section className="service-directory" aria-label={t.services}>
        <div className="service-directory-layout">
          <div><aside className="service-filters" aria-label={locale === 'fil' ? 'Mga kategorya ng serbisyo' : 'Service categories'}>
            <h2>{locale === 'fil' ? 'Mga kategorya' : 'Categories'}</h2>
            <div className="service-filter-list service-filter-desktop">{categoryButtons()}</div>
            <details className="service-filter-mobile">
              <summary><ServiceIcon category={category} className="service-category-icon" />{categoryOptions.find(topic => topic.id === category)?.[locale]}</summary>
              <div className="service-filter-list">{categoryButtons()}</div>
            </details>
          </aside>
            <section className="service-report"><div><h2>{locale === 'fil' ? 'May nawawalang serbisyo?' : 'Missing a service?'}</h2><p>{locale === 'fil' ? 'Magmungkahi ng serbisyo at magbahagi ng pampublikong sanggunian para masuri. Huwag magpadala ng pribadong impormasyon.' : 'Suggest a service and share a public source for review. Please do not submit private information.'}</p></div><a href={`${lgu.repository}/issues/new?template=missing-record.yml`}>{locale === 'fil' ? 'Magmungkahi sa GitHub' : 'Suggest on GitHub'} <LinkArrow /></a></section>
          </div>
          <div className="service-results">
            {services.length || leads.length ? <>
            <div className="service-directory-tools"><label>{c.filterDirectory}<span className="service-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 4.5 4.5" /></svg><input type="search" value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} placeholder={locale === 'fil' ? 'Maghanap ng serbisyo o tanggapan' : 'Search services or offices'} /></span></label>
              <p role="status" aria-atomic="true">{matching.length + matchingLeads.length} {locale === 'fil' ? 'resulta' : matching.length + matchingLeads.length === 1 ? 'result' : 'results'}</p></div>
            {visibleServices.length > 0 && <section aria-labelledby="charter-services"><h2 id="charter-services">{locale === 'fil' ? 'Mga serbisyo sa Citizens’ Charter' : 'Citizens’ Charter services'}</h2>
              <ul className="service-grid">{visibleServices.map(row => <li key={String(row.recordId)} className="service-card">
                <div className="service-card-top"><ServiceIcon category={serviceTopic(`${row.office} ${row.name}`)} /><span className="service-badge">Citizens’ Charter</span></div>
                <h3 lang="en"><a href={href(`services/${encodeURIComponent(String(row.recordId))}`)}>{String(row.name)}</a></h3>
                {typeof row.office === 'string' && <p className="civic-meta" lang="en">{row.office}</p>}
                {typeof row.classification === 'string' && row.classification && <p className="service-classification" lang="en">{row.classification}</p>}
                {row.needsClarification === true && <p className="service-card-status">{locale === 'fil' ? 'May hindi tiyak na impormasyon' : 'Information needs clarification'}</p>}
                <div className="service-card-footer"><a href={href(`services/${encodeURIComponent(String(row.recordId))}`)}>{locale === 'fil' ? 'Tingnan ang detalye' : 'View details'} <span aria-hidden="true">→</span></a></div>
              </li>)}</ul>
            </section>}
            {visibleLeads.length > 0 && <section aria-labelledby="service-legislation-leads"><h2 id="service-legislation-leads">{c.serviceLegislationLeads}</h2><p className="service-evidence">{!services.length && (locale === 'fil' ? 'Walang nakuhang tala ng serbisyo sa Citizens’ Charter. ' : 'No service entries were captured from the Citizens’ Charter. ')}{c.serviceLegislationLeadsText}</p><ul className="service-grid">{visibleLeads.map(({ record, topic }) => <li key={String(record.recordId)} className="service-card">
              <div className="service-card-top"><ServiceIcon category={serviceTopic(`${topic} ${record.title}`)} /><span className="service-badge service-badge-lead">{locale === 'fil' ? 'Indeks ng ordinansa' : 'Ordinance index'}</span></div>
              <h3><a href={href(`services/${encodeURIComponent(String(record.recordId))}`)}>{topic}</a></h3>
              <p className="service-card-status">{locale === 'fil' ? 'Hindi pa beripikado ang availability' : 'Availability unverified'}</p>
              <p className="civic-meta">{String(record.documentNumber)} · {formatDate(String(record.sourceDate), locale)}</p>
              <div className="service-card-footer"><a href={href(`services/${encodeURIComponent(String(record.recordId))}`)}>{locale === 'fil' ? 'Tingnan ang serbisyo' : 'View service'} <span aria-hidden="true">→</span></a><a href={String(record.documentUrl)}>{locale === 'fil' ? 'Opisyal na dokumento' : 'Official document'}</a></div>
            </li>)}</ul><SourceNote {...props} id={String(leads[0].record.sourceId)} /></section>}
            {!matching.length && !matchingLeads.length && <p>{t.noResults}</p>}
            {pages > 1 && <nav className="service-pagination" aria-label={locale === 'fil' ? 'Mga pahina ng resulta' : 'Result pages'}>
              <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>{locale === 'fil' ? 'Nakaraan' : 'Previous'}</button>
              <span aria-live="polite">{locale === 'fil' ? `Pahina ${page} ng ${pages}` : `Page ${page} of ${pages}`}</span>
              <button type="button" disabled={page === pages} onClick={() => setPage(page + 1)}>{locale === 'fil' ? 'Susunod' : 'Next'}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg></button>
            </nav>}
            </> : <div className="civic-empty"><h2>{c.serviceMissing}</h2><p>{c.serviceMissingText}</p></div>}
          </div>
        </div>
    </section>
    <div className="civic-split"><section>
      <section aria-labelledby="service-guidance">
        <h2 id="service-guidance">{locale === 'fil' ? 'Mga praktikal na gabay' : 'Practical guidance'}</h2>
        <p>{locale === 'fil' ? 'Mga pambansang gabay at inilathalang kontak ito, hindi kumpletong listahan ng serbisyo ng Cavinti. Tingnan ang mga link at kumpirmahin ang kasalukuyang detalye bago pumunta.' : 'These are national guidance and published contacts, not a complete Cavinti service catalogue. Check the links and confirm current details before visiting.'}</p>
        <ul className="record-list">
          <li>
            <h3>{locale === 'fil' ? 'Pagpaparehistro ng kapanganakan' : 'Register a birth'}</h3>
            <p>{locale === 'fil' ? 'Ayon sa PSA, iparehistro ang kapanganakan sa local civil registry office ng lungsod o munisipalidad kung saan ito nangyari sa loob ng 30 araw. Kung sa Cavinti ipinanganak, magtanong sa municipal civil registrar tungkol sa mga dokumento at delayed registration.' : 'The PSA says a birth should be registered within 30 days at the local civil registry office where it occurred. For a birth in Cavinti, ask the municipal civil registrar about documents and delayed registration.'}</p>
            <a href="https://psa.gov.ph/civilregistration/facts">{locale === 'fil' ? 'Gabay ng PSA sa civil registration' : 'PSA civil registration guidance'}<LinkArrow /></a>
          </li>
          <li>
            <h3>{locale === 'fil' ? 'Kopya ng birth certificate' : 'Request a birth certificate'}</h3>
            <p>{locale === 'fil' ? 'Para sa PSA copy, tingnan ang gabay ng PSA sa pag-apply at appointment. Iba ito sa unang pagpaparehistro ng kapanganakan sa lokal na civil registry.' : 'For a PSA copy, see the PSA application and appointment guidance. This is separate from registering the birth with the local civil registry.'}</p>
            <a href="https://psa.gov.ph/birth-certificate">{locale === 'fil' ? 'Gabay ng PSA sa birth certificate' : 'PSA birth certificate guidance'}<LinkArrow /></a>
          </li>
          <li>
            <h3>{locale === 'fil' ? 'Kalusugan at tulong panlipunan' : 'Health and social welfare'}</h3>
            <p>{locale === 'fil' ? 'Inilathala ng munisipalidad ang mga kontak ng Rural Health Unit at Municipal Social Welfare and Development Office. Magtanong sa kanila tungkol sa available na tulong, iskedyul at mga kailangan.' : 'The municipality publishes contacts for the Rural Health Unit and Municipal Social Welfare and Development Office. Ask them about available assistance, schedules and requirements.'}</p>
            <a href={href('government/offices')}>{c.contactOffice}<LinkArrow /></a>
          </li>
        </ul>
        <p className="civic-meta">{locale === 'fil' ? 'Mga sanggunian at kontak: sinaliksik noong Oktubre 27, 2026; hindi live na nakumpirma ang mga numero.' : 'Sources and contacts researched October 27, 2026; phone numbers were not live-validated.'}</p>
      </section>
      <ul className="civic-links"><li><a href={String(data.services.sourceUrl)}>{c.officialCharter}<LinkArrow /></a></li><li><a href={href('government/offices')}>{c.contactOffice}<LinkArrow /></a></li></ul>
      <p className="civic-meta">{t.capture}: {formatDate(String(data.services.capturedAt), locale)}</p>
      <SourceNote {...props} id={lgu.sourceIds.charter} />
    </section><aside className="civic-aside"><h2>{c.beforeVisit}</h2><p>{c.beforeVisitText}</p><h3>{c.publishedContacts}</h3><ul className="civic-links">{rows(data.contacts.records).map(row => <li key={String(row.category)}><a href={href(`government/offices/${row.category}`)} lang="en">{String(row.service)}<LinkArrow /></a></li>)}</ul></aside></div>
    <p><a href={`${import.meta.env.BASE_URL}${lgu.dataPath}/services.json`}>{c.originalRecord} <LinkArrow /></a></p>
  </>
}
