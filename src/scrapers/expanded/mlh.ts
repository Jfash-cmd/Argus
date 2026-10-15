import * as cheerio from 'cheerio';
import { Scraper, safeFetch, cleanUntrustedText } from '../base';
import { NormalizedOpportunity, parseRewardAmount, sanitizeLink } from '../../types/opportunity';

export class MlhScraper implements Scraper {
  name = 'mlh';

  async scrape(): Promise<NormalizedOpportunity[]> {
    const opportunities: NormalizedOpportunity[] = [];
    const nowIso = new Date().toISOString();

    try {
      const res = await safeFetch('https://mlh.io/seasons/2026/events');
      if (res.ok) {
        const html = await res.text();
        const $ = cheerio.load(html);

        $('.event-wrapper').each((_, el) => {
          const rawTitle = $(el).find('.event-name').text().trim();
          const rawLink = $(el).find('a').first().attr('href') || '';
          const link = sanitizeLink(rawLink);
          if (!rawTitle || !link) return;

          const dateStr = $(el).find('.event-date').text().trim();
          let deadline: string | null = null;
          if (dateStr) {
            const parsed = new Date(dateStr);
            if (!isNaN(parsed.getTime())) deadline = parsed.toISOString();
          }

          opportunities.push({
            title: cleanUntrustedText(rawTitle, 120),
            source: 'mlh',
            category: 'hackathon',
            reward: 'Sponsored prizes & swag',
            reward_num: null,
            deadline,
            link,
            tags: ['MLH', 'Student', 'Hackathon'],
            first_seen: nowIso,
          });
        });
      }
    } catch (err) {
      console.error('[MlhScraper] scrape failed:', err);
    }

    return opportunities;
  }
}
