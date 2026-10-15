import { Scraper, safeFetch, cleanUntrustedText } from './base';
import { NormalizedOpportunity, parseRewardAmount, sanitizeLink, OpportunityCategory } from '../types/opportunity';

export class SuperteamScraper implements Scraper {
  name = 'superteam_earn';

  async scrape(): Promise<NormalizedOpportunity[]> {
    const opportunities: NormalizedOpportunity[] = [];
    const nowIso = new Date().toISOString();

    const endpoints = [
      'https://earn.superteam.fun/api/bounties/',
      'https://earn.superteam.fun/api/listings/',
    ];

    for (const url of endpoints) {
      try {
        const res = await safeFetch(url);
        if (!res.ok) continue;

        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.bounties || data.listings || []);

        for (const item of items) {
          const rawTitle = item.title || item.name;
          if (!rawTitle) continue;
          const title = cleanUntrustedText(rawTitle, 130);

          const isGrant = (item.type || '').toLowerCase().includes('grant') || 
                          (item.category || '').toLowerCase().includes('grant');
          const category: OpportunityCategory = isGrant ? 'grant' : 'bounty';

          // Guardrail: explicitly format reward or flag as Unspecified
          const reward = item.rewardAmount 
            ? `${item.rewardAmount} ${item.token || 'USDC'}` 
            : (item.prize ? `$${item.prize}` : 'Reward not disclosed');

          let deadline: string | null = null;
          if (item.deadline) {
            const d = new Date(item.deadline);
            if (!isNaN(d.getTime())) deadline = d.toISOString();
          }

          const slug = item.slug || item.id;
          const rawUrl = item.url || (slug ? `https://earn.superteam.fun/listings/bounties/${slug}` : 'https://earn.superteam.fun');
          const link = sanitizeLink(rawUrl);
          if (!link) continue;

          const tags: string[] = ['Superteam', category.toUpperCase()];
          if (item.skills && Array.isArray(item.skills)) {
            tags.push(...item.skills.map((s: { label?: string; name?: string } | string) => 
              cleanUntrustedText(typeof s === 'string' ? s : (s.label || s.name || ''), 30)
            ).filter(Boolean));
          }

          opportunities.push({
            title,
            source: 'superteam_earn',
            category,
            reward,
            reward_num: parseRewardAmount(reward) || (item.rewardAmount ? Number(item.rewardAmount) : null),
            deadline,
            link,
            tags: tags.slice(0, 5),
            first_seen: nowIso,
          });
        }

        if (opportunities.length > 0) break;
      } catch (err) {
        console.error(`[SuperteamScraper] Failed on ${url}:`, err);
      }
    }

    return opportunities;
  }
}
