import { expect, test } from '@playwright/test'

test('CMCI homepage charts expose all five dated pillar datasets', async ({ page }) => {
  await page.goto('/en/')
  const section = page.locator('.cmci-charts')
  await expect(section.locator('.cmci-totals')).toContainText('155')
  await expect(section.locator('.cmci-totals')).toContainText('32.52')
  await expect(section).toContainText('This is not a 2026 ranking')
  for (const name of ['Economic dynamism', 'Government efficiency', 'Infrastructure', 'Resiliency', 'Innovation']) {
    await section.getByRole('button', { name: new RegExp(name) }).click()
    await expect(section.locator('tbody tr')).toHaveCount(10)
    await expect(section.locator('tbody')).toBeVisible()
  }
  await expect(section.getByRole('link', { name: 'View the archived CMCI profile' })).toHaveAttribute('href', /web\/20260613131358\//)
})

test('utility bar uses Philippine time, dated rates and collected Pililla contacts', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-11T12:00:00Z') })
  await page.route('https://api.open-meteo.com/**', route => route.fulfill({ json: { current: { temperature_2m: 24.2, time: '2026-11-11T20:00' } } }))
  await page.route('https://api.frankfurter.dev/**', route => route.fulfill({ json: { amount: 1, base: 'USD', date: '2026-11-10', rates: { PHP: 62.904 } } }))
  await page.goto('/en/')
  await expect(page.locator('.live-weather')).toContainText('Pililla 24.2°C')
  await expect(page.locator('.live-rate')).toContainText('1 USD = ₱62.90')
  await expect(page.locator('.live-rate')).toContainText('Nov 10, 2026')
  await expect(page.locator('.live-clock')).toContainText(/8:00.*PHT/)
  await page.locator('.hotline-menu summary').click()
  await expect(page.locator('.hotline-dropdown')).toContainText('Needs validation')
  await expect(page.locator('.hotline-dropdown a[href="tel:+639179398558"]')).toBeVisible()
  await expect(page.locator('.hotline-dropdown')).not.toContainText('654-5185')
})

test('unavailable live sources do not display invented values', async ({ page }) => {
  await page.route('https://api.open-meteo.com/**', route => route.fulfill({ status: 503, body: '' }))
  await page.route('https://api.frankfurter.dev/**', route => route.fulfill({ json: { base: 'USD', amount: 1, date: '2026-11-10', rates: {} } }))
  await page.goto('/fil/')
  await expect(page.locator('.live-weather')).toContainText('Hindi available ang panahon')
  await expect(page.locator('.live-rate')).toContainText('Hindi available ang palitan')
  await expect(page.locator('.population-summary')).toContainText('72,503')
})
