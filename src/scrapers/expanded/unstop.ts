import { Scraper, safeFetch, cleanUntrustedText } from '../base';
import { NormalizedOpportunity, parseRewardAmount, sanitizeLink, cleanRewardString } from '../../types/opportunity';

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
          let reward = 'Prizes & certificates';
          let rewardNum: number | null = null;
          if (typeof item.prizes === 'number') {
            reward = `$${item.prizes.toLocaleString()}`;
            rewardNum = item.prizes;
          } else if (typeof item.prizes === 'string') {
            reward = cleanRewardString(item.prizes);
            rewardNum = parseRewardAmount(reward);
          } else if (Array.isArray(item.prizes) && item.prizes.length > 0) {
            const topTier = item.prizes.find((p: any) => p && typeof p.cash === 'number' && p.cash > 0) || item.prizes[0];
            if (topTier && typeof topTier.cash === 'number' && topTier.cash > 0) {
              const symbol = topTier.currencyCode === 'INR' ? '₹' : (topTier.currencyCode === 'USD' ? '$' : (topTier.currencyCode ? `${topTier.currencyCode} ` : '$'));
              reward = `${symbol}${topTier.cash.toLocaleString()}`;
              rewardNum = topTier.cash;
            } else if (topTier && (typeof topTier.amount === 'number' || typeof topTier.amount === 'string')) {
              reward = `$${topTier.amount}`;
              rewardNum = parseRewardAmount(String(topTier.amount));
            } else if (topTier && topTier.rank) {
              reward = `${topTier.rank} Certificate & Prizes`;
            }
          }

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
            reward_num: rewardNum ?? parseRewardAmount(reward),
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
