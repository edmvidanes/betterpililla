import type { Locale } from '../i18n/locales'
import { contentStatusLabel, type ContentStatus } from '../i18n/content-status'
import './work-in-progress.css'

export default function WorkInProgress({ locale, children, status = 'pending' }: { locale: Locale; children?: string; status?: ContentStatus }) {
  return <section className="work-in-progress" aria-label={contentStatusLabel(status, locale)}>
    <h2>{contentStatusLabel(status, locale)}</h2>
    <p>{children ?? (locale === 'fil' ? 'Wala pang naberipikang nilalaman para sa seksyong ito. Ilalathala ang mga tala kapag nasuri na ang mga sanggunian.' : 'Verified content is not available for this section yet. Records will appear after the sources have been checked.')}</p>
  </section>
}
