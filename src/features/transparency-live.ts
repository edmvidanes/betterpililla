import { lgu } from '../config/lgu'

// Live, read-only queries against the shared BetterGov PH search
// (search2.bettergov.ph), the same central index BetterLB uses.
// Procurement is pinned to the exact PhilGEPS organization name for
// Pililla; DPWH projects must mention Pililla in the description.
// If the host is unreachable the caller shows an unavailable state —
// records are never substituted from another municipality.

export interface PhilgepsDoc {
  id: string
  reference_id: string
  contract_no?: string
  award_title: string
  notice_title?: string
  awardee_name?: string
  organization_name: string
  area_of_delivery?: string
  business_category?: string
  contract_amount?: number | string
  award_date?: string
  award_status?: string
}

export interface DpwhDoc {
  contractId: string
  description: string
  category?: string
  status?: string
  budget?: number
  amountPaid?: number
  progress?: number
  contractor?: string
  infraYear?: string
  programName?: string
  sourceOfFunds?: string
  startDate?: string
  completionDate?: string
  location?: { province?: string; region?: string }
}

const TIMEOUT_MS = 12000

async function search<T>(index: string, body: Record<string, unknown>): Promise<{ hits: T[]; total: number }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(`${lgu.transparency.searchHost}/indexes/${index}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${lgu.transparency.searchKey}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`search ${index}: HTTP ${response.status}`)
    const payload = await response.json() as { hits: T[]; estimatedTotalHits?: number }
    return { hits: payload.hits || [], total: payload.estimatedTotalHits ?? (payload.hits || []).length }
  } finally {
    clearTimeout(timer)
  }
}

export function fetchPilillaProcurement(limit = 100) {
  return search<PhilgepsDoc>('philgeps', {
    q: '',
    limit,
    filter: [`organization_name = "${lgu.transparency.procurementOrganization}"`],
    sort: ['award_date:desc'],
  })
}

export function isPilillaProject(doc: DpwhDoc) {
  return /\bpililla\b/i.test(doc.description || '')
}

export async function fetchPilillaProjects(limit = 100) {
  const result = await search<DpwhDoc>('dpwh', { q: 'Pililla', limit })
  const hits = result.hits.filter(isPilillaProject)
  return { hits, total: hits.length }
}

export async function fetchTransparencyRecord(projects: boolean, recordId: string) {
  if (projects) {
    const result = await search<DpwhDoc>('dpwh', { q: recordId, limit: 10 })
    return result.hits.find(doc => doc.contractId === recordId) || null
  }
  const result = await search<PhilgepsDoc>('philgeps', {
    q: recordId,
    limit: 10,
    filter: [`organization_name = "${lgu.transparency.procurementOrganization}"`],
  })
  return result.hits.find(doc => doc.id === recordId || doc.reference_id === recordId) || null
}
