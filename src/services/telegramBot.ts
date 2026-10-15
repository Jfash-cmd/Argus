import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../lib/db';
import { OpportunityCategory, sanitizeLink } from '../types/opportunity';

let botInstance: TelegramBot | null = null;

export function getTelegramBot(): TelegramBot | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token.includes('demo_token') || token.trim() === '') return null;
  if (!botInstance) {
    try {
      botInstance = new TelegramBot(token, { polling: true });
      initBotCommands(botInstance);
      console.log('[TelegramBot] Initialized Argus bot with polling.');
    } catch (err) {
      console.error('[TelegramBot] Failed to initialize:', err);
    }
  }
  return botInstance;
}

function initBotCommands(bot: TelegramBot) {
  // /start or /start <token>
  bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id.toString();
    const token = match?.[1]?.trim();
    const telegramId = msg.from?.id ? msg.from.id.toString() : chatId;
    if (token) {
      const user = await prisma.user.findUnique({ where: { auth_token: token } });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { chat_id: chatId, telegram_id: telegramId, username: msg.from?.username },
        });
        return bot.sendMessage(chatId, `🎯 *Connected to Argus!* Your account is now linked to receive real-time alerts.`, { parse_mode: 'Markdown' });
      }
    }
    await prisma.user.upsert({
      where: { telegram_id: telegramId },
      update: { chat_id: chatId, username: msg.from?.username, first_name: msg.from?.first_name },
      create: { telegram_id: telegramId, chat_id: chatId, username: msg.from?.username, first_name: msg.from?.first_name, filter: { create: {} } },
    });
    bot.sendMessage(chatId, `🦅 *ARGUS RADAR*\nWelcome! Use /filter, /category, /minprize, /addmanual, or /mystatus to configure alerts.`, { parse_mode: 'Markdown' });
  });

  // /addmanual <link> (cheap stand-in for X/Discord)
  bot.onText(/\/addmanual\s*(.*)/, async (msg, match) => {
    const chatId = msg.chat.id.toString();
    const cleanUrl = sanitizeLink(match?.[1]?.trim() || '');
    if (!cleanUrl) return bot.sendMessage(chatId, '❗ Provide a valid URL. Example: `/addmanual https://x.com/...`', { parse_mode: 'Markdown' });
    try {
      const title = `Manual Submission (${new URL(cleanUrl).hostname})`;
      await prisma.opportunity.upsert({
        where: { title_source: { title, source: 'manual' } },
        update: {},
        create: { title, source: 'manual', category: 'bounty', reward: 'See submission link', reward_num: null, deadline: null, link: cleanUrl, tags: '["ManualSubmission"]' },
      });
      bot.sendMessage(chatId, `✅ *Opportunity Added!* Indexed for alert routing.`, { parse_mode: 'Markdown' });
    } catch {
      bot.sendMessage(chatId, '❗ Failed to save manual link.');
    }
  });

  // /filter <keyword>
  bot.onText(/\/filter\s*(.*)/, async (msg, match) => {
    const chatId = msg.chat.id.toString();
    const keyword = match?.[1]?.trim().toLowerCase();
    if (!keyword) return bot.sendMessage(chatId, '❗ Example: `/filter rust`', { parse_mode: 'Markdown' });
    const user = await prisma.user.findFirst({ where: { chat_id: chatId }, include: { filter: true } });
    if (!user) return bot.sendMessage(chatId, '❗ Type /start first.');
    const keywords: string[] = user.filter?.keywords ? JSON.parse(user.filter.keywords) : [];
    const idx = keywords.indexOf(keyword);
    if (idx > -1) keywords.splice(idx, 1);
    else keywords.push(keyword);
    await prisma.filter.upsert({ where: { user_id: user.id }, update: { keywords: JSON.stringify(keywords) }, create: { user_id: user.id, keywords: JSON.stringify(keywords) } });
    bot.sendMessage(chatId, `✅ *Keywords:* ${keywords.length ? keywords.map(k => `\`${k}\``).join(', ') : '_(none)_'}`, { parse_mode: 'Markdown' });
  });

  // /category <hackathon|bounty|freelance|grant>
  bot.onText(/\/category\s*(.*)/, async (msg, match) => {
    const chatId = msg.chat.id.toString();
    const rawCat = match?.[1]?.trim().toLowerCase() as OpportunityCategory;
    const valid: OpportunityCategory[] = ['hackathon', 'bounty', 'freelance', 'grant'];
    if (!valid.includes(rawCat)) return bot.sendMessage(chatId, `❗ Choose: ${valid.join(', ')}`, { parse_mode: 'Markdown' });
    const user = await prisma.user.findFirst({ where: { chat_id: chatId }, include: { filter: true } });
    if (!user) return bot.sendMessage(chatId, '❗ Type /start first.');
    const cats: OpportunityCategory[] = user.filter?.categories ? JSON.parse(user.filter.categories) : [];
    const idx = cats.indexOf(rawCat);
    if (idx > -1) cats.splice(idx, 1);
    else cats.push(rawCat);
    await prisma.filter.upsert({ where: { user_id: user.id }, update: { categories: JSON.stringify(cats) }, create: { user_id: user.id, categories: JSON.stringify(cats) } });
    bot.sendMessage(chatId, `✅ *Categories:* ${cats.length ? cats.join(', ') : '_(all)_'}`, { parse_mode: 'Markdown' });
  });

  // /minprize <amount>
  bot.onText(/\/minprize\s*(.*)/, async (msg, match) => {
    const chatId = msg.chat.id.toString();
    const amount = parseFloat(match?.[1]?.replace('$', '') || '');
    if (isNaN(amount) || amount < 0) return bot.sendMessage(chatId, '❗ Example: `/minprize 500`', { parse_mode: 'Markdown' });
    const user = await prisma.user.findFirst({ where: { chat_id: chatId } });
    if (!user) return bot.sendMessage(chatId, '❗ Type /start first.');
    await prisma.filter.upsert({ where: { user_id: user.id }, update: { min_prize: amount }, create: { user_id: user.id, min_prize: amount } });
    bot.sendMessage(chatId, `✅ *Min Prize:* $${amount.toLocaleString()}`, { parse_mode: 'Markdown' });
  });

  // /mystatus
  bot.onText(/\/mystatus/, async (msg) => {
    const chatId = msg.chat.id.toString();
    const user = await prisma.user.findFirst({ where: { chat_id: chatId }, include: { filter: true } });
    if (!user) return bot.sendMessage(chatId, '❗ Type /start first.');
    const kw: string[] = user.filter?.keywords ? JSON.parse(user.filter.keywords) : [];
    const cats: string[] = user.filter?.categories ? JSON.parse(user.filter.categories) : [];
    bot.sendMessage(chatId, `🦅 *Argus Status:* Keywords: ${kw.join(', ') || 'All'} | Categories: ${cats.join(', ') || 'All'} | Min Prize: $${user.filter?.min_prize ?? 0}`, { parse_mode: 'Markdown' });
  });
}
