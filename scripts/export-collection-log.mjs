import { readFile, writeFile, readdir, mkdir, copyFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = process.cwd(), cache = join(root, '.cache/public-records')
const attempts = []
for (const run of await readdir(cache)) {
  for (const phase of await readdir(join(cache, run))) {
    const report = JSON.parse(await readFile(join(cache, run, phase, 'report.json'), 'utf8'))
    attempts.push(...report.results)
  }
}
attempts.sort((a, b) => a.capturedAt.localeCompare(b.capturedAt))
const output = join(root, 'public/collection')
await mkdir(output, { recursive: true })
await copyFile(join(root, 'docs/collection/psa-reader-capture.json'), join(output, 'psa-review.json'))
const source = id => attempts.filter(row => row.id === id).at(-1)
const nhcp = source('nhcp-pililla-church'), tourism = source('rizal-tourism')
if (nhcp?.status !== 'captured-for-review' || tourism?.status !== 'captured-for-review') throw new Error('Heritage sources were not captured')
const provenance = record => ({ url: record.url, capturedAt: record.capturedAt, sourceSha256: record.responseSha256 })
const heritage = {
  schemaVersion: 'betterpililla-heritage-review/v1', publicationStatus: 'review-required',
  records: [
    { title: 'Simbahan ng Pililla', source: provenance(nhcp), locator: 'Registry entry: Location, Marker date, Installed by', sourceLocation: 'Pililia, Rizal (Region IV-A)', markerDate: '1977-01-16', installedBy: 'National Historical Institute (NHI)', note: 'Source spelling retained. Marker date is not the date the town or church was founded.' },
    ...['54 MW WIND FARM', 'BAHAY NA BATO', 'LYGER ANIMAL SANCTUARY'].map(title => ({ title, source: provenance(tourism), locator: `${title} heading and address`, sourceLocation: 'Pililla, Rizal', note: 'Place-listing candidate only. Opening hours, fees, accessibility and present operation are not confirmed. Some provincial descriptions cite Wikipedia; those descriptions were excluded.' })),
  ],
}
await writeFile(join(output, 'heritage-review.json'), `${JSON.stringify(heritage, null, 2)}\n`)
const log = { schemaVersion: 'betterpililla-collection-attempts/v1', generatedAt: new Date().toISOString(), limitation: 'HTTP captures require content review. responseSha256 can describe an error response; it is not a government document hash. Original responses stay in the local .cache/public-records run folders.' }
await writeFile(join(output, 'attempts.json'), `${JSON.stringify(log, null, 2).slice(0, -2)},\n  "attempts": [\n${attempts.map(row => `    ${JSON.stringify(row)}`).join(',\n')}\n  ]\n}\n`)
const auditPath = join(root, 'src/data/link-audit.json')
const audit = JSON.parse(await readFile(auditPath, 'utf8'))
for (const capture of attempts) {
  const row = { url: capture.url, checkedAt: capture.capturedAt, status: capture.status === 'captured-for-review' ? 'ok' : 'unavailable', httpStatus: capture.httpStatus, contentBytes: capture.responseBytes, contentType: capture.contentType, reason: capture.note }
  const index = audit.links.findIndex(link => link.url === capture.url)
  if (index < 0) audit.links.push(row); else audit.links[index] = row
}
await writeFile(auditPath, `{\n  "links": [\n${audit.links.map(row => `    ${JSON.stringify(row)}`).join(',\n')}\n  ]\n}\n`)
console.log(`Exported ${attempts.length} access attempts, PSA review, 4 heritage candidates and checked source links.`)
