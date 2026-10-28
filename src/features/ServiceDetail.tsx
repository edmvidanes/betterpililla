import { rows, type DataRecord, type EvidenceValue } from '../data/loaders'
import { formatDate } from '../i18n/locales'
import { LinkArrow, RawRecord, SourceNote, type CivicProps } from './Civic'
import './records-polish.css'

export default function ServiceDetail(props: CivicProps & { recordId: string }) {
  const { data, locale, href, recordId } = props
  const fil = locale === 'fil'
  const service = rows(data.services.services).find(row => row.recordId === recordId)
  const lead = rows(data.services.serviceLegislationLeads).find(row => row.recordId === recordId)
  const ordinance = lead && rows(data.ordinances.records).find(row => row.recordId === recordId && row.sourceId === lead.sourceId)
  if (!service && !ordinance) return null
  const topic = lead?.topic && typeof lead.topic === 'object' && !Array.isArray(lead.topic) ? lead.topic[locale] : null
  const name = service ? String(service.name) : typeof topic === 'string' ? topic : String(ordinance?.title)
  const unknown = fil ? 'Hindi pa beripikado' : 'Not verified'
  const text = (value: EvidenceValue | undefined) => typeof value === 'string' && value ? value : unknown
  const list = (value: EvidenceValue | undefined) => Array.isArray(value) && value.length ? <ul>{value.map((item, i) => <li key={i}>{typeof item === 'string' ? item : String((item as DataRecord).description)}</li>)}</ul> : <p>{unknown}</p>
  const fee = service?.fee && typeof service.fee === 'object' && !Array.isArray(service.fee) ? service.fee.sourceText : null

  return <>
    <a className="service-back" href={href('services')}>{fil ? '← Lahat ng serbisyo' : '← All services'}</a>
    <header className="service-detail-header"><h1>{name}</h1><p>{service ? (fil ? 'Tala ng serbisyo' : 'Service record') : (fil ? 'Batay sa indeks ng ordinansa · hindi pa beripikado' : 'Ordinance index lead · availability unverified')}</p></header>
    <div className="service-detail-layout"><div>
      {!service && <p className="notice">{fil ? 'Hindi pa nasusuri ang buong dokumento o nakumpirma ang kasalukuyang serbisyo. Kumpirmahin ang mga detalye sa munisipalidad bago mag-apply.' : 'The full document has not been reviewed and current availability has not been confirmed. Check details with the municipality before applying.'}</p>}
      <div className="service-detail-facts"><div><h2>{fil ? 'Oras ng pagproseso' : 'Processing time'}</h2><p>{text(service?.timeframe)}</p></div><div><h2>{fil ? 'Sino ang maaaring mag-apply' : 'Who can apply'}</h2>{list(service?.eligibility)}</div><div><h2>{fil ? 'Bayad' : 'Fees'}</h2><p>{text(fee)}</p></div></div>
      <section className="service-detail-section"><h2>{fil ? 'Mga kailangan' : 'Requirements'}</h2>{list(service?.requirements)}</section>
      <section className="service-detail-section"><h2>{fil ? 'Mga hakbang' : 'Steps'}</h2>{list(service?.steps)}</section>
      {service && Array.isArray(service.forms) && service.forms.length > 0 && <section className="service-detail-section"><h2>{fil ? 'Mga form' : 'Forms'}</h2><ul>{rows(service.forms).map(form => <li key={String(form.url)}><a href={String(form.url)}>{String(form.title)}</a></li>)}</ul></section>}
      {ordinance && <section className="service-detail-section"><h2>{fil ? 'Kaugnay na ordinansa' : 'Related ordinance'}</h2><p lang="en">{String(ordinance.title)}</p><p className="civic-meta">{String(ordinance.documentNumber)} · {formatDate(String(ordinance.sourceDate), locale)}</p><p><a href={href(`open-lgu/legislation/${encodeURIComponent(recordId)}`)}>{fil ? 'Tingnan ang rekord ng ordinansa' : 'View ordinance record'} <LinkArrow /></a></p></section>}
    </div><aside className="civic-aside service-detail-aside"><h2>{fil ? 'Tanggapan' : 'Responsible office'}</h2><p>{text(service?.office)}</p><a href={href('government/offices')}>{fil ? 'Tingnan ang mga contact' : 'Find office contacts'} <LinkArrow /></a><h2>{fil ? 'Pinagmulan' : 'Source'}</h2><p>{ordinance ? (fil ? 'Opisyal na indeks ng ordinansa; hindi pa nasusuri ang kalakip.' : 'Official ordinance index; attachment not reviewed.') : (fil ? 'Tingnan ang tala ng pinagmulan para sa detalye.' : 'See the source record for details.')}</p><a href={String(ordinance ? ordinance.documentUrl : service?.sourceUrl)}>{fil ? 'Buksan ang opisyal na dokumento' : 'Open official document'} <LinkArrow /></a><SourceNote {...props} id={String(ordinance ? ordinance.sourceId : service?.sourceId)} /></aside></div>
    {service && <RawRecord {...props} value={service} />}
  </>
}
