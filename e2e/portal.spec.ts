import { expect, test } from '@playwright/test'

test('legislation shows its collection gap and preserves the requested locale', async ({ page }) => {
  await page.goto('/en/open-lgu/legislation?year=2025')
  await expect(page.locator('main')).toContainText('have not been collected')
  await expect(page.locator('main a[href*="/uploads/"]')).toHaveCount(0)
  await page.getByRole('link', { name: 'Filipino', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'fil')
  await expect(page.locator('main')).toContainText('Hindi pa nakokolekta')
  await expect(page).toHaveURL(/\/fil\/open-lgu\/legislation\?year=2025$/)
})

test('withdrawn template records are absent from public downloads and search', async ({ request }) => {
  for (const [file, field] of [
    ['services.json', 'services'], ['sector-inventory.json', 'sectors'],
    ['legislation/ordinances.json', 'records'], ['legislation/resolutions.json', 'records'],
  ]) {
    const response = await request.get(`/data/${file}`)
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data.publicationStatus).toBe('not-collected')
    expect(data[field]).toEqual([])
  }
  const search = await (await request.get('/data/search-index.json')).json()
  expect(search.some((row: { type: string }) => row.type === 'legislation' || row.type === 'service')).toBe(false)
})

test('services retain collection gaps and reporting opens the public contribution queue', async ({ page }) => {
  await page.goto('/en/services')
  await expect(page.locator('main')).toContainText('Citizens’ Charter has not been collected')
  await page.goto('/en/services/service:cchatto-cc:1')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page or record not found')
  await page.goto('/en/report-data')
  const links = page.locator('main a[href^="https://github.com/edmvidanes/betterpililla/issues/new?"]')
  await expect(links).toHaveCount(3)
  await expect(links.first()).toHaveAttribute('href', /template=data-correction.yml/)
})
