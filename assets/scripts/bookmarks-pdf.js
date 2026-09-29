/**
 * Bookmarks as a PDF: the reader's bookmarked verses, facts and sayings laid
 * out on A4 pages, returned as a PDF blob named daily-grace-bookmarks-<date>.pdf.
 * script.js opens it in a new tab.
 *
 * Everything happens on the reader's device: nothing is sent anywhere. The
 * bookmarks popup's PDF pill (script.js) imports this module on the first tap,
 * so none of it loads with the page. It then loads jsPDF from cdnjs (about
 * 110 KB compressed, checked by its SRI hash, as people.js loads Leaflet) and
 * embeds the site's own fonts, Germania One for titles and Strait for text,
 * which between them hold every character in the verses, facts and sayings.
 *
 * Usage
 *   const { makeBookmarksPdf } = await import('./bookmarks-pdf.js?v=…');
 *   const { blob, filename } = await makeBookmarksPdf({ verses, facts, sayings, guidance });
 *     verses   [{ book_name, chapter, verse, text }]   (getVersesByIds)
 *     facts    [{ title, text, reference }]            (<did-you-know>.bookmarkedItems())
 *     sayings  [{ saying, meaning, kjv_text, reference }] (<bible-sayings>.bookmarkedItems())
 *     guidance [{ name, section, question, summary, guidance, teachings, practice, prayer }]
 *              (<daily-guidance>.bookmarkedItems(): topics of guidance-for-life.json)
 * Each list is newest first, as the popup shows it. Rejects if jsPDF or the
 * fonts cannot be loaded.
 */

const JSPDF = {
  js: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/4.2.1/jspdf.umd.min.js',
  integrity: 'sha512-plOdviVmws4Y3JAvbnpfKb2hVxKM1lCwsi3vmElYRj+tiDLffZ4FVUj5a8vyKJ9pIgl8JCAHEJ4D1iUKBecswg==',
};

const asset = (path) => new URL(path, import.meta.url).href;
const FONTS = [
  { family: 'GermaniaOne', file: 'GermaniaOne-Regular.ttf', url: asset('../fonts/GermaniaOne-Regular.ttf') },
  { family: 'Strait', file: 'Strait-Regular.ttf', url: asset('../fonts/Strait-Regular.ttf') },
];
const EMBLEM_URL = asset('../images/dg-icon-gold-256.webp');

// The site's palette.
const NAVY = '#001b34';
const INK = '#10253b';
const MUTED = '#5b6878';
const GOLD = '#c6922e';
const GOLD_DARK = '#805b18';
const RED = '#c62828';
const RULE = '#e6d6b8';
const CREAM = '#f3e7d2';

// A4 in millimetres, and the space the content may use.
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_X = 18;
const TOP = 18;
const BOTTOM = PAGE_H - 20;           // content stops here; the footer sits below
const WIDTH = PAGE_W - MARGIN_X * 2;

const PT = 25.4 / 72;                 // one point in millimetres
const lineHeight = (size, leading = 1.3) => size * PT * leading;

// ------------------------------------------------------------------ loading

let jsPdfLoad = null;

/** Loads jsPDF once; a failed load can be tried again. */
function loadJsPdf() {
  if (window.jspdf?.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
  jsPdfLoad ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = JSPDF.js;
    script.integrity = JSPDF.integrity;
    script.crossOrigin = 'anonymous';
    script.referrerPolicy = 'no-referrer';
    script.onload = () => (window.jspdf?.jsPDF
      ? resolve(window.jspdf.jsPDF)
      : reject(new Error('jsPDF did not load.')));
    script.onerror = () => {
      script.remove();
      reject(new Error('jsPDF could not be loaded.'));
    };
    document.head.append(script);
  }).catch((error) => {
    jsPdfLoad = null;
    throw error;
  });
  return jsPdfLoad;
}

const fontCache = new Map();

/** A font file as base64, which is how jsPDF takes it. */
function loadFont(url) {
  if (!fontCache.has(url)) {
    const request = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        return response.arrayBuffer();
      })
      .then((buffer) => {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        // In slices, since spreading a whole font into one call can overflow the stack.
        for (let index = 0; index < bytes.length; index += 0x8000) {
          binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
        }
        return btoa(binary);
      })
      .catch((error) => {
        fontCache.delete(url);
        throw error;
      });
    fontCache.set(url, request);
  }
  return fontCache.get(url);
}

/** The DG emblem as a PNG data URL (jsPDF takes no WebP), or null. */
async function loadEmblem() {
  try {
    const image = new Image();
    image.src = EMBLEM_URL;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext('2d').drawImage(image, 0, 0);
    return canvas.toDataURL('image/png');
  } catch {
    return null;                        // the PDF is fine without it
  }
}

// ------------------------------------------------------------------ text

// A few verses in the database have a broken apostrophe (father�s).
const clean = (text) => String(text ?? '').replace(/�/g, '’').replace(/\s+/g, ' ').trim();

