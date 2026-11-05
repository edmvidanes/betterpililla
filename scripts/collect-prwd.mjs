import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { join, resolve } from 'node:path'
import { parse } from 'parse5'

const run = promisify(execFile), origin = 'https://prwd.gov.ph'
const startedAt = new Date().toISOString()
const folder = resolve('.cache/prwd', startedAt.replace(/[:.]/g, '-'))
await mkdir(folder, { recursive: true })
const queue = [], known = new Set(), captures = [], externalLinks = [], excluded = []
function add(href, from, label = '') {
  let url
  try { url = new URL(href, from || origin); url.hash = '' } catch { return }
  if (!['http:', 'https:'].includes(url.protocol)) return
  if (!['prwd.gov.ph', 'www.prwd.gov.ph'].includes(url.hostname)) { externalLinks.push({ url: url.href, from, label }); return }
  url.protocol = 'https:'; url.hostname = 'prwd.gov.ph'
  if (/wp-admin|wp-login|wp-sitemap-users|wp-json\/wp\/v2\/users/.test(url.pathname) || /preview=|replytocom=/.test(url.search)) { excluded.push({ url: url.href, reason: 'Administration, author inventory or draft/duplicate route' }); return }
  const extension = url.pathname.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase()
  if (extension && !['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'xml', 'txt'].includes(extension)) return
  if (!known.has(url.href)) { known.add(url.href); queue.push({ url: url.href, from, label }) }
}
const text = node => node.nodeName === '#text' ? node.value : ['script', 'style', 'nav', 'header', 'footer'].includes(node.tagName) ? '' : (node.childNodes || []).map(text).join(' ')
const attr = (node, name) => node.attrs?.find(item => item.name === name)?.value || ''
add(origin + '/', null, 'Official website'); add(origin + '/robots.txt', null, 'Crawl policy')
add(origin + '/wp-sitemap.xml', origin + '/robots.txt', 'Declared sitemap')
while (queue.length && captures.length < 500) {
  const batch = queue.splice(0, 3)
  const rows = await Promise.all(batch.map(async source => {
    const id = createHash('sha256').update(source.url).digest('hex').slice(0, 16), file = `${id}.response`
    let metadata = {}, failure = null
    try {
      const result = await run('curl.exe', ['--silent', '--show-error', '--location', '--proto', '=https', '--proto-redir', '=https', '--connect-timeout', '10', '--max-time', '30', '--max-filesize', '30000000', '--output', join(folder, file), '--write-out', '%{json}', source.url], { timeout: 35000, maxBuffer: 100000 })
      metadata = JSON.parse(result.stdout)
    } catch (error) { failure = String(error.stderr || error.message).trim(); try { metadata = JSON.parse(error.stdout) } catch { /* No HTTP metadata. */ } }
    const bytes = await readFile(join(folder, file)).catch(() => Buffer.alloc(0)), html = bytes.toString('utf8')
    const mime = metadata.content_type || '', httpStatus = metadata.http_code || null
    const kind = /pdf/i.test(mime) ? 'pdf' : /xml/i.test(mime) ? 'xml' : /html/i.test(mime) ? 'html' : /word|sheet|excel|csv/i.test(mime) ? 'document' : 'other'
    const blocked = failure || !httpStatus || httpStatus < 200 || httpStatus >= 300 || bytes.length < 20 || /<title>\s*(404|403|not found|access denied)|just a moment/i.test(html.slice(0, 6000))
    const row = { id, ...source, capturedAt: new Date().toISOString(), httpStatus, contentType: mime, finalUrl: metadata.url_effective || source.url, bytes: bytes.length, sha256: bytes.length ? createHash('sha256').update(bytes).digest('hex') : null, file, kind, status: blocked ? 'source-blocked' : 'captured-for-review', reason: failure || null, title: source.label, text: '', tables: [], images: [] }
    if (!blocked && kind === 'xml') for (const match of html.matchAll(/<loc>([^<]+)<\/loc>/g)) add(match[1].replace(/&amp;/g, '&'), source.url, 'Sitemap entry')
    if (!blocked && kind === 'html') {
      const document = parse(html)
      function visit(node, inContent = false) {
        const classes = attr(node, 'class')
        inContent ||= /entry-content|entry-header|post-content/.test(classes) || node.tagName === 'main'
        if (node.tagName === 'title') row.title = text(node).trim()
        if (node.tagName === 'a') add(attr(node, 'href'), source.url, text(node).replace(/\s+/g, ' ').trim())
        if (['iframe', 'embed', 'object'].includes(node.tagName)) add(attr(node, 'src') || attr(node, 'data'), source.url, 'Embedded document')
        if (node.tagName === 'table' && inContent) row.tables.push(text(node).replace(/\s+/g, ' ').trim())
        if (node.tagName === 'img' && !/logo|icon|seal/i.test(attr(node, 'src'))) row.images.push({ url: new URL(attr(node, 'src') || '/', source.url).href, alt: attr(node, 'alt'), title: attr(node, 'title') })
        for (const child of node.childNodes || []) visit(child, inContent)
      }
      visit(document)
      row.text = text(document).replace(/\s+/g, ' ').trim()
      row.placeholder = /lorem ipsum|consectetur adipiscing/i.test(row.text)
    }
    console.log(`${row.status}: ${source.url} (${row.bytes} bytes)`)
    return row
  }))
  captures.push(...rows)
  const report = { startedAt, completedAt: null, origin, method: 'Public linked pages and declared sitemap; valid TLS; no forms submitted', folder, captures, externalLinks: [...new Map(externalLinks.map(item => [item.url, item])).values()], excluded: [...new Map(excluded.map(item => [item.url, item])).values()], pending: queue }
  await writeFile(join(folder, 'report.json'), JSON.stringify(report, null, 2) + '\n')
}
const report = JSON.parse(await readFile(join(folder, 'report.json'), 'utf8'))
report.completedAt = new Date().toISOString(); report.limitReached = queue.length > 0
await writeFile(join(folder, 'report.json'), JSON.stringify(report, null, 2) + '\n')
await writeFile('.cache/prwd/latest.txt', folder)
console.log(`Collection complete: ${captures.length} URLs, ${queue.length} pending. ${folder}`)
