import { expect, test } from '@playwright/test'

test('missing population is presented without fabricated totals', async ({ page }) => {
  await page.goto('/en/statistics/demographics')
  await expect(page.locator('main')).toContainText('Pililla')
  await expect(page.locator('.population-track')).toHaveCount(0)
  await expect(page.locator('main')).not.toContainText('33,610')
})

test('official name and section filters intersect and recover from an empty result', async ({ page }) => {
  await page.goto('/en/government/officials')
  await page.getByLabel('Search this directory').fill('john')
  await expect(page.locator('.directory-grid > li')).toHaveCount(1)
  await page.getByLabel('Directory section').selectOption('The Council')
  await expect(page.locator('.directory-grid > li')).toHaveCount(0)
  await page.getByLabel('Directory section').selectOption('')
  await expect(page.locator('.directory-grid > li')).toContainText('John V. Masinsin')
})

test('places and advisories withhold foreign template listings', async ({ page }) => {
  for (const route of ['places', 'advisories']) {
    await page.goto(`/en/${route}`)
    await expect(page.locator('main')).toContainText('have not been collected')
    await expect(page.locator('main')).not.toContainText('Layasin')
  }
})
