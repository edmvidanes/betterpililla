import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4174',
    launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : undefined,
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: 'npm run dev -- --host 127.0.0.1 --port 4174 --strictPort',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: !process.env.CI,
  },
})
