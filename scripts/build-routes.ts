import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { routes } from '../src/app/route-manifest.ts'
import { lgu } from '../src/config/lgu.ts'
import { staticEntryPath } from './static-path.ts'

const root = process.cwd()
const publicData = join(root, 'public', lgu.dataPath)
const portal = JSON.parse(await readFile(join(publicData, 'portal.json'), 'utf8'))
const offices = JSON.parse(await readFile(join(publicData, 'emergency-contacts.json'), 'utf8'))
const services = JSON.parse(await readFile(join(publicData, 'services.json'), 'utf8'))
const news = JSON.parse(await readFile(join(root, 'src/data/cavinti-news.json'), 'utf8'))
const allPaths = new Set<string>(routes.map(([path]) => path))
for (const record of portal.search) if (record.path) allPaths.add(record.path.replace(/^\//, ''))
for (const office of offices.records) allPaths.add(`government/offices/${encodeURIComponent(office.category)}`)
for (const service of [...services.services, ...(services.serviceLegislationLeads || [])]) allPaths.add(`services/${encodeURIComponent(service.recordId)}`)
for (const article of news.articles) allPaths.add(`news/${encodeURIComponent(article.id)}`)
const html = await readFile(join(root, 'dist/index.html'), 'utf8')
for (const locale of ['en', 'fil']) {
  for (const path of allPaths) {
    const directory = staticEntryPath(join(root, 'dist', locale), path)
    await mkdir(directory, { recursive: true })
    await writeFile(join(directory, 'index.html'), html.replace('lang="en"', `lang="${locale}"`))
  }
}
// Unknown URLs preserve the request when hosts use their custom 404 document.
await writeFile(join(root, 'dist/404.html'), html)
console.log(`Static entry pages: ${allPaths.size} paths × 2 locales; custom 404.html. Base: ${process.env.SITE_BASE || '/'}`)
