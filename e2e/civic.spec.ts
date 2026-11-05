import { expect, test } from '@playwright/test'

test('missing population is presented without fabricated totals', async ({ page }) => {
  await page.goto('/en/statistics/demographics')
  await expect(page.locator('main')).toContainText('Pililla')
  await expect(page.locator('.population-track')).toHaveCount(0)
  await expect(page.locator('main')).not.toContainText('33,610')
})

test('unverified civic sections explicitly show work in progress', async ({ page, request }) => {
  for (const route of ['government/offices', 'government/committees', 'statistics/municipal-income', 'transparency/finance']) {
    await page.goto(`/en/${route}`)
    await expect(page.getByRole('heading', { name: 'WorkInProgress' })).toBeVisible()
  }
  const municipality = await (await request.get('/data/municipality.json')).json()
  expect(municipality.annualRegularIncome.records).toEqual([])
  expect(municipality.incomeClass.value).toBeUndefined()
})

test('places and advisories withhold foreign template listings', async ({ page }) => {
  for (const route of ['places', 'advisories']) {
    await page.goto(`/en/${route}`)
    await expect(page.locator('main')).toContainText('have not been collected')
    await expect(page.locator('main')).not.toContainText('Layasin')
  }
})
