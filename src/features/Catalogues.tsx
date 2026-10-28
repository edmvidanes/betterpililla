import { useState } from 'react'
import { catalogs, formatDate, formatNumber } from '../i18n/locales'
import { civicCatalogs } from '../i18n/civic'
import { PageIntro, RawRecord, SourceNote, type CivicProps } from './Civic'

export function Downloads(props: CivicProps) {
  const { data, locale } = props
  const t = catalogs[locale], c = civicCatalogs[locale]
  const [query, setQuery] = useState('')
  const matching = data.portal.datasets.filter(row => `${row.id} ${row.coverage}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
  const titles: Record<string, string> = { municipality: t.demographics, barangays: t.barangays, officials: t.officials, 'emergency-contacts': t.offices, services: t.services, 'sector-inventory': t.places, transparency: t.finance, ordinances: c.ordinances, resolutions: c.resolutions, 'source-register': c['source-register'], 'research-updates': c['research-updates'], 'dataset-manifest': c['dataset-manifest'] }
  const downloadUrl = (url: string) => `${import.meta.env.BASE_URL}${url.replace(/^\//, '')}`
  return <><PageIntro title={t.downloads} />
    <div className="directory-tools"><label htmlFor="dataset-query">{c.datasetSearch}<input id="dataset-query" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={c.datasetPlaceholder} /></label><p role="status">{formatNumber(matching.length, locale)} {t.records}</p></div>
    {!matching.length && <p>{t.noResults}</p>}<ul className="dataset-list">{matching.map(dataset => <li className="dataset-row" key={dataset.id}><div><h2>{titles[dataset.id] || dataset.id}</h2><p className="civic-meta">{dataset.id} · {formatNumber(dataset.rowCount, locale)} {t.records} · {t.capture}: {formatDate(dataset.capturedAt, locale)}</p><p lang="en">{dataset.coverage}</p></div>
      <div className="download-links">{(['jsonUrl', 'csvUrl', 'schemaUrl'] as const).map(key => <a key={key} href={downloadUrl(dataset[key])} download aria-label={`${dataset.id} · ${key === 'schemaUrl' ? 'JSON Schema' : key === 'csvUrl' ? 'CSV' : 'JSON'}`}>{key === 'schemaUrl' ? 'JSON Schema' : key === 'csvUrl' ? 'CSV' : 'JSON'}</a>)}</div>
      <details className="civic-disclosure"><summary>{c.technicalDetails}</summary><h3>{t.rights}</h3><p lang="en">{dataset.rights}</p><p className="hash">SHA-256: {dataset.sha256}</p>{dataset.sourceIds.map(id => <SourceNote {...props} key={id} id={id} />)}</details>
    </li>)}</ul>
  </>
}

export function Sources(props: CivicProps) {
  const { data, locale } = props
  const t = catalogs[locale], c = civicCatalogs[locale]
  const [query, setQuery] = useState('')
  const [access, setAccess] = useState('')
  const matching = data.portal.sources.filter(source => (!access || source.status.availabilityStatus === access) && [source.name, source.publisher, source.coverage, source.retrievalStatus, source.url].join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase()))
  const availability = [...new Set(data.portal.sources.map(source => source.status.availabilityStatus))]
  return <><PageIntro title={t.sources} /><p className="civic-meta">{t.capture}: {formatDate(data.portal.capturedAt, locale)}</p>
    <div className="directory-tools"><label htmlFor="source-query">{c.sourceSearch}<input id="source-query" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={c.sourcePlaceholder} /></label><label htmlFor="source-access">{c.availability}<select id="source-access" value={access} onChange={event => setAccess(event.target.value)}><option value="">{c.all}</option>{availability.map(value => <option key={value} value={value}>{c[value]}</option>)}</select></label></div>
    <p className="civic-meta" role="status">{formatNumber(matching.length, locale)} {t.records}</p>{!matching.length && <p>{t.noResults}</p>}
    <ul className="directory-grid source-directory">{matching.map(source => <li key={source.id}><h2><a href={props.href(`sources/${encodeURIComponent(source.id)}`)} lang="en">{source.name || source.publisher}</a></h2><p className="civic-meta">{c[source.status.verificationStatus]} · {c[source.status.availabilityStatus]}</p><p lang="en">{source.coverage || String(source.coverageNote)}</p><SourceNote {...props} id={source.id} /></li>)}</ul>
    {data.research && <RawRecord {...props} value={data.research} />}
  </>
}
