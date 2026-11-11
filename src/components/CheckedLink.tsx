import type { ComponentProps } from 'react'
import audit from '../data/link-audit.json'
import StatusBadge from './StatusBadge'
import { linkContentStatus } from '../i18n/content-status'
import './work-in-progress.css'
import { lgu } from '../config/lgu'

type Result = { url: string; status: string; reason?: string; checkedAt?: string }
const checked = new Map((audit.links as Result[]).map(row => [row.url.replace(/#.*$/, ''), row]))
export function linkStatus(href: string) {
  if (!/^https?:\/\//.test(href) || /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(href)) return null
  const cleanHref = href.replace(/#.*$/, '')
  const issuePath = `${lgu.repository}/issues/new`
  const auditHref = cleanHref.split('?')[0] === issuePath ? issuePath : cleanHref
  return checked.get(auditHref) ?? { url: href, status: 'unchecked', reason: 'This external link has not been verified.' }
}
export default function CheckedLink({ href = '', children, className, ...props }: ComponentProps<'a'>) {
  const result = linkStatus(href)
  if (result && result.status !== 'ok') return <span className={`${className ?? ''} link-work-in-progress`} aria-disabled="true" data-external-url={href} title={result.reason === 'WorkInProgress' ? undefined : result.reason}>
    {children}<StatusBadge status={linkContentStatus(result.status)} />
  </span>
  return <a {...props} className={className} href={href}>{children}</a>
}
