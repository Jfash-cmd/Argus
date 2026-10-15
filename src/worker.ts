import cron from 'node-cron';
import { runIngestionPipeline } from './services/pipeline';
import { generateAndSendDigests } from './services/telegramDigest';
import { getTelegramBot } from './services/telegram';

const LAGOS_TZ = process.env.APP_TIMEZONE || 'Africa/Lagos';

console.log(`[Worker] Initializing Argus Opportunity Radar Worker (Timezone: ${LAGOS_TZ})...`);

// 1. Initialize Telegram Bot
getTelegramBot();

// 2. Cron: Run all scrapers every 3 hours
// Runs at 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00
cron.schedule('0 */3 * * *', async () => {
  console.log('[Worker] Executing 3-hour scheduled scraper run...');
  try {
    const res = await runIngestionPipeline();
    console.log(`[Worker] Pipeline completed. Scraped: ${res.totalScraped}, New: ${res.newCount}, Alerts: ${res.alertsDispatched}`);
  } catch (err) {
    console.error('[Worker] Error in scraper cron:', err);
  }
});

// 3. Cron: Morning Digest at 7:00am Africa/Lagos time
cron.schedule(
  '0 7 * * *',
  async () => {
    console.log('[Worker] 7:00am (Africa/Lagos) Morning Digest triggered');
    try {
      const sent = await generateAndSendDigests(13); // Window covers overnight (from 6:30pm to 7:00am = ~12.5h)
      console.log(`[Worker] Morning digest dispatched to ${sent} users.`);
    } catch (err) {
      console.error('[Worker] Morning digest failed:', err);
    }
  },
  { timezone: LAGOS_TZ }
);

// 4. Cron: Evening Digest at 6:30pm (18:30) Africa/Lagos time
cron.schedule(
  '30 18 * * *',
  async () => {
    console.log('[Worker] 6:30pm (Africa/Lagos) Evening Digest triggered');
    try {
      const sent = await generateAndSendDigests(12); // Window covers daytime (from 7:00am to 6:30pm = 11.5h)
      console.log(`[Worker] Evening digest dispatched to ${sent} users.`);
    } catch (err) {
      console.error('[Worker] Evening digest failed:', err);
    }
  },
  { timezone: LAGOS_TZ }
);

// Run initial ingestion immediately upon worker startup
(async () => {
  try {
    console.log('[Worker] Executing startup ingestion pass...');
    await runIngestionPipeline();
  } catch (err) {
    console.error('[Worker] Startup ingestion error:', err);
  }
})();
