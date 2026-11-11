import { expect, test } from '@playwright/test'

test('reviewed census counts retain their year, date and source', async ({ page }) => {
  await page.goto('/en/statistics/demographics')
  await expect(page.locator('.chart-selection')).toContainText('72,503')
  await expect(page.locator('.chart-selection')).toContainText('2024')
  await expect(page.locator('time[datetime="2024-07-01"]')).toBeVisible()
  await expect(page.locator('.chart-note').first()).toContainText('verified directly against PSA')
  await page.getByRole('button', { name: '2020', exact: true }).click()
  await expect(page.locator('.chart-selection')).toContainText('71,535')
  await page.getByRole('button', { name: '2015', exact: true }).click()
  await expect(page.locator('.chart-selection')).toContainText('64,812')
  await expect(page.locator('main')).not.toContainText('33,610')
})

test('homepage census is sourced and dated in both languages', async ({ page }) => {
  for (const locale of ['en', 'fil']) {
    await page.goto(`/${locale}/`)
    const summary = page.locator('.population-summary')
    await expect(summary).toContainText('72,503')
    await expect(summary).toContainText('2024 POPCEN')
    await expect(summary.locator('time')).toHaveAttribute('datetime', '2024-07-01')
    await expect(summary.getByRole('link', { name: 'PSA OpenSTAT' })).toHaveAttribute('href', `/${locale}/sources/psa-2024-openstat`)
    await expect(page.locator('main')).not.toContainText('33,610')
  }
})

test('uncollected civic sections explicitly identify pending records', async ({ page, request }) => {
  for (const route of ['government/offices', 'government/committees', 'statistics/municipal-income', 'transparency/finance']) {
    await page.goto(`/en/${route}`)
    await expect(page.getByRole('heading', { name: 'Records pending' })).toBeVisible()
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
