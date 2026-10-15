import { NormalizedOpportunity, sanitizeLink } from '../types/opportunity';

export interface Scraper {
  name: string;
  scrape(): Promise<NormalizedOpportunity[]>;
}

export const USER_AGENT = 'ArgusOpportunityRadar/1.0 (Alert discovery engine)';

export async function safeFetch(url: string, headers: Record<string, string> = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json, application/xml, text/html, */*',
        ...headers,
      },
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

// Security: treat scraped web content as untrusted plain text
export function cleanUntrustedText(text: string, maxLength = 300): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[\r\n\t]+/g, ' ') // Collapse whitespace
    .trim()
    .slice(0, maxLength);
}
