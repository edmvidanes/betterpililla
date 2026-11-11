import type { Locale } from './locales'

export type ContentStatus = 'pending' | 'validation' | 'unavailable'
const labels: Record<Locale, Record<ContentStatus, string>> = {
  en: { pending: 'Records pending', validation: 'Needs validation', unavailable: 'Unavailable' },
  fil: { pending: 'Kulang pa ang tala', validation: 'Kailangan pang beripikahin', unavailable: 'Hindi ma-access' },
}
export const contentStatusLabel = (status: ContentStatus, locale: Locale) => labels[locale][status]
export const linkContentStatus = (status: string): ContentStatus => status === 'unchecked' ? 'validation' : 'unavailable'
