import { Scraper, safeFetch, cleanUntrustedText } from '../base';
import { NormalizedOpportunity, parseRewardAmount, sanitizeLink } from '../../types/opportunity';

export class TaikaiScraper implements Scraper {
  name = 'taikai';

  async scrape(): Promise<NormalizedOpportunity[]> {
    const opportunities: NormalizedOpportunity[] = [];
    const nowIso = new Date().toISOString();

    try {
      const res = await safeFetch('https://api.taikai.network/api/v1/hackathons?status=active');
      if (res.ok) {
        const data = await res.json();
        const items = data.data || data.hackathons || [];

        for (const item of items) {
          const rawTitle = item.name || item.title;
          const link = sanitizeLink(item.slug ? `https://taikai.network/en/${item.slug}` : 'https://taikai.network');
          if (!rawTitle || !link) continue;

          const reward = item.totalPrizes ? `$${item.totalPrizes}` : 'Rewards in challenge';
          let deadline: string | null = null;
          if (item.endDate) {
            const d = new Date(item.endDate);
            if (!isNaN(d.getTime())) deadline = d.toISOString();
          }

          opportunities.push({
            title: cleanUntrustedText(rawTitle, 120),
            source: 'taikai',
            category: 'hackathon',
            reward,
            reward_num: parseRewardAmount(reward),
            deadline,
            link,
            tags: ['Taikai', 'Web3', 'Open Innovation'],
            first_seen: nowIso,
          });
        }
      }
    } catch (err) {
      console.error('[TaikaiScraper] scrape failed:', err);
    }

    return opportunities;
  }
}
