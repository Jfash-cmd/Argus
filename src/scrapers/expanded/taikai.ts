import * as cheerio from 'cheerio';
import { Scraper, safeFetch, cleanUntrustedText } from '../base';
import { NormalizedOpportunity, parseRewardAmount, sanitizeLink } from '../../types/opportunity';

export class TaikaiScraper implements Scraper {
  name = 'taikai';

  async scrape(): Promise<NormalizedOpportunity[]> {
    const opportunities: NormalizedOpportunity[] = [];
    const nowIso = new Date().toISOString();

    try {
      const res = await safeFetch('https://taikai.network/en/hackathons', {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
      if (res.ok) {
        const html = await res.text();
        const $ = cheerio.load(html);
        const seen = new Set<string>();

        $('a[href*="/hackathons/"]').each((_, el) => {
          const href = $(el).attr('href') || '';
          const cleanHref = href.split('?')[0].replace(/\/+$/, '');
          if (seen.has(cleanHref) || !cleanHref.includes('/hackathons/')) return;
          if (cleanHref.endsWith('/en/hackathons') || cleanHref.endsWith('/hackathons')) return;

          const cardText = $(el).text().replace(/\s+/g, ' ').trim();
          if (!cardText || cardText.length < 15) return;

          // Prize extraction from cardText (e.g. Prize 9,000€ or Prize 3,500$)
          let reward = 'Prize pool in challenge';
          let rewardNum: number | null = null;
          const prizeMatch = cardText.match(/Prize\s*([0-9.,]+)\s*([€$£]|USD|EUR)?/i);
          if (prizeMatch) {
            const numStr = prizeMatch[1].replace(/,/g, '');
            const parsedNum = parseFloat(numStr);
            if (!isNaN(parsedNum)) {
              rewardNum = parsedNum;
              const currency = prizeMatch[2] || '$';
              reward = `${currency}${parsedNum.toLocaleString()}`;
            }
          }

          // Title derivation
          let title = $(el).find('h2, h3, h4, [class*="title"]').first().text().trim();
          if (!title) {
            const parts = cleanHref.split('/hackathons/');
            if (parts[1]) {
              title = parts[1].replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            }
          }
          if (!title) return;

          seen.add(cleanHref);
          const fullLink = sanitizeLink(cleanHref.startsWith('http') ? cleanHref : `https://taikai.network${cleanHref}`);

          opportunities.push({
            title: cleanUntrustedText(title, 120),
            source: 'taikai',
            category: 'web3_hackathon',
            reward,
            reward_num: rewardNum ?? parseRewardAmount(reward),
            deadline: null,
            link: fullLink,
            tags: ['Web3', 'Open Innovation'],
            first_seen: nowIso,
          });
        });
      }
    } catch (err) {
      console.error('[TaikaiScraper] scrape failed:', err);
    }

    return opportunities.slice(0, 20);
  }
}
