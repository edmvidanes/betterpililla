import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeStatus } from '../../src/domain/status.ts'

test('a blocked primary page with indexed evidence remains index-only, not directly verified', () => {
  const status = normalizeStatus('direct reader returned 403; search index exposed the municipal record', 'primary-government')
  assert.deepEqual(status, {
    verificationStatus: 'primary-index-only', availabilityStatus: 'access-blocked', freshnessStatus: 'not-checked',
  })
  assert.equal(normalizeStatus('reader failed; search result lead', 'primary-government').verificationStatus, 'primary-index-only')
  assert.equal(normalizeStatus('HTTP 403; record not retrieved', 'primary-government').verificationStatus, 'not-reviewed')
})
