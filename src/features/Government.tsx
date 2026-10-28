import { useState } from 'react'
import { lgu } from '../config/lgu'
import { catalogs, formatDate, formatNumber } from '../i18n/locales'
import { civicCatalogs } from '../i18n/civic'
import { LinkArrow, PageIntro, RawRecord, SourceNote, type CivicProps } from './Civic'
import { rows } from '../data/loaders'
import { portraitCaptureDate, portraitRightsUrl, portraitUrl } from './official-portraits'
import './officials.css'

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
  return <><PageIntro title={t.government} /><ul className="directory-grid">{links.map(([path, title, description]) => <li key={path}><h2><a className="government-link" href={href(path)}>{title}<LinkArrow /></a></h2><p className="muted">{description}</p></li>)}</ul><SourceNote {...props} id={lgu.sourceIds.executive} /><SourceNote {...props} id={lgu.sourceIds.legislative} /></>
}

function Portrait({ recordId }: { recordId: string }) {
  const url = portraitUrl(recordId)
  return url ? <img className="official-portrait" src={url} alt="" loading="lazy" referrerPolicy="no-referrer" /> : null
}

export function OfficialDetail(props: CivicProps & { recordId: string; correctionLink: (id: string) => string }) {
  const { data, locale, href, recordId, correctionLink } = props
  const row = rows(data.officials.records).find(record => record.recordId === recordId)
  if (!row) return null
  const fil = locale === 'fil'
  const sourceId = String(row.sourceId || row.profileSourceId)
  const sourcePage = sourceId === 'cavinti-executive-directory' ? 'https://www.cavinti-egov.com/executive' : 'https://www.cavinti-egov.com/legislative'
  const roleEvidence = row.roleEvidence && typeof row.roleEvidence === 'object' && !Array.isArray(row.roleEvidence) ? row.roleEvidence : null
  return <>
    <a className="service-back" href={href('government/officials')}>{fil ? '← Lahat ng nasa direktoryo' : '← All directory profiles'}</a>
    <div className="official-detail">
      <Portrait recordId={recordId} />
      <div><h1 lang="en">{String(row.displayName)}</h1><p lang="en">{String(row.directorySection)}</p>
        <p className="notice">{row.verificationStatus === 'primary-directory-card-observed; exact office or membership status unclear'
          ? (fil ? 'Hindi malinaw ang eksaktong katungkulan o pagiging kasapi; hindi ito patunay ng kasalukuyan o nahalal na katungkulan.' : 'Exact office or membership status is unclear; this card does not establish an elected or current office.')
          : (fil ? 'Hindi itinatatag ng direktoryong ito ang kasalukuyang termino o panunungkulan.' : 'This directory does not establish current tenure or term dates.')}</p>
        <dl className="official-facts">
          <dt>{fil ? 'Katungkulan' : 'Role'}</dt><dd>{row.roleLabel ? <span lang="en">{String(row.roleLabel)}</span> : (fil ? 'Hindi natukoy' : 'Not established')}</dd>
          <dt>{fil ? 'Komite ayon sa direktoryo' : 'Committee as listed'}</dt><dd>{row.committeeLabel ? <span lang="en">{String(row.committeeLabel)}</span> : (fil ? 'Hindi nakasaad' : 'Not stated')}</dd>
          {row.expertiseLabel && <><dt>{fil ? 'Expertise ayon sa direktoryo' : 'Expertise as listed'}</dt><dd lang="en">{String(row.expertiseLabel)}</dd></>}
          {typeof row.authoredCountAsDisplayed === 'number' && <><dt>{fil ? 'Authored / Co-authored ayon sa direktoryo' : 'Authored / co-authored as displayed'}</dt><dd>{formatNumber(row.authoredCountAsDisplayed, locale)} / {formatNumber(Number(row.coauthoredCountAsDisplayed), locale)}</dd></>}
          <dt>{fil ? 'Termino' : 'Term dates'}</dt><dd>{fil ? 'Hindi natukoy' : 'Not established'}</dd>
        </dl>
        {typeof row.authoredCountAsDisplayed === 'number' && <p className="civic-meta">{fil ? 'Hindi pa naihahambing ang bilang sa buong katalogo ng batas.' : 'Counts have not been reconciled against the full legislation catalog.'}</p>}
      </div>
    </div>
    <section><h2>{fil ? 'Pinagmulan at katibayan' : 'Sources and evidence'}</h2>
      <p>{fil ? 'Direktoryo ng Cavinti E-Gov; ang tala ng direktoryo ay nakunan noong' : 'Cavinti E-Gov directory; directory record captured'} {formatDate(String(data.officials.capturedAt), locale)}. <a href={sourcePage}>{fil ? 'Buksan ang direktoryo' : 'Open directory'}</a></p>
      {portraitUrl(recordId) && <p>{fil ? 'Larawan mula sa parehong direktoryo, nakita noong' : 'Portrait from the same directory, observed'} {formatDate(portraitCaptureDate, locale)}. {fil ? 'Direktang nilo-load mula sa munisipal na site; walang nakasaad na photographer. Hindi nasuri ang naka-embed na karapatan.' : 'Loaded directly from the municipal site; photographer uncredited. Embedded rights metadata has not been reviewed.'} <a href={portraitUrl(recordId) || undefined}>{fil ? 'Orihinal na larawan' : 'Original image'}</a> · <a href={portraitRightsUrl}>{fil ? 'Pahayag ng site sa paggamit' : 'Site-wide rights statement'}</a></p>}
      {roleEvidence && <><h3>{fil ? 'Katibayan ng katungkulan' : 'Role evidence'}</h3>{roleEvidence.evidenceText && <p lang="en">{String(roleEvidence.evidenceText)}</p>}{roleEvidence.notes && <p lang="en">{String(roleEvidence.notes)}</p>}<p lang="en">{String(roleEvidence.verificationStatus)}</p>{roleEvidence.documentUrl && <p><a href={String(roleEvidence.documentUrl)}>{String(roleEvidence.documentNumber)}</a></p>}<SourceNote {...props} id={String(roleEvidence.sourceId)} /></>}
      {row.verificationStatus && <p className="civic-meta" lang="en">{String(row.verificationStatus)}</p>}
      <SourceNote {...props} id={sourceId} />
    </section>
    <RawRecord {...props} value={row} />
    <p><a href={correctionLink(recordId)}>{catalogs[locale].correction}</a></p>
  </>
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
  return <><PageIntro title={t.officials} />
    <div className="directory-tools"><label htmlFor="official-query">{c.filterDirectory}<input id="official-query" type="search" placeholder={c.directoryPlaceholder} value={query} onChange={event => setQuery(event.target.value)} /></label><label htmlFor="official-section">{c.directorySection}<select id="official-section" value={section} onChange={event => setSection(event.target.value)}><option value="">{c.allGroups}</option>{sections.map(value => <option key={value} value={value} lang="en">{value}</option>)}</select></label></div>
    <p className="civic-meta" role="status">{formatNumber(matching.length, locale)} {t.records}</p>
    <p className="civic-meta">{locale === 'fil' ? 'Mga larawan mula sa direktoryo ng Cavinti E-Gov; direktang nilo-load mula sa munisipal na site. Walang nakasaad na photographer.' : 'Portraits from the Cavinti E-Gov directory, loaded directly from the municipal site. Photographer not credited.'}</p>
    {!matching.length && <p>{t.noResults}</p>}<ul className="directory-grid">{matching.map(row => <li key={String(row.recordId)}><div className="official-card"><Portrait recordId={String(row.recordId)} /><div><p className="civic-meta" lang="en">{String(row.directorySection)}</p><h2><a lang="en" href={href(`government/officials/${encodeURIComponent(String(row.recordId))}`)}>{String(row.displayName)}</a></h2>{row.roleLabel && <p className="directory-role" lang="en">{String(row.roleLabel)}</p>}{row.committeeLabel && <p lang="en">{String(row.committeeLabel)}</p>}{row.verificationStatus === 'primary-directory-card-observed; exact office or membership status unclear' && <p>{locale === 'fil' ? 'Hindi malinaw ang eksaktong katungkulan o pagiging kasapi.' : 'Exact office or membership status is unclear.'}</p>}<SourceNote {...props} id={String(row.sourceId || row.profileSourceId)} /></div></div></li>)}</ul>
    {winners.length > 0 && <section aria-labelledby="historical-winners">
      <h2 id="historical-winners">{locale === 'fil' ? 'Mga nanalo sa mga nakaraang halalan' : 'Historical election winners'}</h2>
      <div><p>{locale === 'fil'
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
  return <><PageIntro title={t.offices} />
    {!contacts.length && <><h2>{t.notFound}</h2><a href={href('government/offices')}>{c.publishedContacts}</a></>}
    <ul className="directory-grid">{contacts.map(row => <li key={String(row.category)}><h2><a lang="en" href={href(`government/offices/${row.category}`)}>{String(row.service)}</a></h2>
      {row.addressAsPublished && <p lang="en">{String(row.addressAsPublished)}</p>}
      {Array.isArray(row.emailsAsPublished) && <ul className="civic-links">{row.emailsAsPublished.filter((email): email is string => typeof email === 'string').map(email => <li key={email}><a href={`mailto:${email}`}>{email}</a></li>)}</ul>}
      <ul className="civic-links">{(row.numbersAsPublished as string[]).map(number => <li key={number}>{/^\+?[\d\s()-]+$/.test(number) ? <a className="civic-phone" href={`tel:${number.replace(/[^+\d]/g, '')}`}>{number}</a> : number}</li>)}</ul>
      <p className="civic-meta">{t.checked}: {formatDate(String(row.capturedAt || data.contacts.capturedAt), locale)} · {c.validation}: {c.notPerformed}</p>
      <SourceNote {...props} id={String(row.sourceId || data.contacts.sourceId)} />{officeId && <RawRecord {...props} value={row} />}</li>)}</ul>
  </>
}
