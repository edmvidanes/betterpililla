import { useState, type Dispatch, type SetStateAction } from 'react'
import { catalogs, formatNumber, type Locale } from '../i18n/locales'
import './Pagination.css'

export function usePagination<T>(items: T[], resetKey = '') {
  const [state, setState] = useState({ page: 1, resetKey })
  if (state.resetKey !== resetKey) setState({ page: 1, resetKey })
  const pages = Math.max(1, Math.ceil(items.length / 20))
  const page = state.resetKey === resetKey ? Math.min(state.page, pages) : 1
  const setPage: Dispatch<SetStateAction<number>> = value => setState(current => {
    const previous = current.resetKey === resetKey ? Math.min(current.page, pages) : 1
    const next = typeof value === 'function' ? value(previous) : value
    return { page: Math.max(1, Math.min(next, pages)), resetKey }
  })
  return { visible: items.slice((page - 1) * 20, page * 20), page, pages, setPage }
}

export function Pagination({ page, pages, setPage, locale, label }: {
  page: number; pages: number; setPage: Dispatch<SetStateAction<number>>; locale: Locale; label: string
}) {
  if (pages <= 1) return null
  const t = catalogs[locale]
  return <nav className="pagination-controls" aria-label={label}>
    <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>{t.previous}</button>
    <span aria-live="polite">{locale === 'fil' ? 'Pahina' : 'Page'} {formatNumber(page, locale)} {locale === 'fil' ? 'ng' : 'of'} {formatNumber(pages, locale)}</span>
    <button type="button" disabled={page === pages} onClick={() => setPage(page + 1)}>{t.next}</button>
  </nav>
}
