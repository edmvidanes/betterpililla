import type { Locale } from '../../i18n/locales'
import { lgu } from '../../config/lgu'
import '../civic-sections.css'

export default function OfficialChannels({ locale }: { locale: Locale }) {
  const fil = locale === 'fil'
  return <section className="atlas-inner official-channels" aria-labelledby="official-channels-title">
    <h2 id="official-channels-title">{fil ? 'Mga sanggunian ng munisipyo' : 'Municipal sources'}</h2>
    <p>{fil ? 'Tingnan ang mga opisyal na sanggunian at kumpirmahin ang kasalukuyang proseso sa tanggapan.' : 'Follow the official sources and confirm current procedures with the responsible office.'}</p>
    <ul className="atlas-links">
      <li><a href={lgu.officialUrl}>{fil ? 'Opisyal na website ng Pililla' : 'Official Pililla website'}</a></li>
      <li><a href={lgu.citizensCharterUrl}>{fil ? 'Inilathalang 2024 Citizens’ Charter (PDF)' : 'Published 2024 Citizens’ Charter (PDF)'}</a></li>
    </ul>
  </section>
}
