import { Scraper, safeFetch, cleanUntrustedText } from '../base';
import { NormalizedOpportunity, parseRewardAmount, sanitizeLink } from '../../types/opportunity';

export class HackQuestScraper implements Scraper {
  name = 'hackquest';

  async scrape(): Promise<NormalizedOpportunity[]> {
    const opportunities: NormalizedOpportunity[] = [];
    const nowIso = new Date().toISOString();

    try {
      const res = await safeFetch('https://api.hackquest.io/v1/hackathons?page=1&limit=20');
      if (res.ok) {
        const data = await res.json();
        const items = data.data || data.items || [];

        for (const item of items) {
          const rawTitle = item.name || item.title;
          const link = sanitizeLink(item.link || `https://hackquest.io/hackathons/${item.id || item.alias}`);
          if (!rawTitle || !link) continue;

          const reward = item.totalPrize ? `$${item.totalPrize}` : 'Prize pool in description';
          let deadline: string | null = null;
          if (item.endTime) {
            const d = new Date(item.endTime);
            if (!isNaN(d.getTime())) deadline = d.toISOString();
          }

          opportunities.push({
            title: cleanUntrustedText(rawTitle, 120),
            source: 'hackquest',
            category: 'hackathon',
            reward,
            reward_num: parseRewardAmount(reward),
            deadline,
            link,
            tags: ['HackQuest', 'Web3', ...(item.ecosystems || [])].slice(0, 5),
            first_seen: nowIso,
          });
        }
      }
    } catch (err) {
      console.error('[HackQuestScraper] scrape failed:', err);
    }

    return opportunities;
  }
}
