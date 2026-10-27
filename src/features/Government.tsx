import { useState } from 'react'
import { lgu } from '../config/lgu'
import { catalogs, formatDate, formatNumber } from '../i18n/locales'
import { civicCatalogs } from '../i18n/civic'
import { LinkArrow, PageIntro, RawRecord, SourceNote, type CivicProps } from './Civic'
import { rows } from '../data/loaders'

export function Government(props: CivicProps) {
  const { locale, href } = props
  const t = catalogs[locale], c = civicCatalogs[locale]
  const links = [
    ['government/officials', t.officials, c.officialsDescription],
    ['government/offices', t.offices, c.officesDescription],
    ['government/committees', t.committees, c.committeesDescription],
    ['government/barangays', t.barangays, c.barangaysDescription],
    ['open-lgu/terms', t.terms, c.termsDescription],
  ]
  return <><PageIntro title={t.government}>{c.governmentIntro}</PageIntro><ul className="directory-grid">{links.map(([path, title, description]) => <li key={path}><h2><a className="government-link" href={href(path)}>{title}<LinkArrow /></a></h2><p className="muted">{description}</p></li>)}</ul><SourceNote {...props} id={lgu.sourceIds.executive} /><SourceNote {...props} id={lgu.sourceIds.legislative} /></>
}

export function Officials(props: CivicProps) {
  const { data, locale, href } = props
  const t = catalogs[locale], c = civicCatalogs[locale]
  const [query, setQuery] = useState('')
  const [section, setSection] = useState('')
  const [winnerQuery, setWinnerQuery] = useState('')
  const [winnerYear, setWinnerYear] = useState('')
  const officials = rows(data.officials.records)
  const sections = [...new Set(officials.map(row => String(row.directorySection)))]
  const matching = officials.filter(row => (!section || row.directorySection === section) && [row.displayName, row.roleLabel, row.directorySection, row.committeeLabel].join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase()))
  const winners = rows(data.officials.historicalElectionWinners)
  const years = [...new Set(winners.map(row => String(row.Year)))].sort().reverse()
  const matchingWinners = winners.filter(row => (!winnerYear || row.Year === winnerYear) && [row['Full Name'], row.Position, row.Party, row.Year, row['Middle Name Source']].join(' ').toLocaleLowerCase().includes(winnerQuery.toLocaleLowerCase()))
  return <><PageIntro title={t.officials}>{c.officialsIntro}</PageIntro>
    <div className="directory-tools"><label htmlFor="official-query">{c.filterDirectory}<input id="official-query" type="search" placeholder={c.directoryPlaceholder} value={query} onChange={event => setQuery(event.target.value)} /></label><label htmlFor="official-section">{c.directorySection}<select id="official-section" value={section} onChange={event => setSection(event.target.value)}><option value="">{c.allGroups}</option>{sections.map(value => <option key={value} value={value} lang="en">{value}</option>)}</select></label></div>
    <p className="civic-meta" role="status">{formatNumber(matching.length, locale)} {t.records}</p>
    {!matching.length && <p>{t.noResults}</p>}<ul className="directory-grid">{matching.map(row => <li key={String(row.recordId)}><p className="civic-meta" lang="en">{String(row.directorySection)}</p><h2><a lang="en" href={href(`government/officials/${encodeURIComponent(String(row.recordId))}`)}>{String(row.displayName)}</a></h2>{row.roleLabel && <p className="directory-role" lang="en">{String(row.roleLabel)}</p>}{row.committeeLabel && <p lang="en">{String(row.committeeLabel)}</p>}<SourceNote {...props} id={String(row.sourceId || row.profileSourceId)} /></li>)}</ul>
    {winners.length > 0 && <section aria-labelledby="historical-winners">
      <h2 id="historical-winners">{locale === 'fil' ? 'Mga nanalo sa mga nakaraang halalan' : 'Historical election winners'}</h2>
      <div className="notice" role="note"><p>{locale === 'fil'
        ? 'Mga makasaysayang pahayag mula sa sekundaryang dataset, hindi patunay ng panunungkulan o kasalukuyang katungkulan. Hindi kumpleto ang saklaw; dalawa lamang ang tala para sa 2010. Hindi pa napagkakasundo ang pinagmulan ng mga tala noong 2004–2013; mula 2016 pataas ay nagmula sa itinamang dataset.'
        : 'Historical secondary-source claims, not evidence of tenure or current office. Coverage is incomplete; only two records are available for 2010. Provenance for 2004–2013 is unreconciled; records from 2016 onward are derived from the corrected dataset.'}</p>
        <p>OpenHalalan: Leung et al. (2026), <a href="https://doi.org/10.5281/zenodo.17783099">DOI 10.5281/zenodo.17783099</a> · <a href="https://opendatacommons.org/licenses/odbl/1-0/">ODbL 1.0</a> · <a href="https://data.bettergov.ph/datasets/25">BetterGov</a></p>
      </div>
      <SourceNote {...props} id="openhalalan-winners" />
      <div className="directory-tools"><label htmlFor="winner-query">{locale === 'fil' ? 'Maghanap ng nanalo' : 'Search winners'}<input id="winner-query" type="search" value={winnerQuery} onChange={event => setWinnerQuery(event.target.value)} /></label><label htmlFor="winner-year">{locale === 'fil' ? 'Taon ng halalan' : 'Election year'}<select id="winner-year" value={winnerYear} onChange={event => setWinnerYear(event.target.value)}><option value="">{locale === 'fil' ? 'Lahat ng taon' : 'All years'}</option>{years.map(year => <option key={year} value={year}>{year}</option>)}</select></label></div>
      <p className="civic-meta" role="status">{formatNumber(matchingWinners.length, locale)} {t.records}</p>
      {!matchingWinners.length && <p>{t.noResults}</p>}
      <ul className="directory-grid">{matchingWinners.map((row, index) => <li key={`${String(row.Year)}-${String(row['Full Name'])}-${String(row.Position)}-${index}`}><h3 lang="en">{String(row['Full Name'])}</h3><p lang="en">{String(row.Position)} · {String(row.Year)}</p><p>{locale === 'fil' ? 'Partido' : 'Party'}: <span lang="en">{String(row.Party) || '—'}</span></p><p>{locale === 'fil' ? 'Pinagmulan ng gitnang pangalan' : 'Middle name source'}: <span lang="en">{String(row['Middle Name Source']) || '—'}</span></p></li>)}</ul>
    </section>}
  </>
}

