/**
 * My Faith Journal: the shape of each kind of entry. Every kind has its own
 * few parts, each optional: a single line anywhere is a whole entry.
 *
 *   Daily Log    the captain's log: what happened today (or, with the day's
 *                question, the answer to it, then what happened), what I'm
 *                thankful for, what I learned, tomorrow
 *   Discoveries  the explorer's notes: what I found (bookmarks, or a verse
 *                or place in Scripture), what it means, where it fits in my
 *                life
 *   My Diary     how I feel (a mood), then an open page
 *   Notebook     the writer's notebook: a quote worth keeping and its
 *                source, then notes
 *   Prayer List  for whom or what about, the prayer, and its answer
 *
 * Each kind's main words are the entry's `body` (rich text, store.js); the
 * other parts are plain text in `fields`, and the mood is `mood`. The
 * editor, the page, search and the Word book all read the parts from here,
 * so they show the same things in the same order.
 *
 * Exports      sections(entry)   the parts of an entry's kind, in order:
 *                                { body } | { key } | { cards } | { mood } |
 *                                { answer }, each with a label (and a
 *                                placeholder, `single` for a one-line field)
 *              FIELD_KEYS, FIELD_LIMIT, MOODS, moodLabel(key)
 *              fieldsText(entry) the plain parts' words, for search and
 *                                previews
 */

export const FIELD_LIMIT = 4000;

export const MOODS = [
    { key: "glad", label: "Glad" },
    { key: "thankful", label: "Thankful" },
    { key: "peaceful", label: "Peaceful" },
    { key: "worried", label: "Worried" },
    { key: "sad", label: "Sad" },
];

export function moodLabel(key) {
    return MOODS.find((mood) => mood.key === key)?.label ?? "";
}

const THANKFUL = { key: "thankful", label: "What I’m thankful for", placeholder: "One or two blessings from today…" };
const LEARNED = { key: "learned", label: "What I learned", placeholder: "From the verse, or from the day…" };
const TOMORROW = { key: "tomorrow", label: "Tomorrow, with God’s help…", placeholder: "One thing to do, or to trust Him with" };
const HAPPENED = { key: "happened", label: "What happened today", placeholder: "A line or two about your day…" };

const LAYOUTS = {
    // With the day's question (from Today or the Moment), the main words
    // answer it, and what happened has a part of its own.
    log: (entry) =>
        entry.prompt
            ? [
                  { body: true, label: "My answer", placeholder: "Answer the day’s question in a line, or as much as you like…" },
                  HAPPENED,
                  THANKFUL,
                  LEARNED,
                  TOMORROW,
              ]
            : [{ ...HAPPENED, key: undefined, body: true }, THANKFUL, LEARNED, TOMORROW],
    discovery: () => [
        { cards: true, label: "What I found" },
        { key: "reference", label: "A verse or place in Scripture", placeholder: "Psalm 23:1", single: true },
        { body: true, label: "What it means", placeholder: "What does it show you about God, or about life?" },
        { key: "applies", label: "Where it fits in my life", placeholder: "Where could this make a difference this week?" },
    ],
    diary: () => [
        { mood: true, label: "How I feel" },
        { body: true, label: "What is on your heart?", placeholder: "Write freely: this page is yours." },
    ],
    notebook: () => [
        { key: "quote", label: "A quote worth keeping", placeholder: "A verse, a saying, a line from a book…" },
        { key: "source", label: "Its source", placeholder: "Who said it, or where it is found", single: true },
        { body: true, label: "My notes", placeholder: "Ideas, verses to remember, a letter to your future self…" },
    ],
    prayer: () => [
        { key: "forWhom", label: "For whom, or what about", placeholder: "Mum’s health, my exams, a friend…", single: true },
        { body: true, label: "My prayer", placeholder: "Bring it to God in your own words…" },
        { answer: true, label: "The answer" },
    ],
};

/** Every plain part any kind has (an entry keeps them all when its kind changes). */
export const FIELD_KEYS = ["happened", "thankful", "learned", "tomorrow", "reference", "applies", "quote", "source", "forWhom"];

/**
 * The parts of an entry's kind, in order. Every kind but Discoveries keeps
 * its bookmarks at the end, as "Bookmarks in this entry".
 */
export function sections(entry) {
    const layout = (LAYOUTS[entry.kind] ?? LAYOUTS.log)(entry);
    return layout.some((part) => part.cards)
        ? layout
        : [...layout, { cards: true, label: "Bookmarks in this entry" }];
}

/** The words of the plain parts this kind shows, joined. */
export function fieldsText(entry) {
    return sections(entry)
        .filter((part) => part.key)
        .map((part) => entry.fields?.[part.key] ?? "")
        .filter((text) => text.trim())
        .join("\n");
}
