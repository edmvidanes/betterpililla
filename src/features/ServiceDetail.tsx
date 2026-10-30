import { rows, type EvidenceValue } from '../data/loaders'
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
  const missing = fil ? 'Hindi nakasaad sa nakuhang tala' : 'Not stated in the captured record'
  const text = (value: EvidenceValue | undefined) => typeof value === 'string' && value.trim() ? value : missing
  const hasText = (value: EvidenceValue | undefined) => typeof value === 'string' && value.trim().length > 0
  const requirements = rows(service?.requirements)
  const steps = rows(service?.steps)
  const discrepancies = Array.isArray(service?.discrepancies) ? service.discrepancies.filter((item): item is string => typeof item === 'string' && !!item) : []

  return <>
    <a className="service-back" href={href('services')}>{fil ? '← Lahat ng serbisyo' : '← All services'}</a>
    <header className="service-detail-header"><h1 lang={service ? 'en' : undefined}>{name}</h1><p>{service ? (fil ? 'Tala mula sa Citizens’ Charter' : 'Citizens’ Charter record') : (fil ? 'Batay sa indeks ng ordinansa · hindi pa beripikado' : 'Ordinance index lead · availability unverified')}</p></header>
    <div className="service-detail-layout"><div>
      <p className="notice">{service ? (fil ? 'Mula ito sa nakuhang kopya ng Citizens’ Charter; hindi nakumpirma ang kasalukuyang detalye. Makipag-ugnayan sa munisipalidad bago mag-apply.' : 'This is from a captured Citizens’ Charter copy; current details have not been verified. Contact the municipality before applying.') : (fil ? 'Hindi pa nasusuri ang buong dokumento o nakumpirma ang kasalukuyang serbisyo. Kumpirmahin ang mga detalye sa munisipalidad bago mag-apply.' : 'The full document has not been reviewed and current availability has not been confirmed. Check details with the municipality before applying.')}</p>
      {service && <>
        {hasText(service.description) && <section className="service-detail-section"><h2>{fil ? 'Tungkol sa serbisyo' : 'About this service'}</h2><p lang="en">{text(service.description)}</p></section>}
        {discrepancies.length > 0 && <section className="service-detail-section service-discrepancies"><h2>{fil ? 'Pagkakaiba sa mga kopya' : 'Differences between copies'}</h2><ul lang="en">{discrepancies.map((item, i) => <li key={i}>{item}</li>)}</ul></section>}
        <div className="service-detail-facts">
          <div><h2>{fil ? 'Oras ng pagproseso' : 'Processing time'}</h2><p lang={hasText(service.processingTime) ? 'en' : undefined}>{text(service.processingTime)}</p></div>
          <div><h2>{fil ? 'Sino ang maaaring mag-apply' : 'Who can apply'}</h2><p lang={hasText(service.eligibility) ? 'en' : undefined}>{text(service.eligibility)}</p></div>
          <div><h2>{fil ? 'Bayad' : 'Fees'}</h2><p lang={hasText(service.fees) ? 'en' : undefined}>{text(service.fees)}</p></div>
        </div>
        <section className="service-detail-section"><h2>{fil ? 'Mga kailangan' : 'Requirements'}</h2>{requirements.length ? <ul className="service-requirements">{requirements.map((item, i) => <li key={i}><span lang="en">{text(item.name)}</span>{hasText(item.source) && <p><strong>{fil ? 'Saan kukunin:' : 'Where secured:'}</strong> <span lang="en">{text(item.source)}</span></p>}</li>)}</ul> : <p>{missing}</p>}</section>
        <section className="service-detail-section"><h2>{fil ? 'Mga hakbang' : 'Steps'}</h2>{steps.length ? <ol className="service-steps">{steps.map((step, i) => <li key={i}><dl>{([['client', fil ? 'Hakbang ng kliyente' : 'Client step'], ['action', fil ? 'Aksyon ng tanggapan' : 'Office action'], ['fee', fil ? 'Bayad' : 'Fee'], ['time', fil ? 'Oras' : 'Time'], ['responsible', fil ? 'Responsable' : 'Responsible']] as const).filter(([key]) => hasText(step[key])).map(([key, label]) => <div key={key}><dt>{label}</dt><dd lang="en">{text(step[key])}</dd></div>)}</dl></li>)}</ol> : <p>{missing}</p>}</section>
      </>}
      {ordinance && <section className="service-detail-section"><h2>{fil ? 'Kaugnay na ordinansa' : 'Related ordinance'}</h2><p lang="en">{String(ordinance.title)}</p><p className="civic-meta">{String(ordinance.documentNumber)} · {formatDate(String(ordinance.sourceDate), locale)}</p><p><a href={href(`open-lgu/legislation/${encodeURIComponent(recordId)}`)}>{fil ? 'Tingnan ang rekord ng ordinansa' : 'View ordinance record'} <LinkArrow /></a></p></section>}
    </div><aside className="civic-aside service-detail-aside"><h2>{fil ? 'Tanggapan' : 'Responsible office'}</h2><p lang={hasText(service?.office) ? 'en' : undefined}>{text(service?.office)}</p><a href={href('government/offices')}>{fil ? 'Tingnan ang mga contact' : 'Find office contacts'} <LinkArrow /></a>
      {service && <>{hasText(service.classification) && <><h2>{fil ? 'Klasipikasyon' : 'Classification'}</h2><p lang="en">{text(service.classification)}</p></>}{hasText(service.transactionType) && <><h2>{fil ? 'Uri ng transaksyon' : 'Transaction type'}</h2><p lang="en">{text(service.transactionType)}</p></>}</>}
      <h2>{fil ? 'Pinagmulan' : 'Source'}</h2>{service ? <><p>{fil ? 'Pangalan ng pinagkunang file:' : 'Source filename:'} <span lang="en">{text(service.sourceDocument)}</span></p><p>{fil ? 'Ang mga detalye ay napanatili sa orihinal na wika.' : 'Details are retained in the original language.'}</p></> : <><p>{fil ? 'Opisyal na indeks ng ordinansa; hindi pa nasusuri ang kalakip.' : 'Official ordinance index; attachment not reviewed.'}</p><a href={String(ordinance?.documentUrl)}>{fil ? 'Buksan ang opisyal na dokumento' : 'Open official document'} <LinkArrow /></a></>}
      <SourceNote {...props} id={String(service ? service.sourceId : ordinance?.sourceId)} />
    </aside></div>
    {service && <RawRecord {...props} value={service} />}
  </>
}
