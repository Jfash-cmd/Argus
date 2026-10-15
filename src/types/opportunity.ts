export type OpportunityCategory = 'hackathon' | 'bounty' | 'freelance' | 'grant';

export interface NormalizedOpportunity {
  title: string;
  source: string;
  category: OpportunityCategory;
  reward: string;
  reward_num: number | null;
  deadline: string | null;
  link: string;
  tags: string[];
  first_seen: string;
}

export interface UserFilter {
  keywords: string[];
  categories: OpportunityCategory[];
  min_prize: number;
}

// Strip HTML tags (e.g. <span data-currency-value>...</span>) and normalize reward text
export function cleanRewardString(rawReward?: string | null): string {
  if (!rawReward || typeof rawReward !== 'string') return 'Prize pool undisclosed';
  const noHtml = rawReward.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  if (!noHtml || noHtml === '$' || noHtml === '$0' || noHtml.includes('[object Object]')) return 'Prize pool undisclosed';
  return noHtml;
}

// Parse real numeric reward value without guessing
export function parseRewardAmount(rewardStr: string): number | null {
  if (!rewardStr || typeof rewardStr !== 'string') return null;
  const noHtml = cleanRewardString(rewardStr);
  const clean = noHtml.replace(/,/g, '');
  const match = clean.match(/(?:\$|USD|USDC|EUR|GBP)?\s*([0-9]+(?:\.[0-9]+)?)\s*(k|m)?/i);
  if (!match) return null;
  let val = parseFloat(match[1]);
  if (isNaN(val)) return null;
  const multiplier = (match[2] || '').toLowerCase();
  if (multiplier === 'k') val *= 1000;
  if (multiplier === 'm') val *= 1000000;
  return val;
}

// Validate and sanitize external URLs
export function sanitizeLink(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return '';
}
