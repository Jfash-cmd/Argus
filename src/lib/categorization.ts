import { OpportunityCategory } from '../types/opportunity';

export const WEB3_SOURCES = new Set([
  'dorahacks',
  'ethglobal',
  'devfolio',
  'taikai',
  'encodeclub',
  'encode_club',
  'superteam',
  'superteam_earn',
]);

// Web3 keywords and chain names per specification
export const WEB3_KEYWORD_REGEX = /\b(blockchain|crypto|cryptocurrency|web3|web 3|defi|nft|nfts|dao|daos|solana|ethereum|eth|btc|bitcoin|polygon|arbitrum|optimism|avalanche|near|aptos|sui|cosmos|polkadot|cardano|binance|bsc|evm|smart contract|smart contracts|zk|zero knowledge|token|tokens|dapp|dapps|onchain|on-chain|decentralized|decentralised)\b|(?<!data\s*|code\s*|knowledge\s*|user\s*)\bbase\b/i;

export function isWeb3Hackathon(
  source: string,
  title?: string,
  tags?: string[],
  details?: string | null
): boolean {
  const normSource = (source || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  // Rule (a): Always Web3 if source is DoraHacks, ETHGlobal, Devfolio, Taikai, Encode Club, or Superteam Earn
  for (const w3s of WEB3_SOURCES) {
    if (normSource.includes(w3s.replace(/[^a-z0-9]/g, ''))) return true;
  }

  // Rule (b): Any other source (Devpost, MLH, HackerEarth, Unstop, Kaggle, lablab.ai, HackQuest, Reddit, etc.)
  // is Web3 ONLY if title, tags, or description/details contain at least one Web3 keyword or chain name
  const text = `${title || ''} ${(tags || []).join(' ')} ${details || ''}`;
  return WEB3_KEYWORD_REGEX.test(text);
}

export function classifyHackathon(
  source: string,
  title?: string,
  tags?: string[],
  details?: string | null
): 'web3_hackathon' | 'web2_hackathon' {
  return isWeb3Hackathon(source, title, tags, details) ? 'web3_hackathon' : 'web2_hackathon';
}

export function resolveCategory(
  category: string,
  source: string,
  title?: string,
  tags?: string[],
  details?: string | null
): OpportunityCategory {
  if (category === 'hackathon' || category === 'web3_hackathon' || category === 'web2_hackathon') {
    return classifyHackathon(source, title, tags, details);
  }
  return category as OpportunityCategory;
}

export function formatCategoryLabel(category: string): string {
  switch (category) {
    case 'web3_hackathon':
      return 'Web3 Hackathon';
    case 'web2_hackathon':
      return 'Web2 Hackathon';
    case 'hackathon':
      return 'Hackathon';
    case 'bounty':
      return 'Bounty';
    case 'freelance':
      return 'Freelance';
    case 'grant':
      return 'Grant';
    default:
      return category.replace(/_/g, ' ');
  }
}
