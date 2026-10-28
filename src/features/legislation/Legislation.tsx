import { useEffect, useMemo, useState } from 'react'
import { Button } from '@bettergov/kapwa/button'
import en from '../../i18n/catalogs/legislation-en.json'
import fil from '../../i18n/catalogs/legislation-fil.json'

export interface LegislationRecord {
  recordId: string
  documentType: string
  documentNumber: string
  publicationStatus: string | null
  title: string
  authorText: string
  committeeText: string | null
  sourceDateLabel: string
  sourceDate: string
  documentUrl: string
  sourceRecordOrder: number
  sourceId: string
  verificationStatus: string
  sourceIndexUrl?: string
  sourceFeedUrl?: string
  retrievedAt?: string
  sourceFeedSha256?: string
}

interface LegislationProps {
  locale: 'en' | 'fil'
  records: LegislationRecord[]
  recordId?: string
  href: (path: string) => string
  sourceLink: (sourceId: string) => string
  correctionLink: (recordId: string) => string
}

const legislationLabels = { en, fil }

type Labels = typeof legislationLabels.en
const PAGE_SIZE = 25
const INDEX_PATH = '/open-lgu/legislation'
const FILTER_KEYS = ['q', 'type', 'number', 'year', 'author', 'topic', 'from', 'to', 'source'] as const
type FilterKey = typeof FILTER_KEYS[number]
type Filters = Record<FilterKey, string>
const EMPTY_FILTERS: Filters = { q: '', type: '', number: '', year: '', author: '', topic: '', from: '', to: '', source: '' }

function readQuery(): { filters: Filters; page: number } {
  const params = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search)
  const filters = { ...EMPTY_FILTERS }
  for (const key of FILTER_KEYS) filters[key] = params.get(key) ?? ''
  const page = Number(params.get('page') || 1)
  return { filters, page: Number.isSafeInteger(page) && page > 0 ? page : 1 }
}

function typeGroup(type: string): string {
  const value = type.toLowerCase().trim()
  if (value === 'ordinance' || value === 'resolution') return value
  if (/^executive[-_ ]?orders?$/.test(value) || value === 'eo') return 'executive-order'
  return 'other'
}

function matchingIndex(records: LegislationRecord[]) {
  const titles = new Map<string, LegislationRecord[]>()
  const numbers = new Map<string, LegislationRecord[]>()
  const attachments = new Map<string, LegislationRecord[]>()
  function add(map: Map<string, LegislationRecord[]>, key: string, record: LegislationRecord) {
    const bucket = map.get(key)
    if (bucket) bucket.push(record)
    else map.set(key, [record])
  }
  for (const record of records) {
    if (record.title) add(titles, record.title, record)
    if (record.documentNumber) add(numbers, JSON.stringify([record.documentType, record.documentNumber]), record)
    if (record.documentUrl) add(attachments, record.documentUrl, record)
  }
  return (record: LegislationRecord) => {
    const matches = new Map<string, LegislationRecord>()
    const groups = [titles.get(record.title), numbers.get(JSON.stringify([record.documentType, record.documentNumber])), attachments.get(record.documentUrl)]
    for (const group of groups) {
      for (const candidate of group ?? []) {
        if (candidate.recordId !== record.recordId) matches.set(candidate.recordId, candidate)
      }
    }
    return [...matches.values()]
  }
}

function matchDescription(record: LegislationRecord, candidate: LegislationRecord, text: Labels) {
  const title = Boolean(record.title) && record.title === candidate.title
  const number = Boolean(record.documentNumber) && record.documentNumber === candidate.documentNumber && record.documentType === candidate.documentType
  const attachment = Boolean(record.documentUrl) && record.documentUrl === candidate.documentUrl
  if (title && number && attachment) return text.exactDuplicate
  return [title && text.sharedTitle, number && text.sharedNumber, attachment && text.sharedAttachment].filter(Boolean).join(' · ')
}

function RelatedRows({ record, matches, text, href }: { record: LegislationRecord; matches: LegislationRecord[]; text: Labels; href: LegislationProps['href'] }) {
  return (
    <ul className="record-list">
      {matches.map((candidate) => (
        <li key={candidate.recordId} className="min-w-0 break-words">
          <a href={href(`${INDEX_PATH}/${encodeURIComponent(candidate.recordId)}`)}>
            {candidate.documentNumber || candidate.recordId} · {candidate.sourceId} · {text.row} {candidate.sourceRecordOrder}
          </a>
          <p className="muted">{matchDescription(record, candidate, text)}</p>
        </li>
      ))}
    </ul>
  )
}

