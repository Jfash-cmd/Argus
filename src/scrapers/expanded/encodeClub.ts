import { Scraper, safeFetch, cleanUntrustedText } from '../base';
import { NormalizedOpportunity, parseRewardAmount, sanitizeLink, isDeadlineExpired } from '../../types/opportunity';

export class EncodeClubScraper implements Scraper {
  name = 'encode_club';

  async scrape(): Promise<NormalizedOpportunity[]> {
    const opportunities: NormalizedOpportunity[] = [];
    const nowIso = new Date().toISOString();

    try {
      const res = await safeFetch('https://api.encode.club/programmes?type=hackathon&status=open');
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.programmes || []);

        for (const item of items) {
          const rawTitle = item.title || item.name;
          const link = sanitizeLink(item.url || 'https://www.encode.club/hackathons');
          if (!rawTitle || !link) continue;

          const reward = item.prizepool ? `$${item.prizepool}` : '$10,000+ Prize Pool';
          let deadline: string | null = null;
          if (item.deadline) {
            const d = new Date(item.deadline);
            if (!isNaN(d.getTime())) deadline = d.toISOString();
          }

          if (isDeadlineExpired(deadline)) continue;

          opportunities.push({
            title: cleanUntrustedText(rawTitle, 120),
            source: 'encode_club',
            category: 'web3_hackathon',
            reward,
            reward_num: parseRewardAmount(reward),
            deadline,
            link,
            tags: ['Web3', 'Blockchain'],
            first_seen: nowIso,
          });
        }
      }
    } catch (err) {
      console.error('[EncodeClubScraper] scrape failed:', err);
    }

    return opportunities;
  }
}
