import { useContext } from 'react'
import { LocaleContext } from '../i18n/LocaleContext'
import { contentStatusLabel, type ContentStatus } from '../i18n/content-status'
import type { Locale } from '../i18n/locales'
import './work-in-progress.css'

export default function StatusBadge({ status, locale }: { status: ContentStatus; locale?: Locale }) {
  const contextLocale = useContext(LocaleContext)
  const language = locale ?? contextLocale
  return <span className="work-in-progress-label" lang={language} data-content-status={status}>{contentStatusLabel(status, language)}</span>
}
