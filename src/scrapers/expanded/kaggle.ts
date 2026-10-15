import { Scraper, safeFetch, cleanUntrustedText } from '../base';
import { NormalizedOpportunity, parseRewardAmount, sanitizeLink } from '../../types/opportunity';

export class KaggleScraper implements Scraper {
  name = 'kaggle';

  async scrape(): Promise<NormalizedOpportunity[]> {
    const opportunities: NormalizedOpportunity[] = [];
    const nowIso = new Date().toISOString();

    try {
      const res = await safeFetch('https://www.kaggle.com/api/v1/competitions/list?category=all&sortBy=latestDeadline');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          for (const comp of data.slice(0, 15)) {
            const rawTitle = comp.title;
            const link = sanitizeLink(comp.ref ? `https://www.kaggle.com/competitions/${comp.ref}` : comp.url || '');
            if (!rawTitle || !link) continue;

            const reward = comp.reward || 'Knowledge / Medals';
            let deadline: string | null = null;
            if (comp.deadline) {
              const d = new Date(comp.deadline);
              if (!isNaN(d.getTime())) deadline = d.toISOString();
            }

            opportunities.push({
              title: cleanUntrustedText(rawTitle, 120),
              source: 'kaggle',
              category: 'bounty',
              reward,
              reward_num: parseRewardAmount(reward),
              deadline,
              link,
              tags: ['Kaggle', 'Machine Learning', comp.category || 'Data Science'],
              first_seen: nowIso,
            });
          }
        }
      }
    } catch (err) {
      console.error('[KaggleScraper] scrape failed:', err);
    }

    return opportunities;
  }
}
