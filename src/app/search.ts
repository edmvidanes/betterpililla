import type { SearchRow } from '../domain/types'
import { catalogs, type Locale } from '../i18n/locales'
import { routes } from './route-manifest'

export function searchPortal(rows: SearchRow[], query: string, locale: Locale): SearchRow[] {
  const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean)
  const matches = (text: string) => terms.every(term => text.toLocaleLowerCase().includes(term))
  const pages = routes.filter(([path]) => path !== 'search').map(([path, key]) => ({
    id: `page:${path}`, title: catalogs[locale][key], path, type: 'page', sourceIds: [],
    text: `${path.replaceAll('/', ' ')} ${catalogs.en[key]} ${catalogs.fil[key]}`,
  })).filter(row => matches(`${row.title} ${row.text}`))
  const pagePaths = new Set(pages.map(page => page.path.replace(/^\//, '')))
  const records = rows.filter(row => !pagePaths.has(row.path.replace(/^\//, '')) && matches(`${row.title} ${row.text} ${row.sourceIds?.join(' ')}`))
  const titleMatches = (row: SearchRow) => matches(row.title)
  return [...pages, ...records.filter(titleMatches), ...records.filter(row => !titleMatches(row))]
}
