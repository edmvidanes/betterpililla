import CheckedLink from '../components/CheckedLink'
import progress from '../data/provider-progress.json'
import summary from '../../public/collection/providers/summary.json'
import type { Locale } from '../i18n/locales'
import './provider-records.css'

export default function ProviderCollection({ locale, href }: { locale: Locale; href: (path: string) => string }) {
  const fil = locale === 'fil', asset = (name: string) => `${import.meta.env.BASE_URL}collection/providers/${name}`
  return <section className="provider-records" id="provider-progress" aria-labelledby="provider-progress-title">
    <h2 id="provider-progress-title">{fil ? 'Progreso: water district at lalawigan' : 'Progress: water district and province'}</h2>
    <p>{fil ? 'Karagdagang pampublikong tala na nakolekta noong 5 Nobyembre 2026. Hiwalay ang saklaw ng bawat ahensya sa mga rekord ng munisipyo.' : 'Additional public records collected 5 November 2026. Each agency’s records retain their own scope alongside the municipal collection.'}</p>
    <ul className="directory-grid"><li><h3>Pililla Water District</h3><p>{summary.prwd.documents} {fil ? 'dokumento' : 'documents'} · {summary.prwd.pdfPages} {fil ? 'PDF page' : 'PDF pages'}</p><CheckedLink href={href('services/water-district')}>{fil ? 'Mga serbisyo, rates at rekord' : 'Services, rates and records'}</CheckedLink></li><li><h3>Rizal Provincial Government</h3><p>{summary.province.documents} {fil ? 'dokumento' : 'documents'} · {summary.province.pdfPages} {fil ? 'PDF page' : 'PDF pages'}</p><CheckedLink href={href('services/public-contacts')}>{fil ? 'Mga hotline at tulong' : 'Hotlines and assistance'}</CheckedLink></li></ul>
    <div className="provider-table" role="region" aria-label={fil ? 'Progreso sa anim na yugto' : 'Progress across six phases'} tabIndex={0}><table><caption>{fil ? 'Nakolekta at mga susunod na pagsusuri' : 'Collected evidence and remaining review'}</caption><thead><tr><th scope="col">{fil ? 'Yugto' : 'Phase'}</th><th scope="col">{fil ? 'Nakolekta' : 'Collected'}</th><th scope="col">{fil ? 'Kailangan pa' : 'Remaining'}</th></tr></thead><tbody>{progress.map(row => <tr key={row.phase}><th scope="row">{row.phase}<br /><span lang="en">{row.status}</span></th><td>{row[locale]}</td><td>{row.remaining[locale]}</td></tr>)}</tbody></table></div>
    <p>{fil ? 'Ang “nakolekta” ay nangangahulugang may na-download na ebidensya; hindi ito patunay na kasalukuyan o kumpleto ang rekord. Walang ipinadalang form o FOI request.' : '“Collected” means evidence was downloaded; it does not establish that a record is current or complete. No forms or FOI requests were submitted.'}</p>
    <ul className="collection-evidence">{[['prwd-pages.json','PRWD pages and documents'],['prwd-images.json','PRWD image archive'],['prwd-charter-services.json','13 charter services with page citations'],['prwd-tariff.json','April 2026 tariff and spreadsheet ranges'],['prwd-missing-documents.json','Missing disclosure documents'],['province-sources.json','Provincial source inventory'],['province-pililla-bid-pages.json','Provincial bid pages naming Pililla'],['external-checks.json','External form and payment link checks']].map(([name,label]) => <li key={name}><a href={asset(name)} download lang="en">{label} (JSON)</a></li>)}</ul>
    <p>{fil ? 'Ang FOI workbooks ay may pangalan at detalye ng requester. Metadata lamang ang kasama sa pampublikong inventory; hindi inilathala ang mga personal na hanay.' : 'FOI workbooks contain requester details. The public inventory includes metadata; personal request rows are not republished.'}</p>
  </section>
}
