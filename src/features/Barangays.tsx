import { useState } from 'react'
import { barangayId } from '../domain/ids'
import { rows, type DataRecord } from '../data/loaders'
import { catalogs, formatNumber } from '../i18n/locales'
import { civicCatalogs } from '../i18n/civic'
import { PageIntro, RawRecord, SourceNote, type CivicProps } from './Civic'

export default function Barangays(props: CivicProps & { recordId?: string; correctionLink: (id: string) => string }) {
  const { data, locale, href, recordId, correctionLink } = props
  const t = catalogs[locale], c = civicCatalogs[locale]
  const [query, setQuery] = useState('')
  const [year, setYear] = useState('2020')
  const [sort, setSort] = useState('name')
  const claims = rows(data.barangays.sourceClaims)
  const names = [...new Set(claims.flatMap(claim => Array.isArray(claim.namesAsPublished) ? claim.namesAsPublished as string[] : []))]
  const name = names.find(value => barangayId(value) === recordId)
  const population = data.barangays.secondaryPopulationTable as DataRecord
  const populationRows = rows(population.rows)
  const valueFor = (value: string, referenceYear = year) => {
    const count = populationRows.find(row => row.sourceName === value)?.[`population${referenceYear}`]
    return typeof count === 'number' ? count : null
  }
  const matching = names.filter(value => value.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    .sort((a, b) => sort === 'population' ? (valueFor(b) ?? -1) - (valueFor(a) ?? -1) || a.localeCompare(b, locale) : a.localeCompare(b, locale))
  const maximum = Math.max(1, ...populationRows.map(row => Number(row[`population${year}`]) || 0))
  if (recordId && !name) return <><h1>{t.notFound}</h1><p>{t.notFoundText}</p><code>{recordId}</code><p><a href={href('government/barangays')}>{c.backBarangays}</a></p></>

  return <>
    {name && <p><a href={href('government/barangays')}>{c.backBarangays}</a></p>}
    <PageIntro title={name || t.barangays} />
    <div className="barangay-layout">
      <section aria-labelledby="barangay-population-title">
        <h2 id="barangay-population-title">{c.barangayPopulation}</h2>
        <p className="civic-meta">{c.populationSourceNote}</p>
        {!name && <div className="directory-tools barangay-tools">
          <label htmlFor="barangay-query">{c.barangaySearch}
            <input id="barangay-query" type="search" value={query} placeholder={c.barangayPlaceholder} onChange={event => setQuery(event.target.value)} />
          </label>
          <label htmlFor="barangay-year">{t.period}
            <select id="barangay-year" value={year} onChange={event => setYear(event.target.value)}><option value="2015">2015</option><option value="2020">2020</option></select>
          </label>
          <label htmlFor="barangay-sort">{c.sortBy}
            <select id="barangay-sort" value={sort} onChange={event => setSort(event.target.value)}><option value="name">{c.barangayNameSort}</option><option value="population">{c.barangayPopulationSort}</option></select>
          </label>
        </div>}
        {!name && <p className="civic-meta" role="status">{formatNumber(matching.length, locale)} {c.barangayNames} · {year}</p>}
        {name ? <>
          {valueFor(name) === null ? <div className="civic-empty"><h3>{c.noNamedPopulation}</h3><p>{c.noNamedPopulationNote}</p></div> : <ul className="barangay-bars" aria-label={c.barangayPopulation}>
            {['2015', '2020'].map(referenceYear => <li key={referenceYear}>
              <div className="barangay-bar-label"><span>{referenceYear}</span><strong>{formatNumber(valueFor(name, referenceYear)!, locale)} {c.populationUnit}</strong></div>
              <span className="barangay-bar-track" aria-hidden="true"><span style={{ width: `${valueFor(name, referenceYear)! / Math.max(valueFor(name, '2015')!, valueFor(name, '2020')!, 1) * 100}%` }} /></span>
            </li>)}
          </ul>}
          {claims.filter(claim => (claim.namesAsPublished as string[] | null)?.includes(name)).map(claim => <SourceNote {...props} key={String(claim.sourceId)} id={String(claim.sourceId)} />)}
          <p><a href={correctionLink(recordId!)}>{t.correction}</a></p>
        </> : <>
          {!matching.length && <p>{t.noResults}</p>}
          <ul className="barangay-bars">{matching.map(value => {
            const count = valueFor(value)
            return <li key={value}><a href={href(`government/barangays/${encodeURIComponent(barangayId(value))}`)}>
              <span className="barangay-bar-label"><strong lang="en">{value}</strong><span>{count === null ? c.coverageMissing : formatNumber(count, locale)}</span></span>
              {count !== null && <span className="barangay-bar-track" aria-hidden="true"><span style={{ width: `${count / maximum * 100}%` }} /></span>}
            </a></li>
          })}</ul>
          <SourceNote {...props} id={String(population.sourceId)} />
        </>}
      </section>
    </div>
    <RawRecord {...props} value={name ? { sourceClaims: claims.filter(claim => (claim.namesAsPublished as string[] | null)?.includes(name)), population: populationRows.find(row => row.sourceName === name) ?? null } : data.barangays} />
  </>
}
