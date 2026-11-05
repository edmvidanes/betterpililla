import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { parse } from 'parse5'

const reportPath = resolve(process.argv[2] || '')
const report = JSON.parse(await readFile(reportPath, 'utf8'))
const source = report.results.find(row => row.id === 'dilg-directory-rows' && row.status === 'captured-for-review')
if (!source) throw new Error('A successful directory-row capture is required')
const html = await readFile(resolve(dirname(reportPath), source.responseFile), 'utf8')
const value = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(value).join(' ')
const tables = []
function visit(node) {
  if (node.tagName === 'tr') tables.push((node.childNodes || []).filter(cell => ['th', 'td'].includes(cell.tagName)).map(cell => value(cell).replace(/\s+/g, ' ').trim()))
  for (const child of node.childNodes || []) visit(child)
}
visit(parse(html))
const header = tables.find(cells => cells.includes('CITY/MUNICIPALITY') && cells.includes('FIRST NAME'))
if (!header) throw new Error('Directory headers were not found')
const columns = ['REGION', 'PROVINCE', 'CITY/MUNICIPALITY', 'POSITION', 'ELECTION YEAR', 'FIRST NAME', 'MIDDLE NAME', 'LAST NAME', 'SUFFIX']
if (columns.some(key => !header.includes(key))) throw new Error('Required directory columns are missing')
const records = tables.filter(cells => cells[header.indexOf('PROVINCE')] === 'RIZAL' && cells[header.indexOf('CITY/MUNICIPALITY')] === 'PILILLA').map(cells => ({
  sourceRow: cells[0], ...Object.fromEntries(columns.map(key => [key, cells[header.indexOf(key)]])),
}))
if (!records.length || records.some(row => row['REGION'] !== 'REGION IV-A - CALABARZON' || row['ELECTION YEAR'] !== '2025-2028' || !row['FIRST NAME'] || !row['LAST NAME'])) throw new Error('Jurisdiction, term or name check failed')
if (new Set(records.map(row => row.sourceRow)).size !== records.length) throw new Error('Duplicate source rows')
for (const position of ['MUNICIPAL MAYOR', 'MUNICIPAL VICE-MAYOR']) if (records.filter(row => row.POSITION === position).length !== 1) throw new Error(`Unexpected ${position} coverage`)
const metadata = {
  schemaVersion: 'betterpililla-officials-review/v1', publicationStatus: 'review-required',
  directoryAsOf: '2026-02', capturedAt: source.capturedAt, sourceUrl: source.url,
  sourceSha256: source.responseSha256, sourceMethod: source.method,
  publisherEvidence: 'https://www.foi.gov.ph/agencies/dilg/list-of-elected-local-officials/',
  folderUrl: 'https://drive.google.com/drive/folders/1fcyeVj_aNF3mdcnDq8rvL8Zj9r77oLZw',
  limitations: ['February 2026 directory snapshot for term 2025-2028; subsequent changes are not verified.', 'Ten elective officials found; ex-officio seats, appointments and committee memberships are not established.', 'Blank or zero office contact fields were excluded, along with contact and address columns.'],
}
const output = resolve('public/collection/officials-review.json')
await mkdir(dirname(output), { recursive: true })
await writeFile(output, `${JSON.stringify(metadata, null, 2).slice(0, -2)},\n  "records": [\n${records.map(row => `    ${JSON.stringify(row)}`).join(',\n')}\n  ]\n}\n`)
console.log(`${records.length} Pililla/Rizal/2025-2028 rows saved for review; 1 mayor, 1 vice-mayor, ${records.filter(row => row.POSITION === 'SANGGUNIANG BAYAN MEMBER').length} council members.`)
