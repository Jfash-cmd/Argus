import { Scraper, safeFetch, cleanUntrustedText } from '../base';
import { NormalizedOpportunity, parseRewardAmount, sanitizeLink } from '../../types/opportunity';

export class DevfolioScraper implements Scraper {
  name = 'devfolio';

  async scrape(): Promise<NormalizedOpportunity[]> {
    const opportunities: NormalizedOpportunity[] = [];
    const nowIso = new Date().toISOString();

    try {
      const res = await safeFetch('https://api.devfolio.co/api/hackathons?filter=open&page=1&limit=20');
      if (res.ok) {
        const data = await res.json();
        const items = data.result || data.hackathons || [];

        for (const item of items) {
          const rawTitle = item.name || item.title;
          const slug = item.slug || item.id;
          const link = sanitizeLink(slug ? `https://${slug}.devfolio.co` : 'https://devfolio.co');
          if (!rawTitle || !link) continue;

          const reward = item.prizes_total ? `$${item.prizes_total}` : 'Prize pool in hackathon';
          let deadline: string | null = null;
          if (item.ends_at) {
            const d = new Date(item.ends_at);
            if (!isNaN(d.getTime())) deadline = d.toISOString();
          }

          opportunities.push({
            title: cleanUntrustedText(rawTitle, 120),
            source: 'devfolio',
            category: 'hackathon',
            reward,
            reward_num: parseRewardAmount(reward),
            deadline,
            link,
            tags: ['Devfolio', 'Hackathon'],
            first_seen: nowIso,
          });
        }
      }
    } catch (err) {
      console.error('[DevfolioScraper] scrape failed:', err);
    }

    return opportunities;
  }
}
