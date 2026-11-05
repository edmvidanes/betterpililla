import { expect, test } from '@playwright/test'

test('collection tracking is removed from public routes and navigation', async ({ page, request }) => {
  for (const path of ['/en/', '/en/services', '/en/transparency', '/en/services/water-district', '/fil/services/public-contacts']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('a[href*="collection-plan"]')).toHaveCount(0)
    await expect(page.locator('.collection-plan, #provider-progress')).toHaveCount(0)
  }
  for (const locale of ['en', 'fil']) {
    await page.goto(`/${locale}/collection-plan`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(locale === 'en' ? 'Page or record not found' : 'Hindi nakita ang pahina o rekord')
  }
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).not.toContain('collection-plan')
  const retiredChecklist = await request.get('/collection/record-requests.md')
  expect(retiredChecklist.headers()['content-type'] ?? '').not.toContain('text/markdown')
  expect(await retiredChecklist.text()).not.toContain('Suggested request text')
})

test('source evidence remains available while unreviewed municipal records stay withheld', async ({ page, request }) => {
  await page.goto('/en/services')
  await expect(page.locator('.work-in-progress')).toContainText('Verified content is not available')
  for (const name of ['officials-review.json', 'psa-review.json', 'heritage-review.json', 'attempts.json']) {
    const response = await request.get(`/collection/${name}`)
    expect(response.ok()).toBe(true)
    expect((await response.body()).length).toBeGreaterThan(100)
  }
  const records = await (await request.get('/collection/officials-review.json')).json()
  expect(records.publicationStatus).toBe('review-required')
  expect(records.records).toHaveLength(10)
  expect(records.records.every((row: Record<string, string>) => row.PROVINCE === 'RIZAL' && row['CITY/MUNICIPALITY'] === 'PILILLA')).toBe(true)
  const released = await (await request.get('/data/officials.json')).json()
  expect(released.records).toEqual([])
})
