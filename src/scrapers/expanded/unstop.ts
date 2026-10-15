import { Scraper, safeFetch, cleanUntrustedText } from '../base';
import { NormalizedOpportunity, parseRewardAmount, sanitizeLink } from '../../types/opportunity';

export class UnstopScraper implements Scraper {
  name = 'unstop';

  async scrape(): Promise<NormalizedOpportunity[]> {
    const opportunities: NormalizedOpportunity[] = [];
    const nowIso = new Date().toISOString();

    try {
      const res = await safeFetch('https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&per_page=20');
      if (res.ok) {
        const data = await res.json();
        const items = data.data?.data || data.items || [];

        for (const item of items) {
          const rawTitle = item.title;
          const link = sanitizeLink(item.seo_url ? `https://unstop.com/${item.seo_url}` : 'https://unstop.com');
          if (!rawTitle || !link) continue;

          const reward = item.prizes ? `$${item.prizes}` : 'Prizes & certificates';
          let deadline: string | null = null;
          if (item.end_date) {
            const d = new Date(item.end_date);
            if (!isNaN(d.getTime())) deadline = d.toISOString();
          }

          opportunities.push({
            title: cleanUntrustedText(rawTitle, 120),
            source: 'unstop',
            category: 'hackathon',
            reward,
            reward_num: parseRewardAmount(reward),
            deadline,
            link,
            tags: ['Unstop', 'Competition'],
            first_seen: nowIso,
          });
        }
      }
    } catch (err) {
      console.error('[UnstopScraper] scrape failed:', err);
    }

    return opportunities;
  }
}
