import { Scraper, safeFetch, cleanUntrustedText } from '../base';
import { NormalizedOpportunity, parseRewardAmount, sanitizeLink } from '../../types/opportunity';

export class EthGlobalScraper implements Scraper {
  name = 'ethglobal';

  async scrape(): Promise<NormalizedOpportunity[]> {
    const opportunities: NormalizedOpportunity[] = [];
    const nowIso = new Date().toISOString();

    try {
      const res = await safeFetch('https://ethglobal.com/api/events');
      if (res.ok) {
        const data = await res.json();
        const events = Array.isArray(data) ? data : (data.events || []);

        for (const ev of events) {
          const rawTitle = ev.name || ev.title;
          const slug = ev.slug || ev.id;
          const link = sanitizeLink(ev.url || (slug ? `https://ethglobal.com/events/${slug}` : 'https://ethglobal.com'));
          if (!rawTitle || !link) continue;

          const reward = ev.prizes ? `$${ev.prizes}` : '$100,000+ Prize Pool';
          let deadline: string | null = null;
          if (ev.endDate || ev.end_date) {
            const d = new Date(ev.endDate || ev.end_date);
            if (!isNaN(d.getTime())) deadline = d.toISOString();
          }

          opportunities.push({
            title: cleanUntrustedText(rawTitle, 120),
            source: 'ethglobal',
            category: 'hackathon',
            reward,
            reward_num: parseRewardAmount(reward),
            deadline,
            link,
            tags: ['ETHGlobal', 'Ethereum', 'Web3'],
            first_seen: nowIso,
          });
        }
      }
    } catch (err) {
      console.error('[EthGlobalScraper] scrape failed:', err);
    }

    return opportunities;
  }
}
