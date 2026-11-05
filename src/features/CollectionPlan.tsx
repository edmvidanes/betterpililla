import CheckedLink from '../components/CheckedLink'
import { useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { collectionDate, collectionItems, collectionStatus, phases } from '../data/collection-plan'
import { catalogs, formatDate } from '../i18n/locales'
import { PageIntro, type CivicProps } from './Civic'
import officials from '../../public/collection/officials-review.json'
import './collection-plan.css'

export default function CollectionPlan({ locale, href }: CivicProps) {
  const fil = locale === 'fil', t = catalogs[locale]
  const asset = (name: string) => `${import.meta.env.BASE_URL}collection/${name}`
  useEffect(() => {
    const followFragment = () => {
      const id = location.hash.slice(1)
      if (!/^(collect-[a-z-]+|phase-[1-6])$/.test(id)) return
      const target = document.getElementById(id)
      if (!target) return
      ScrollTrigger.refresh()
      const smoother = ScrollSmoother.get()
      if (smoother) smoother.scrollTo(target, false, 'top 112px')
      else target.scrollIntoView({ block: 'start', behavior: 'instant' })
    }
    const frame = requestAnimationFrame(followFragment)
    window.addEventListener('hashchange', followFragment)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('hashchange', followFragment) }
  }, [])
  return <article className="collection-plan">
    <PageIntro title={t.collectionPlan}>{fil ? 'Mga kulang na tala at sunod-sunod na hakbang sa pagkolekta ng pampublikong dokumento ng Pililla, Rizal.' : 'An itemized list of missing records and the steps for collecting public documents about Pililla, Rizal.'}</PageIntro>
    <p className="civic-meta">{fil ? 'Huling pagsusuri' : 'Last collection review'}: {formatDate(collectionDate, locale)}. {fil ? 'Ang ebidensya para sa pagsusuri ay hindi pa inilalathala bilang kasalukuyang rekord ng munisipyo.' : 'Evidence for review has not been released as current municipal records.'}</p>
    <nav className="collection-phases" aria-label={fil ? 'Mga yugto ng pagkolekta' : 'Collection phases'}>{phases.map(phase => <a key={phase.id} href={`#phase-${phase.id}`}>{phase.id}. {phase.title[locale]}</a>)}</nav>
    {phases.map(phase => <section className="collection-phase" id={`phase-${phase.id}`} key={phase.id} aria-labelledby={`phase-title-${phase.id}`}>
      <h2 id={`phase-title-${phase.id}`}>{fil ? 'Yugto' : 'Phase'} {phase.id}: {phase.title[locale]}</h2>
      <p>{phase.task[locale]}</p>
      <ul className="collection-items">{collectionItems.filter(item => item.phase === phase.id).map(item => <li id={`collect-${item.id}`} key={item.id}>
        <div className="collection-item-heading"><h3><CheckedLink href={href(item.path)}>{item.title[locale]}</CheckedLink></h3><span className={`collection-status collection-status-${item.status}`}>{collectionStatus[item.status][locale]}</span></div>
        <p>{item.records[locale]}</p><p className="civic-meta">{fil ? 'Tagapangalaga ng tala' : 'Record custodian'}: {item.custodian}</p>
      </li>)}</ul>
      <p className="collection-gate"><strong>{fil ? 'Bago ilathala' : 'Before publishing'}:</strong> {phase.gate[locale]}</p>
    </section>)}
    <section aria-labelledby="collection-review-title">
      <h2 id="collection-review-title">{fil ? 'Mga nakolektang tala para sa pagsusuri' : 'Collected evidence for review'}</h2>
      <details className="collection-review"><summary>{fil ? 'Sampung halal na opisyal sa direktoryo ng DILG' : 'Ten elected officials from the DILG directory'}</summary>
        <p>{fil ? 'Termino 2025–2028. Direktoryo noong Pebrero 2026; kailangan pang tiyakin ang mga sumunod na pagbabago at ex-officio seats.' : 'Term 2025–2028. Directory as of February 2026; later changes and ex-officio seats still need checking.'}</p>
        <div className="collection-table"><table><caption>{fil ? 'Eksaktong pangalan at posisyon mula sa sanggunian' : 'Names and positions as published in the source'}</caption><thead><tr><th scope="col">{fil ? 'Pangalan' : 'Name'}</th><th scope="col">{fil ? 'Posisyon' : 'Position'}</th><th scope="col">{fil ? 'Hanay sa sanggunian' : 'Source row'}</th></tr></thead><tbody>{officials.records.map(row => <tr key={row.sourceRow}><td>{[row['FIRST NAME'], row['MIDDLE NAME'], row['LAST NAME'], row.SUFFIX].filter(Boolean).join(' ')}</td><td lang="en">{row.POSITION}</td><td>{row.sourceRow}</td></tr>)}</tbody></table></div>
        <p><CheckedLink href={officials.folderUrl}>DILG directory folder</CheckedLink> · <a href={asset('officials-review.json')} download>{fil ? 'I-download ang mga tala at sanggunian (JSON)' : 'Download records and provenance (JSON)'}</a></p>
      </details>
      <ul className="collection-evidence">
        <li><a href={asset('psa-review.json')} download>{fil ? 'PSA: mga code, populasyon at siyam na barangay (JSON)' : 'PSA codes, population and nine barangays (JSON)'}</a><p>{fil ? '2024 POPCEN; listahan noong 31 Hulyo 2025. Transkripsyon mula sa web reader; hindi nakuhang orihinal na file.' : '2024 POPCEN; roster dated 31 July 2025. Web-reader transcription; original file retrieval was blocked.'}</p></li>
        <li><a href={asset('heritage-review.json')} download>{fil ? 'NHCP at mga lugar sa listahan ng lalawigan (JSON)' : 'NHCP and provincial place listings (JSON)'}</a><p>{fil ? 'Mga tala para sa pagsusuri; hindi pa kumpirmado ang oras, bayarin at access sa pagbisita.' : 'Review candidates; opening hours, fees and visitor access remain unconfirmed.'}</p></li>
        <li><a href={asset('attempts.json')} download>{fil ? 'Tala ng pag-access sa mga sanggunian (JSON)' : 'Source access log (JSON)'}</a><p>{fil ? 'Nakatala ang URL, oras, HTTP status, dami ng bytes at hash ng tugon. Hindi itinuturing na dokumento ang error page.' : 'Includes URL, time, HTTP status, byte count and response hash. Error pages are not treated as documents.'}</p></li>
      </ul>
    </section>
    <section className="collection-gate" aria-labelledby="collection-next-title"><h2 id="collection-next-title">{fil ? 'Susunod na koleksyon' : 'Next collection batch'}</h2>
      <p>{fil ? 'Unahin ang kasalukuyang Citizen’s Charter at pampublikong office directory. Pagkatapos ay kunin ang mga dokumento ng SB at taunang pananalapi. Naihanda ang listahan ng dokumentong kailangan; wala pang ipinadalang kahilingan.' : 'Prioritize the current Citizen’s Charter and public office directory. Follow with SB documents and yearly municipal financial records. The document request checklist is prepared; no requests have been sent.'}</p>
      <p><a href={asset('record-requests.md')} download>{fil ? 'I-download ang checklist ng hihinging dokumento' : 'Download the document request checklist'}</a></p>
    </section>
    <p>{fil ? 'Ang budget portal, procurement at DPWH feeds ay may hiwalay na saklaw. Ang aberya sa feed ay hindi katibayang walang rekord o zero ang halaga.' : 'The budget portal, procurement and DPWH feeds have separate coverage. A feed outage is not evidence of no records or zero spending.'} <CheckedLink href={href('transparency')}>{t.transparency}</CheckedLink></p>
  </article>
}
