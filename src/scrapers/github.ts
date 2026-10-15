import { Scraper, safeFetch, cleanUntrustedText } from './base';
import { NormalizedOpportunity, parseRewardAmount, sanitizeLink } from '../types/opportunity';

export class GitHubScraper implements Scraper {
  name = 'github';

  async scrape(): Promise<NormalizedOpportunity[]> {
    const opportunities: NormalizedOpportunity[] = [];
    const nowIso = new Date().toISOString();

    try {
      const url = 'https://api.github.com/search/issues?q=is:issue+is:open+label:bounty&sort=created&order=desc&per_page=25';
      const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
      if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
      }

      const res = await safeFetch(url, headers);
      if (!res.ok) return [];

      const data = await res.json();
      if (!data.items || !Array.isArray(data.items)) return [];

      for (const item of data.items) {
        const fullText = `${item.title} ${item.body || ''}`;
        const rewardMatch = fullText.match(/\$\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?)\b|\b([0-9]+)\s*(?:USDC|USD|USDT)\b/i);
        // Guardrail: never guess reward if absent
        const reward = rewardMatch ? rewardMatch[0].trim() : 'Bounty amount in issue';

        const rawLink = sanitizeLink(item.html_url || '');
        if (!rawLink) continue;

        const labels: string[] = Array.isArray(item.labels)
          ? item.labels.map((l: { name: string } | string) => cleanUntrustedText(typeof l === 'string' ? l : l.name, 30)).filter(Boolean)
          : ['bounty'];

        const repoName = item.repository_url ? item.repository_url.split('/').slice(-2).join('/') : '';
        if (repoName) labels.unshift(cleanUntrustedText(repoName, 40));

        opportunities.push({
          title: cleanUntrustedText(item.title || 'GitHub Bounty Issue', 120),
          source: 'github',
          category: 'bounty',
          reward,
          reward_num: parseRewardAmount(reward),
          deadline: null,
          link: rawLink,
          tags: labels.slice(0, 5),
          first_seen: nowIso,
        });
      }
    } catch (err) {
      console.error('[GitHubScraper] scrape failed:', err);
    }

    return opportunities;
  }
}
