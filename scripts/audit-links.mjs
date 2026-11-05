import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { parse } from 'parse5';
import { routes } from '../src/app/route-manifest.ts';

const origin = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4174';
const urls = new Set();
const internal = new Map();
const pages = [];
const feeds = [];
function collect(value) {
  if (typeof value === 'string' && /^https?:\/\//.test(value)) urls.add(value);
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
}
const portal = JSON.parse(await readFile('public/data/portal.json', 'utf8'));
collect(portal);
for (const dataset of portal.datasets) collect(JSON.parse(await readFile('public/' + dataset.jsonUrl, 'utf8')));
const browser = await chromium.launch({ channel: 'msedge' });
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  page.on('response', async response => {
    if (!response.url().includes('/indexes/')) return;
    const payload = await response.json().catch(() => ({}));
    feeds.push({ url: response.url(), status: response.status(), total: payload.estimatedTotalHits ?? null, returned: payload.hits?.length ?? 0, descriptionsMentionPililla: payload.hits?.every(row => row.description ? /\bpililla\b/i.test(row.description) : row.organization_name === 'MUNICIPALITY OF PILILLA, RIZAL') ?? null });
  });
  for (const locale of ['en', 'fil']) for (const [route] of routes) {
    const errors = []; const onError = error => errors.push(error.message); page.on('pageerror', onError);
    const path = `/${locale}/${route}`;
    const response = await page.goto(origin + path, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('main') && !document.querySelector('main').textContent.includes('Loading validated public data') && !document.querySelector('main').textContent.includes('Naglo-load'), null, { timeout: 15000 }).catch(() => {});
    await page.locator('main h1').first().waitFor({ timeout: 15000 }).catch(() => {});
    await page.waitForFunction(() => !/Loading records|Kinukuha ang mga rekord/.test(document.querySelector('main')?.textContent || ''), null, { timeout: 15000 }).catch(() => {});
    const links = await page.locator('a[href], [data-external-url]').evaluateAll(items => items.map(a => ({ url: a.href || a.dataset.externalUrl, text: a.textContent.trim() })));
    for (const link of links) {
      if (link.url.startsWith(origin + '/')) internal.set(link.url, link.text);
      else if (/^https?:\/\//.test(link.url)) urls.add(link.url);
    }
    const body = await page.locator('main').innerText({ timeout: 500 }).catch(() => '');
    pages.push({ path, status: response.status(), heading: await page.locator('main h1').first().textContent({ timeout: 500 }).catch(() => ''), textLength: body.length, loading: /Loading validated|Naglo-load|Loading records|Kinukuha ang mga rekord/.test(body), workInProgress: body.includes('WorkInProgress'), errors });
    page.off('pageerror', onError);
    console.log(`page: ${path}, ${body.length} characters, ${errors.length} errors`);
  }
} finally { await browser.close(); }
await mkdir('docs/qa', { recursive: true });
const rows = data => '[\n' + data.map(row => '  ' + JSON.stringify(row)).join(',\n') + '\n]\n';
await writeFile('docs/qa/page-audit.json', rows(pages));
await writeFile('docs/qa/live-data.json', rows(feeds));
console.log(`Collected ${urls.size} external links from ${pages.length} pages.`);

function contentInfo(buffer, type) {
  const raw = buffer.toString('utf8');
  if (!type.includes('html')) return { title: '', text: raw.slice(0, 1000) };
  let title = '', text = '';
  function visit(node, inTitle = false) {
    if (['script', 'style', 'noscript'].includes(node.tagName)) return;
    if (node.nodeName === '#text') { text += node.value + ' '; if (inTitle) title += node.value; }
    node.childNodes?.forEach(child => visit(child, inTitle || node.tagName === 'title'));
  }
  visit(parse(raw));
  return { title: title.trim(), text: text.replace(/\s+/g, ' ').trim() };
}
async function check(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  const base = { url, checkedAt: new Date().toISOString() };
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'BetterPililla-LinkQA/1.0', Range: 'bytes=0-1048575' } });
    const type = response.headers.get('content-type') || '';
    const chunks = []; let size = 0;
    for await (const chunk of response.body) { chunks.push(chunk); size += chunk.length; if (size >= 1048576) break; }
    const buffer = Buffer.concat(chunks);
    const { title, text } = contentInfo(buffer, type);
    let status = response.ok ? 'ok' : 'unavailable';
    let reason = response.ok ? 'Nonempty response received.' : `HTTP ${response.status}`;
    if (response.ok && (!buffer.length || type.includes('html') && text.length < 40)) { status = 'empty'; reason = 'No usable content returned.'; }
    if (response.ok && /just a moment|access denied|page not found|404 not found|verify you are human/i.test(title)) { status = 'unavailable'; reason = `Unavailable page: ${title}`; }
    if (type.includes('pdf') && buffer.subarray(0, 1024).indexOf(Buffer.from('%PDF-')) < 0) { status = 'unavailable'; reason = 'The PDF link did not return a PDF.'; }
    return { ...base, status, httpStatus: response.status, finalUrl: response.url, title, contentBytes: buffer.length, contentType: type, reason };
  } catch (error) { return { ...base, status: 'unavailable', httpStatus: null, reason: error.name === 'AbortError' ? 'Request timed out after 15 seconds.' : error.message }; }
  finally { clearTimeout(timer); }
}
const previous = JSON.parse(await readFile('src/data/link-audit.json', 'utf8'));
const queue = process.argv.includes('--pages-only') ? [] : [...urls].sort(); const results = queue.length ? [] : previous.links;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (queue.length) { const url = queue.shift(); const result = await check(url); results.push(result); console.log(`${result.status}: ${url}`); }
}));
results.sort((a, b) => a.url.localeCompare(b.url));
await writeFile('src/data/link-audit.json', '{\n  "links": [\n' + results.map(row => '    ' + JSON.stringify(row)).join(',\n') + '\n  ]\n}\n');
const local = [];
for (const [url] of internal) { const response = await fetch(url); local.push({ url, status: response.status, contentType: response.headers.get('content-type') }); }
await writeFile('docs/qa/internal-links.json', rows(local));
console.log(JSON.stringify({ external: results.length, working: results.filter(r => r.status === 'ok').length, unavailable: results.filter(r => r.status !== 'ok').length, internal: local.length }));
process.exit(0);
