import en from './catalogs/civic-en.json'
import fil from './catalogs/civic-fil.json'
import type { Locale } from './locales'

export const civicCatalogs: Record<Locale, Record<keyof typeof en, string>> = { en, fil }
