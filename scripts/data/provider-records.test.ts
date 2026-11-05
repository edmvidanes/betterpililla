import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'

const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const directory = 'public/collection/providers/'
const tariff = read(directory + 'prwd-tariff.json')
const rounded = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100
test('all tariff rows reconcile to source cells and rounded franchise tax', () => {
  assert.equal(tariff.length, 20)
  for (const [index, size] of ['1/2', '3/4', '1', '2'].entries()) {
    const sheet = read(directory + `prwd-rates-sheet-${index + 1}.json`)
    const group = tariff.filter((row: { meterInches: string }) => row.meterInches === size)
    assert.equal(group.length, 5)
    for (const [classificationIndex, row] of group.entries()) {
      const source = sheet.find((record: { row: number }) => record.row === classificationIndex + 4)
      const cell = (column: string) => source.cells.find((c: { cell: string }) => c.cell === column + source.row).value
      assert.equal(row.minimumBill, cell('D'))
      assert.equal(row.minimumTotal, cell('F'))
      assert.equal(row.franchiseTax, rounded(row.minimumBill * .02))
      assert.ok(Math.abs(row.minimumTotal - row.minimumBill - row.franchiseTax) < .00001)
      assert.deepEqual(row.ratesBeforeTax, ['G','H','I','J','K'].map(cell))
      assert.deepEqual(row.ratesIncludingTax, row.ratesBeforeTax.map((value: number) => rounded(value * 1.02)))
    }
  }
})
test('provider evidence retains agency, period and unresolved source conflicts', () => {
  const district = read('src/data/prwd.json'), help = read('src/data/public-help.json')
  assert.equal(district.rateEffective, '2026-04')
  assert.equal(district.charterEdition, '2023, 3rd Edition')
  assert.equal(help.operationallyVerified, false)
  assert.equal(help.sourceDate, null)
  assert.deepEqual(help.hotlines.slice(0,3).flatMap((row: { phones: string[] }) => row.phones), ['0917-939-8558','0998-967-3463','0997-771-6015'])
  assert.equal(read(directory + 'prwd-missing-documents.json').length, 21)
  assert.equal(read(directory + 'prwd-charter-services.json').length, 13)
  assert.ok(district.issues.some((issue: string) => issue.includes('seven minutes')))
  assert.ok(district.procurement[0].note.includes('both September 30 and October 5'))
  const all = [read(directory + 'prwd-pages.json'), read(directory + 'province-sources.json')].flat()
  const documents = all.filter(row => ['pdf','docx','xlsx'].includes(row.kind) && row.status === 'collected-for-review')
  assert.equal(documents.length, 67)
  for (const row of documents) { assert.equal(row.httpStatus, 200); assert.ok(row.bytes > 1000); assert.match(row.sha256, /^[a-f0-9]{64}$/) }
  const publicText = JSON.stringify(read(directory + 'prwd-pages.json'))
  assert.equal(publicText.includes('2025 PiWaD FOI Registry'), true)
  assert.equal(publicText.includes('requesterName'), false)
})
