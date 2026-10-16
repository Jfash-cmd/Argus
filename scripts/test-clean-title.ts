import { stripEmojisAndDecorations } from '../src/types/opportunity';

function cleanTitleTest(rawTitle: string): { title: string; details: string | null } {
  if (!rawTitle || typeof rawTitle !== 'string') return { title: 'Untitled Opportunity', details: null };
  let text = rawTitle;

  // 1. Convert Markdown links [text](url) -> extract ONLY text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 2. Strip repo-path tags like #owner/repo-name or #TAG
  text = text.replace(/#[\w\-\.\/]+/g, '');

  // 3. Strip any stray raw URLs
  text = text.replace(/https?:\/\/\S+/gi, '');

  // 4. Strip leading bracketed prefixes (e.g. [Bounty], [Bug], [Bounty: $105])
  let prevText = '';
  while (text !== prevText) {
    prevText = text;
    text = text.replace(/^\s*\[[^\]]+\]\s*[:\-\—]?\s*/i, '').trim();
  }

  // 5. Clean emojis and symbols
  text = stripEmojisAndDecorations(text);

  // 6. Strip stray leading/trailing quotes or punctuation (preserving balanced parens)
  text = text.replace(/^[\s\-_*|:•#~]+/, '').replace(/[\s\-_*|:•#~]+$/, '').trim();
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

const test1 = cleanTitleTest("[Reject amounts whose precision exceeds the destination chain's USD](https://github.com/zhangjiayang6835-cyber/bounty-plaza/issues/1906) #ZHANGJIAYANG6835-CYBER/BOUNTY");
console.log('Test 1:', test1);

const test2 = cleanTitleTest("Bypass the Bypass (XSS)");
console.log('Test 2:', test2);

const test3 = cleanTitleTest("Add structured progress callbacks to transfer()");
console.log('Test 3:', test3);