function LegislationIndex({ locale, records, href, sourceLink }: LegislationProps) {
  const text = legislationLabels[locale]
  const [{ filters, page }, setQuery] = useState(readQuery)
  const [advancedOpen, setAdvancedOpen] = useState(() => ['number', 'author', 'topic', 'from', 'to', 'source'].some(key => Boolean(readQuery().filters[key as FilterKey])))
  const formatNumber = new Intl.NumberFormat(locale === 'fil' ? 'fil-PH' : 'en-PH')
  const sources = useMemo(() => [...new Set(records.map((record) => record.sourceId))].sort(), [records])
  const years = useMemo(() => [...new Set(records.map((record) => record.sourceDate.slice(0, 4)).filter((year) => /^\d{4}$/.test(year)))].sort().reverse(), [records])
  const getMatches = useMemo(() => matchingIndex(records), [records])
  const searchableRows = useMemo(() => records.map((record) => ({
    record,
    searchText: [record.title, record.documentNumber, record.authorText, record.committeeText, record.sourceDateLabel, record.sourceId, record.recordId].join('\n').toLowerCase(),
    number: record.documentNumber.toLowerCase(),
    author: record.authorText.toLowerCase(),
    topic: `${record.committeeText ?? ''}\n${record.title}`.toLowerCase(),
  })), [records])
  const filtered = useMemo(() => {
    const query = filters.q.trim().toLowerCase()
    const number = filters.number.trim().toLowerCase()
    const author = filters.author.trim().toLowerCase()
    const topic = filters.topic.trim().toLowerCase()
    return searchableRows.filter(({ record, searchText, number: recordNumber, author: recordAuthor, topic: recordTopic }) => (
      (!query || searchText.includes(query)) &&
      (!filters.type || typeGroup(record.documentType) === filters.type) &&
      (!number || recordNumber.includes(number)) &&
      (!filters.year || record.sourceDate.startsWith(`${filters.year}-`)) &&
      (!author || recordAuthor.includes(author)) &&
      (!topic || recordTopic.includes(topic)) &&
      (!filters.from || Boolean(record.sourceDate) && record.sourceDate >= filters.from) &&
      (!filters.to || Boolean(record.sourceDate) && record.sourceDate <= filters.to) &&
      (!filters.source || record.sourceId === filters.source)
    )).map(({ record }) => record)
  }, [filters, searchableRows])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * PAGE_SIZE
  const visible = filtered.slice(start, start + PAGE_SIZE)

  useEffect(() => {
    const url = new URL(window.location.href)
    for (const key of FILTER_KEYS) {
      if (filters[key]) url.searchParams.set(key, filters[key])
      else url.searchParams.delete(key)
    }
    if (currentPage > 1) url.searchParams.set('page', String(currentPage))
    else url.searchParams.delete('page')
    window.history.replaceState(window.history.state, '', url)
  }, [filters, currentPage])

  useEffect(() => {
    const update = () => setQuery(readQuery())
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])

  function updateFilter(key: FilterKey, value: string) {
    setQuery((current) => ({ filters: { ...current.filters, [key]: value }, page: 1 }))
  }

  return (
    <>
      <h1>{text.title}</h1>
      <section className="legislation-search" aria-labelledby="legislation-filters">
        <h2 id="legislation-filters">{text.filters}</h2>
        <form onSubmit={(event) => event.preventDefault()}>
          <div className="legislation-primary">
            <label className="legislation-query" htmlFor="legislation-query">{text.query}
              <input id="legislation-query" name="q" type="search" placeholder={text.queryPlaceholder} aria-describedby="legislation-filter-hint" value={filters.q} onChange={(event) => updateFilter('q', event.target.value)} />
            </label>
            <label htmlFor="legislation-type">{text.type}
              <select id="legislation-type" name="type" value={filters.type} onChange={(event) => updateFilter('type', event.target.value)}>
                <option value="">{text.all}</option>
                <option value="ordinance">{text.ordinance}</option>
                <option value="resolution">{text.resolution}</option>
                <option value="executive-order">{text.executiveOrder}</option>
                <option value="other">{text.other}</option>
                {filters.type && !['ordinance', 'resolution', 'executive-order', 'other'].includes(filters.type) && <option value={filters.type}>{filters.type}</option>}
              </select>
            </label>
            <label htmlFor="legislation-year">{text.year}
              <select id="legislation-year" name="year" value={filters.year} onChange={(event) => updateFilter('year', event.target.value)}>
                <option value="">{text.all}</option>
                {filters.year && !years.includes(filters.year) && <option value={filters.year}>{filters.year}</option>}
                {years.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </label>
          </div>
          <p id="legislation-filter-hint" className="civic-meta">{text.filterHint}</p>
          <details className="civic-disclosure" open={advancedOpen} onToggle={event => setAdvancedOpen(event.currentTarget.open)}>
            <summary>{text.advancedFilters}</summary>
            <div className="field-grid">
            <label htmlFor="legislation-number">{text.number}
              <input id="legislation-number" name="number" value={filters.number} onChange={(event) => updateFilter('number', event.target.value)} />
            </label>
            <label htmlFor="legislation-author">{text.author}
              <input id="legislation-author" name="author" value={filters.author} onChange={(event) => updateFilter('author', event.target.value)} />
            </label>
            <label htmlFor="legislation-topic">{text.topic}
              <input id="legislation-topic" name="topic" value={filters.topic} onChange={(event) => updateFilter('topic', event.target.value)} />
            </label>
            <label htmlFor="legislation-from">{text.from}
              <input id="legislation-from" name="from" type="date" value={filters.from} max={filters.to || undefined} onChange={(event) => updateFilter('from', event.target.value)} />
            </label>
            <label htmlFor="legislation-to">{text.to}
              <input id="legislation-to" name="to" type="date" value={filters.to} min={filters.from || undefined} onChange={(event) => updateFilter('to', event.target.value)} />
            </label>
            <label htmlFor="legislation-source">{text.source}
              <select id="legislation-source" name="source" value={filters.source} onChange={(event) => updateFilter('source', event.target.value)}>
                <option value="">{text.all}</option>
                {filters.source && !sources.includes(filters.source) && <option value={filters.source}>{filters.source}</option>}
                {sources.map((source) => <option key={source} value={source}>{source}</option>)}
              </select>
            </label>
          </div>
          </details>
          <Button type="button" variant="outline" onClick={() => setQuery({ filters: { ...EMPTY_FILTERS }, page: 1 })}>{text.reset}</Button>
        </form>
        {filters.from && filters.to && filters.from > filters.to && <p className="notice" role="status">{text.datesReversed}</p>}
      </section>
      <details className="civic-disclosure"><summary>{text.coverageTitle}</summary><p>{text.coverage}</p></details>
      <section aria-labelledby="legislation-results">
        <h2 id="legislation-results">{text.results}</h2>
        <p role="status" aria-live="polite" aria-atomic="true">
          {formatNumber.format(filtered.length)} {text.of} {formatNumber.format(records.length)} {text.matching}.
          {filtered.length > 0 && <> {text.showing} {formatNumber.format(start + 1)} {text.through} {formatNumber.format(Math.min(start + PAGE_SIZE, filtered.length))}.</>}
        </p>
        {visible.length === 0 ? <p className="notice">{records.length ? text.noResults : text.noRows}</p> : (
          <ul className="record-list">
            {visible.map((record) => {
              const matches = getMatches(record)
              return (
                <li key={record.recordId} className="min-w-0">
                  <p className="muted break-words">{record.documentType} · {record.documentNumber} · {record.sourceDateLabel}</p>
                  <h3 className="break-words [overflow-wrap:anywhere]">
                    <a href={href(`${INDEX_PATH}/${encodeURIComponent(record.recordId)}`)} className="whitespace-pre-wrap">{record.title || record.recordId}</a>
                  </h3>
                  <p className="muted">{text.original}. {text.untranslated}</p>
                  <p className="whitespace-pre-wrap break-words">{text.author}: {record.authorText || text.notSupplied}</p>
                  <p className="whitespace-pre-wrap break-words">{text.committee}: {record.committeeText || text.notSupplied}</p>
                  <p className="muted break-words"><a href={sourceLink(record.sourceId)}>{record.sourceId}</a> · {text.row} {record.sourceRecordOrder}</p>
                  {matches.length > 0 && <details><summary>{text.related} ({formatNumber.format(matches.length)})</summary><RelatedRows record={record} matches={matches} text={text} href={href} /></details>}
                </li>
              )
            })}
          </ul>
        )}
        <nav aria-label={text.pagination} className="mt-6 flex flex-wrap items-center gap-4">
          <Button type="button" variant="outline" disabled={currentPage <= 1} onClick={() => setQuery((current) => ({ ...current, page: currentPage - 1 }))}>{text.previous}</Button>
          <span>{text.page} {formatNumber.format(currentPage)} {text.of} {formatNumber.format(totalPages)}</span>
          <Button type="button" variant="outline" disabled={currentPage >= totalPages} onClick={() => setQuery((current) => ({ ...current, page: currentPage + 1 }))}>{text.next}</Button>
        </nav>
      </section>
    </>
  )
}

export default function Legislation(props: LegislationProps) {
  const { locale, records, recordId, href, sourceLink, correctionLink } = props
  const text = legislationLabels[locale]
  if (recordId === undefined) return <LegislationIndex {...props} />
  const record = records.find((candidate) => candidate.recordId === recordId)
  if (!record) {
    return (
      <section className="panel">
        <h1>{text.notFound}</h1>
        <p>{text.notFoundNote}</p>
        <p className="break-words [overflow-wrap:anywhere]">{text.recordId}: <code>{recordId}</code></p>
        <p><a href={href(INDEX_PATH)}>{text.back}</a></p>
        <p><a href={`${href('/search')}?q=${encodeURIComponent(recordId)}`}>{text.search}</a></p>
      </section>
    )
  }
  const matches = matchingIndex(records)(record)
  const metadata: [string, string | null][] = [
    [text.recordId, record.recordId],
    [text.type, record.documentType],
    [text.number, record.documentNumber],
    [text.publication, record.publicationStatus],
    [text.author, record.authorText],
    [text.committee, record.committeeText],
    [text.sourceDate, record.sourceDateLabel],
    [text.normalizedDate, record.sourceDate],
    [text.source, record.sourceId],
    [text.row, String(record.sourceRecordOrder)],
  ]
  return (
    <>
      <p><a href={href(INDEX_PATH)}>{text.back}</a></p>
      <h1 className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{record.title || record.recordId}</h1>
      <p className="notice">{text.original}. {text.untranslated}</p>
      <section className="panel" aria-labelledby="legislation-metadata">
        <h2 id="legislation-metadata">{text.metadata}</h2>
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[minmax(10rem,1fr)_3fr]">
          {metadata.map(([label, value]) => <div key={label} className="contents"><dt className="font-semibold">{label}</dt><dd className="m-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{value || text.notSupplied}</dd></div>)}
        </dl>
      </section>
      <section className="panel" aria-labelledby="legislation-evidence">
        <h2 id="legislation-evidence">{text.evidence}</h2>
        <h3>{text.verification}</h3>
        <p className="break-words">{record.verificationStatus || text.notSupplied}</p>
        <p>{text.verificationNote}</p>
        <h3>{text.availability}</h3>
        <p>{record.documentUrl ? text.availabilityNote : text.noAttachmentNote}</p>
        {record.documentUrl && !/\.pdf(?:$|[?#])/i.test(record.documentUrl) && <p className="notice">{text.nonPdf}</p>}
        <h3>{text.freshness}</h3>
        <p>{text.freshnessNote}</p>
        <p>{text.captured}: {record.retrievedAt || text.notSupplied}</p>
        <ul className="record-list">
          <li>{record.documentUrl ? <a href={record.documentUrl}>{text.attachment}</a> : text.attachmentMissing}</li>
          {record.sourceIndexUrl && <li><a href={record.sourceIndexUrl}>{text.index}</a></li>}
          {record.sourceFeedUrl && <li><a href={record.sourceFeedUrl}>{text.feed}</a></li>}
          <li><a href={sourceLink(record.sourceId)}>{text.evidenceLink}: {record.sourceId}</a></li>
        </ul>
        <p className="break-words [overflow-wrap:anywhere]">{text.hash}: <code>{record.sourceFeedSha256 || text.notSupplied}</code></p>
      </section>
      {matches.length > 0 && (
        <section className="panel" aria-labelledby="legislation-related">
          <h2 id="legislation-related">{text.related}</h2>
          <p>{text.relatedNote}</p>
          <RelatedRows record={record} matches={matches} text={text} href={href} />
        </section>
      )}
      <p><a href={correctionLink(record.recordId)}>{text.correction}</a></p>
    </>
  )
}
