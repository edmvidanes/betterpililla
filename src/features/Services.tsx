import { useState } from 'react'
import { lgu } from '../config/lgu'
import { catalogs, formatDate } from '../i18n/locales'
import { civicCatalogs } from '../i18n/civic'
import { LinkArrow, PageIntro, RawRecord, SourceNote, type CivicProps } from './Civic'
import { rows } from '../data/loaders'

export default function Services(props: CivicProps) {
  const { data, locale, href } = props
  const t = catalogs[locale], c = civicCatalogs[locale]
  const [query, setQuery] = useState(new URLSearchParams(location.search).get('q') || '')
  const services = rows(data.services.services)
  const matching = services.filter(row => String(row.name).toLocaleLowerCase().includes(query.toLocaleLowerCase()))
  const ordinances = rows(data.ordinances.records)
  const leads = rows(data.services.serviceLegislationLeads).flatMap(lead => {
    const record = ordinances.find(row => row.recordId === lead.recordId && row.sourceId === lead.sourceId)
    const topic = lead.topic && typeof lead.topic === 'object' && !Array.isArray(lead.topic) ? lead.topic[locale] : null
    return record ? [{ record, topic: typeof topic === 'string' ? topic : String(record.title) }] : []
  })
  return <>
    <PageIntro title={t.services}>{c.servicesIntro}</PageIntro>
    <div className="civic-split"><section>
      {services.length ? <><label>{c.filterDirectory}<input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label><ul className="record-list">{matching.map(row => <li key={String(row.recordId)}><h2><a href={href(`services/${encodeURIComponent(String(row.recordId))}`)}>{String(row.name)}</a></h2><SourceNote {...props} id={String(row.sourceId)} /></li>)}</ul>{!matching.length && <p role="status">{t.noResults}</p>}</> : <div className="civic-empty"><h2>{c.serviceMissing}</h2><p>{c.serviceMissingText}</p></div>}
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
      {leads.length > 0 && <section aria-labelledby="service-legislation-leads"><h2 id="service-legislation-leads">{c.serviceLegislationLeads}</h2><p>{c.serviceLegislationLeadsText}</p><ul className="record-list">{leads.map(({ record, topic }) => <li key={String(record.recordId)}><h3>{topic}</h3><p><a href={href(`open-lgu/legislation/${encodeURIComponent(String(record.recordId))}`)} lang="en">{String(record.title)}</a></p><p className="civic-meta">{String(record.documentNumber)} · {formatDate(String(record.sourceDate), locale)} · <a href={String(record.documentUrl)}>{locale === 'fil' ? 'Opisyal na dokumento' : 'Official document'}<LinkArrow /></a></p></li>)}</ul><SourceNote {...props} id={String(leads[0].record.sourceId)} /></section>}
    </section><aside className="civic-aside"><h2>{c.beforeVisit}</h2><p>{c.beforeVisitText}</p><h3>{c.publishedContacts}</h3><ul className="civic-links">{rows(data.contacts.records).map(row => <li key={String(row.category)}><a href={href(`government/offices/${row.category}`)} lang="en">{String(row.service)}<LinkArrow /></a></li>)}</ul></aside></div>
    <RawRecord {...props} value={data.services} />
  </>
}
