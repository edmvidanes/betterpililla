import type { ComponentProps } from 'react'
import audit from '../data/link-audit.json'
import './work-in-progress.css'

type Result = { url: string; status: string; reason?: string }
const checked = new Map((audit.links as Result[]).map(row => [row.url.replace(/#.*$/, ''), row]))
export function linkStatus(href: string) {
  if (!/^https?:\/\//.test(href) || /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(href)) return null
  return checked.get(href.replace(/#.*$/, '')) ?? { url: href, status: 'unchecked', reason: 'This external link has not been verified.' }
}
export default function CheckedLink({ href = '', children, className, ...props }: ComponentProps<'a'>) {
  const result = linkStatus(href)
  if (result && result.status !== 'ok') return <span className={`${className ?? ''} link-work-in-progress`} aria-disabled="true" data-external-url={href} title={result.reason}>
    {children}<span className="work-in-progress-label" lang="en">WorkInProgress</span>
  </span>
  return <a {...props} className={className} href={href}>{children}</a>
}
