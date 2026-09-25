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

const DEFAULT_MEDIA_BASE = 'https://dailygrace.faith/media/';
// const DEFAULT_MEDIA_BASE = 'http://localhost:9001/media/';
// Resolved against the calling PAGE, not this file, so the two dots count up
// from apps/pages/ and not from this directory. A page at another depth must
// pass its own versesSrc.
const DEFAULT_VERSES_SRC = '../../assets/verses.json';

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july',
  'august', 'september', 'october', 'november', 'december'];

/* ---------- Week arithmetic ---------- */

// Sunday-based week. Returns one entry per leaf: each day contributes its
// reflection page and its comic page, in reading order.
function weekLeaves(today = new Date()) {
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const leaves = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const label = date.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
    leaves.push({ date, label, comic: false, fileName: `${label}.webp` });
    leaves.push({ date, label, comic: true, fileName: `${label} - Comic.webp` });
  }
  return leaves;
}

// Sunday-based calendar weeks, matching weekLeaves(). UTC arithmetic avoids DST shifts.
function coverPaths(today = new Date()) {
  const year = today.getFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const day = Date.UTC(year, today.getMonth(), today.getDate());
  const week = Math.floor(((day - start.getTime()) / 86400000 + start.getUTCDay()) / 7) + 1;
  return [
    `images/coverpages/${year}/${year}-WEEK${week}.webp`,
    `images/coverpages/${year}/${year}-404.webp`
  ];
}

function isFutureDate(date, today = new Date()) {
  const pageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return pageDate > currentDate;
}

/* ---------- Media paths ---------- */

function imagePath(leaf) {
  const month = MONTHS[leaf.date.getMonth()];
  return `images/sources/${month}/${leaf.fileName}`;
}

function audioUrl(leaf, mediaBase) {
  const baseName = leaf.fileName.replace(/\.[^.]+$/, '');
  const month = leaf.date.toLocaleString('en-US', { month: 'long' });
  return new URL(
    `audio/${leaf.date.getFullYear()}/${month}/webm/${baseName}.webm`,
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

async function loadVerses(versesSrc) {
  try {
    const response = await fetch(new URL(versesSrc, window.location.href));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const verses = await response.json();
    return new Map(verses
      .filter(item => typeof item?.id === 'string' && typeof item.verse === 'string')
      .map(item => [item.id, item.verse]));
  } catch (error) {
    console.warn('Unable to load verses:', error);
    return new Map();
  }
}

/* ---------- Public builder ---------- */

/**
 * @param {Object} [options]
 * @param {Date} [options.date]   Any day in the week to show. Default: today.
 * @param {Date} [options.today]  What counts as today: later pages stay covered.
 * @returns {Promise<Array>} FlipPage descriptors ready for <flip-book>.pages
 */
export async function buildWeekPages({
  mediaBase = DEFAULT_MEDIA_BASE,
  versesSrc = DEFAULT_VERSES_SRC,
  today = new Date(),
  date = today
} = {}) {
  const leaves = weekLeaves(date);
  const [cover, fallbackCover] = coverPaths(date);

  const [coverSrc, sources, verses] = await Promise.all([
    probe(cover, mediaBase).then(src => src || probe(fallbackCover, mediaBase)),
    Promise.all(leaves.map(leaf => probe(imagePath(leaf), mediaBase))),
    loadVerses(versesSrc)
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
    if (isFutureDate(leaf.date, today)) {
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
