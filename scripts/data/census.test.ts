import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { loadDataPack, validatePack } from './validate.ts'
import { publicationDocuments } from './publication-policy.ts'
import { normalizeSource } from '../../src/domain/evidence.ts'
import { lgu } from '../../src/config/lgu.ts'

test('published Pililla totals match original primary cells and keep other records withheld', async () => {
  const directory = 'docs/collection/census/'
  const capture = JSON.parse(await readFile(directory + 'capture.json', 'utf8'))
  const pack = await loadDataPack()
  validatePack(pack)
  const { documents } = publicationDocuments(pack, lgu.withheldDatasets)
  const facts = documents.municipality.populationFacts
  const expectedYears = [2015, 2020, 2024]
  for (const response of capture.responses) {
    const bytes = await readFile(directory + response.file)
    assert.equal(createHash('sha256').update(bytes).digest('hex'), response.sha256)
    const primary = JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, ''))
    assert.ok(primary.data.every((row: { key: string[] }) => row.key[0] === '0405810000'))
    if (primary.data.length === 3) {
      assert.deepEqual(facts.map((fact: { referenceYear: number }) => fact.referenceYear), expectedYears)
      for (const [index, fact] of facts.entries()) {
        assert.equal(fact.value, Number(primary.data[index].values[0]))
        assert.equal(fact.geography, 'Pililla, Rizal')
        assert.equal(fact.sourceResponseSha256, response.sha256)
        assert.equal(fact.verificationStatus, 'primary-direct')
      }
    } else assert.equal(Number(primary.data[0].values[0]), facts.at(-1).value)
  }
  assert.equal(facts.at(-1).referenceDate, capture.referenceDate2024)
  const source = documents['source-register'].sources.find((s: { id: string }) => s.id === lgu.sourceIds.population)
  assert.equal(normalizeSource(source, capture.capturedOn).status.verificationStatus, 'primary-direct')
  assert.equal(documents['source-register'].sources.find((s: { id: string }) => s.id === 'philatlas-pililla').url, 'https://www.philatlas.com/luzon/r04a/rizal/pililla.html')
  assert.deepEqual(documents.municipality.annualRegularIncome.records, [])
  assert.deepEqual(documents.barangays.secondaryPopulationTable.rows, [])
})
