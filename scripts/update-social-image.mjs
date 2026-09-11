import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Generate metadata before publishing so crawlers receive it without JavaScript.
const now = new Date();
const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit'
}).formatToParts(now).map(({ type, value }) => [type, value]));
const month = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Manila', month: 'long'
}).format(now).toLowerCase();
const url = `https://dailygrace.faith/media/banner/${month}/daily-grace-${parts.year}-${parts.month}-${parts.day}.webp`;
const path = fileURLToPath(new URL('../index.html', import.meta.url));
const html = readFileSync(path, 'utf8');
const tag = /<meta property="og:image" content="[^"]*"\s*\/>/g;
if ([...html.matchAll(tag)].length !== 1) {
  throw new Error('Expected exactly one og:image meta tag in index.html');
}
writeFileSync(path, html.replace(tag, `<meta property="og:image" content="${url}" />`));
console.log(`og:image: ${url}`);
