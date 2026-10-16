import { prisma } from '../lib/db';
import { runAllScrapers } from '../scrapers';
import { NormalizedOpportunity, parseRewardAmount, cleanRewardString, cleanTitle, cleanTag, filterAndCleanTags, isDeadlineExpired, getCompetitiveness } from '../types/opportunity';
import { resolveCategory } from '../lib/categorization';
import { dispatchNewOpportunityAlerts } from './telegramAlerts';

export interface IngestionResult {
  totalScraped: number;
  newCount: number;
  newOpportunities: NormalizedOpportunity[];
  alertsDispatched: number;
}

export async function purgeExpiredOpportunities(): Promise<number> {
  const now = new Date();
  try {
    const deleted = await prisma.opportunity.deleteMany({
      where: {
        deadline: {
          lt: now,
        },
      },
    });
    if (deleted.count > 0) {
      console.log(`[Pipeline] Cleaned up ${deleted.count} expired opportunities from database.`);
    }
    return deleted.count;
  } catch (err) {
    console.error('[Pipeline] Error purging expired opportunities:', err);
    return 0;
  }
}

export async function runIngestionPipeline(): Promise<IngestionResult> {
  console.log('[Pipeline] Starting Argus ingestion pipeline across all scrapers...');
  
  // Scheduled cleanup step: purge any opportunity whose deadline has passed
  await purgeExpiredOpportunities();

  const { opportunities, stats } = await runAllScrapers();
  console.log('[Pipeline] Scraper yields:', stats, `Total items: ${opportunities.length}`);

  const newOpportunities: NormalizedOpportunity[] = [];

  for (const item of opportunities) {
    try {
      // Filter out expired opportunities entirely
      if (isDeadlineExpired(item.deadline)) {
        continue;
      }

      const { title: safeTitle, details: safeDetails } = cleanTitle(item.title);
      const safeTags = filterAndCleanTags(item.tags || [], item.source);
      const finalDetails = item.details || safeDetails;
      const finalCategory = resolveCategory(item.category, item.source, safeTitle, safeTags, finalDetails);
      const competitiveness = item.competitiveness || getCompetitiveness(item.source);

      const existing = await prisma.opportunity.findUnique({
        where: {
          title_source: {
            title: safeTitle,
            source: item.source,
          },
        },
      });

      if (typeof item.reward !== 'string' && typeof item.reward !== 'number') {
        console.warn(`[Pipeline Warning] Opportunity "${safeTitle}" from source "${item.source}" has non-primitive reward:`, item.reward);
      }
      const safeReward = cleanRewardString(item.reward);

      if (!existing) {
        await prisma.opportunity.create({
          data: {
            title: safeTitle,
            source: item.source,
            category: finalCategory,
            competitiveness,
            reward: safeReward,
            reward_num: item.reward_num ?? parseRewardAmount(safeReward),
            deadline: item.deadline ? new Date(item.deadline) : null,
            link: item.link,
            tags: JSON.stringify(safeTags),
            details: finalDetails,
            first_seen: new Date(item.first_seen),
          },
        });

        newOpportunities.push({
          ...item,
          title: safeTitle,
          category: finalCategory,
          competitiveness,
          details: finalDetails,
          tags: safeTags,
        });
      } else if (!existing.competitiveness) {
        // Backfill competitiveness if missing
        await prisma.opportunity.update({
          where: { id: existing.id },
          data: { competitiveness },
        });
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
