/**
 * strongs-entry.js — Strong's dictionary entries for the interlinears: the
 * explanation popup of <bible-search-results> and the Interlinear tab of
 * <passage-reader>. A tapped word shows its entry: the number, the Hebrew or
 * Greek word, its transliteration and pronunciation, the definition, how the
 * KJV renders it and where it comes from.
 *
 * The dictionary is in assets/strongs/hebrew/<n>.json and greek/<n>.json, 100
 * entries to a file (tools/strongs/build_strongs.py), so a word fetches only
 * the one file its number falls in; each file is fetched once per page.
 *
 * Usage
 *   import { STRONGS_ENTRY_STYLES, loadStrongsEntry, strongsEntryNode } from './strongs-entry.js?v=…';
 *   const entry = await loadStrongsEntry("H7225");          // null if there is none
 *   panel.replaceChildren(strongsEntryNode("H7225", entry)); // entry null: "could not be loaded"
 *   // and ${STRONGS_ENTRY_STYLES} in the component's shadow styles
 */

const DEFAULT_STRONGS_BASE = new URL("../../assets/strongs/", import.meta.url).href;
// Strong's dictionary entries per file (tools/strongs/build_strongs.py).
const STRONGS_CHUNK = 100;

/** The styles of strongsEntryNode's card, for a shadow root. */
export const STRONGS_ENTRY_STYLES = `
  .il-entry-item {
    margin-top: 8px; padding: 10px 12px;
    border-left: 3px solid var(--search-gold, #a8810c); border-radius: 6px;
    background: rgb(255 255 255 / 50%);
    color: var(--search-ink, #10253b);
    text-align: left;
    font: 400 1rem/1.45 'Strait', 'Roboto', sans-serif;
  }
  .il-entry-item h4 {
    display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 10px;
    margin: 0 0 4px;
    font: 400 1rem/1.3 'Roboto', Arial, sans-serif;
  }
  .il-entry-item .il-num {
    color: #805b18;
    letter-spacing: .04em;
    font: 600 .8125rem/1.4 'Roboto', Arial, sans-serif;
  }
  .il-entry-item .il-orig {
    color: var(--search-hebrew, #963d32);
    font: 400 1.5rem/1.35 'SBL Hebrew', 'Ezra SIL', 'Gentium Plus', 'Times New Roman', serif;
  }
  .il-entry-item .il-xlit { color: #4f5c65; font: italic .8125rem/1.3 Georgia, 'Times New Roman', serif; }
  .il-entry-item p { margin: 0 0 4px; }
  .il-entry-item p:last-child { margin-bottom: 0; }
  .il-entry-item .il-derivation { color: #4f5c65; font-size: .9375rem; }`;

// One fetch per dictionary file, shared by every component on the page.
const strongsCache = new Map();

/**
 * The dictionary entry for "H7225" or "G26", or null if there is none. base
 * is the dictionary folder (default: ../../assets/strongs/ from this file).
 */
export function loadStrongsEntry(number, base = DEFAULT_STRONGS_BASE) {
    const folder = number[0] === "H" ? "hebrew" : "greek";
    const file = Math.floor(Number(number.slice(1)) / STRONGS_CHUNK);
    const url = new URL(`${folder}/${file}.json`, base).href;
    if (!strongsCache.has(url)) {
        const request = fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch Strong's entries: ${response.status}`,
                    );
                }
                return response.json();
            })
            .catch((error) => {
                strongsCache.delete(url);
                throw error;
            });
        strongsCache.set(url, request);
    }
    return strongsCache.get(url).then((entries) => entries[number] ?? null);
}

/** One Strong's dictionary entry as a card; a null entry says it could not load. */
export function strongsEntryNode(number, entry) {
    const item = document.createElement("article");
    item.className = "il-entry-item";
    const heading = document.createElement("h4");
    const label = document.createElement("span");
    label.className = "il-num";
    label.textContent = number;
    heading.append(label);
    if (!entry) {
        const missing = document.createElement("p");
        missing.textContent = "This dictionary entry could not be loaded.";
        item.append(heading, missing);
        return item;
    }
    const orig = document.createElement("span");
    orig.className = "il-orig";
    orig.lang = number[0] === "H" ? "he" : "grc";
    orig.dir = orig.lang === "he" ? "rtl" : "ltr";
    orig.textContent = entry.lemma;
    const xlit = document.createElement("span");
    xlit.className = "il-xlit";
    xlit.textContent = entry.pron ? `${entry.xlit} (${entry.pron})` : entry.xlit;
    heading.append(orig, xlit);
    item.append(heading);
    if (entry.def) {
        const def = document.createElement("p");
        def.textContent = entry.def;
        item.append(def);
    }
    if (entry.kjv) {
        const kjv = document.createElement("p");
        const name = document.createElement("strong");
        name.textContent = "In the KJV: ";
        kjv.append(name, entry.kjv);
        item.append(kjv);
    }
    if (entry.derivation) {
        const derivation = document.createElement("p");
        derivation.className = "il-derivation";
        derivation.textContent = entry.derivation;
        item.append(derivation);
    }
    return item;
}
