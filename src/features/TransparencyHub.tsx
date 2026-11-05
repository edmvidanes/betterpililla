import CheckedLink from '../components/CheckedLink'
import { catalogs } from '../i18n/locales'
import { PageIntro, type CivicProps } from './Civic'

export default function TransparencyHub({ locale, href }: CivicProps) {
  const t = catalogs[locale]
  const fil = locale === 'fil'
  const pillars = [
    {
      path: 'transparency/budget', title: t.budgetPortal, badge: 'FY2027',
      text: fil ? 'Ihambing ang NEP at House Bill 10858, kasama ang mga dokumento ng bawat proyekto na binabanggit ang Pililla.' : 'Compare NEP and House Bill 10858, with source documents for projects naming Pililla.',
    },
    {
      path: 'transparency/budget/gaa', title: t.enactedBudgets, badge: '2020–2026',
      text: fil ? 'Basahin ang mga taunang appropriation para sa mga programa at proyekto na binabanggit ang Pililla. Hindi ito aktuwal na paggastos.' : 'Read yearly appropriations for programs and projects naming Pililla. These are spending authorizations, not expenditure.',
    },
    {
      path: 'transparency/budget/about', title: t.budgetSources, badge: fil ? 'Mga dokumento' : 'Documents',
      text: fil ? 'Suriin ang mga pinagmulang PDF, saklaw ng paghahanap, at paliwanag sa paghahambing ng badyet.' : 'Check source PDFs, query coverage, and how the budget comparison works.',
    },
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
    <p className="civic-meta">{fil
      ? 'Ang Better Pililla ay boluntaryong inisyatibo ng komunidad, hindi opisyal na portal ng pamahalaan. Isinasalamin lamang nito ang mga pampublikong tala; ang orihinal na dokumento ang mananatiling awtoridad.'
      : 'Better Pililla is a volunteer community initiative, not an official government portal. It mirrors public records; the original document remains the authority.'}</p>
    <ul className="directory-grid">
      {pillars.filter(pillar => pillar.path !== 'transparency/finance').map(pillar => <li key={pillar.path}>
        <p className="civic-meta">{pillar.badge}</p>
        <h2><CheckedLink href={href(pillar.path)}>{pillar.title}</CheckedLink></h2>
        <p>{pillar.text}</p>
      </li>)}
    </ul>
    <section className="work-in-progress" aria-label="WorkInProgress"><h2>{t.finance} · WorkInProgress</h2><p>{fil ? 'Wala pang nasuring municipal finance o audit documents. Ipapakita ang mga ito kapag may beripikadong pinagmulan.' : 'Verified municipal finance and audit documents have not been collected. This section will be populated when source documents are available.'}</p><CheckedLink href={href('transparency/finance')}>{t.finance}</CheckedLink></section>
    <p><CheckedLink href={href('collection-plan') + '#collect-finance'}>{t.collectionPlan}</CheckedLink> · <CheckedLink href={href('sources')}>{t.sources}</CheckedLink></p>
  </>
}
