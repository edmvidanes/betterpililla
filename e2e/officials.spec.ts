import { expect, test } from '@playwright/test'

test('unverified officials are withheld in both languages and public downloads', async ({ page, request }) => {
  for (const locale of ['en', 'fil']) {
    await page.goto(`/${locale}/government/officials`)
    await expect(page.getByRole('heading', { name: locale === 'fil' ? 'Kulang pa ang tala' : 'Records pending' })).toBeVisible()
    await expect(page.locator('main')).not.toContainText('Masinsin')
    await expect(page.locator('.directory-grid')).toHaveCount(0)
  }
  const officials = await (await request.get('/data/officials.json')).json()
  expect(officials.records).toEqual([])
  expect(officials.publicationStatus).toBe('WorkInProgress')
})
