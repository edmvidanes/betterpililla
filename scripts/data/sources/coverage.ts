import { parse } from 'parse5';
import type { DefaultTreeAdapterTypes } from 'parse5';
import type { AvailabilityStatus, SourceRecord } from '../../../src/domain/types.ts';
import { SourceClient } from './http.ts';

export interface CoverageCheck { sourceId: string; adapter: string; requestedUrl: string; finalUrl: string | null; retrievedAt: string; httpStatus: number | null; contentType: string | null; sourceDate: string | null; responseSha256?: string; availabilityStatus: AvailabilityStatus; freshnessStatus: 'not-checked' | 'stale'; note: string; observed?: { title: string; linkCount: number; tableCount: number; headings: string[]; }; }
const municipalChecks: Record<string, { family: string; requiredText: RegExp }> = {
  'cavinti-citizens-charter': { family: 'municipal-charter-coverage', requiredText: /Service Name.*Office\s*&\s*Contact/i },
  'cavinti-about': { family: 'municipal-geography-coverage', requiredText: /Cavinti|barangay/i },
  'cavinti-executive-directory': { family: 'municipal-directory-coverage', requiredText: /Executive Office/i },
  'cavinti-legislative-directory': { family: 'municipal-directory-coverage', requiredText: /Council|Sangguniang/i },
  'cavinti-other-documents': { family: 'municipal-document-coverage', requiredText: /document/i },
};

/** Inspect public page shape only. No universal facts parser, PDF archive or social-post scraper. */
export async function checkCoverage(source: SourceRecord, client: SourceClient): Promise<CoverageCheck> {
  const isPdf = /\.pdf(?:\?|$)/i.test(source.url);
  const social = source.tier === 'primary-lgu-social' || /facebook\.com/i.test(source.url);
  const adapter = isPdf ? 'document-metadata-head-only' : social ? 'official-channel-metadata-head-only'
    : municipalChecks[source.id]?.family ?? (/psa|deped|doh|dti|dilg|blgf|coa|philgeps|pagasa|phivolcs|namria|hazardhunter|tieza/.test(source.id) ? 'government-reference-coverage' : 'reference-documentation-coverage');
  const base = { sourceId: source.id, adapter, requestedUrl: source.url, retrievedAt: new Date().toISOString() };
  try {
    const capture = await client.capture(source.url, isPdf || social ? 'HEAD' : 'GET');
    const result: CoverageCheck = { ...base, retrievedAt: capture.retrievedAt, finalUrl: capture.finalUrl, httpStatus: capture.status,
      contentType: capture.contentType, sourceDate: capture.sourceDate, ...(capture.sha256 ? { responseSha256: capture.sha256 } : {}),
      availabilityStatus: capture.status === 401 || capture.status === 403 || capture.status === 429 ? 'access-blocked' : capture.status === 404 ? 'not-found-in-checked-source' : capture.status >= 200 && capture.status < 300 ? 'available' : 'unknown',
      freshnessStatus: 'not-checked', note: isPdf || social ? 'HEAD metadata only. Attachment text, social posts, completeness, legal correctness and current operation were not verified.' : 'HTTP/page-shape coverage only. Existing claims, source wording and last complete parsed records were not replaced.' };
    if (!isPdf && !social && /html/i.test(capture.contentType) && capture.status === 200) {
      const page = parse(capture.body);
      const titles: string[] = []; const headings: string[] = []; const texts: string[] = [];
      let linkCount = 0; let tableCount = 0;
      function text(node: DefaultTreeAdapterTypes.Node): string {
        if (node.nodeName === '#text') return (node as DefaultTreeAdapterTypes.TextNode).value;
        return 'childNodes' in node ? node.childNodes.map(text).join(' ') : '';
      }
      function visit(node: DefaultTreeAdapterTypes.Node): void {
        if ('tagName' in node) {
          if (['script', 'style', 'noscript'].includes(node.tagName)) return;
          if (node.tagName === 'a') linkCount++;
          if (node.tagName === 'table') tableCount++;
          if (node.tagName === 'title') titles.push(text(node).replace(/\s+/g, ' ').trim());
          if (/^h[1-3]$/.test(node.tagName)) headings.push(text(node).replace(/\s+/g, ' ').trim());
        }
        if (node.nodeName === '#text') texts.push((node as DefaultTreeAdapterTypes.TextNode).value);
        if ('childNodes' in node) for (const child of node.childNodes) visit(child);
      }
      visit(page);
      const visible = texts.join(' ').replace(/\s+/g, ' ');
      result.observed = { title: titles.join(' '), headings: headings.slice(0, 30), linkCount, tableCount };
      if (/just a moment|verify you are human|access denied|incapsula|enable javascript and cookies/i.test(`${titles.join(' ')} ${visible.slice(0, 2000)}`)) {
        result.availabilityStatus = 'access-blocked'; result.note = 'Challenge/access-control shell observed; no bypass or extraction attempted.';
      } else if (municipalChecks[source.id] && !municipalChecks[source.id].requiredText.test(visible)) {
        result.availabilityStatus = 'unknown'; result.note = 'Expected source-family page markers were absent. Parser coverage requires manual review; canonical claims unchanged.';
      }
    }
    return result;
  } catch (error) {
    return { ...base, finalUrl: null, httpStatus: null, contentType: null, sourceDate: null, availabilityStatus: 'access-blocked', freshnessStatus: 'stale', note: `Coverage request failed; existing capture retained. ${error instanceof Error ? error.message : String(error)}` };
  }
}
