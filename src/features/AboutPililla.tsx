import CheckedLink from '../components/CheckedLink'
import type { Locale } from '../i18n/locales'
import './civic-sections.css'

const source = 'https://pilillarizal.gov.ph/aboutUs'

export default function AboutPililla({ locale, href }: { locale: Locale; href: (path: string) => string }) {
  const fil = locale === 'fil'
  return <section className="about-Pililla" aria-labelledby="about-Pililla-title">
    <h2 id="about-Pililla-title">{fil ? 'Tungkol sa Pililla' : 'About Pililla'}</h2>
    <p className="civic-meta">{fil ? 'Orihinal na teksto sa Ingles mula sa ' : 'Original English text from the '}<CheckedLink href={source}>{fil ? 'pahina ng munisipyo tungkol sa Pililla' : 'municipal About page'}</CheckedLink>{fil ? '; walang nakikitang petsa ng paglalathala o pag-update.' : '; no publication or update date is visible.'}</p>
    <div className="about-Pililla-profile" lang="en">
      <h3>Geographical Profile</h3>
      <p>Municipality of Pililla is one of the upland municipalities of Rizal province. It is situated in the foothills of Sierra Madre mountain range. It is located within 121° 28’ 6.31” – 121° 37’ 57.06” Longitude and 14° 11’ 30.40” – 14° 23’ 29.96” Latitude of eastern part of Rizal. It is bounded by the Municipality of Paete to the north, Kalayaan to the north-west, Lumban to the west, Luisiana to the south, Pagsanjan to the southwest and the province of Quezon to the east.</p>
      <p>It is located 119 kilometres south-east of Manila, a two hours and three minutes (2hrs and 3mins) drive via the South Luzon Expressway and National Hi-way or 123 kilometres south-east of Manila, a two hours and 17 minutes (2hrs and 17mins) drive via Marcos Hi-way. It is 11 kilometres away from the provincial capital via Pagsanjan route.</p>
      <h3>Our Vision</h3>
      <p>adventure and falls capital of Rizal.</p>
      <h3>Our Mission</h3>
      <p>The municipality shall endeavor to implement development program and projects and ensure the delivery of basic services through good governance. Provide adequate infrastructure facilities. Employ ecologically sustainable development strategies building on the unity and active participation of committed citizenry. It shall give preferential treatment for the poor. Promote Pililla as the eco-tourism, eventful, adventure and falls capital of Rizal towards world class Pililla.</p>
    </div>
    <p className="about-Pililla-evidence">{fil ? 'May 17 pangalan ng barangay sa pahina, samantalang may hiwalay na ebidensiya para sa 19; hindi pa napagkakasundo ang mga tala. ' : 'The About page displays 17 barangay names, while separate evidence cites 19; the records remain unreconciled. '}<CheckedLink href={href('government/barangays')}>{fil ? 'Tingnan ang mga sanggunian sa barangay' : 'Explore the barangay evidence'}</CheckedLink>.</p>
  </section>
}
