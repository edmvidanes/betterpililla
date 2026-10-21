import en from './catalogs/en.json'
import fil from './catalogs/fil.json'
export type Locale = 'en' | 'fil'
export type MessageKey = keyof typeof en
export const catalogs: Record<Locale, Record<MessageKey, string>> = { en, fil }
export const languageTag = (locale: Locale) => locale === 'fil' ? 'fil-PH' : 'en-PH'
export const formatNumber = (value: number, locale: Locale) => new Intl.NumberFormat(languageTag(locale)).format(value)
export function formatDate(value: string, locale: Locale) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return value
  return new Intl.DateTimeFormat(languageTag(locale), { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value))
}
