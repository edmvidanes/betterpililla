import type { Locale } from '../i18n/locales'
import './work-in-progress.css'

export default function WorkInProgress({ locale, children }: { locale: Locale; children?: string }) {
  return <section className="work-in-progress" aria-label="WorkInProgress">
    <h2 lang="en">WorkInProgress</h2>
    <p>{children ?? (locale === 'fil' ? 'Wala pang naberipikang nilalaman para sa seksyong ito. Ilalathala ang mga tala kapag nasuri na ang mga sanggunian.' : 'Verified content is not available for this section yet. Records will appear after the sources have been checked.')}</p>
  </section>
}
