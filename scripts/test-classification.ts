import { classifyHackathon, isWeb3Hackathon, resolveCategory } from '../src/lib/categorization';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${msg}`);
}

console.log('--- Testing Classification Logic ---');

// Web3 Sources
assert(classifyHackathon('ethglobal', 'Hackathon') === 'web3_hackathon', 'ETHGlobal is web3_hackathon');
assert(classifyHackathon('devfolio', 'Hackathon') === 'web3_hackathon', 'Devfolio is web3_hackathon');
assert(classifyHackathon('taikai', 'Innovation Challenge') === 'web3_hackathon', 'Taikai is web3_hackathon');
assert(classifyHackathon('encode_club', 'Solidity Bootcamp Hack') === 'web3_hackathon', 'Encode Club is web3_hackathon');
assert(classifyHackathon('superteam_earn', 'Solana Hack') === 'web3_hackathon', 'Superteam is web3_hackathon');
assert(classifyHackathon('dorahacks', 'Web3 Grant Hack') === 'web3_hackathon', 'DoraHacks is web3_hackathon');

// Web2 Sources
assert(classifyHackathon('mlh', 'HackMIT') === 'web2_hackathon', 'MLH is web2_hackathon');
assert(classifyHackathon('hackerearth', 'AI Challenge') === 'web2_hackathon', 'HackerEarth is web2_hackathon');
assert(classifyHackathon('unstop', 'National Coding Challenge') === 'web2_hackathon', 'Unstop is web2_hackathon');
assert(classifyHackathon('kaggle', 'Data Science Competition') === 'web2_hackathon', 'Kaggle is web2_hackathon');
assert(classifyHackathon('lablab_ai', 'Generative AI Sprint') === 'web2_hackathon', 'lablab is web2_hackathon');
assert(classifyHackathon('hackquest', 'Buildathon') === 'web2_hackathon', 'HackQuest is web2_hackathon');

// Devpost & other content-based sources
assert(classifyHackathon('devpost', 'Global AI Hackathon', ['Python', 'AI']) === 'web2_hackathon', 'Devpost without web3 keywords is web2_hackathon');
assert(classifyHackathon('devpost', 'Solana Summer Camp', ['Solana']) === 'web3_hackathon', 'Devpost with Solana tag is web3_hackathon');
assert(classifyHackathon('devpost', 'Crypto DeFi Hackathon 2026') === 'web3_hackathon', 'Devpost with crypto/defi title is web3_hackathon');
assert(classifyHackathon('medium', 'Building on Ethereum Layer 2', ['Newsletter', 'Medium']) === 'web3_hackathon', 'Medium with Ethereum is web3_hackathon');
assert(classifyHackathon('substack', 'Top 5 Web3 Hackathons to Join', ['Newsletter', 'Substack']) === 'web3_hackathon', 'Substack with Web3 is web3_hackathon');

// Non-hackathons stay as-is
assert(resolveCategory('bounty', 'github', 'Fix Rust bug') === 'bounty', 'Bounty category preserved');
assert(resolveCategory('freelance', 'reddit', 'Need React dev') === 'freelance', 'Freelance category preserved');
assert(resolveCategory('grant', 'superteam_earn', 'Ecosystem Grant') === 'grant', 'Grant category preserved');

console.log('All categorization assertions passed!');
