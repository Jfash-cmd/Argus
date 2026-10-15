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
  details?: string | null;
  first_seen: string;
}

export interface UserFilter {
  keywords: string[];
  categories: OpportunityCategory[];
  min_prize: number;
}

// Strip HTML tags (e.g. <span data-currency-value>...</span>) and normalize reward text
export function cleanRewardString(rawReward?: any): string {
  if (rawReward === null || rawReward === undefined) return 'Prize pool undisclosed';

  // Defensive check: log warning if structured reward data is passed unconverted
  if (typeof rawReward === 'object') {
    console.warn(
      '[Normalizer Warning] Structured/unconverted reward data passed to cleanRewardString:',
      JSON.stringify(rawReward)
    );
    if (Array.isArray(rawReward) && rawReward.length > 0) {
      const top = rawReward.find((p: any) => p && (p.cash || p.amount || p.value)) || rawReward[0];
      const cash = top?.cash ?? top?.amount ?? top?.value;
      if (typeof cash === 'number' || (typeof cash === 'string' && cash.trim())) {
        const symbol = top?.currencyCode === 'INR' ? '₹' : (top?.currencyCode === 'USD' ? '$' : (top?.currencyCode ? `${top.currencyCode} ` : '$'));
        return `${symbol}${Number(cash).toLocaleString()}`;
      }
      if (top?.rank) return `${top.rank} Prizes & Certificates`;
    } else if (rawReward && typeof rawReward === 'object') {
      const cash = rawReward.cash ?? rawReward.amount ?? rawReward.value;
      if (typeof cash === 'number' || (typeof cash === 'string' && cash.trim())) {
        return `$${Number(cash).toLocaleString()}`;
      }
    }
    return 'Prize pool undisclosed';
  }

  const str = String(rawReward);
  const noHtml = str.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  if (!noHtml || noHtml === '$' || noHtml === '$0' || noHtml.includes('[object Object]')) {
    return 'Prize pool undisclosed';
  }
  return noHtml;
}

// Parse real numeric reward value without guessing
export function parseRewardAmount(rewardStr: string): number | null {
  if (!rewardStr || typeof rewardStr !== 'string') return null;
  const noHtml = cleanRewardString(rewardStr);
  const clean = noHtml.replace(/,/g, '');
  const match = clean.match(/(?:\$|USD|USDC|EUR|GBP|INR|₹|Rs\.?)?\s*([0-9]+(?:\.[0-9]+)?)\s*(k|m)?/i);
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

// Strip emojis, pictographs, and decorative symbols
export function stripEmojisAndDecorations(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{200D}\u{FE0F}\u{FE0E}\u{1F1E6}-\u{1F1FF}]/gu, '')
    .replace(/[\u2705\u274C\u2728\u26A0\uFE0F]/gu, '')
    .replace(/^[\s\-_*|:•#~]+/g, '').replace(/[\s\-_*|:•#~]+$/g, '').replace(/\s{2,}/g, ' ').trim();
}

// Clean and normalize tag text: uppercase, no symbols/emojis
export function cleanTag(rawTag: string): string {
  if (!rawTag || typeof rawTag !== 'string') return '';
  return stripEmojisAndDecorations(rawTag).replace(/^#+/, '').trim().toUpperCase();
}

// Clean title: strip bracketed prefixes, emojis, and split out extra task details
export function cleanTitle(rawTitle: string): { title: string; details: string | null } {
  if (!rawTitle || typeof rawTitle !== 'string') return { title: 'Untitled Opportunity', details: null };
  let text = stripEmojisAndDecorations(rawTitle);

  let prevText = '';
  while (text !== prevText) {
    prevText = text;
    text = text.replace(/^\s*\[[^\]]+\]\s*[:\-\—]?\s*/i, '').trim();
  }
  text = stripEmojisAndDecorations(text);
  if (!text) return { title: 'Opportunity', details: null };

  let title = text;
  let details: string | null = null;

  const colonIndex = text.indexOf(':');
  if (colonIndex > 2 && colonIndex < 45) {
    const left = text.slice(0, colonIndex).trim();
    const right = text.slice(colonIndex + 1).trim();
    if (right.length > 0) {
      title = left;
      details = right.charAt(0).toUpperCase() + right.slice(1);
    }
  } else {
    const dashMatch = text.match(/\s+[-—–]\s+/);
    if (dashMatch && dashMatch.index && dashMatch.index > 3 && dashMatch.index < 45) {
      const left = text.slice(0, dashMatch.index).trim();
      const right = text.slice(dashMatch.index + dashMatch[0].length).trim();
      if (right.length > 5) {
        title = left;
        details = right.charAt(0).toUpperCase() + right.slice(1);
      }
    }
  }

  if (title.length > 65 && !details) {
    const breakMatch = title.match(/^(.*?)\s+(for|in|with|on)\s+(.*)$/i);
    if (breakMatch && breakMatch[1].length >= 15 && breakMatch[1].length <= 55) {
      title = breakMatch[1].trim();
      details = (breakMatch[2] + ' ' + breakMatch[3]).trim();
    }
  }

  title = title.charAt(0).toUpperCase() + title.slice(1);
  return { title, details };
}
