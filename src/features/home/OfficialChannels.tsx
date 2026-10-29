import type { Locale } from '../../i18n/locales'
import '../civic-sections.css'

const channels = [
  ['Cavinti PIO', 'Public Information Office', 'https://www.facebook.com/cavintiPH'],
  ['Cavinti Tourism', 'Tourism & Culture', 'https://www.facebook.com/LGUCavintiTourismOfficial'],
  ['Cavinti Water', 'Utilities Service', 'https://www.facebook.com/cavintiwater'],
  ['MENRO Cavinti', 'Environment & Natural Resources', 'https://www.facebook.com/MENROcavinti'],
  ['Cavinti MPS', 'Municipal Police Station', 'https://www.facebook.com/cavinti.mps.5'],
  ['BFP Cavinti', 'Fire Station', 'https://www.facebook.com/BFPR4ACavintiFireStation'],
  ['Cavinti RHU', 'Rural Health Unit', 'https://www.facebook.com/cavinti.rhu'],
  ['MDRRMO Cavinti', 'Disaster Risk Reduction', 'https://www.facebook.com/mdrrmo.cavinti'],
] as const

export default function OfficialChannels({ locale }: { locale: Locale }) {
  const fil = locale === 'fil'
  return <section className="atlas-inner official-channels" aria-labelledby="official-channels-title">
    <h2 id="official-channels-title">{fil ? 'Mga opisyal na channel' : 'Official channels'}</h2>
    <p>{fil ? 'Mga Facebook page na nakalista sa ' : 'Facebook pages listed on the '}<a href="https://www.cavinti-egov.com/">{fil ? 'opisyal na homepage ng munisipyo' : 'official municipal homepage'}</a>.</p>
    <ul className="directory-grid official-channels-list" lang="en">{channels.map(([name, description, url]) => <li key={url}>
      <a className="official-channel-link" href={url}>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 17 17 7M7 7h10v10" /></svg>
        <h3>{name}</h3><p>{description}</p>
      </a>
    </li>)}</ul>
  </section>
}
