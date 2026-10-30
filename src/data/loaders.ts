import { lgu } from '../config/lgu'
import type { Json, Portal, SearchRow } from '../domain/types'

// Canonical evidence has source-specific shapes; recursive rendering preserves their original fields.
export type EvidenceValue = Json
export type DataRecord = Record<string, EvidenceValue>
export const rows = (value: EvidenceValue | undefined): DataRecord[] => Array.isArray(value) ? value as DataRecord[] : []
export interface DataPack {
  portal: Portal; municipality: DataRecord; barangays: DataRecord; officials: DataRecord;
  contacts: DataRecord; services: DataRecord; sectors: DataRecord; transparency: DataRecord;
  ordinances: DataRecord; resolutions: DataRecord; research: DataRecord | null
  search: SearchRow[]; legislationIndex: DataRecord; legislationDetail: DataRecord | null
}
const files = {
  municipality: 'municipality.json', barangays: 'barangays.json', officials: 'officials.json',
  contacts: 'emergency-contacts.json', services: 'services.json', sectors: 'sector-inventory.json',
  transparency: 'transparency.json', ordinances: 'legislation/service-index.json', resolutions: 'legislation/resolutions.json',
} as const
type Dataset = keyof typeof files

function datasetsForRoute(route: string): Dataset[] {
  if (!route || route === 'about' || route === 'map' || route === 'statistics/demographics' || route === 'statistics/competitiveness') return ['municipality']
  if (route === 'services') return ['services', 'ordinances', 'contacts']
  if (route.startsWith('services/')) return ['services', 'ordinances']
  if (route === 'government/officials' || route.startsWith('government/officials/') || route === 'government/committees') return ['officials']
  if (route === 'government/offices' || route.startsWith('government/offices/')) return ['contacts']
  if (route === 'government/barangays' || route.startsWith('government/barangays/')) return ['barangays']
  if (route === 'statistics/municipal-income' || route.startsWith('transparency/')) return ['transparency']
  if (route === 'places') return ['sectors', 'contacts']
  if (route === 'advisories') return ['sectors']
  return []
}

async function fetchData(file: string) {
  const response = await fetch(`${import.meta.env.BASE_URL}${lgu.dataPath}/${file}`)
  if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`)
  return response.json()
}

let searchPromise: Promise<SearchRow[]> | undefined
export function loadSearch(): Promise<SearchRow[]> {
  if (!searchPromise) searchPromise = fetchData('search-index.json').catch(error => { searchPromise = undefined; throw error })
  return searchPromise
}

export async function loadData(route: string): Promise<DataPack> {
  const needed = datasetsForRoute(route)
  const legislationRoute = route === 'open-lgu/legislation' || route.startsWith('open-lgu/legislation/')
  const [portal, values, research, search, legislationIndex] = await Promise.all([
    fetchData('portal.json'),
    Promise.all(needed.map(key => fetchData(route === 'services' && key === 'services' ? 'services-index.json' : files[key]))),
    route === 'sources' ? fetch(`${import.meta.env.BASE_URL}${lgu.dataPath}/research-updates.json`).then(response => response.ok && response.headers.get('content-type')?.includes('json') ? response.json() : null) : null,
    route === 'search' || route.startsWith('sources/') ? loadSearch() : [],
    legislationRoute ? fetchData('legislation/index.json') as Promise<DataRecord> : Promise.resolve({} as DataRecord),
  ])
  const recordId = route.startsWith('open-lgu/legislation/') ? route.slice('open-lgu/legislation/'.length) : null
  const record = recordId ? rows(legislationIndex.records).find(row => row.recordId === recordId) : undefined
  const legislationDetail = record ? await fetchData(`legislation/records/${record.documentType}-${record.sourceRecordOrder}.json`) : null
  const datasets = Object.fromEntries(needed.map((key, index) => [key, values[index]]))
  return {
    portal, municipality: {}, barangays: {}, officials: {}, contacts: {}, services: {},
    sectors: {}, transparency: {}, ordinances: {}, resolutions: {}, ...datasets, research, search, legislationIndex, legislationDetail,
  }
}
