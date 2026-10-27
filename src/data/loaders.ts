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
const filenames = ['portal.json', 'municipality.json', 'barangays.json', 'officials.json', 'emergency-contacts.json', 'services.json', 'sector-inventory.json', 'transparency.json', 'legislation/ordinances.json', 'legislation/resolutions.json']
let pack: Promise<DataPack> | undefined
export function loadData(): Promise<DataPack> {
  if (!pack) pack = (async () => {
    const values = await Promise.all(filenames.map(async file => {
      const response = await fetch(`${import.meta.env.BASE_URL}${lgu.dataPath}/${file}`)
      if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`)
      return response.json()
    }))
    const researchResponse = await fetch(`${import.meta.env.BASE_URL}${lgu.dataPath}/research-updates.json`)
    const research = researchResponse.ok && researchResponse.headers.get('content-type')?.includes('json') ? await researchResponse.json() : null
    const [portal, municipality, barangays, officials, contacts, services, sectors, transparency, ordinances, resolutions] = values
    return { portal, municipality, barangays, officials, contacts, services, sectors, transparency, ordinances, resolutions, research }
  })()
  return pack
}
