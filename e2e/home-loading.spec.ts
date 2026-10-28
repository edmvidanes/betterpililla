import { expect, test } from '@playwright/test'

test('landing page shows its first sections while data is loading', async ({ page }) => {
  let release!: () => void
  const dataReady = new Promise<void>(resolve => { release = resolve })
  await page.route('**/data/*.json', async route => {
    await dataReady
    await route.continue()
  })
  try {
    await page.goto('/en/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: 'Cavinti, Laguna' })).toBeVisible()
    await expect(page.locator('#portal-search')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Go straight to the information' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Explore public information' })).toBeVisible()
  } finally {
    release()
  }
})
