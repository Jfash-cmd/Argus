import { prisma } from '../lib/db';
import { NormalizedOpportunity, parseRewardAmount } from '../types/opportunity';
import { getTelegramBot } from './telegramBot';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export function matchesUserFilter(
  opp: NormalizedOpportunity,
  filterKeywords: string[],
  filterCategories: string[],
  minPrize: number
): boolean {
  if (filterCategories.length > 0 && !filterCategories.includes(opp.category)) return false;
  const prizeVal = opp.reward_num ?? parseRewardAmount(opp.reward) ?? 0;
  if (minPrize > 0 && prizeVal < minPrize) return false;
  if (filterKeywords.length > 0) {
    const haystack = `${opp.title} ${opp.tags.join(' ')} ${opp.reward}`.toLowerCase();
    if (!filterKeywords.some(kw => haystack.includes(kw.toLowerCase()))) return false;
  }
  return true;
}

export async function dispatchNewOpportunityAlerts(newOpps: NormalizedOpportunity[]): Promise<number> {
  if (newOpps.length === 0) return 0;
  const bot = getTelegramBot();
  const users = await prisma.user.findMany({ where: { chat_id: { not: null } }, include: { filter: true } });
  if (users.length === 0) return 0;

  let totalDispatched = 0;

  for (const opp of newOpps) {
    let isUrgent = false;
    let deadlineStr = 'Flexible / Ongoing';
    if (opp.deadline) {
      const hrsLeft = (new Date(opp.deadline).getTime() - Date.now()) / (3600 * 1000);
      if (hrsLeft > 0 && hrsLeft <= 48) isUrgent = true;
      deadlineStr = new Date(opp.deadline).toLocaleString('en-US', { timeZone: 'Africa/Lagos' });
    }

    const header = isUrgent ? '🚨 *URGENT OPPORTUNITY (<48H TO DEADLINE)*' : '🎯 *NEW OPPORTUNITY DISCOVERED*';
    const message = `${header}
\n*${opp.title}*
• *Source:* ${opp.source.toUpperCase()} | *Category:* ${opp.category.toUpperCase()}
• *Reward:* ${opp.reward}
• *Deadline (WAT):* ${deadlineStr}
• *Tags:* ${opp.tags.map(t => `#${t.replace(/\s+/g, '_')}`).join(' ')}
\n🔗 [View Listing & Apply](${opp.link})`;

    for (const user of users) {
      if (!user.chat_id) continue;
      const kw: string[] = user.filter?.keywords ? JSON.parse(user.filter.keywords) : [];
      const cats: string[] = user.filter?.categories ? JSON.parse(user.filter.categories) : [];
      const minP = user.filter?.min_prize ?? 0;

      if (matchesUserFilter(opp, kw, cats, minP)) {
        if (bot) {
          try {
            await bot.sendMessage(user.chat_id, message, { parse_mode: 'Markdown', disable_web_page_preview: false });
            totalDispatched++;
            await sleep(50); // 50ms delay between sends to respect Telegram rate limits
          } catch (err) {
            console.error(`[Dispatcher] Error sending to chat ${user.chat_id}:`, err);
          }
        } else {
          totalDispatched++;
        }
      }
    }
  }

  return totalDispatched;
}
