import CheckedLink from '../components/CheckedLink'
import help from '../data/public-help.json'
import { PageIntro, type CivicProps } from './Civic'
import './provider-records.css'

const telephoneHref = (phone: string) => `tel:+63${phone.replace(/\D/g, '').replace(/^0/, '')}`
export default function PublicHelp({ locale, href }: CivicProps) {
  const fil = locale === 'fil'
  return <article className="provider-records">
    <PageIntro title={fil ? 'Mga hotline at tulong para sa publiko' : 'Public hotlines and assistance'}>{fil ? 'Mga kontak ng Pililla at serbisyo ng Lalawigan ng Rizal na maaaring lapitan ng mga residente.' : 'Pililla contacts and Rizal provincial services residents can approach.'}</PageIntro>
    <p className="civic-meta">{fil ? 'Sinuri ang mga sanggunian noong 5 Nobyembre 2026. Walang nakalagay na petsa sa mga larawan ng hotline; hindi nasubukan ang mga numero sa pagtawag.' : 'Sources checked 5 November 2026. Hotline images have no visible issue date; numbers have not been verified through test calls.'}</p>
    <section id="hotlines" aria-labelledby="hotlines-title"><h2 id="hotlines-title">{fil ? 'Mga inilathalang hotline' : 'Published hotlines'}</h2>
      <ul className="directory-grid">{help.hotlines.map(row => <li key={row.name}>
        <p className="civic-meta">{row.scope}</p><h3>{row.name}</h3><p>{row.purpose[locale]}</p>
        {row.phones.map(phone => <p key={phone}><a className="provider-phone" href={telephoneHref(phone)} aria-label={`${row.name}: ${phone}`}>{phone}</a></p>)}
        <p className="civic-meta">{fil ? 'Nasa sanggunian; hindi pa kumpirmado ang operasyon' : 'Source-listed; operational verification pending'}</p>
        <CheckedLink href={row.source}>{fil ? 'Larawan sa opisyal na website' : 'Official website source image'}</CheckedLink>
      </li>)}</ul>
      <p>{fil ? 'Hindi ginawang dial link ang lumang landline ng PNP na (02) 654-5185. Kailangan pang kumpirmahin ang kasalukuyang format nito.' : 'The older printed PNP landline, (02) 654-5185, needs its current format confirmed and is not offered as a dial link.'}</p>
    </section>
    <section id="provincial-offices" aria-labelledby="province-directory-title"><h2 id="province-directory-title">{fil ? 'Mga tanggapan ng Lalawigan ng Rizal' : 'Rizal provincial offices'}</h2>
      <p>{help.address}</p><p>{fil ? 'Trunkline' : 'Capitol trunkline'}: <a className="provider-phone" href={telephoneHref(help.trunkline)}>{help.trunkline}</a>. {fil ? 'Hilingin ang local number ng tanggapan.' : 'Ask for the office extension.'}</p>
      <p><CheckedLink href={help.directorySource}>{fil ? 'Opisyal na direktoryo ng lalawigan' : 'Official provincial directory'}</CheckedLink></p>
      <div className="provider-table" role="region" aria-label={fil ? 'Direktoryo ng lalawigan' : 'Provincial directory'} tabIndex={0}><table>
        <caption>{fil ? 'Mga pampublikong contact mula sa direktoryo; mga opisina ng lalawigan' : 'Public contacts from the directory; provincial offices'}</caption>
        <thead><tr><th scope="col">{fil ? 'Tanggapan' : 'Office'}</th><th scope="col">{fil ? 'Local number' : 'Extension'}</th><th scope="col">Email</th></tr></thead>
        <tbody>{help.offices.map(row => <tr key={row.name}><th scope="row" lang="en">{row.name}</th><td>{row.extensions}</td><td><a href={`mailto:${row.email}`}>{row.email}</a></td></tr>)}</tbody>
      </table></div>
    </section>
    <section aria-labelledby="province-services-title"><h2 id="province-services-title">{fil ? 'Mga serbisyo sa 2025 Citizen’s Charter' : 'Services in the 2025 Citizen’s Charter'}</h2>
      <p>{fil ? 'Mga serbisyo ito ng lalawigan. Kumpirmahin ang eligibility, intake at iskedyul sa responsableng tanggapan bago pumunta.' : 'These are provincial services. Confirm eligibility, intake and schedules with the responsible office before visiting.'}</p>
      <ul className="directory-grid">{help.services.map(row => <li key={row.name}><h3 lang="en">{row.name}</h3><p lang="en">{row.office}</p><CheckedLink href={`${help.charter}#page=${row.pages.split('–')[0]}`}>{fil ? '2025 charter, mga pahina' : '2025 charter, pages'} {row.pages}</CheckedLink></li>)}</ul>
    </section>
    <section className="collection-gate"><h2>{fil ? 'Tubig sa Pililla' : 'Water services in Pililla'}</h2><p><CheckedLink href={href('services/water-district')}>Pililla Water District</CheckedLink> — {fil ? 'Mga kontak, charter, rates, form at pampublikong rekord.' : 'Contacts, charter, rates, forms and public records.'}</p></section>
    <details className="provider-review"><summary>{fil ? 'Mga detalye na kailangan pang kumpirmahin' : 'Details requiring confirmation'}</summary><ul>{help.reviewIssues.map(issue => <li key={issue} lang="en">{issue}</li>)}</ul></details>
  </article>
}
