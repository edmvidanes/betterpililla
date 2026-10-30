import { useState } from 'react'
import { lgu } from '../config/lgu'
import { catalogs, formatDate } from '../i18n/locales'
import { civicCatalogs } from '../i18n/civic'
import { LinkArrow, PageIntro, RawRecord, SourceNote, type CivicProps } from './Civic'
import './records-polish.css'
import { rows } from '../data/loaders'

export default function Services(props: CivicProps) {
  const { data, locale, href } = props
  const t = catalogs[locale], c = civicCatalogs[locale]
  const [query, setQuery] = useState(new URLSearchParams(location.search).get('q') || '')
  const services = rows(data.services.services)
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const matching = services.filter(row => [row.name, row.office, row.description, row.classification, row.transactionType].some(value => typeof value === 'string' && value.toLocaleLowerCase().includes(normalizedQuery)))
  const offices = [...new Set(matching.map(row => typeof row.office === 'string' && row.office ? row.office : (locale === 'fil' ? 'Hindi nakasaad ang tanggapan' : 'Office not specified')))]
  const ordinances = rows(data.ordinances.records)
  const leads = rows(data.services.serviceLegislationLeads).flatMap(lead => {
    const record = ordinances.find(row => row.recordId === lead.recordId && row.sourceId === lead.sourceId)
    const topic = lead.topic && typeof lead.topic === 'object' && !Array.isArray(lead.topic) ? lead.topic[locale] : null
    return record ? [{ record, topic: typeof topic === 'string' ? topic : String(record.title) }] : []
  })
  const matchingLeads = leads.filter(({ record, topic }) => `${topic} ${record.title}`.toLocaleLowerCase().includes(normalizedQuery))
  return <>
    <PageIntro title={t.services}>{locale === 'fil' ? 'Maghanap ng mga serbisyong nakatala sa Citizens’ Charter at mga kaugnay na tala sa indeks ng ordinansa.' : 'Find services recorded in the Citizens’ Charter and related leads in the ordinance index.'}</PageIntro>
    <section className="service-directory" aria-label={t.services}>
      {services.length || leads.length ? <>
        <div className="service-directory-tools"><label>{c.filterDirectory}<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={locale === 'fil' ? 'Maghanap ng serbisyo o tanggapan' : 'Search services or offices'} /></label>
          <p role="status" aria-atomic="true">{matching.length + matchingLeads.length} {locale === 'fil' ? 'resulta' : matching.length + matchingLeads.length === 1 ? 'result' : 'results'}</p></div>
        {services.length > 0 && <section aria-labelledby="charter-services"><h2 id="charter-services">{locale === 'fil' ? 'Mga serbisyo sa Citizens’ Charter' : 'Citizens’ Charter services'}</h2>
          {offices.map(office => <section key={office} className="service-office-group"><h3 lang="en">{office}</h3><ul className="service-grid">{matching.filter(row => (typeof row.office === 'string' && row.office ? row.office : (locale === 'fil' ? 'Hindi nakasaad ang tanggapan' : 'Office not specified')) === office).map(row => <li key={String(row.recordId)} className="service-card"><h4 lang="en"><a href={href(`services/${encodeURIComponent(String(row.recordId))}`)}>{String(row.name)}</a></h4>{typeof row.classification === 'string' && <p className="civic-meta" lang="en">{row.classification}</p>}{Array.isArray(row.discrepancies) && row.discrepancies.length > 0 && <p className="service-card-status">{locale === 'fil' ? 'May hindi tiyak na impormasyon' : 'Information needs clarification'}</p>}<div className="service-card-footer"><a href={href(`services/${encodeURIComponent(String(row.recordId))}`)}>{locale === 'fil' ? 'Tingnan ang detalye' : 'View details'} <span aria-hidden="true">→</span></a></div></li>)}</ul></section>)}
        </section>}
        {leads.length > 0 && <section aria-labelledby="service-legislation-leads"><h2 id="service-legislation-leads">{c.serviceLegislationLeads}</h2><p className="service-evidence">{!services.length && (locale === 'fil' ? 'Walang nakuhang tala ng serbisyo sa Citizens’ Charter. ' : 'No service entries were captured from the Citizens’ Charter. ')}{c.serviceLegislationLeadsText}</p><ul className="service-grid">{matchingLeads.map(({ record, topic }) => <li key={String(record.recordId)} className="service-card">
          <h3><a href={href(`services/${encodeURIComponent(String(record.recordId))}`)}>{topic}</a></h3>
          <p className="service-card-status">{locale === 'fil' ? 'Batay sa indeks ng ordinansa · hindi pa beripikado' : 'Ordinance index lead · availability unverified'}</p>
          <p className="civic-meta">{String(record.documentNumber)} · {formatDate(String(record.sourceDate), locale)}</p>
          <div className="service-card-footer"><a href={href(`services/${encodeURIComponent(String(record.recordId))}`)}>{locale === 'fil' ? 'Tingnan ang serbisyo' : 'View service'} <span aria-hidden="true">→</span></a><a href={String(record.documentUrl)}>{locale === 'fil' ? 'Opisyal na dokumento' : 'Official document'}</a></div>
        </li>)}</ul><SourceNote {...props} id={String(leads[0].record.sourceId)} /></section>}
        {!matching.length && !matchingLeads.length && <p>{t.noResults}</p>}
      </> : <div className="civic-empty"><h2>{c.serviceMissing}</h2><p>{c.serviceMissingText}</p></div>}
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
    <RawRecord {...props} value={data.services} />
  </>
}
