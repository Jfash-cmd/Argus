import * as cheerio from 'cheerio';
import { Scraper, safeFetch, cleanUntrustedText } from '../base';
import { NormalizedOpportunity, parseRewardAmount, sanitizeLink } from '../../types/opportunity';

export class EthGlobalScraper implements Scraper {
  name = 'ethglobal';

  async scrape(): Promise<NormalizedOpportunity[]> {
    const opportunities: NormalizedOpportunity[] = [];
    const nowIso = new Date().toISOString();

    try {
      const res = await safeFetch('https://ethglobal.com/events');
      if (res.ok) {
        const html = await res.text();
        const $ = cheerio.load(html);
        const seen = new Set<string>();

        $('a[href^="/events/"]').each((_, el) => {
          const href = $(el).attr('href') || '';
          const cleanHref = href.split('?')[0].replace(/\/+$/, '');
          if (seen.has(cleanHref) || cleanHref === '/events') return;

          const rawText = $(el).text().replace(/\s+/g, ' ').trim();
          if (!rawText || (rawText.includes('Apply to Attend') && rawText.length < 20)) return;

          let title = $(el).find('h2, h3, h4').first().text().trim();
          if (!title) {
            const match = rawText.match(/(ETHGlobal\s+[A-Za-z0-9\s]+?)(?:Virtual|IRL|Hackathon|Conference|[0-9]{4}|$)/i);
            if (match) {
              title = match[1].trim();
            } else {
              const slug = cleanHref.replace('/events/', '');
              title = `ETHGlobal ${slug.charAt(0).toUpperCase() + slug.slice(1)}`;
            }
          }

          if (!title) return;
          seen.add(cleanHref);

          opportunities.push({
            title: cleanUntrustedText(title, 120),
            source: 'ethglobal',
            category: 'web3_hackathon',
            reward: '$100,000+ Prize Pool',
            reward_num: 100000,
            deadline: null,
            link: `https://ethglobal.com${cleanHref}`,
            tags: ['Ethereum', 'Web3'],
            first_seen: nowIso,
          });
        });
      }
    } catch (err) {
      console.error('[EthGlobalScraper] scrape failed:', err);
    }

    return opportunities.slice(0, 25);
  }
}
