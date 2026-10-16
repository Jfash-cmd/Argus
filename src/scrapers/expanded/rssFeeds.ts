import * as cheerio from 'cheerio';
import { Scraper, safeFetch, cleanUntrustedText } from '../base';
import { NormalizedOpportunity, sanitizeLink } from '../../types/opportunity';
import { classifyHackathon } from '../../lib/categorization';

async function parseRssFeeds(
  feeds: string[],
  source: 'medium' | 'substack',
  defaultTag: string
): Promise<NormalizedOpportunity[]> {
  const opportunities: NormalizedOpportunity[] = [];
  const nowIso = new Date().toISOString();

  for (const url of feeds) {
    try {
      const res = await safeFetch(url);
      if (!res.ok) continue;
      const text = await res.text();
      const $ = cheerio.load(text, { xmlMode: true });

      $('item').each((_, el) => {
        const rawTitle = $(el).find('title').text().trim();
        const rawLink = $(el).find('link').text().trim();
        const pubDate = $(el).find('pubDate').text().trim();
        const link = sanitizeLink(rawLink);
        if (!rawTitle || !link) return;

        const title = cleanUntrustedText(rawTitle, 120);
        const isBounty = url.toLowerCase().includes('bounty') || title.toLowerCase().includes('bounty');
        const category = isBounty ? 'bounty' : classifyHackathon(source, title, [defaultTag]);

        opportunities.push({
          title,
          source,
          category,
          reward: 'See article announcement',
          reward_num: null,
          deadline: null,
          link,
          tags: ['Newsletter'],
          first_seen: pubDate ? new Date(pubDate).toISOString() : nowIso,
        });
      });
    } catch (err) {
      console.error(`[${source}Scraper] Failed on ${url}:`, err);
    }
  }

  return opportunities;
}

export class MediumScraper implements Scraper {
  name = 'medium';

  async scrape(): Promise<NormalizedOpportunity[]> {
    const feeds = [
      'https://medium.com/feed/tag/hackathon',
      'https://medium.com/feed/tag/bug-bounty',
    ];
    return parseRssFeeds(feeds, 'medium', 'Medium');
  }
}

export class SubstackScraper implements Scraper {
  name = 'substack';

  async scrape(): Promise<NormalizedOpportunity[]> {
    const feeds = [
      'https://web3bounties.substack.com/feed',
      'https://hackathons.substack.com/feed',
    ];
    return parseRssFeeds(feeds, 'substack', 'Substack');
  }
}

// Backward-compatible alias
export class SubstackMediumScraper extends MediumScraper {}