const verseReference = (row) => (Number(row.verse) === 0
  ? `${row.book_name} ${row.chapter}, title`
  : `${row.book_name} ${row.chapter}:${row.verse}`);

const plural = (count, one, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

function localDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// ------------------------------------------------------------------ layout

/**
 * Lays out a document top to bottom. Each item is a list of runs (one style
 * each), in blocks: a run marked breakBefore starts a new block, and a page
 * may turn only between blocks. Most items are one block, so they are never
 * split; a long guidance topic may turn between its passages.
 */
class Writer {
  constructor(doc) {
    this.doc = doc;
    this.y = TOP;
  }

  style({ font = 'Strait', size = 11, color = INK }) {
    this.doc.setFont(font, 'normal');
    this.doc.setFontSize(size);
    this.doc.setTextColor(color);
  }

  // Each run wrapped to the width, with its line height and the gap after it.
  measure(runs) {
    return runs.filter((run) => run.text).map((run) => {
      this.style(run);
      const indent = run.indent ?? 0;
      const lines = this.doc.splitTextToSize(run.text, WIDTH - indent);
      const step = lineHeight(run.size ?? 11, run.leading);
      return { ...run, indent, lines, step, height: lines.length * step + (run.gap ?? 0) };
    });
  }

  newPage() {
    this.doc.addPage();
    this.y = TOP;
  }

  /** Starts a new page unless height fits in what is left of this one. */
  keep(height) {
    if (this.y + height > BOTTOM && this.y > TOP) this.newPage();
  }

  /** The measured runs in blocks, each with its height. */
  blocks(runs) {
    const blocks = [];
    for (const run of this.measure(runs)) {
      if (!blocks.length || run.breakBefore) blocks.push({ runs: [], height: 0 });
      const block = blocks[blocks.length - 1];
      block.runs.push(run);
      block.height += run.height;
    }
    return blocks;
  }

  /**
   * Draws an item block by block, moving each block whole to the next page if
   * need be; keepWith keeps that much room after the first block.
   */
  item(runs, { keepWith = 0 } = {}) {
    this.blocks(runs).forEach((block, index) => {
      const room = block.height + (index === 0 ? keepWith : 0);
      if (room <= BOTTOM - TOP) this.keep(room);
      for (const run of block.runs) {
        this.style(run);
        for (const line of run.lines) {
          if (this.y + run.step > BOTTOM) this.newPage();    // only for a block taller than a page
          this.doc.text(line, MARGIN_X + run.indent, this.y, { baseline: 'top' });
          this.y += run.step;
        }
        this.y += run.gap ?? 0;
      }
    });
  }

  rule(color = RULE, gap = 4) {
    this.doc.setDrawColor(color);
    this.doc.setLineWidth(0.25);
    this.doc.line(MARGIN_X, this.y, PAGE_W - MARGIN_X, this.y);
    this.y += gap;
  }
}

function drawHeader(writer, { emblem, date, counts }) {
  const { doc } = writer;
  const size = 17;
  let textX = MARGIN_X;
  if (emblem) {
    doc.setFillColor(CREAM);
    doc.circle(MARGIN_X + size / 2, TOP + size / 2, size / 2, 'F');
    doc.addImage(emblem, 'PNG', MARGIN_X + 1.5, TOP + 1.5, size - 3, size - 3);
    textX += size + 5;
  }
  writer.style({ size: 8, color: GOLD_DARK });
  doc.text('DAILY GRACE · SAVED ON THIS DEVICE', textX, TOP + 1, { baseline: 'top', charSpace: 0.6 });
  writer.style({ font: 'GermaniaOne', size: 26, color: NAVY });
  doc.text('My Bookmarks', textX, TOP + 5, { baseline: 'top' });
  writer.style({ size: 10, color: MUTED });
  doc.text(`${date} · ${counts}`, textX, TOP + 16, { baseline: 'top' });

  writer.y = TOP + size + 6;
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.6);
  doc.line(MARGIN_X, writer.y, PAGE_W - MARGIN_X, writer.y);
  writer.y += 8;
}

/** A section: its heading stays with the first item under it. */
function drawSection(writer, title, items, toRuns) {
  if (!items.length) return;
  const heading = [
    { font: 'GermaniaOne', size: 17, color: NAVY, text: `${title} (${items.length})`, gap: 1.5 },
  ];
  const first = writer.blocks(toRuns(items[0]))[0]?.height ?? 0;
  writer.item(heading, { keepWith: 6 + first });
  writer.doc.setDrawColor(GOLD);
  writer.doc.setLineWidth(0.8);
  writer.doc.line(MARGIN_X, writer.y, MARGIN_X + 12, writer.y);
  writer.y += 5;
  items.forEach((item, index) => {
    writer.item(toRuns(item));
    if (index < items.length - 1) {
      writer.y += 1;
      writer.rule();
    }
  });
  writer.y += 9;
}

