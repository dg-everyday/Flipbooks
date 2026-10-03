/**
 * Builds the Daily Grace page list for <flip-book>.
 *
 * Everything that knows about Daily Grace's file naming lives here: which
 * seven days belong to the week being shown, where the cover and artwork sit under the
 * media base, which files carry narration, and which are dated ahead of today
 * and so must show the "will be available" paper instead.
 *
 * The component gets the finished list and no rules at all.
 */

import { loadVerses } from '../../components/daily-verses.js?v=20261004-1';

const DEFAULT_MEDIA_BASE = 'https://dailygrace.faith/media/';
// const DEFAULT_MEDIA_BASE = 'http://localhost:9001/media/';
// The folder of month verse files (<YYYY>/<month>.json). Resolved against the
// calling PAGE, not this file, so the two dots count up from apps/pages/ and
// not from this directory. A page at another depth must pass its own
// versesBase.
const DEFAULT_VERSES_BASE = '../../assets/verses/';

// Each day's devotional goes live at midnight here, as on the main page.
const TIME_ZONE = 'Asia/Manila';
const DAY_MS = 86400000;

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july',
  'august', 'september', 'october', 'november', 'december'];

/* ---------- Calendar days ---------- */

// Every day here is a Date at UTC midnight, read with the UTC getters and
// formatted in UTC, so the viewer's own time zone never moves it.

/** Today's calendar date in Asia/Manila. */
function manilaToday() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, year: 'numeric', month: 'numeric', day: 'numeric' })
      .formatToParts(new Date())
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, Number(value)])
  );
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

/** A YYYY-MM-DD string as a day, or null when it is malformed or no real date. */
function parseDay(text) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text ?? '');
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCMonth() === month - 1 ? date : null;
}

/* ---------- Week arithmetic ---------- */

// The Sunday that starts the week `day` falls in.
function weekStart(day) {
  return new Date(day.getTime() - day.getUTCDay() * DAY_MS);
}

// Returns one entry per leaf: each day contributes its reflection page and
// its comic page, in reading order.
function weekLeaves(sunday) {
  const leaves = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(sunday.getTime() + i * DAY_MS);
    const label = date.toLocaleDateString('en-US', {
      timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric'
    });
    leaves.push({ date, label, comic: false, fileName: `${label}.webp` });
    leaves.push({ date, label, comic: true, fileName: `${label} - Comic.webp` });
  }
  return leaves;
}

// Weeks are numbered from the one holding January 1 and named for their
// Saturday, so a week that runs into a new year belongs to the new one and
// keeps one cover throughout: December 27, 2026 – January 2, 2027 is
// 2027-WEEK1 on every day of it.
function coverPaths(sunday) {
  const saturday = new Date(sunday.getTime() + 6 * DAY_MS);
  const year = saturday.getUTCFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const week = Math.floor(((saturday - start) / DAY_MS + start.getUTCDay()) / 7) + 1;
  return [
    `images/coverpages/${year}/${year}-WEEK${week}.webp`,
    `images/coverpages/${year}/${year}-404.webp`
  ];
}

/* ---------- Media paths ---------- */

function imagePath(leaf) {
  const month = MONTHS[leaf.date.getUTCMonth()];
  return `images/sources/${leaf.date.getUTCFullYear()}/${month}/${leaf.fileName}`;
}

function audioUrl(leaf, mediaBase) {
  const baseName = leaf.fileName.replace(/\.[^.]+$/, '');
  const month = leaf.date.toLocaleString('en-US', { timeZone: 'UTC', month: 'long' });
  return new URL(
    `audio/${leaf.date.getUTCFullYear()}/${month}/webm/${baseName}.webm`,
    mediaBase
  ).href;
}

// Resolves to the absolute URL when the file exists, or null when it 404s.
// The media server is the source of truth for which days have shipped.
// On the site's own origin a HEAD request answers that without downloading
// the artwork, which <flip-book> then fetches a few pages at a time. From
// anywhere else (local development against the live media host) CORS hides
// the status, so the image itself is loaded instead.
function probe(path, mediaBase) {
  const src = new URL(path, mediaBase).href;
  if (new URL(src).origin === window.location.origin) {
    return fetch(src, { method: 'HEAD' })
      .then(response => (response.ok ? src : null), () => null);
  }
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// The week's verse references by day name. A week can straddle two months,
// or two years, so this may read two month files.
async function loadWeekVerses(versesBase, names) {
  try {
    const verses = await loadVerses(new URL(versesBase, window.location.href).href, names);
    return new Map([...verses]
      .filter(([, item]) => typeof item?.verse === 'string')
      .map(([id, item]) => [id, item.verse]));
  } catch (error) {
    console.warn('Unable to load verses:', error);
    return new Map();
  }
}

/* ---------- Public builder ---------- */

/**
 * @param {Object} [options]
 * @param {string} [options.date]  Any day in the week to show, as YYYY-MM-DD.
 *   A missing, malformed or future date shows this week.
 * @param {Date} [options.today]   What counts as today, as a Date at UTC
 *   midnight: later pages stay covered. Default: today in Asia/Manila.
 * @returns {Promise<Array>} FlipPage descriptors ready for <flip-book>.pages
 */
export async function buildWeekPages({
  mediaBase = DEFAULT_MEDIA_BASE,
  versesBase = DEFAULT_VERSES_BASE,
  today = manilaToday(),
  date
} = {}) {
  const requested = parseDay(date);
  const sunday = weekStart(requested && requested <= today ? requested : today);
  const leaves = weekLeaves(sunday);
  const [cover, fallbackCover] = coverPaths(sunday);

  const [coverSrc, sources, verses] = await Promise.all([
    probe(cover, mediaBase).then(src => src || probe(fallbackCover, mediaBase)),
    Promise.all(leaves.map(leaf => probe(imagePath(leaf), mediaBase))),
    loadWeekVerses(versesBase, [...new Set(leaves.map(leaf => leaf.label))])
  ]);

  const pages = [];
  if (coverSrc) {
    // Cover pages carry no narration.
    pages.push({ src: coverSrc, alt: 'Daily Grace — this week', id: 'cover' });
  }

  leaves.forEach((leaf, i) => {
    const src = sources[i];
    if (!src) return; // not published yet — the day simply has no leaf

    const page = {
      src,
      id: leaf.label,
      alt: leaf.comic
        ? `Daily Grace comic — ${leaf.label}`
        : `Daily Grace — ${leaf.label}`,
      audio: leaf.comic ? null : audioUrl(leaf, mediaBase)
    };

    // Artwork is published ahead of its date; the paper keeps it covered
    // until the day arrives.
    if (leaf.date > today) {
      page.placeholder = {
        logo: true,
        title: 'DAILY GRACE',
        badge: leaf.comic ? 'COMIC' : '',
        label: 'WILL BE AVAILABLE IN',
        headline: leaf.label,
        body: verses.get(leaf.label) || ''
      };
    }
    pages.push(page);
  });

  return pages;
}
