import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const ordinances = JSON.parse(readFileSync('data/cavinti/legislation/ordinances.json', 'utf8')).records as { recordId: string; title: string; documentNumber: string; documentUrl: string }[]

test('filtered source row opens its own document and survives locale switching', async ({ page }) => {
  const row = ordinances[0]
  await page.goto('/en/open-lgu/legislation')
  await page.getByLabel('Search original metadata').fill(row.recordId)
  const recordLink = page.locator('main a').filter({ hasText: row.title })
  await expect(recordLink).toHaveCount(1)
  await recordLink.click()
  await expect(page.locator(`main a[href="${row.documentUrl}"]`)).toBeVisible()
  await page.getByRole('link', { name: 'Filipino', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'fil')
  await expect(page.locator('h1')).toHaveText(row.title)
  await expect(page).toHaveURL(new RegExp('/fil/open-lgu/legislation/'))
})

test('duplicate source rows remain distinct deep links', async ({ page }) => {
  const row = ordinances.find(a => ordinances.some(b => b.recordId !== a.recordId && b.documentUrl === a.documentUrl))!
  const other = ordinances.find(b => b.recordId !== row.recordId && b.documentUrl === row.documentUrl)!
  await page.goto(`/en/open-lgu/legislation/${encodeURIComponent(row.recordId)}`)
  const related = page.locator(`main a[href$="${encodeURIComponent(other.recordId)}"]`)
  await expect(related).toHaveCount(1)
  await related.click()
  await expect(page).toHaveURL(new RegExp(encodeURIComponent(other.recordId).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  await expect(page.locator(`main a[href="${other.documentUrl}"]`)).toBeVisible()
})

test('unknown records do not render an unrelated attachment', async ({ page }) => {
  await page.goto('/en/open-lgu/legislation/not-a-record')
  await expect(page.locator('main a[href*="/uploads/documents/"]')).toHaveCount(0)
  await expect(page.locator('main')).toContainText('not-a-record')
})
