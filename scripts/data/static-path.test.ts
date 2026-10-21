import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { staticEntryPath } from '../static-path.ts'

 test('source identifiers cannot escape a generated locale directory', () => {
  const root = resolve('/tmp/portal/dist/fil')
  for (const id of ['../../../../dist', '/tmp/other', '..\\..\\other', '\0', '..']) {
    assert.throws(() => staticEntryPath(root, `open-lgu/legislation/${encodeURIComponent(id)}`), /Unsafe static route/)
  }
  assert.throws(() => staticEntryPath(root, '../index'), /Unsafe static route/)
})

test('source-scoped record IDs and the locale landing preserve their entry locations', () => {
  const root = resolve('/tmp/portal/dist/en')
  assert.equal(staticEntryPath(root, 'open-lgu/legislation/ordinance%3Asource-hash%3A1'), resolve(root, 'open-lgu/legislation/ordinance:source-hash:1'))
  assert.equal(staticEntryPath(root, ''), root)
})
