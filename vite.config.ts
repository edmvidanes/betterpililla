import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import type { Connect } from 'vite'

function budgetRoutes() {
  const rewrite: Connect.NextHandleFunction = (request, _response, next) => {
    const path = request.url?.split('?')[0] || ''
    if (path.startsWith('/budget-portal/') && !path.split('/').at(-1)?.includes('.')) request.url = '/budget-portal/index.html'
    next()
  }
  return { name: 'budget-routes', configureServer(server: { middlewares: Connect.Server }) { server.middlewares.use(rewrite) }, configurePreviewServer(server: { middlewares: Connect.Server }) { server.middlewares.use(rewrite) } }
}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.SITE_BASE || '/',
  plugins: [budgetRoutes(), react(), tailwindcss()],
})
