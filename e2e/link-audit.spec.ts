import { expect, test } from '@playwright/test'
import audit from '../src/data/link-audit.json' with { type: 'json' }

test('failed external links are visibly unavailable and never clickable', async ({ page }) => {
  await page.goto('/en/sources')
  const failed = new Set(audit.links.filter(row => row.status !== 'ok').map(row => row.url))
  await expect(page.locator('[data-external-url]').first()).toBeAttached()
  const links = await page.locator('main a[href]').evaluateAll(nodes => nodes.map(node => (node as HTMLAnchorElement).href))
  expect(links.filter(url => failed.has(url))).toEqual([])
  await expect(page.locator('[data-external-url]').first()).toContainText('WorkInProgress')
})

test('deep map route renders without runtime or hydration errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/fil/map')
  await expect(page.getByRole('heading', { name: 'WorkInProgress' })).toBeVisible()
  await expect(page.locator('main')).toBeVisible()
  expect(errors).toEqual([])
})
