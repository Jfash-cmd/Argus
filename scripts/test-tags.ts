import { filterAndCleanTags, isRedundantTag } from '../src/types/opportunity';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${msg}`);
}

console.log('--- Testing Tag Filtering & Normalization ---');

// Unstop tests
assert(isRedundantTag('Unstop', 'unstop'), 'Unstop matches unstop source');
assert(isRedundantTag('UNSTOP', 'unstop'), 'UNSTOP matches unstop source case-insensitively');
assert(isRedundantTag('Competition', 'unstop'), 'Competition is redundant');
assert(isRedundantTag('competition', 'unstop'), 'competition is redundant');
assert(!isRedundantTag('IoT', 'unstop'), 'IoT is not redundant on unstop');
assert(!isRedundantTag('Embedded Systems', 'unstop'), 'Embedded Systems is not redundant on unstop');

const unstopCleaned = filterAndCleanTags(['Unstop', 'Competition', 'IoT', 'Embedded Systems'], 'unstop');
assert(JSON.stringify(unstopCleaned) === JSON.stringify(['IOT', 'EMBEDDED SYSTEMS']), 'Unstop tags cleaned to only meaningful tags');

const unstopEmpty = filterAndCleanTags(['Unstop', 'Competition'], 'unstop');
assert(JSON.stringify(unstopEmpty) === JSON.stringify([]), 'Unstop tags with only redundant tags becomes empty array');

// Superteam tests
assert(isRedundantTag('Superteam', 'superteam_earn'), 'Superteam matches superteam_earn source');
assert(isRedundantTag('SUPERTEAM', 'superteam_earn'), 'SUPERTEAM matches superteam_earn source');
const superteamCleaned = filterAndCleanTags(['Superteam', 'Solana', 'Rust'], 'superteam_earn');
assert(JSON.stringify(superteamCleaned) === JSON.stringify(['SOLANA', 'RUST']), 'Superteam tags cleaned');

// Medium & Substack tests
assert(isRedundantTag('Medium', 'medium'), 'Medium matches medium source');
assert(isRedundantTag('Substack', 'substack'), 'Substack matches substack source');
const mediumCleaned = filterAndCleanTags(['Newsletter', 'Medium'], 'medium');
assert(JSON.stringify(mediumCleaned) === JSON.stringify(['NEWSLETTER']), 'Medium source removed from Medium RSS tags');

// Devpost tests
assert(isRedundantTag('Devpost', 'devpost'), 'Devpost matches devpost source');
const devpostCleaned = filterAndCleanTags(['Hackathon', 'Devpost'], 'devpost');
assert(JSON.stringify(devpostCleaned) === JSON.stringify(['HACKATHON']), 'Devpost source removed from Devpost tags');

// Reddit tests
assert(!isRedundantTag('r/hackathon', 'reddit'), 'r/hackathon subreddit tag is preserved');
const redditCleaned = filterAndCleanTags(['r/hackathon', 'Gig'], 'reddit');
assert(JSON.stringify(redditCleaned) === JSON.stringify(['R/HACKATHON', 'GIG']), 'Reddit tags preserved');

// General deduplication & cleanup
const dedupCleaned = filterAndCleanTags(['#AI', 'ai', ' AI '], 'devpost');
assert(JSON.stringify(dedupCleaned) === JSON.stringify(['AI']), 'Duplicate tags normalized and deduped');

console.log('All tag filtering assertions passed!');
