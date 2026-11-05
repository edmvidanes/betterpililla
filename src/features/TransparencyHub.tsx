import CheckedLink from '../components/CheckedLink'
import { catalogs } from '../i18n/locales'
import { PageIntro, type CivicProps } from './Civic'

export default function TransparencyHub({ locale, href }: CivicProps) {
  const t = catalogs[locale]
  const fil = locale === 'fil'
  const pillars = [
    {
      path: 'transparency/finance',
      title: t.finance,
      badge: fil ? 'Pananalapi' : 'Financials',
      text: fil
        ? 'Kita at gastusin ng munisipyo mula sa mga beripikadong ulat (SRE, COA, BLGF). Kung wala pang nakuhang tala, hayagang ipinapakita ang kakulangan — hindi ito zero.'
        : 'Municipal income and spending from verified reports (SRE, COA, BLGF). Where no record has been captured yet, the gap is shown openly — missing is not zero.',
    },
    {
      path: 'transparency/procurement',
      title: t.procurement,
      badge: fil ? 'Mga kontrata' : 'Contracts',
      text: fil
        ? 'Mga award sa PhilGEPS ng MUNICIPALITY OF PILILLA, RIZAL lamang, direkta mula sa BetterGov PH search. Hindi kasama ang mga paaralan at ibang ahensya sa Pililla.'
        : 'PhilGEPS awards for MUNICIPALITY OF PILILLA, RIZAL only, live from the BetterGov PH search index. Schools and other agencies located in Pililla are excluded.',
    },
    {
      path: 'transparency/projects',
      title: t.projects,
      badge: fil ? 'Pagsubaybay' : 'Monitoring',
      text: fil
        ? 'Mga proyektong DPWH na binabanggit ang Pililla sa paglalarawan. Maaaring sumaklaw ang isang proyekto sa karatig-bayan; tingnan ang bawat rekord.'
        : 'DPWH projects whose description mentions Pililla. A single project may span neighboring towns; check each record.',
    },
  ]
  return <>
    <PageIntro title={t.transparency}>
      {fil
        ? 'Impormasyong pampubliko tungkol sa Pililla, Rizal — pananalapi, procurement at mga proyekto, kasama ang pinagmulan ng bawat tala.'
        : 'Explore public information about Pililla, Rizal — finance, procurement and projects, with the source of every record.'}
    </PageIntro>
    <section className="notice" aria-labelledby="budget-portal-title">
      <h2 id="budget-portal-title">{fil ? 'Portal ng mga badyet' : 'Budget transparency portal'}</h2>
      <p>{fil ? 'Mga dokumento ng badyet 2020–2027 na binabanggit ang Pililla. Local preview; nakabinbin ang pagsusuri ng nilalaman.' : 'Budget source records for 2020–2027 naming Pililla. Local preview; content review is pending.'}</p>
      <CheckedLink href="http://127.0.0.1:5132/">{fil ? 'Buksan ang local transparency portal (English)' : 'Open the local transparency portal'}</CheckedLink>
    </section>
    <p className="civic-meta">{fil
      ? 'Ang Better Pililla ay boluntaryong inisyatibo ng komunidad, hindi opisyal na portal ng pamahalaan. Isinasalamin lamang nito ang mga pampublikong tala; ang orihinal na dokumento ang mananatiling awtoridad.'
      : 'Better Pililla is a volunteer community initiative, not an official government portal. It mirrors public records; the original document remains the authority.'}</p>
    <ul className="directory-grid">
      {pillars.map(pillar => <li key={pillar.path}>
        <p className="civic-meta">{pillar.badge}</p>
        <h2><CheckedLink href={href(pillar.path)}>{pillar.title}</CheckedLink></h2>
        <p>{pillar.text}</p>
      </li>)}
    </ul>
    <p><CheckedLink href={href('sources')}>{t.sources}</CheckedLink></p>
  </>
}
