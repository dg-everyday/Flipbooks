import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Generate metadata before publishing so crawlers receive it without JavaScript.
const now = new Date();
const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
        .formatToParts(now)
        .map(({ type, value }) => [type, value]),
);
const month = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    month: "long",
})
    .format(now)
    .toLowerCase();
const url = `https://dailygrace.faith/media/banner/${month}/daily-grace-${parts.year}-${parts.month}-${parts.day}.webp`;
const targets = [
    "../../index.html", 
    "../../apps/pages/flipbook.html"
];
// The formatter wraps long meta tags across lines, so allow newlines between attributes.
const tag = /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/g;
for (const target of targets) {
    const path = fileURLToPath(new URL(target, import.meta.url));
    const html = readFileSync(path, "utf8");
    if ([...html.matchAll(tag)].length !== 1) {
        throw new Error(`Expected exactly one og:image meta tag in ${target}`);
    }
    writeFileSync(
        path,
        // Swap only the URL so the surrounding formatting survives untouched.
        html.replace(tag, (meta) => meta.replace(/content="[^"]*"/, `content="${url}"`)),
    );
}
console.log(`og:image: ${url}`);
