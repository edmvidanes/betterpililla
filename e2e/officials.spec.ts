import { expect, test } from '@playwright/test'

test('Pililla officials keep their source limits without unrelated portraits', async ({ page }) => {
  await page.goto('/en/government/officials')
  await expect(page.locator('.directory-grid > li')).toHaveCount(2)
  await expect(page.locator('.directory-grid')).toContainText('John V. Masinsin')
  await expect(page.locator('.directory-grid')).toContainText('Dan V. Masinsin')
  await expect(page.locator('.directory-grid img')).toHaveCount(0)
  await page.getByRole('link', { name: 'John V. Masinsin', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('John V. Masinsin')
  await expect(page.locator('main')).toContainText('COMELEC')
  await page.getByRole('link', { name: 'Filipino', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('John V. Masinsin')
})
