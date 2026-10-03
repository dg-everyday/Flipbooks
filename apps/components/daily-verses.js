/**
 * The daily verses, one JSON file per month:
 *   <base><YYYY>/<month>.json        e.g. assets/verses/2027/january.json
 * Each file is an array of entries whose `id` is the day ("January 1, 2027").
 * Shared by the components that show a day's verse or reflection; a month
 * file is fetched once per page however many of them ask for it.
 *
 * Import it with the same ?v= token everywhere, or the page loads two copies
 * and fetches each month twice. Bump the token in every import when it changes.
 */

/** Where the month files live, resolved against the page. */
export const DEFAULT_VERSES_BASE = 'assets/verses/';

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july',
  'august', 'september', 'october', 'november', 'december'];

/**
 * The month file holding the day `name` ("September 24, 2026"), resolved
 * against `base` (an absolute URL); null for a name that is not a date.
 */
export function versesFileUrl(base, name) {
  const match = /^([A-Za-z]+) \d{1,2}, (\d{4})$/.exec(name ?? '');
  const month = match?.[1].toLowerCase();
  if (!MONTHS.includes(month)) return null;
  return new URL(`${match[2]}/${month}.json`, base.endsWith('/') ? base : `${base}/`).href;
}

const files = new Map();

/** One month file as a Map by day name. A failed fetch is forgotten, so it can be retried. */
function loadFile(url) {
  if (!files.has(url)) {
    files.set(url, fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${url} (${response.status})`);
        return response.json();
      })
      .then((list) => new Map(list.map((item) => [item.id, item])))
      .catch((error) => {
        files.delete(url);
        throw error;
      }));
  }
  return files.get(url);
}

/**
 * The entries for the days `names`, by day name, from every month they fall
 * in. A day whose month could not be loaded is simply missing; this rejects
 * only when none of the months could be.
 */
export async function loadVerses(base, names) {
  const urls = [...new Set(names.map((name) => versesFileUrl(base, name)).filter(Boolean))];
  const results = await Promise.allSettled(urls.map(loadFile));
  const months = results.filter((result) => result.status === 'fulfilled').map((result) => result.value);
  if (!months.length) {
    throw results[0]?.reason ?? new Error(`No verses file for ${names.join(', ')}`);
  }
  return new Map(months.flatMap((month) => [...month]));
}
