import { lgu } from '../config/lgu'
import type { Json, Portal } from '../domain/types'

// Canonical evidence has source-specific shapes; recursive rendering preserves their original fields.
export type EvidenceValue = Json
export type DataRecord = Record<string, EvidenceValue>
export const rows = (value: EvidenceValue | undefined): DataRecord[] => Array.isArray(value) ? value as DataRecord[] : []
export interface DataPack {
  portal: Portal; municipality: DataRecord; barangays: DataRecord; officials: DataRecord;
  contacts: DataRecord; services: DataRecord; sectors: DataRecord; transparency: DataRecord;
  ordinances: DataRecord; resolutions: DataRecord; research: DataRecord | null
}
const files = {
  municipality: 'municipality.json', barangays: 'barangays.json', officials: 'officials.json',
  contacts: 'emergency-contacts.json', services: 'services.json', sectors: 'sector-inventory.json',
  transparency: 'transparency.json', ordinances: 'legislation/ordinances.json', resolutions: 'legislation/resolutions.json',
} as const
type Dataset = keyof typeof files

function datasetsForRoute(route: string): Dataset[] {
  if (!route || route === 'about' || route === 'map' || route === 'statistics/demographics' || route === 'statistics/competitiveness') return ['municipality']
  if (route === 'services') return ['services', 'ordinances', 'contacts']
  if (route.startsWith('services/')) return ['services', 'ordinances']
  if (route === 'government/officials' || route.startsWith('government/officials/') || route === 'government/committees') return ['officials']
  if (route === 'government/offices' || route.startsWith('government/offices/')) return ['contacts']
  if (route === 'government/barangays' || route.startsWith('government/barangays/')) return ['barangays']
  if (route === 'open-lgu/legislation' || route.startsWith('open-lgu/legislation/')) return ['ordinances', 'resolutions']
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

export async function loadData(route: string): Promise<DataPack> {
  const needed = datasetsForRoute(route)
  const [portal, values, research] = await Promise.all([
    fetchData('portal.json'),
    Promise.all(needed.map(key => fetchData(files[key]))),
    route === 'sources' ? fetch(`${import.meta.env.BASE_URL}${lgu.dataPath}/research-updates.json`).then(response => response.ok && response.headers.get('content-type')?.includes('json') ? response.json() : null) : null,
  ])
  const datasets = Object.fromEntries(needed.map((key, index) => [key, values[index]]))
  return {
    portal, municipality: {}, barangays: {}, officials: {}, contacts: {}, services: {},
    sectors: {}, transparency: {}, ordinances: {}, resolutions: {}, ...datasets, research,
  }
}
