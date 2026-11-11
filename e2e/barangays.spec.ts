import { expect, test } from '@playwright/test'

test('historical barangay counts survive year selection, detail navigation and locale switching', async ({ page }) => {
  await page.goto('/en/government/barangays')
  await page.getByLabel('Find a barangay').fill('Malaya')
  const entries = page.locator('.barangay-bars > li')
  await expect(entries).toHaveCount(1)
  await expect(entries).toContainText('Malaya7,550')
  await expect(entries.locator('.barangay-bar-track')).toHaveCount(1)
  await page.getByLabel('Reference period').selectOption('2015')
  await expect(entries).toContainText('Malaya7,748')
  await entries.getByRole('link').click()
  await expect(page.locator('h1')).toHaveText('Malaya')
  await expect(page.locator('.barangay-bars > li').nth(0)).toContainText('20157,748')
  await expect(page.locator('.barangay-bars > li').nth(1)).toContainText('20207,550')
  await page.getByRole('link', { name: 'Filipino', exact: true }).click()
  await expect(page.locator('h1')).toHaveText('Malaya')
  await expect(page.locator('.barangay-bars > li').nth(0)).toContainText('20157,748')
  await expect(page.locator('.barangay-bars > li').nth(1)).toContainText('20207,550')
  await expect(page.locator('.barangay-bar-track')).toHaveCount(2)
})

test('barangay population sorting and empty search remain usable', async ({ page }) => {
  await page.goto('/en/government/barangays')
  await expect(page.locator('.barangay-bars > li')).toHaveCount(9)
  await page.getByLabel('Sort by').selectOption('population')
  await expect(page.locator('.barangay-bars > li').first()).toContainText('Quisao17,302')
  await page.getByLabel('Reference period').selectOption('2015')
  await expect(page.locator('.barangay-bars > li').first()).toContainText('Quisao15,826')
  await page.getByLabel('Find a barangay').fill('no-such-barangay')
  await expect(page.locator('.barangay-bars > li')).toHaveCount(0)
  await page.getByLabel('Find a barangay').fill('Quisao')
  await expect(page.locator('.barangay-bars > li')).toHaveCount(1)
})

test('all nine PhilAtlas rows appear with the correct years and source', async ({ page }) => {
  await page.goto('/en/government/barangays')
  const expected = [
    ['Bagumbayan', '11,101', '13,468'], ['Halayhayin', '8,090', '9,210'],
    ['Hulo', '9,966', '11,243'], ['Imatong', '931', '957'],
    ['Malaya', '7,748', '7,550'], ['Niogan', '4,938', '5,816'],
    ['Quisao', '15,826', '17,302'], ['Takungan', '1,677', '1,623'], ['Wawa', '4,535', '4,366'],
  ]
  for (const [year, column] of [['2020', 2], ['2015', 1]] as const) {
    await page.getByLabel('Reference period').selectOption(year)
    const entries = page.locator('.barangay-bars > li')
    await expect(entries).toHaveCount(9)
    await expect(page.locator('.barangay-bar-track')).toHaveCount(9)
    for (const row of expected) await expect(entries.filter({ hasText: row[0] })).toContainText(row[0] + row[column])
  }
  await expect(page.locator('main')).toContainText('Published PhilAtlas counts for the 2015 and 2020 censuses')
  await page.locator('main summary').filter({ hasText: 'PhilAtlas Pililla, Rizal profile' }).first().click()
  await expect(page.locator('main a[href="https://www.philatlas.com/luzon/r04a/rizal/pililla.html"]').first()).toBeVisible()
  await expect(page.locator('#barangay-year option[value="2024"]')).toHaveCount(0)
})

test('unknown barangay IDs never display another name’s population', async ({ page }) => {
  await page.goto('/en/government/barangays/barangay:not-a-record')
  await expect(page.locator('h1')).toHaveText('Page or record not found')
  await expect(page.locator('.barangay-bars')).toHaveCount(0)
})
