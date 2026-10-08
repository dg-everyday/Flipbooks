/**
 * The site's settings, read once from apps/settings/appsettings.json and
 * shared by every module that imports this one.
 *
 *   import { MEDIA_BASE_URL, resolveMedia } from '../settings/settings.js?v=20261009-1';
 *
 * Import it with that exact ?v= token everywhere: a module is loaded once per
 * URL, so a second token would fetch the settings a second time.
 *
 * MEDIA_BASE_URL   the media host, ending in a slash ("media_base_url").
 * resolveMedia()   expands the placeholder the JSON data uses for that host:
 *
 *   "media:stories/where-art-thou/00.webp"
 *     -> "<media_base_url>stories/where-art-thou/00.webp"
 *
 * The placeholder is written as a URL scheme so assets/scripts/check-assets.mjs
 * treats it as remote, as it did the full URLs, instead of looking for the
 * file on disk. Anything else, absolute URLs included, passes through.
 */

const SETTINGS_URL = new URL('./appsettings.json', import.meta.url);
const MEDIA_PLACEHOLDER = 'media:';

async function loadSettings() {
  try {
    const response = await fetch(SETTINGS_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    // Without settings the media cannot load, but the text of the site can,
    // so carry on rather than take every component down with this module.
    console.error(`Could not load ${SETTINGS_URL.href}:`, error);
    return {};
  }
}

export const settings = Object.freeze(await loadSettings());

export const MEDIA_BASE_URL = settings.media_base_url ?? '';

/** The value with its "media:" placeholder swapped for MEDIA_BASE_URL. */
export function resolveMedia(value) {
  return typeof value === 'string' && value.startsWith(MEDIA_PLACEHOLDER)
    ? `${MEDIA_BASE_URL}${value.slice(MEDIA_PLACEHOLDER.length)}`
    : value;
}
