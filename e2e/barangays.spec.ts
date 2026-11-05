import { expect, test } from '@playwright/test'

test('Pililla barangay names preserve missing population and locale switching', async ({ page }) => {
  await page.goto('/en/government/barangays')
  await page.getByLabel('Find a barangay').fill('Malaya')
  const entries = page.locator('.barangay-bars > li')
  await expect(entries).toHaveCount(1)
  await expect(entries).toContainText('Malaya')
  await expect(entries.locator('.barangay-bar-track')).toHaveCount(0)
  await entries.getByRole('link').click()
  await expect(page.locator('h1')).toHaveText('Malaya')
  await expect(page.locator('main')).toContainText('No published population for this exact name')
  await page.getByRole('link', { name: 'Filipino', exact: true }).click()
  await expect(page.locator('h1')).toHaveText('Malaya')
  await expect(page.locator('main')).toContainText('Walang inilathalang populasyon')
})

test('barangay sorting and empty search remain usable with unavailable population', async ({ page }) => {
  await page.goto('/en/government/barangays')
  await expect(page.locator('.barangay-bars > li')).toHaveCount(9)
  await page.getByLabel('Sort by').selectOption('population')
  await expect(page.locator('.barangay-bars > li').first()).toContainText('Bagumbayan')
  await page.getByLabel('Find a barangay').fill('no-such-barangay')
  await expect(page.locator('.barangay-bars > li')).toHaveCount(0)
  await page.getByLabel('Find a barangay').fill('Quisao')
  await expect(page.locator('.barangay-bars > li')).toHaveCount(1)
})

test('unknown barangay IDs never display another name’s population', async ({ page }) => {
  await page.goto('/en/government/barangays/barangay:not-a-record')
  await expect(page.locator('h1')).toHaveText('Page or record not found')
  await expect(page.locator('.barangay-bars')).toHaveCount(0)
})