const verseRuns = (row) => [
  { font: 'GermaniaOne', size: 12.5, color: GOLD_DARK, text: verseReference(row), gap: 1 },
  { size: 11.5, text: clean(row.text), gap: 1 },
];

const factRuns = (fact) => [
  { font: 'GermaniaOne', size: 13, color: NAVY, text: clean(fact.title), gap: 1 },
  { size: 11, text: clean(fact.text), gap: 1.2 },
  { size: 9.5, color: RED, text: fact.reference ? `(${clean(fact.reference)})` : '', gap: 1 },
];

const sayingRuns = (saying) => [
  { font: 'GermaniaOne', size: 13, color: NAVY, text: clean(saying.saying), gap: 1 },
  { size: 11, text: clean(saying.meaning), gap: 1.2 },
  { size: 10, color: MUTED, text: saying.kjv_text ? `“${clean(saying.kjv_text)}”` : '', gap: 1.2 },
  { size: 9.5, color: RED, text: saying.reference ? `(${clean(saying.reference)})` : '', gap: 1 },
];

// A guidance topic in full, as on the Questions We All Ask page: the question and
// its answer, every passage of Scripture with who spoke it, then what to do.
// A page may turn before a passage or before "Try this", never inside one.
const guidanceRuns = (topic) => [
  { size: 8.5, color: GOLD_DARK, text: clean(topic.section).toUpperCase(), gap: 0.8 },
  { font: 'GermaniaOne', size: 13, color: NAVY, text: clean(topic.name), gap: 0.8 },
  { size: 11.5, color: NAVY, text: clean(topic.question), gap: 1.2 },
  { size: 11, text: clean(topic.summary), gap: 1.2 },
  { size: 11, text: clean(topic.guidance), gap: 2 },
  ...(topic.teachings || []).flatMap((teaching) => [
    { font: 'GermaniaOne', size: 11, color: GOLD_DARK, indent: 4, gap: 0.4, breakBefore: true,
      text: [clean(teaching.reference), clean(teaching.who)].filter(Boolean).join(' · ') },
    { size: 10.5, indent: 4, text: clean(teaching.text), gap: 1.6 },
  ]),
  { size: 11, color: GOLD_DARK, text: topic.practice ? `Try this: ${clean(topic.practice)}` : '', gap: 1, breakBefore: true },
  { size: 11, color: MUTED, text: topic.prayer ? `A prayer: ${clean(topic.prayer)}` : '', gap: 1 },
];

function drawFooters(doc) {
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setDrawColor(RULE);
    doc.setLineWidth(0.25);
    doc.line(MARGIN_X, PAGE_H - 14, PAGE_W - MARGIN_X, PAGE_H - 14);
    doc.setFont('Strait', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(MUTED);
    doc.text('Daily Grace · dailygrace.faith · Scripture quotations from the King James Version.',
      MARGIN_X, PAGE_H - 11, { baseline: 'top' });
    doc.text(`Page ${page} of ${pages}`, PAGE_W - MARGIN_X, PAGE_H - 11, { baseline: 'top', align: 'right' });
  }
}

// ------------------------------------------------------------------ entry

/** Builds the PDF of the bookmarks: resolves to { blob, filename }. */
export async function makeBookmarksPdf({ verses = [], facts = [], sayings = [], guidance = [] }) {
  const [JsPdf, fonts, emblem] = await Promise.all([
    loadJsPdf(),
    Promise.all(FONTS.map((font) => loadFont(font.url))),
    loadEmblem(),
  ]);

  const doc = new JsPdf({ unit: 'mm', format: 'a4', compress: true });
  FONTS.forEach((font, index) => {
    doc.addFileToVFS(font.file, fonts[index]);
    doc.addFont(font.file, font.family, 'normal');
  });

  const now = new Date();
  const date = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const counts = [
    verses.length && plural(verses.length, 'verse'),
    facts.length && plural(facts.length, 'fact'),
    sayings.length && plural(sayings.length, 'saying'),
    guidance.length && plural(guidance.length, 'question'),
  ].filter(Boolean).join(', ');
  // A PDF viewer's tab shows this title rather than the blob URL.
  doc.viewerPreferences({ DisplayDocTitle: true });
  doc.setProperties({
    title: 'My Bookmarks — Daily Grace',
    subject: `Bookmarked verses, facts, sayings and questions, saved ${date}`,
    author: 'Daily Grace',
    creator: 'Daily Grace (dailygrace.faith)',
  });

  const writer = new Writer(doc);
  drawHeader(writer, { emblem, date, counts });
  drawSection(writer, 'Bible Verses', verses, verseRuns);
  drawSection(writer, 'Did You Know', facts, factRuns);
  drawSection(writer, 'Bible Sayings', sayings, sayingRuns);
  drawSection(writer, 'Questions We All Ask', guidance, guidanceRuns);
  drawFooters(doc);

  return { blob: doc.output('blob'), filename: `daily-grace-bookmarks-${localDate(now)}.pdf` };
}
