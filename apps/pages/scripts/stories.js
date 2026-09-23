/**
 * Loads one story for stories.html.
 *
 *   stories.html?story=daniel3  ->  assets/stories/daniel3.json
 *
 * A manifest is either a bare array of entries, or an object carrying a title
 * and an optional aspect ratio alongside its pages:
 *
 *   { "title": "...", "aspect": "9/16", "pages": [ ... ] }
 *
 * Each entry: { image, caption?, audio?, id?, placeholder? }. Paths are
 * written relative to the SITE ROOT ("assets/stories/..."), not to this file
 * or to the page, so a manifest reads the same wherever it is loaded from.
 * Absolute URLs pass through untouched.
 */

const STORY_DIR = 'assets/stories/';

// The slug becomes part of a fetched path, so it is checked against a strict
// allowlist rather than escaped: anything carrying a slash, dot or colon is
// rejected outright instead of being normalised into a surprising path.
const SLUG = /^[a-z0-9][a-z0-9_-]*$/i;

/**
 * @returns {{ slug: string|null, reason: 'missing'|'invalid'|null }}
 */
export function storySlug(search = window.location.search) {
  const raw = (new URLSearchParams(search).get('story') || '').trim();
  if (!raw) return { slug: null, reason: 'missing' };
  if (!SLUG.test(raw)) return { slug: null, reason: 'invalid' };
  return { slug: raw, reason: null };
}

// stories.html sits at apps/pages/, so the site root is two levels up. Keeping
// manifest paths root-relative matches how the stylesheets reference assets.
function siteRoot() {
  return new URL('../../', document.baseURI);
}

function normalizeStory(data) {
  const isBareArray = Array.isArray(data);
  const pages = isBareArray ? data : (Array.isArray(data?.pages) ? data.pages : []);
  return {
    title: (!isBareArray && typeof data?.title === 'string') ? data.title : '',
    aspect: (!isBareArray && typeof data?.aspect === 'string') ? data.aspect : '',
    pages
  };
}

/**
 * @throws when the manifest is missing or unreadable; the caller reports it.
 */
export async function loadStory(slug) {
  const url = new URL(`${STORY_DIR}${slug}.json`, siteRoot());
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return normalizeStory(await response.json());
}

/** Maps a loaded story onto <flip-book> page descriptors. */
export function toFlipPages(story) {
  const root = siteRoot();
  const resolve = path => (path ? new URL(path, root).href : null);

  return story.pages.map((entry, i) => ({
    src: resolve(entry.image),
    alt: entry.caption || `${story.title || 'Story'} — page ${i + 1}`,
    id: entry.id ?? null,
    // Narration is per entry; omit the key and no play button is drawn.
    audio: resolve(entry.audio),
    // A story may use the placeholder paper too, for a page held back.
    placeholder: entry.placeholder || null
  }));
}
