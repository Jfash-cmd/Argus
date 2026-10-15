import * as cheerio from 'cheerio';
import { Scraper, safeFetch, cleanUntrustedText } from '../base';
import { NormalizedOpportunity, parseRewardAmount, sanitizeLink } from '../../types/opportunity';

export class SubstackMediumScraper implements Scraper {
  name = 'substack_medium';

  async scrape(): Promise<NormalizedOpportunity[]> {
    const opportunities: NormalizedOpportunity[] = [];
    const nowIso = new Date().toISOString();
    const feeds = [
      'https://medium.com/feed/tag/hackathon',
      'https://medium.com/feed/tag/bug-bounty',
    ];

    for (const url of feeds) {
      try {
        const res = await safeFetch(url);
        if (!res.ok) continue;
        const text = await res.text();
        const $ = cheerio.load(text, { xmlMode: true });

        $('item').each((_, el) => {
          const rawTitle = $(el).find('title').text().trim();
          const rawLink = $(el).find('link').text().trim();
          const pubDate = $(el).find('pubDate').text().trim();
          const link = sanitizeLink(rawLink);
          if (!rawTitle || !link) return;

          const title = cleanUntrustedText(rawTitle, 120);
          opportunities.push({
            title,
            source: 'substack_medium',
            category: url.includes('bounty') ? 'bounty' : 'hackathon',
            reward: 'See article announcement',
            reward_num: null,
            deadline: null,
            link,
            tags: ['Newsletter', 'Medium'],
            first_seen: pubDate ? new Date(pubDate).toISOString() : nowIso,
          });
        });
      } catch (err) {
        console.error(`[SubstackMediumScraper] Failed on ${url}:`, err);
      }
    }

    return opportunities;
  }
}
