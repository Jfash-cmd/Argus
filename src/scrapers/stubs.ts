import { Scraper } from './base';
import { NormalizedOpportunity } from '../types/opportunity';

/**
 * Phase 2 Stub: X / Twitter Scraper
 * Coming in Phase 2: Live stream filtered tweets for hackathon and grant announcements.
 */
export class TwitterScraperStub implements Scraper {
  name = 'twitter_x';

  async scrape(): Promise<NormalizedOpportunity[]> {
    console.info('[Phase 2 Stub] X/Twitter scraping scheduled for Phase 2 implementation.');
    return [];
  }
}

/**
 * Phase 2 Stub: Discord Scanner
 * Coming in Phase 2: Monitor #bounties and #announcements channels across partner Discord servers.
 */
export class DiscordScannerStub implements Scraper {
  name = 'discord';

  async scrape(): Promise<NormalizedOpportunity[]> {
    console.info('[Phase 2 Stub] Discord scanning scheduled for Phase 2 implementation.');
    return [];
  }
}

/**
 * Phase 2 Stub: AI Opportunity Scoring Algorithm
 * Coming in Phase 2: Calculate composite opportunity score based on prize/hour, competition, and credibility.
 */
export interface OpportunityScore {
  score: number; // 0 - 100
  urgency: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
}

export function scoreOpportunityStub(opportunity: NormalizedOpportunity): OpportunityScore {
  return {
    score: 85,
    urgency: opportunity.deadline ? 'high' : 'medium',
    confidence: 0.9,
  };
}