export function Contacts(props: CivicProps & { officeId?: string }) {
  const { data, locale, href, officeId } = props
  const t = catalogs[locale], c = civicCatalogs[locale]
  const contacts = rows(data.contacts.records).filter(row => !officeId || row.category === officeId)
  return <><PageIntro title={t.offices}>{c.contactIntro}</PageIntro>
    <div className="notice" role="note"><strong>{c.contactTitle}</strong><p>{c.contactLimit}</p></div>
    {!contacts.length && <><h2>{t.notFound}</h2><a href={href('government/offices')}>{c.publishedContacts}</a></>}
    <ul className="directory-grid">{contacts.map(row => <li key={String(row.category)}><h2><a lang="en" href={href(`government/offices/${row.category}`)}>{String(row.service)}</a></h2>
      {row.addressAsPublished && <p lang="en">{String(row.addressAsPublished)}</p>}
      {Array.isArray(row.emailsAsPublished) && <ul className="civic-links">{row.emailsAsPublished.filter((email): email is string => typeof email === 'string').map(email => <li key={email}><a href={`mailto:${email}`}>{email}</a></li>)}</ul>}
      <ul className="civic-links">{(row.numbersAsPublished as string[]).map(number => <li key={number}>{/^\+?[\d\s()-]+$/.test(number) ? <a className="civic-phone" href={`tel:${number.replace(/[^+\d]/g, '')}`}>{number}</a> : number}</li>)}</ul>
      <p className="civic-meta">{t.checked}: {formatDate(String(row.capturedAt || data.contacts.capturedAt), locale)} · {c.validation}: {c.notPerformed}</p>
      <SourceNote {...props} id={String(row.sourceId || data.contacts.sourceId)} />{officeId && <RawRecord {...props} value={row} />}</li>)}</ul>
  </>
}
