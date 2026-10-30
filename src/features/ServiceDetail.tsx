import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { rows, type EvidenceValue } from '../data/loaders'
import { formatDate } from '../i18n/locales'
import { LinkArrow, RawRecord, SourceNote, type CivicProps } from './Civic'
import { charterTitles } from './charterTitles'
import './records-polish.css'

function DetailIcon({ kind }: { kind: 'office' | 'time' | 'people' | 'fee' | 'requirements' | 'steps' | 'source' | 'ordinance' }) {
  const paths = {
    office: <><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M9 9h.01M15 9h.01M9 12h.01M15 12h.01" /></>,
    time: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    people: <><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
    fee: <><circle cx="12" cy="12" r="9" /><path d="M15 8.5c-.6-.7-1.7-1-3-1-1.7 0-3 1-3 2.2 0 3.3 6 1.2 6 4.5 0 1.3-1.3 2.3-3 2.3-1.3 0-2.4-.4-3-1.1M12 5.5v13" /></>,
    requirements: <><path d="M8 4h11v17H5V4h3M9 3h6v3H9zM8 11l1.5 1.5L12 10M13 12h3M8 16l1.5 1.5L12 15M13 17h3" /></>,
    steps: <><path d="M5 6h2M5 12h2M5 18h2M11 6h8M11 12h8M11 18h8" /></>,
    source: <><path d="M6 3h9l4 4v14H6zM15 3v5h4M9 12h7M9 16h7" /></>,
    ordinance: <><path d="M4 21h16M6 21V10h12v11M3 10l9-6 9 6M9 13v5M12 13v5M15 13v5" /></>,
  }
  return <svg className="service-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>
}

