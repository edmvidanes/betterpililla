import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createServer } from 'vite'
import { join } from 'node:path'
import { routes } from '../src/app/route-manifest.ts'
import { lgu } from '../src/config/lgu.ts'
import { staticEntryPath } from './static-path.ts'
import { transparencyRecordId } from '../src/domain/transparency-record.ts'

const root = process.cwd()
const publicData = join(root, 'public', lgu.dataPath)
const search = JSON.parse(await readFile(join(publicData, 'search-index.json'), 'utf8'))
const offices = JSON.parse(await readFile(join(publicData, 'emergency-contacts.json'), 'utf8'))
const services = JSON.parse(await readFile(join(publicData, 'services.json'), 'utf8'))
const ordinances = JSON.parse(await readFile(join(publicData, 'legislation', 'ordinances.json'), 'utf8'))
const news = JSON.parse(await readFile(join(root, 'src/data/cavinti-news.json'), 'utf8'))
const transparency = JSON.parse(await readFile(join(publicData, 'transparency.json'), 'utf8'))
const catalogs = {
  en: JSON.parse(await readFile(join(root, 'src/i18n/catalogs/en.json'), 'utf8')),
  fil: JSON.parse(await readFile(join(root, 'src/i18n/catalogs/fil.json'), 'utf8')),
}
type Locale = keyof typeof catalogs
type Metadata = { title: string | Record<Locale, string>; text?: string | Record<Locale, string> }
const pages = new Map<string, Metadata>()
for (const [path, key] of routes) pages.set(path, { title: { en: catalogs.en[key], fil: catalogs.fil[key] } })
for (const record of search) {
  const path = record.path?.replace(/^\//, '')
  if (path && !pages.has(path)) pages.set(path, { title: record.title, text: record.text })
}
for (const office of offices.records) {
  const path = `government/offices/${encodeURIComponent(office.category)}`
  if (!pages.has(path)) pages.set(path, { title: office.service })
}
for (const service of services.services) pages.set(`services/${encodeURIComponent(service.recordId)}`, { title: service.name })
for (const lead of services.serviceLegislationLeads || []) {
  if (ordinances.records.some((record: { recordId: string; sourceId: string }) => record.recordId === lead.recordId && record.sourceId === lead.sourceId)) {
    pages.set(`services/${encodeURIComponent(lead.recordId)}`, { title: lead.topic, text: { en: 'Ordinance index lead; current service availability has not been confirmed.', fil: 'Batay sa indeks ng ordinansa; hindi pa nakumpirma ang kasalukuyang serbisyo.' } })
  }
}
for (const article of news.articles) pages.set(`news/${encodeURIComponent(article.id)}`, { title: article.title, text: article.bodyText })
for (const record of transparency.dpwhProjectSnapshot || []) pages.set(`transparency/projects/${transparencyRecordId(record)}`, { title: record.description })
for (const record of transparency.betterGovProcurementLeads || []) pages.set(`transparency/procurement/${transparencyRecordId(record)}`, { title: record.title })
const children = new Map<string, string[]>()
for (const path of pages.keys()) {
  if (!path) continue
  const parent = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : ''
  if (!pages.has(parent)) continue
  const siblings = children.get(parent) || []
  siblings.push(path)
  children.set(parent, siblings)
}

const origin = 'https://www.bettercavinti.org'
const basePath = new URL(process.env.SITE_BASE || '/', origin).pathname.replace(/\/*$/, '/')
const url = (locale: Locale, path: string) => `${origin}${basePath}${locale}/${path}`
const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const localized = (value: string | Record<Locale, string> | undefined, locale: Locale) => typeof value === 'string' ? value : value?.[locale] || ''
const html = await readFile(join(root, 'dist/index.html'), 'utf8')
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
let home: Record<Locale, string>
try {
  const { renderHome } = await vite.ssrLoadModule('/src/app/prerender.tsx')
  home = { en: renderHome('en'), fil: renderHome('fil') }
} finally {
  await vite.close()
}
const entries: string[] = []
for (const locale of ['en', 'fil'] as const) {
  for (const [path, page] of pages) {
    const label = localized(page.title, locale)
    const title = path ? `${label} · Better${lgu.name}` : `Better${lgu.name} · ${catalogs[locale].communityPortal}`
    const text = localized(page.text, locale).replace(/\s+/g, ' ').trim()
    const description = text ? text.slice(0, 160) : locale === 'fil'
      ? `${label}: impormasyon at mga pampublikong rekord tungkol sa Cavinti, Laguna.`
      : `${label}: public information and records about Cavinti, Laguna.`
    const canonical = url(locale, path)
    const social = `<meta property="og:type" content="website" />\n    <meta property="og:site_name" content="Better${lgu.name}" />\n    <meta property="og:title" content="${escape(title)}" />\n    <meta property="og:description" content="${escape(description)}" />\n    <meta property="og:url" content="${escape(canonical)}" />\n    <meta property="og:image" content="${origin}${basePath}social-hero.jpg" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta property="og:image:alt" content="Cavinti, Laguna: photographs from the portal's homepage" />\n    <meta name="twitter:card" content="summary_large_image" />\n    <meta name="twitter:title" content="${escape(title)}" />\n    <meta name="twitter:description" content="${escape(description)}" />\n    <meta name="twitter:image" content="${origin}${basePath}social-hero.jpg" />`
    const metadata = `<meta name="description" content="${escape(description)}" />\n    <link rel="canonical" href="${escape(canonical)}" />\n    <link rel="alternate" hreflang="en" href="${escape(url('en', path))}" />\n    <link rel="alternate" hreflang="fil" href="${escape(url('fil', path))}" />\n    <link rel="alternate" hreflang="x-default" href="${escape(url('en', path))}" />${path === 'search' ? '\n    <meta name="robots" content="noindex, follow" />' : ''}\n    <title>${escape(title)}</title>`
    const parent = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : ''
    const localUrl = (child: string) => `${basePath}${locale}/${child}`
    const links = (children.get(path) || []).map(child => `<li><a href="${escape(localUrl(child))}">${escape(localized(pages.get(child)!.title, locale))}</a></li>`).join('')
    const fallback = path === ''
      ? `<div id="root" data-prerendered>${home[locale]}</div>`
      : `<div id="root"><main><h1>${escape(label)}</h1><p>${escape(text || description)}</p>${links ? `<ul>${links}</ul>` : ''}<p><a href="${escape(localUrl(parent))}">${escape(parent ? catalogs[locale][routes.find(([route]) => route === parent)?.[1] || 'home'] : catalogs[locale].home)}</a></p></main></div>`
    const pageHtml = html.replace('lang="en"', `lang="${locale}"`)
      .replace(/<meta name="description"[^>]*>\s*<title>[^<]*<\/title>/, `${metadata}\n    ${social}`)
      .replace('<div id="root"></div>', fallback)
    const directory = staticEntryPath(join(root, 'dist', locale), path)
    await mkdir(directory, { recursive: true })
    await writeFile(join(directory, 'index.html'), pageHtml)
    if (path !== 'search') entries.push(`  <url><loc>${escape(canonical)}</loc></url>`)
    if (locale === 'en' && path === '') await writeFile(join(root, 'dist/index.html'), pageHtml)
  }
}
await writeFile(join(root, 'dist/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`)
await writeFile(join(root, 'dist/robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}${basePath}sitemap.xml\n`)
// Unknown URLs preserve the request when hosts use their custom 404 document.
await writeFile(join(root, 'dist/404.html'), html.replace('</head>', '  <meta name="robots" content="noindex, follow" />\n  </head>'))
console.log(`Static entry pages: ${pages.size} paths × 2 locales; sitemap, robots.txt and custom 404.html. Base: ${process.env.SITE_BASE || '/'}`)
