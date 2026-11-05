import type { Locale } from '../i18n/locales'
import { catalogs } from '../i18n/locales'
import { collectionItems } from '../data/collection-plan'
import CheckedLink from './CheckedLink'
import './work-in-progress.css'

export default function WorkInProgress({ locale, children, path }: { locale: Locale; children?: string; path?: string }) {
  const items = collectionItems.filter(item => path === item.path || path?.startsWith(item.path + '/'))
  const planHref = `${import.meta.env.BASE_URL}${locale}/collection-plan`
  return <section className="work-in-progress" aria-label="WorkInProgress">
    <h2 lang="en">WorkInProgress</h2>
    <p>{children ?? (locale === 'fil' ? 'Wala pang naberipikang nilalaman para sa seksyong ito. Ilalathala ang mga tala kapag nasuri na ang mga sanggunian.' : 'Verified content is not available for this section yet. Records will appear after the sources have been checked.')}</p>
    {items.length > 0 && <ul>{items.map(item => <li key={item.id}><strong>{item.title[locale]}:</strong> {item.records[locale]} <CheckedLink href={`${planHref}#collect-${item.id}`}>{locale === 'fil' ? 'Yugto' : 'Phase'} {item.phase}</CheckedLink></li>)}</ul>}
    <p className="collection-plan-link"><CheckedLink href={planHref}>{catalogs[locale].collectionPlan}</CheckedLink></p>
  </section>
}