export default function ServiceDetail(props: CivicProps & { recordId: string }) {
  const { data, locale, href, recordId } = props
  const fil = locale === 'fil'
  const service = rows(data.services.services).find(row => row.recordId === recordId)
  const lead = rows(data.services.serviceLegislationLeads).find(row => row.recordId === recordId)
  const ordinance = lead && rows(data.ordinances.records).find(row => row.recordId === recordId && row.sourceId === lead.sourceId)
  const stepsRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const container = stepsRef.current
    if (!container) return
    gsap.registerPlugin(ScrollTrigger)
    const motion = gsap.matchMedia()
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(container.querySelector('.service-steps-progress'), { scaleY: 0 }, {
        scaleY: 1, ease: 'none', scrollTrigger: { trigger: container, start: 'top center', end: 'bottom center', scrub: true },
      })
    })
    return () => motion.revert()
  }, [recordId, service])
  if (!service && !ordinance) return null
  const topic = lead?.topic && typeof lead.topic === 'object' && !Array.isArray(lead.topic) ? lead.topic[locale] : null
  const name = service ? String(service.name) : typeof topic === 'string' ? topic : String(ordinance?.title)
  const missing = fil ? 'Hindi nakasaad sa nakuhang tala' : 'Not stated in the captured record'
  const text = (value: EvidenceValue | undefined) => typeof value === 'string' && value.trim() ? value : missing
  const hasText = (value: EvidenceValue | undefined) => typeof value === 'string' && value.trim().length > 0
  const requirements = rows(service?.requirements)
  const steps = rows(service?.steps)
  const discrepancies = Array.isArray(service?.discrepancies) ? service.discrepancies.filter((item): item is string => typeof item === 'string' && !!item) : []

  return <div className="service-record">
    <a className="service-back" href={href('services')}>{fil ? '← Lahat ng serbisyo' : '← All services'}</a>
    <header className="service-record-header"><h1 lang={service ? 'en' : undefined}>{name}</h1><p>{service ? (fil ? 'Tala mula sa Citizens’ Charter' : 'Citizens’ Charter record') : (fil ? 'Batay sa indeks ng ordinansa · hindi pa beripikado' : 'Ordinance index lead · availability unverified')}</p></header>
    {!service && <p className="notice service-record-notice">{fil ? 'Hindi pa nasusuri ang buong dokumento o nakumpirma ang kasalukuyang serbisyo. Kumpirmahin ang mga detalye sa munisipalidad bago mag-apply.' : 'The full document has not been reviewed and current availability has not been confirmed. Check details with the municipality before applying.'}</p>}
    <div className="service-record-overview">
      <section className="service-record-intro"><h2>{fil ? 'Pangkalahatang impormasyon' : 'Overview'}</h2>{hasText(service?.description) && <p lang="en">{text(service?.description)}</p>}
        {service && <div className="service-record-facts">
          <div><DetailIcon kind="time" /><div><h3>{fil ? 'Oras ng pagproseso' : 'Processing time'}</h3><p lang={hasText(service.processingTime) ? 'en' : undefined}>{text(service.processingTime)}</p></div></div>
          <div><DetailIcon kind="people" /><div><h3>{fil ? 'Sino ang maaaring mag-apply' : 'Who can apply'}</h3><p lang={hasText(service.eligibility) ? 'en' : undefined}>{text(service.eligibility)}</p></div></div>
          <div><DetailIcon kind="fee" /><div><h3>{fil ? 'Bayad' : 'Fees'}</h3><p lang={hasText(service.fees) ? 'en' : undefined}>{text(service.fees)}</p></div></div>
        </div>}
      </section>
      <aside className="service-record-office"><h2><DetailIcon kind="office" />{fil ? 'Tanggapan' : 'Responsible office'}</h2><p lang={hasText(service?.office) ? 'en' : undefined}>{text(service?.office)}</p><a href={href('government/offices')}>{fil ? 'Tingnan ang mga contact' : 'Find office contacts'} <LinkArrow /></a>
        {service && <>{hasText(service.classification) && <><h3>{fil ? 'Klasipikasyon' : 'Classification'}</h3><p lang="en">{text(service.classification)}</p></>}{hasText(service.transactionType) && <><h3>{fil ? 'Uri ng transaksyon' : 'Transaction type'}</h3><p lang="en">{text(service.transactionType)}</p></>}</>}
      </aside>
    </div>
    <div className="service-record-body">
      {service && <>
        {discrepancies.length > 0 && <section className="service-record-section service-discrepancies"><h2>{fil ? 'Hindi tiyak na impormasyon' : 'Uncertain information'}</h2><ul lang="en">{discrepancies.map((item, i) => <li key={i}>{item}</li>)}</ul></section>}
        <section className="service-record-section"><h2><DetailIcon kind="requirements" />{fil ? 'Mga kailangan' : 'Requirements'}</h2>{requirements.length ? <ul className="service-requirements">{requirements.map((item, i) => <li key={i}><span lang="en">{text(item.name)}</span>{hasText(item.source) && <p><strong>{fil ? 'Saan kukunin:' : 'Where secured:'}</strong> <span lang="en">{text(item.source)}</span></p>}</li>)}</ul> : <p>{missing}</p>}</section>
        <section className="service-record-section"><h2><DetailIcon kind="steps" />{fil ? 'Mga hakbang' : 'Steps'}</h2>{steps.length ? <div ref={stepsRef} className="service-steps-timeline"><span className="service-steps-track" aria-hidden="true"><span className="service-steps-progress" /></span><ol className="service-steps">{steps.map((step, i) => <li key={i}><dl>{([['client', fil ? 'Hakbang ng kliyente' : 'Client step'], ['action', fil ? 'Aksyon ng tanggapan' : 'Office action'], ['fee', fil ? 'Bayad' : 'Fee'], ['time', fil ? 'Oras' : 'Time'], ['responsible', fil ? 'Responsable' : 'Responsible']] as const).filter(([key]) => hasText(step[key])).map(([key, label]) => <div className={`step-${key}`} key={key}><dt>{label}</dt><dd lang="en">{text(step[key])}</dd></div>)}</dl></li>)}</ol></div> : <p>{missing}</p>}</section>
      </>}
      {ordinance && <section className="service-record-section"><h2><DetailIcon kind="ordinance" />{fil ? 'Kaugnay na ordinansa' : 'Related ordinance'}</h2><p lang="en">{String(ordinance.title)}</p><p className="civic-meta">{String(ordinance.documentNumber)} · {formatDate(String(ordinance.sourceDate), locale)}</p><p><a href={href(`open-lgu/legislation/${encodeURIComponent(recordId)}`)}>{fil ? 'Tingnan ang rekord ng ordinansa' : 'View ordinance record'} <LinkArrow /></a></p></section>}
      <section className="service-record-section service-record-source"><h2><DetailIcon kind="source" />{fil ? 'Pinagmulan' : 'Source'}</h2>{service ? <><p><span lang="en">{hasText(service.sourceDocument) ? charterTitles(String(service.sourceDocument)) : missing}</span></p><p>{fil ? 'Ang mga detalye ay napanatili sa orihinal na wika.' : 'Details are retained in the original language.'}</p></> : <><p>{fil ? 'Opisyal na indeks ng ordinansa; hindi pa nasusuri ang kalakip.' : 'Official ordinance index; attachment not reviewed.'}</p><a href={String(ordinance?.documentUrl)}>{fil ? 'Buksan ang opisyal na dokumento' : 'Open official document'} <LinkArrow /></a></>}
        <SourceNote {...props} id={String(service ? service.sourceId : ordinance?.sourceId)} />
      </section>
    </div>
    {service && <RawRecord {...props} value={service} />}
  </div>
}
