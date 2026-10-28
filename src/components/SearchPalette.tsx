import { useMemo, useState, type RefObject } from 'react'
import type { DataPack } from '../data/loaders'
import { searchPortal } from '../app/search'
import { catalogs, type Locale } from '../i18n/locales'
import './search-palette.css'
function ResultIcon({ type, label }: { type: string; label: string }) {
  return <svg className="palette-result-type" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label={label}>
    {type === 'source' ? <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></> : type === 'legislation' ? <><path d="M12 3v17M5 21h14M4 7h16M7 7l-4 7h8L7 7Zm10 0-4 7h8l-4-7Z" /></> : <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h4M9 12h6M9 16h6" /></>}
  </svg>
}


export default function SearchPalette({ dialog, search, error, locale, href }: {
  dialog: RefObject<HTMLDialogElement | null>; search: DataPack['search'] | null; error: boolean
  locale: Locale; href: (path: string) => string
}) {
  const t = catalogs[locale]
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const results = useMemo(() => {
    if (!query.trim() || !search) return []
    return searchPortal(search, query, locale).slice(0, 30)
  }, [search, query, locale])
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
      {!search ? <p className="palette-message" role="status">{error ? t.loadError : t.loading}</p> : !query.trim() ? <p className="palette-message">{t.searchPrompt}</p> : !results.length ? <p className="palette-message" role="status">{t.noResults}</p> : <ul id="palette-results" role="listbox" aria-label={t.search}>
        {results.map((row, index) => <li id={`palette-result-${index}`} role="option" aria-selected={index === active} key={`${row.type}:${row.id}`} onMouseMove={() => setActive(index)}><a href={href(row.path)} tabIndex={-1}><ResultIcon type={row.type} label={row.type === 'page' ? t.searchPage : row.type} /><span className="palette-result-title">{row.title}</span><span className="palette-arrow" aria-hidden="true">→</span></a></li>)}
      </ul>}
      {query.trim() && search && <a className="palette-all" href={`${href('search')}?q=${encodeURIComponent(query)}`}>{t.searchAll} <span aria-hidden="true">→</span></a>}
    </div>
    <div className="palette-footer"><span><kbd>↑</kbd> <kbd>↓</kbd> {t.searchNavigate}</span><span><kbd>↵</kbd> {t.searchSelect}</span><span><kbd>esc</kbd> {t.searchDismiss}</span></div>
  </dialog>
}
