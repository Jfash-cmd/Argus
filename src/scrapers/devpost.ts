import * as cheerio from 'cheerio';
import { Scraper, safeFetch, cleanUntrustedText } from './base';
import { NormalizedOpportunity, parseRewardAmount, sanitizeLink, cleanRewardString } from '../types/opportunity';

export class DevpostScraper implements Scraper {
  name = 'devpost';

  async scrape(): Promise<NormalizedOpportunity[]> {
    const opportunities: NormalizedOpportunity[] = [];
    const nowIso = new Date().toISOString();

    try {
      const res = await safeFetch('https://devpost.com/api/hackathons?page=1&status[]=upcoming&status[]=open');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.hackathons)) {
          for (const item of data.hackathons) {
            // Strip any HTML tags like <span data-currency-value>...</span>
            const reward = cleanRewardString(item.prize_amount);
            const rawLink = sanitizeLink(item.url || '');
            if (!rawLink) continue;

            let deadline: string | null = null;
            if (item.submission_period_dates?.includes('-')) {
              const datePart = item.submission_period_dates.split('-')[1]?.trim();
              const parsed = datePart ? new Date(datePart) : null;
              if (parsed && !isNaN(parsed.getTime())) deadline = parsed.toISOString();
            }

            opportunities.push({
              title: cleanUntrustedText(item.title || 'Devpost Hackathon', 120),
              source: 'devpost',
              category: 'hackathon',
              reward,
              reward_num: parseRewardAmount(reward),
              deadline,
              link: rawLink,
              tags: (item.themes?.map((t: { name: string }) => cleanUntrustedText(t.name, 30)) || ['Hackathon']).slice(0, 5),
              first_seen: nowIso,
            });
          }
          if (opportunities.length > 0) return opportunities;
        }
      }
    } catch {
      // Fallback to HTML scrape
    }

    try {
      const htmlRes = await safeFetch('https://devpost.com/hackathons?status[]=upcoming&status[]=open');
      if (htmlRes.ok) {
        const html = await htmlRes.text();
        const $ = cheerio.load(html);
        $('.hackathon-tile, .main-content article').each((_, el) => {
          const title = cleanUntrustedText($(el).find('h3, .title').text(), 120);
          const href = $(el).find('a').first().attr('href') || '';
          const rawLink = sanitizeLink(href.startsWith('http') ? href : `https://devpost.com${href}`);
          if (!title || !rawLink) return;

          const rawReward = $(el).find('.prize-amount, .prize').text().trim();
          const reward = cleanRewardString(rawReward);
          const deadlineText = $(el).find('.submission-period, time').text().trim();
          let deadline: string | null = null;
          if (deadlineText) {
            const parsed = new Date(deadlineText);
            if (!isNaN(parsed.getTime())) deadline = parsed.toISOString();
          }

          opportunities.push({
            title,
            source: 'devpost',
            category: 'hackathon',
            reward,
            reward_num: parseRewardAmount(reward),
            deadline,
            link: rawLink,
            tags: ['Hackathon', 'Devpost'],
            first_seen: nowIso,
          });
        });
      }
    } catch (err) {
      console.error('[DevpostScraper] scrape failed:', err);
    }

    return opportunities;
  }
}
