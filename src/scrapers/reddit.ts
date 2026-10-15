import * as cheerio from 'cheerio';
import { Scraper, safeFetch, cleanUntrustedText } from './base';
import { NormalizedOpportunity, parseRewardAmount, sanitizeLink, OpportunityCategory } from '../types/opportunity';

export class RedditScraper implements Scraper {
  name = 'reddit';

  private subreddits: { name: string; category: OpportunityCategory; prefixFilter?: string }[] = [
    { name: 'hackathon', category: 'hackathon' },
    { name: 'forhire', category: 'freelance', prefixFilter: '[hiring]' },
    { name: 'slavelabour', category: 'freelance', prefixFilter: '[task]' },
  ];

  async scrape(): Promise<NormalizedOpportunity[]> {
    const opportunities: NormalizedOpportunity[] = [];
    const nowIso = new Date().toISOString();

    for (const sub of this.subreddits) {
      try {
        const rssUrl = `https://www.reddit.com/r/${sub.name}/new.rss`;
        const rssRes = await safeFetch(rssUrl, { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' });
        if (rssRes.ok) {
          const text = await rssRes.text();
          const $ = cheerio.load(text, { xmlMode: true });
          $('entry').each((_, el) => {
            const rawTitle = $(el).find('title').text().trim();
            const rawLink = $(el).find('link').attr('href') || '';
            const link = sanitizeLink(rawLink);
            const content = $(el).find('content').text();
            const updated = $(el).find('updated').text();
            const lowerTitle = rawTitle.toLowerCase();

            if (sub.prefixFilter && !lowerTitle.includes(sub.prefixFilter) && !lowerTitle.includes('[hiring]')) return;
            if (!rawTitle || !link) return;

            const title = cleanUntrustedText(rawTitle, 130);
            const combined = `${rawTitle} ${content}`;
            const rewardMatch = combined.match(/\$\s*([0-9]+(?:\.[0-9]+)?(?:\s*\/\s*(?:hr|hour))?)/i);
            const reward = rewardMatch ? rewardMatch[0].trim() : (sub.category === 'hackathon' ? 'Prize pool details in post' : 'Rate negotiable / See post');

            opportunities.push({
              title,
              source: 'reddit',
              category: sub.category,
              reward,
              reward_num: parseRewardAmount(reward),
              deadline: null,
              link,
              tags: [`r/${sub.name}`, sub.category === 'hackathon' ? 'Hackathon' : 'Gig'],
              first_seen: updated ? new Date(updated).toISOString() : nowIso,
            });
          });
        }
      } catch (err) {
        console.error(`[RedditScraper] r/${sub.name} error:`, err);
      }
    }

    return opportunities;
  }
}
