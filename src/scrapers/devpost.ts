import * as cheerio from 'cheerio';
import { Scraper, safeFetch, cleanUntrustedText } from './base';
import { NormalizedOpportunity, parseRewardAmount, sanitizeLink, cleanRewardString, isDeadlineExpired } from '../types/opportunity';
import { classifyHackathon } from '../lib/categorization';

export class DevpostScraper implements Scraper {
  name = 'devpost';

  async scrape(): Promise<NormalizedOpportunity[]> {
    const opportunities: NormalizedOpportunity[] = [];
    const nowIso = new Date().toISOString();

    const seenUrls = new Set<string>();
    const endpoints = [
      'https://devpost.com/api/hackathons?page=1&status[]=upcoming&status[]=open',
      'https://devpost.com/api/hackathons?page=1&status[]=upcoming&status[]=open&themes[]=Blockchain',
    ];

    for (const url of endpoints) {
      try {
        const res = await safeFetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.hackathons)) {
            for (const item of data.hackathons) {
              const rawLink = sanitizeLink(item.url || '');
              if (!rawLink || seenUrls.has(rawLink)) continue;
              seenUrls.add(rawLink);

              const reward = cleanRewardString(item.prize_amount);

              let deadline: string | null = null;
              if (item.submission_period_dates?.includes('-')) {
                const datePart = item.submission_period_dates.split('-')[1]?.trim();
                const parsed = datePart ? new Date(datePart) : null;
                if (parsed && !isNaN(parsed.getTime())) deadline = parsed.toISOString();
              }

              if (isDeadlineExpired(deadline)) continue;

              const tags = (item.themes?.map((t: { name: string }) => cleanUntrustedText(t.name, 30)) || ['Hackathon']).slice(0, 5);
              const title = cleanUntrustedText(item.title || 'Devpost Hackathon', 120);
              opportunities.push({
                title,
                source: 'devpost',
                category: classifyHackathon('devpost', title, tags),
                reward,
                reward_num: parseRewardAmount(reward),
                deadline,
                link: rawLink,
                tags,
                first_seen: nowIso,
              });
            }
          }
        }
      } catch {
        // Continue to next endpoint
      }
    }

    if (opportunities.length > 0) return opportunities;

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

          if (isDeadlineExpired(deadline)) return;

          const tags = ['Hackathon'];
          opportunities.push({
            title,
            source: 'devpost',
            category: classifyHackathon('devpost', title, tags),
            reward,
            reward_num: parseRewardAmount(reward),
            deadline,
            link: rawLink,
            tags,
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
