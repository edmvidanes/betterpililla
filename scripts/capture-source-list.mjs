import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { join, resolve } from 'node:path'
import { parse } from 'parse5'

const run = promisify(execFile)
const [input, output] = process.argv.slice(2)
if (!input || !output) throw new Error('Usage: node scripts/capture-source-list.mjs input.json output-folder')
const sources = JSON.parse(await readFile(input, 'utf8')), folder = resolve(output)
await mkdir(folder, { recursive: true })
const captures = []
const attr = (node, name) => node.attrs?.find(item => item.name === name)?.value || ''
const text = node => node.nodeName === '#text' ? node.value : ['script', 'style', 'nav', 'footer'].includes(node.tagName) ? '' : (node.childNodes || []).map(text).join(' ')
for (let start = 0; start < sources.length; start += 3) {
  const batch = await Promise.all(sources.slice(start, start + 3).map(async source => {
    const id = createHash('sha256').update(source.url).digest('hex').slice(0, 16), file = `${id}.response`
    let metadata = {}, reason = null
    try {
      const result = await run('curl.exe', ['--silent', '--show-error', '--location', '--proto', '=https', '--proto-redir', '=https', '--connect-timeout', '10', '--max-time', '40', '--max-filesize', '60000000', '--output', join(folder, file), '--write-out', '%{json}', source.url], { timeout: 45000, maxBuffer: 100000 })
      metadata = JSON.parse(result.stdout)
    } catch (error) { reason = String(error.stderr || error.message).trim(); try { metadata = JSON.parse(error.stdout) } catch { /* No response metadata. */ } }
    const bytes = await readFile(join(folder, file)).catch(() => Buffer.alloc(0))
    const extension = new URL(source.url).pathname.split('.').pop().toLowerCase()
    const kind = ['pdf', 'docx', 'xlsx', 'png', 'jpg', 'jpeg'].includes(extension) ? extension : /html/i.test(metadata.content_type || '') ? 'html' : 'other'
    const row = { ...source, id, file, kind, capturedAt: new Date().toISOString(), httpStatus: metadata.http_code || null, finalUrl: metadata.url_effective || source.url, contentType: metadata.content_type || '', bytes: bytes.length, sha256: bytes.length ? createHash('sha256').update(bytes).digest('hex') : null, reason, links: [], images: [], text: '' }
    row.status = reason || row.httpStatus !== 200 || bytes.length < 20 ? 'source-blocked' : 'captured-for-review'
    if (kind === 'html' && row.status === 'captured-for-review') {
      const document = parse(bytes.toString('utf8'))
      const url = value => { try { return new URL(value, source.url).href } catch { return null } }
      function visit(node) {
        if (node.tagName === 'title') row.title = text(node).trim()
        if (node.tagName === 'a') row.links.push({ url: url(attr(node, 'href')), label: text(node).replace(/\s+/g, ' ').trim() })
        if (node.tagName === 'img') row.images.push({ url: url(attr(node, 'src')), label: attr(node, 'alt') || attr(node, 'title') })
        if (['iframe', 'embed', 'object'].includes(node.tagName)) row.links.push({ url: url(attr(node, 'src') || attr(node, 'data')), label: 'Embedded document' })
        for (const child of node.childNodes || []) visit(child)
      }
      visit(document); row.text = text(document).replace(/\s+/g, ' ').trim()
      for (const match of bytes.toString('utf8').matchAll(/url\(["']?([^"')]+)["']?\)/g)) row.images.push({ url: url(match[1]), label: 'Background image' })
    }
    console.log(`${row.status}: ${source.url} (${row.bytes} bytes)`)
    return row
  }))
  captures.push(...batch)
  await writeFile(join(folder, 'report.json'), JSON.stringify({ capturedAt: new Date().toISOString(), folder, method: 'Explicit public source list; valid TLS; no forms submitted', captures }, null, 2) + '\n')
}
