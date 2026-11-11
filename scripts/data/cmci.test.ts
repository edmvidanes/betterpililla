import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { gunzipSync } from 'node:zlib'
import { createHash } from 'node:crypto'
import { parse } from 'parse5'

test('CMCI charts retain the archived assessment year, rank, score and all fifty source rows', async () => {
  const cmci = JSON.parse(await readFile('src/data/cmci-pililla-2024.json', 'utf8'))
  const bytes = gunzipSync(await readFile('docs/collection/cmci/20260613-profile.html.gz'))
  assert.equal(createHash('sha256').update(bytes).digest('hex'), cmci.sourceResponseSha256)
  const dom = parse(bytes.toString('utf8'))
  const all = (node: any, predicate: (n: any) => boolean): any[] => [...(predicate(node) ? [node] : []), ...(node.childNodes || []).flatMap((child: any) => all(child, predicate))]
  const text = (node: any): string => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join(' ')
  const clean = (node: any) => text(node).replace(/\s+/g, ' ').trim()
  const year = all(dom, n => n.tagName === 'select' && n.attrs.some((a: any) => a.name === 'id' && a.value === 'year'))[0]
  assert.equal(Number(clean(all(year, n => n.tagName === 'option' && n.attrs.some((a: any) => a.name === 'selected'))[0])), cmci.assessmentYear)
  const overall = all(dom, n => n.tagName === 'input' && n.attrs.some((a: any) => a.name === 'class' && a.value === 'knob'))[0]
  assert.equal(Number(overall.attrs.find((a: any) => a.name === 'value').value), cmci.overallScore)
  assert.ok(bytes.toString().includes(`${cmci.overallRank}<sup>th</sup>`))
  assert.equal(cmci.pillars.length, 5)
  const tables = all(dom, n => n.tagName === 'table')
  for (const pillar of cmci.pillars) {
    const table = tables.find(n => clean(n).startsWith('Rank Score ' + pillar.name))
    const rows = all(table, n => n.tagName === 'tr').slice(1)
    const published = [pillar, ...pillar.indicators]
    assert.equal(rows.length, 11)
    for (const [index, row] of rows.entries()) {
      const cells = all(row, n => ['td', 'th'].includes(n.tagName)).map(clean)
      assert.equal(cells[0], published[index].name)
      assert.equal(Number.parseInt(cells[1]), published[index].rank)
      assert.equal(cells[2], published[index].scoreAsPublished)
      assert.equal(Number(cells[2]), published[index].score)
    }
  }
})
