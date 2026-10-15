import { prisma } from '../lib/db';
import { getTelegramBot } from './telegramBot';
import { matchesUserFilter } from './telegramAlerts';
import { NormalizedOpportunity } from '../types/opportunity';

export async function generateAndSendDigests(windowHours = 12): Promise<number> {
  const bot = getTelegramBot();
  const cutoff = new Date(Date.now() - windowHours * 60 * 60 * 1000);
  const now = new Date();

  // Fetch only opportunities first seen since the cutoff (never pad with stale listings)
  const recentDbOpps = await prisma.opportunity.findMany({
    where: { first_seen: { gte: cutoff } },
    orderBy: [{ reward_num: 'desc' }, { first_seen: 'desc' }],
  });

  if (recentDbOpps.length === 0) {
    console.log('[Digest] No new opportunities in this window. Skipping digest dispatch.');
    return 0;
  }

  const normalized: NormalizedOpportunity[] = recentDbOpps.map(o => ({
    title: o.title,
    source: o.source,
    category: o.category as any,
    reward: o.reward,
    reward_num: o.reward_num,
    deadline: o.deadline ? o.deadline.toISOString() : null,
    link: o.link,
    tags: JSON.parse(o.tags || '[]'),
    first_seen: o.first_seen.toISOString(),
  }));

  const users = await prisma.user.findMany({
    where: { chat_id: { not: null } },
    include: { filter: true },
  });

  let sentCount = 0;
  const timeStr = now.toLocaleTimeString('en-US', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' });

  for (const user of users) {
    if (!user.chat_id) continue;
    const kw: string[] = user.filter?.keywords ? JSON.parse(user.filter.keywords) : [];
    const cats: string[] = user.filter?.categories ? JSON.parse(user.filter.categories) : [];
    const minP = user.filter?.min_prize ?? 0;

    const matched = normalized.filter(o => matchesUserFilter(o, kw, cats, minP));
    if (matched.length === 0) continue;

    const sections: string[] = [];

    // 1. Top 5 picks
    const top5 = matched.slice(0, 5);
    if (top5.length > 0) {
      sections.push(`🌟 *TOP 5 PICKS*\n` + top5.map((o, i) => `${i + 1}. [${o.title}](${o.link}) — *${o.reward}* (${o.category})`).join('\n'));
    }

    // 2. Quick wins (short tasks / bounties / freelance)
    const quickWins = matched.filter(o => o.category === 'freelance' || (o.category === 'bounty' && (o.reward_num ?? 0) <= 500)).slice(0, 4);
    if (quickWins.length > 0) {
      sections.push(`⚡ *QUICK WINS (Short Tasks)*\n` + quickWins.map(o => `• [${o.title}](${o.link}) — *${o.reward}*`).join('\n'));
    }

    // 3. High-reward (hackathons+grants)
    const highReward = matched.filter(o => (o.category === 'hackathon' || o.category === 'grant') && (o.reward_num ?? 0) >= 1000).slice(0, 4);
    if (highReward.length > 0) {
      sections.push(`💰 *HIGH-REWARD (Hackathons & Grants)*\n` + highReward.map(o => `• [${o.title}](${o.link}) — *${o.reward}*`).join('\n'));
    }

    // 4. Closing soon (<72hr)
    const closingSoon = matched.filter(o => {
      if (!o.deadline) return false;
      const hrs = (new Date(o.deadline).getTime() - Date.now()) / (3600 * 1000);
      return hrs > 0 && hrs <= 72;
    }).slice(0, 4);
    if (closingSoon.length > 0) {
      sections.push(`⏳ *CLOSING SOON (<72HR)*\n` + closingSoon.map(o => `• [${o.title}](${o.link}) — *${o.reward}*`).join('\n'));
    }

    // 5. Newly announced
    const newlyAnnounced = matched.filter(o => !top5.includes(o) && !highReward.includes(o)).slice(0, 4);
    if (newlyAnnounced.length > 0) {
      sections.push(`🚀 *NEWLY ANNOUNCED*\n` + newlyAnnounced.map(o => `• [${o.title}](${o.link}) — *${o.reward}*`).join('\n'));
    }

    if (sections.length === 0) continue;

    const digestMessage = `📬 *Argus Opportunity Digest (${timeStr} WAT)*\n\n` +
      sections.join('\n\n') +
      `\n\n_Update your alerts anytime with /mystatus or visit argus-radar.com_`;

    if (bot) {
      try {
        await bot.sendMessage(user.chat_id, digestMessage, { parse_mode: 'Markdown', disable_web_page_preview: true });
        sentCount++;
      } catch (err) {
        console.error(`[Digest] Failed sending to chat ${user.chat_id}:`, err);
      }
    } else {
      console.log(`[Digest] Mock send to user ${user.telegram_id}:\n${digestMessage.slice(0, 150)}...`);
    }
  }

  return sentCount;
}
