import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { resolve, join } from 'node:path'

const run = promisify(execFile)
const root = fileURLToPath(new URL('../', import.meta.url))
const phase = Number(process.argv[2])
if (!Number.isInteger(phase) || phase < 1 || phase > 6) throw new Error('Choose a phase: node scripts/collect-public-records.mjs 1..6')
const sources = JSON.parse(await readFile(join(root, 'docs/collection/sources.json'), 'utf8')).filter(source => source.phase === phase)
const startedAt = new Date().toISOString()
const output = resolve(root, '.cache/public-records', startedAt.replace(/[:.]/g, '-'), `phase-${phase}`)
await mkdir(output, { recursive: true })
const results = []
for (const source of sources) {
  if (!/^[a-z0-9-]+$/.test(source.id) || new URL(source.url).protocol !== 'https:') throw new Error('Invalid source catalog entry')
  const bodyPath = join(output, `${source.id}.response`)
  const capturedAt = new Date().toISOString()
  let metadata = {}, failure = null
  try {
    const { stdout } = await run('curl.exe', ['--silent', '--show-error', '--ipv4', '--location', '--proto', '=https', '--proto-redir', '=https', '--connect-timeout', '10', '--max-time', '25', '--max-filesize', '30000000', '--output', bodyPath, '--write-out', '%{json}', source.url], { timeout: 30000, maxBuffer: 100000 })
    metadata = JSON.parse(stdout)
  } catch (error) {
    failure = String(error.stderr || error.message).trim()
    try { metadata = JSON.parse(error.stdout) } catch { /* No HTTP response. */ }
  }
  const bytes = await readFile(bodyPath).catch(() => Buffer.alloc(0))
  const httpStatus = metadata.http_code || null
  const contentType = metadata.content_type || null
  const text = bytes.toString('utf8')
  const errorPage = /access denied|request blocked|just a moment|captcha|<title>\s*(error|404|403)/i.test(text.slice(0, 12000))
  const expectedFormat = source.kind === 'pdf' ? bytes.subarray(0, 5).toString() === '%PDF-' : source.kind === 'json' ? /json/i.test(contentType || '') : /html/i.test(contentType || '')
  const captured = !failure && httpStatus >= 200 && httpStatus < 300 && bytes.length > 100 && expectedFormat && !errorPage
  const result = {
    ...source, capturedAt, method: 'curl-https-valid-tls', httpStatus, contentType,
    finalUrl: metadata.url_effective || source.url, responseBytes: bytes.length,
    responseSha256: bytes.length ? createHash('sha256').update(bytes).digest('hex') : null,
    responseFile: `${source.id}.response`, status: captured ? 'captured-for-review' : 'source-blocked',
    note: captured ? 'HTTP and format checked only; jurisdiction, period, completeness and publication permission still need review.' : failure || `HTTP ${httpStatus}; expected ${source.kind}; usable record not captured.`,
  }
  results.push(result)
  await writeFile(join(output, 'report.json'), `${JSON.stringify({ startedAt, phase, results }, null, 2)}\n`)
  console.log(`${source.id}: ${result.status} (${httpStatus ?? 'no HTTP response'}, ${bytes.length} bytes)`)
}
console.log(`Local evidence and report: ${output}`)
