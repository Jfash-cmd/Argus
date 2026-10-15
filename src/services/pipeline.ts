import { prisma } from '../lib/db';
import { runAllScrapers } from '../scrapers';
import { NormalizedOpportunity, parseRewardAmount, cleanRewardString } from '../types/opportunity';
import { dispatchNewOpportunityAlerts } from './telegramAlerts';

export interface IngestionResult {
  totalScraped: number;
  newCount: number;
  newOpportunities: NormalizedOpportunity[];
  alertsDispatched: number;
}

export async function runIngestionPipeline(): Promise<IngestionResult> {
  console.log('[Pipeline] Starting Argus ingestion pipeline across all scrapers...');
  const { opportunities, stats } = await runAllScrapers();
  console.log('[Pipeline] Scraper yields:', stats, `Total items: ${opportunities.length}`);

  const newOpportunities: NormalizedOpportunity[] = [];

  for (const item of opportunities) {
    try {
      const existing = await prisma.opportunity.findUnique({
        where: {
          title_source: {
            title: item.title,
            source: item.source,
          },
        },
      });

      if (typeof item.reward !== 'string' && typeof item.reward !== 'number') {
        console.warn(`[Pipeline Warning] Opportunity "${item.title}" from source "${item.source}" has non-primitive reward:`, item.reward);
      }
      const safeReward = cleanRewardString(item.reward);

      if (!existing) {
        await prisma.opportunity.create({
          data: {
            title: item.title,
            source: item.source,
            category: item.category,
            reward: safeReward,
            reward_num: item.reward_num ?? parseRewardAmount(safeReward),
            deadline: item.deadline ? new Date(item.deadline) : null,
            link: item.link,
            tags: JSON.stringify(item.tags || []),
            first_seen: new Date(item.first_seen),
          },
        });

        newOpportunities.push(item);
      }
    } catch (err) {
      console.error(`[Pipeline] Error saving "${item.title}":`, err);
    }
  }

  // Dispatch real-time Telegram alerts to matching users (with 50ms pacing)
  let alertsDispatched = 0;
  if (newOpportunities.length > 0) {
    alertsDispatched = await dispatchNewOpportunityAlerts(newOpportunities);
  }

  console.log(`[Pipeline] Finished. ${newOpportunities.length} new opportunities stored. ${alertsDispatched} alerts dispatched.`);
  return {
    totalScraped: opportunities.length,
    newCount: newOpportunities.length,
    newOpportunities,
    alertsDispatched,
  };
}
