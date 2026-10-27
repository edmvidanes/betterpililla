import { useMemo, useState, type RefObject } from 'react'
import type { DataPack } from '../data/loaders'
import { searchPortal } from '../app/search'
import { catalogs, type Locale } from '../i18n/locales'
import './search-palette.css'

export default function SearchPalette({ dialog, data, error, locale, href }: {
  dialog: RefObject<HTMLDialogElement | null>; data: DataPack | null; error: boolean
  locale: Locale; href: (path: string) => string
}) {
  const t = catalogs[locale]
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const results = useMemo(() => {
    if (!query.trim() || !data) return []
    return searchPortal(data.portal.search, query, locale).slice(0, 30)
  }, [data, query, locale])
  const select = (index: number) => {
    setActive(index)
    document.getElementById(`palette-result-${index}`)?.scrollIntoView({ block: 'nearest' })
  }
  return <dialog ref={dialog} className="search-dialog" aria-label={t.search} onClose={() => { setQuery(''); setActive(0) }}>
    <div className="palette-input-row">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
      <input type="search" role="combobox" aria-label={t.query} placeholder={t.query} aria-expanded={results.length > 0} aria-controls="palette-results" aria-activedescendant={results[active] ? `palette-result-${active}` : undefined} value={query} onChange={event => { setQuery(event.target.value); setActive(0) }} onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); dialog.current?.close() }
        if (event.key === 'ArrowDown' && results.length) { event.preventDefault(); select((active + 1) % results.length) }
        if (event.key === 'ArrowUp' && results.length) { event.preventDefault(); select((active - 1 + results.length) % results.length) }
        if (event.key === 'Enter' && results[active]) { event.preventDefault(); location.assign(href(results[active].path)) }
      }} />
      <button type="button" className="palette-close" aria-label={t.closeSearch} onClick={() => dialog.current?.close()}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
    </div>
    <div className="palette-body">
      {!data ? <p className="palette-message" role="status">{error ? t.loadError : t.loading}</p> : !query.trim() ? <p className="palette-message">{t.searchPrompt}</p> : !results.length ? <p className="palette-message" role="status">{t.noResults}</p> : <ul id="palette-results" role="listbox" aria-label={t.search}>
        {results.map((row, index) => <li id={`palette-result-${index}`} role="option" aria-selected={index === active} key={`${row.type}:${row.id}`} onMouseMove={() => setActive(index)}><a href={href(row.path)} tabIndex={-1}><span className="palette-result-type">{row.type === 'page' ? t.searchPage : row.type}</span><span className="palette-result-title">{row.title}</span><span className="palette-arrow" aria-hidden="true">→</span></a></li>)}
      </ul>}
      {query.trim() && data && <a className="palette-all" href={`${href('search')}?q=${encodeURIComponent(query)}`}>{t.searchAll} <span aria-hidden="true">→</span></a>}
    </div>
    <div className="palette-footer"><span><kbd>↑</kbd> <kbd>↓</kbd> {t.searchNavigate}</span><span><kbd>↵</kbd> {t.searchSelect}</span><span><kbd>esc</kbd> {t.searchDismiss}</span></div>
  </dialog>
}
