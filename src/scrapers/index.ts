import { Scraper } from './base';
import { DevpostScraper } from './devpost';
import { SuperteamScraper } from './superteam';
import { GitHubScraper } from './github';
import { RedditScraper } from './reddit';

// Phase 2 expanded sources
import { SubstackMediumScraper } from './expanded/rssFeeds';
import { LablabScraper } from './expanded/lablab';
import { HackQuestScraper } from './expanded/hackquest';
import { KaggleScraper } from './expanded/kaggle';
import { MlhScraper } from './expanded/mlh';
import { DevfolioScraper } from './expanded/devfolio';
import { HackerEarthScraper } from './expanded/hackerEarth';
import { EthGlobalScraper } from './expanded/ethGlobal';
import { UnstopScraper } from './expanded/unstop';
import { TaikaiScraper } from './expanded/taikai';
import { EncodeClubScraper } from './expanded/encodeClub';

import { NormalizedOpportunity } from '../types/opportunity';

export function getActiveScrapers(): Scraper[] {
  return [
    // Phase 1 Core Sources
    new DevpostScraper(),
    new SuperteamScraper(),
    new GitHubScraper(),
    new RedditScraper(),
    // Phase 2 Expanded Sources
    new SubstackMediumScraper(),
    new LablabScraper(),
    new HackQuestScraper(),
    new KaggleScraper(),
    new MlhScraper(),
    new DevfolioScraper(),
    new HackerEarthScraper(),
    new EthGlobalScraper(),
    new UnstopScraper(),
    new TaikaiScraper(),
    new EncodeClubScraper(),
  ];
}

export async function runAllScrapers(): Promise<{
  opportunities: NormalizedOpportunity[];
  stats: Record<string, number>;
}> {
  const scrapers = getActiveScrapers();
  const allOpportunities: NormalizedOpportunity[] = [];
  const stats: Record<string, number> = {};

  const results = await Promise.allSettled(
    scrapers.map(async (scraper) => {
      const items = await scraper.scrape();
      return { name: scraper.name, items };
    })
  );

  for (const res of results) {
    if (res.status === 'fulfilled') {
      const { name, items } = res.value;
      stats[name] = items.length;
      allOpportunities.push(...items);
    } else {
      console.error('[runAllScrapers] Scraper failed:', res.reason);
    }
  }

  return { opportunities: allOpportunities, stats };
}
