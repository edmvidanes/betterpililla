import { expect, test } from '@playwright/test'

test('official portraits match profiles and unresolved membership remains explicit', async ({ page }) => {
  await page.goto('/en/government/officials')
  const card = page.locator('.directory-grid > li').filter({ hasText: 'NITZSHELL TORRES-DELA TORRE' })
  await expect(card.locator('img')).toHaveAttribute('src', /686dd80a51e03AMC_3460/)
  await expect(card).toContainText('Exact office or membership status is unclear')
  await card.getByRole('link', { name: 'NITZSHELL TORRES-DELA TORRE J.D.' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('NITZSHELL TORRES-DELA TORRE J.D.')
  await expect(page.locator('.official-detail')).toContainText('does not establish an elected or current office')
  await expect(page.locator('.official-facts')).toContainText('Juris Doctor')
  await expect(page.locator('.official-facts')).toContainText('0 / 0')
  await expect(page.getByRole('link', { name: 'Open directory' })).toHaveAttribute('href', 'https://www.cavinti-egov.com/legislative')
  await expect(page.getByRole('link', { name: 'Site-wide rights statement' })).toHaveAttribute('href', 'https://www.cavinti-egov.com/contact')
})
