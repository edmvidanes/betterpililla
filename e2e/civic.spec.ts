import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const population = JSON.parse(readFileSync('data/cavinti/municipality.json', 'utf8')).populationFacts as { indicator: string; referenceYear?: number; value: number; sourceId: string }[]
const ordinances = JSON.parse(readFileSync('data/cavinti/legislation/ordinances.json', 'utf8')).records as { recordId: string; documentNumber: string; sourceDate: string }[]

test('population selection keeps the published value and its evidence together', async ({ page }) => {
  await page.goto('/en/statistics/demographics')
  const chart = page.locator('.population-chart')
  for (const year of [2020, 2024]) {
    const fact = population.find(row => row.indicator === 'total_population' && row.referenceYear === year)!
    await chart.getByRole('button', { name: String(year), exact: true }).focus()
    await page.keyboard.press('Enter')
    await expect(chart.locator('.chart-selection')).toContainText(fact.value.toLocaleString('en-PH'))
    await expect(chart.locator(`a[href$="/sources/${fact.sourceId}"]`)).toHaveCount(1)
    await expect(chart.getByRole('button', { name: String(year), exact: true })).toHaveAttribute('aria-pressed', 'true')
  }
  await expect(chart.locator('[aria-live]')).toContainText('direct access blocked')
  await chart.getByLabel('Reference period').selectOption('true')
  await chart.getByRole('button', { name: '1903', exact: true }).click()
  const historic = population.find(row => row.referenceYear === 1903)!
  await expect(chart.locator('.chart-selection')).toContainText(historic.value.toLocaleString('en-PH'))
  await chart.getByLabel('Reference period').selectOption('false')
  await expect(chart.getByRole('button', { name: '2024', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('official name and section filters intersect and recover from an empty result', async ({ page }) => {
  await page.goto('/en/government/officials')
  await page.getByLabel('Search this directory').fill('arrantlee')
  await expect(page.locator('.directory-grid > li')).toHaveCount(1)
  await page.getByLabel('Directory section').selectOption('The Council')
  await expect(page.locator('.directory-grid > li')).toHaveCount(0)
  await page.getByLabel('Directory section').selectOption('')
  await expect(page.locator('.directory-grid > li h2')).toContainText('ARRANTLEE')
})

test('advanced legislative filters remain visible and active across reload and locale switch', async ({ page }) => {
  const record = ordinances.find(row => /^\d{4}-\d{2}-\d{2}$/.test(row.sourceDate))!
  const query = new URLSearchParams({ type: 'ordinance', year: record.sourceDate.slice(0, 4), number: record.documentNumber })
  await page.goto(`/en/open-lgu/legislation?${query}`)
  await expect(page.getByLabel('Document number', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Document number', { exact: true })).toHaveValue(record.documentNumber)
  await expect(page.getByRole('region', { name: 'Captured source rows' }).locator(`a[href$="/${encodeURIComponent(record.recordId)}"]`)).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('Document number', { exact: true })).toHaveValue(record.documentNumber)
  await page.getByRole('link', { name: 'Filipino', exact: true }).click()
  await expect(page.getByLabel('Numero ng dokumento', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Numero ng dokumento', { exact: true })).toHaveValue(record.documentNumber)
  await expect(page.locator('html')).toHaveAttribute('lang', 'fil')
  await page.getByRole('button', { name: 'Alisin ang mga salaan' }).click()
  await expect(page).not.toHaveURL(/number=/)
})
