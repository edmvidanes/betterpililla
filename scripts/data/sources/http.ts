import { sha256 } from '../normalize.ts';

export interface Capture { url: string; finalUrl: string; status: number; contentType: string; retrievedAt: string; sourceDate: string | null; sourceDateHeader?: string | null; sha256?: string; body: string; }
export type Fetcher = typeof fetch;
const agent = 'BetterCavintiManualResearch/1.0';

export class SourceClient {
  private robots = new Map<string, Promise<string>>();
  private fetcher: Fetcher;
  constructor(fetcher: Fetcher = fetch) { this.fetcher = fetcher; }

  private async allowed(url: URL): Promise<boolean> {
    let pending = this.robots.get(url.origin);
    if (!pending) {
      pending = (async () => {
        const response = await this.fetcher(`${url.origin}/robots.txt`, { headers: { 'User-Agent': agent }, signal: AbortSignal.timeout(30000) });
        if (response.status === 404 || response.status === 410) return '';
        if (!response.ok) throw new Error(`robots.txt unavailable (${response.status}); source not requested`);
        const text = await response.text();
        if (text.length > 512000) throw new Error('robots.txt too large; source not requested');
        return text;
      })();
      this.robots.set(url.origin, pending);
    }
    const text = await pending;
    const groups: { agents: string[]; rules: { allow: boolean; value: string }[] }[] = [];
    let group: (typeof groups)[number] | undefined;
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.replace(/#.*/, '').trim();
      const colon = line.indexOf(':');
      if (colon === -1) continue;
      const key = line.slice(0, colon).toLowerCase().trim();
      const value = line.slice(colon + 1).trim();
      if (key === 'user-agent') {
        if (!group || group.rules.length) { group = { agents: [], rules: [] }; groups.push(group); }
        group.agents.push(value.toLowerCase());
      } else if (group && (key === 'allow' || key === 'disallow') && value) group.rules.push({ allow: key === 'allow', value });
    }
    const specific = groups.filter((item) => item.agents.some((name) => name !== '*' && agent.toLowerCase().includes(name)));
    const selected = specific.length ? specific : groups.filter((item) => item.agents.includes('*'));
    let best = -1; let allowed = true;
    for (const item of selected) for (const rule of item.rules) {
      const pattern = rule.value.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$');
      if (new RegExp(`^${pattern}`).test(url.pathname + url.search) && (rule.value.length > best || rule.value.length === best && rule.allow)) {
        best = rule.value.length; allowed = rule.allow;
      }
    }
    return allowed;
  }

  async capture(input: string, method: 'GET' | 'HEAD' = 'GET'): Promise<Capture> {
    let url = new URL(input);
    for (let redirects = 0; redirects <= 5; redirects++) {
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Unsupported source URL');
      if (!await this.allowed(url)) throw new Error(`robots.txt disallows ${url.href}; access controls not bypassed`);
      const response = await this.fetcher(url, { method, redirect: 'manual', headers: { 'User-Agent': agent, Accept: 'application/json,text/html,application/pdf;q=0.8,*/*;q=0.5' }, signal: AbortSignal.timeout(45000) });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) throw new Error('Source redirect missing location');
        url = new URL(location, url); continue;
      }
      const contentType = response.headers.get('content-type') ?? 'unknown';
      if (Number(response.headers.get('content-length')) > 8_000_000 && method === 'GET') throw new Error('Source response exceeds manual metadata capture limit (8 MB)');
      const bytes = method === 'HEAD' ? new Uint8Array() : new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength > 8_000_000) throw new Error('Source response exceeds manual metadata capture limit (8 MB)');
      const body = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      const sourceDateHeader = response.headers.get('last-modified');
      const modified = sourceDateHeader ? new Date(sourceDateHeader) : null;
      return { url: input, finalUrl: url.href, status: response.status, contentType, retrievedAt: new Date().toISOString(),
        sourceDate: modified && Number.isFinite(modified.valueOf()) ? modified.toISOString() : null, sourceDateHeader,
        ...(method === 'GET' ? { sha256: sha256(bytes) } : {}), body };
    }
    throw new Error('Source redirected more than five times');
  }
}
