import { Scraper, safeFetch, cleanUntrustedText } from '../base';
import { NormalizedOpportunity, parseRewardAmount, sanitizeLink, isDeadlineExpired } from '../../types/opportunity';

export class LablabScraper implements Scraper {
  name = 'lablab_ai';

  async scrape(): Promise<NormalizedOpportunity[]> {
    const opportunities: NormalizedOpportunity[] = [];
    const nowIso = new Date().toISOString();

    try {
      const res = await safeFetch('https://lablab.ai/api/v2/events?status=open');
      if (res.ok) {
        const data = await res.json();
        const events = Array.isArray(data) ? data : (data.events || []);

        for (const ev of events) {
          const rawTitle = ev.title || ev.name;
          const slug = ev.slug || ev.id;
          const link = sanitizeLink(ev.url || (slug ? `https://lablab.ai/event/${slug}` : 'https://lablab.ai'));
          if (!rawTitle || !link) continue;

          const reward = ev.prizePool ? `$${ev.prizePool}` : 'Prize pool details in event';
          let deadline: string | null = null;
          if (ev.endDate) {
            const d = new Date(ev.endDate);
            if (!isNaN(d.getTime())) deadline = d.toISOString();
          }

          if (isDeadlineExpired(deadline)) continue;

          opportunities.push({
            title: cleanUntrustedText(rawTitle, 120),
            source: 'lablab_ai',
            category: 'web2_hackathon',
            reward,
            reward_num: parseRewardAmount(reward),
            deadline,
            link,
            tags: ['AI', ...(ev.technologies || [])].slice(0, 5),
            first_seen: nowIso,
          });
        }
      }
    } catch (err) {
      console.error('[LablabScraper] scrape failed:', err);
    }

    return opportunities;
  }
}
