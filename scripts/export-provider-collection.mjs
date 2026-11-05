import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { parse } from 'parse5'

const root = (await readFile('.cache/prwd/latest.txt', 'utf8')).trim()
const directories = [root, '.cache/prwd/images', '.cache/prwd/additional', '.cache/prwd/media', '.cache/province/2026-11-05', '.cache/province/linked', '.cache/province/additional']
const output = 'public/collection/providers'
await mkdir(output, { recursive: true })
const captures = [], extraction = new Map()
for (const directory of directories) {
  const report = JSON.parse(await readFile(join(directory, 'report.json'), 'utf8'))
  for (const row of report.captures) captures.push({ ...row, folder: directory })
  const index = JSON.parse(await readFile(join(directory, 'extracted/index.json'), 'utf8').catch(() => '[]'))
  for (const row of index) extraction.set(row.id, row)
}
const unique = [...new Map(captures.map(row => [row.url, row])).values()]
const attr = (node, name) => node.attrs?.find(item => item.name === name)?.value || ''
const nodeText = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(nodeText).join(' ')
const inventory = []
for (const row of unique) {
  const extension = new URL(row.url).pathname.split('.').pop().toLowerCase()
  const kind = ['pdf', 'docx', 'xlsx', 'png', 'jpg', 'jpeg', 'bmp', 'mp4'].includes(extension) ? extension : row.kind
  let sourceDate = null
  if (kind === 'html' && row.httpStatus === 200) {
    const html = await readFile(join(row.folder, row.file), 'utf8')
    sourceDate = html.match(/datetime=["']([^"']+)["']/)?.[1] || html.match(/class=["']published["'][^>]*>([^<]+)</)?.[1] || html.match(/\| ([A-Z][a-z]{2} \d{1,2}, \d{4}) \|/)?.[1] || null
  }
  const excluded = /author\/|blogger-gb|\/sample\/?$|sitemap|robots|cropped-logo|\/logo|commission-logo|DBM-logo|GSIS-logo|philgeps-logo|lwua-logo|pawd-logo|gpppb-logo|iqwd.qdev/.test(row.url) || row.placeholder
  inventory.push({ id: row.id, url: row.url, title: row.title || row.label || new URL(row.url).pathname.split('/').pop(), agency: /prwd.gov.ph/.test(row.url) ? 'Pililla Water District' : /rizalprovince.ph/.test(row.url) ? 'Rizal Provincial Government' : 'Linked external service', kind, sourceDate, capturedAt: row.capturedAt, httpStatus: row.httpStatus, bytes: row.bytes, sha256: row.sha256, status: excluded ? 'excluded-template-or-out-of-scope' : row.httpStatus === 200 && !row.reason ? 'collected-for-review' : 'WorkInProgress', pages: extraction.get(row.id)?.pages ?? null, imageOnlyPages: extraction.get(row.id)?.imageOnlyPages ?? [], sheets: extraction.get(row.id)?.sheets ?? [] })
}
const writeRows = async (file, rows) => writeFile(join(output, file), '[\n' + rows.map(row => '  ' + JSON.stringify(row)).join(',\n') + '\n]\n')
await writeRows('prwd-pages.json', inventory.filter(row => /prwd.gov.ph/.test(row.url) && !['png', 'jpg', 'jpeg'].includes(row.kind)))
await writeRows('prwd-images.json', inventory.filter(row => /prwd.gov.ph/.test(row.url) && ['png', 'jpg', 'jpeg'].includes(row.kind)))
await writeRows('province-sources.json', inventory.filter(row => /rizalprovince.ph/.test(row.url)))
await writeRows('external-checks.json', inventory.filter(row => !/prwd.gov.ph|rizalprovince.ph/.test(row.url)))
const charter = JSON.parse(await readFile(join(root, 'extracted/8e0f0b539c12679e.json'), 'utf8'))
const titles = ['Request for documents (FOI)', 'New water connection', 'Reconnection', 'Water bill payment', 'Senior citizen discount', 'Change of account name', 'Meter relocation or transfer', 'Meter replacement', 'Meter calibration', 'Temporary disconnection', 'Disconnection of unpaid accounts', 'Leak and broken pipeline reports', 'Hiring and recruitment']
const pages = [[6,7],[8,9],[10,11],[12],[13],[14],[15,16],[17],[18,19],[20],[21],[22],[23,24]]
await writeRows('prwd-charter-services.json', titles.map((title, index) => ({ id: index + 1, title, pages: pages[index], edition: '2023, 3rd Edition', sourceUrl: charter.url, status: 'edition-collected-current-procedure-review-pending', sourceText: pages[index].map(n => charter.pages[n - 1].text.replace(/\s+/g, ' ').trim()).join('\n\n') })))
const rates = JSON.parse(await readFile(join(root, 'extracted/b2e10334d825ce55.json'), 'utf8'))
const tariff = []
for (const [index, sheet] of rates.sheets.entries()) {
  const size = ['1/2', '3/4', '1', '2'][index]
  for (const row of sheet.rows.filter(row => row.row >= 4 && row.row <= 8)) {
    const cell = column => row.cells.find(c => c.cell === `${column}${row.row}`)?.value
    tariff.push({ meterInches: size, classification: cell('A'), sheet: sheet.name, range: `A${row.row}:P${row.row}`, minimumBill: cell('D'), franchiseTax: cell('E'), minimumTotal: cell('F'), ratesBeforeTax: ['G','H','I','J','K'].map(cell), ratesIncludingTax: ['L','M','N','O','P'].map(cell) })
  }
  await writeRows(`prwd-rates-sheet-${index + 1}.json`, sheet.rows)
}
await writeRows('prwd-tariff.json', tariff)
const transparency = captures.find(row => row.url === 'https://prwd.gov.ph/transparency/')
const missing = []
function visit(node) {
  if (node.tagName === 'a' && attr(node, 'href') === '#' && !/transparency seal|mandate|contact information/i.test(nodeText(node))) {
    const title = nodeText(node).replace(/\s+/g, ' ').trim()
    if (title && /FY |CY |Manual|SALN/.test(title)) missing.push({ title, sourceUrl: transparency.url, status: 'WorkInProgress', reason: 'The published link points to # and provides no document.' })
  }
  for (const child of node.childNodes || []) visit(child)
}
visit(parse(await readFile(join(transparency.folder, transparency.file), 'utf8')))
await writeRows('prwd-missing-documents.json', missing)
const provinceHits = []
for (const row of captures.filter(row => /\/ITB-2026\//.test(row.url) && extraction.has(row.id))) {
  const data = JSON.parse(await readFile(join(row.folder, `extracted/${row.id}.json`), 'utf8'))
  for (const page of data.pages.filter(page => /pililla/i.test(page.text))) provinceHits.push({ url: row.url, page: page.page, sourceText: page.text.replace(/\s+/g, ' ').trim(), status: 'review-candidate-not-award-or-expenditure' })
}
await writeRows('province-pililla-bid-pages.json', provinceHits)
const totals = agency => { const rows = inventory.filter(row => row.agency === agency && row.status !== 'excluded-template-or-out-of-scope'); return { urlsChecked: rows.length, captured: rows.filter(row => row.status === 'collected-for-review').length, documents: rows.filter(row => ['pdf','xlsx','docx'].includes(row.kind) && row.httpStatus === 200).length, pdfPages: rows.reduce((sum, row) => sum + (row.pages || 0), 0) } }
await writeFile(join(output, 'summary.json'), JSON.stringify({ collectedAt: new Date().toISOString(), municipality: 'Pililla, Rizal', prwd: totals('Pililla Water District'), province: totals('Rizal Provincial Government'), prwdExternalServices: 13, tariffRows: tariff.length, meterSizes: 4, missingPrwdLinks: missing.length, provinceBidPagesNamingPililla: provinceHits.length, note: 'District and provincial evidence does not fill municipal finance, charter, elected-official or PSA datasets. Captured records still require content and currency review.' }, null, 2) + '\n')
const prior = await readFile('src/data/link-audit.json', 'utf8')
const audit = JSON.parse(prior), known = new Set(audit.links.map(row => row.url))
const displayed = inventory.filter(row => row.status !== 'excluded-template-or-out-of-scope' && (/pdf|xlsx|docx|bmp/.test(row.kind) || /forms.gle|foi.gov.ph|lbp-eservices|hotline|prwd_income|prwd_cashflow|prwd_comparative|Active-Service|\/contact-us\/|\/forms\/|\/transparency\/?$|\/about-us\/|\/bod-and-management\/|\/mandate-and-functions\/|\/water-rates\/|\/bidding-and-awards\/|new-water-rates-effective|\/directory.html|\/index.html$|\/iskolarnigob|\/disclosure%20report|\/bids.html|\/RPHS-|\/tourism.html$|\/pay-your-water/.test(row.url)))
const added = displayed.map(row => ({ url: row.url, checkedAt: row.capturedAt, status: row.status === 'collected-for-review' ? 'ok' : 'unavailable', httpStatus: row.httpStatus, contentBytes: row.bytes, title: row.title, reason: row.status === 'collected-for-review' ? 'Nonempty source captured; content and currency review are separate.' : row.status }))
const fresh = new Map(added.map(row => [row.url, row]))
let updated = prior.split('\n').map(line => {
  try { const row = JSON.parse(line.trim().replace(/,$/, '')); return fresh.has(row.url) ? '    ' + JSON.stringify(fresh.get(row.url)) + (line.trim().endsWith(',') ? ',' : '') : line } catch { return line }
}).join('\n')
const newRows = added.filter(row => !known.has(row.url))
if (newRows.length) updated = updated.replace(/\n  \]/, ',\n' + newRows.map(row => '    ' + JSON.stringify(row)).join(',\n') + '\n  ]')
await writeFile('src/data/link-audit.json', updated)
console.log(JSON.stringify({ inventory: inventory.length, missingDocuments: missing.length, provinceBidPages: provinceHits.length }))
