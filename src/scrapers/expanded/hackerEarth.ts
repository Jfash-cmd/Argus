import { Scraper, safeFetch, cleanUntrustedText } from '../base';
import { NormalizedOpportunity, parseRewardAmount, sanitizeLink } from '../../types/opportunity';

export class HackerEarthScraper implements Scraper {
  name = 'hackerearth';

  async scrape(): Promise<NormalizedOpportunity[]> {
    const opportunities: NormalizedOpportunity[] = [];
    const nowIso = new Date().toISOString();

    try {
      const res = await safeFetch('https://www.hackerearth.com/api/events/upcoming/?format=json');
      if (res.ok) {
        const data = await res.json();
        const items = data.response || [];

        for (const item of items) {
          const rawTitle = item.title;
          const link = sanitizeLink(item.url || '');
          if (!rawTitle || !link) continue;

          let deadline: string | null = null;
          if (item.end_tz) {
            const d = new Date(item.end_tz);
            if (!isNaN(d.getTime())) deadline = d.toISOString();
          }

          opportunities.push({
            title: cleanUntrustedText(rawTitle, 120),
            source: 'hackerearth',
            category: 'hackathon',
            reward: 'Prizes & hiring opportunities',
            reward_num: null,
            deadline,
            link,
            tags: ['HackerEarth', 'Competitive Programming'],
            first_seen: nowIso,
          });
        }
      }
    } catch (err) {
      console.error('[HackerEarthScraper] scrape failed:', err);
    }

    return opportunities;
  }
}
