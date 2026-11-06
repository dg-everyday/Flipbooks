/**
 * My Faith Journal as a Word book (.docx): one year of the journal, made in
 * the browser, with nothing sent anywhere and no library to download.
 *
 * A .docx is a zip of XML files. This module writes those files and zips
 * them, stored without compression (a year of text is a few megabytes at
 * most; see docs/faith-journal/plan.md, "What does not fit a year").
 *
 * The book, on A4 pages, numbered from the second page:
 *   a cover (My Faith Journal, the year, how many entries on how many days),
 *   then a chapter for each month (Heading 1, so Word's navigation pane lists
 *   them), each day under it (Heading 2), and each entry (Heading 3: its kind
 *   and title) with the day's verse and question, then each part of its kind
 *   that has something in it, under a small label (kinds.js): the main words
 *   with bold, lists and quotes kept, the other parts, the bookmarks put into
 *   it with their exact text, a mood, a prayer's answer; and its categories.
 *
 * My Diary entries are left out unless `includeDiary` is set.
 *
 * Usage
 *   const { blob, fileName } = makeWordBook({ year, entries, kindLabels, cardLabels, includeDiary });
 *     entries     the year's entries (store.js), in any order
 *     kindLabels  { log: "Daily Log", … }   cardLabels  { verses: "Bible Verse", … }
 */

import { cleanBody } from "./store.js?v=20261106-3";
import { moodLabel, sections } from "./kinds.js?v=20261106-1";

const WORD_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const NS_W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const NS_R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const NAVY = "001B34";
const GOLD = "A87A22";
const MUTED = "5B6878";

/* ---------- Zip (stored) ---------- */

const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
        let c = n;
        for (let k = 0; k < 8; k += 1) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        table[n] = c >>> 0;
    }
    return table;
})();

function crc32(bytes) {
    let c = 0xffffffff;
    for (const byte of bytes) {
        c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
}

/** files: [{ name, text }] → a zip Blob, every file stored as it is. */
export function zipFiles(files, date = new Date()) {
    const encoder = new TextEncoder();
    const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
    const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
    const parts = [];
    const central = [];
    let offset = 0;

    for (const file of files) {
        const name = encoder.encode(file.name);
        const data = encoder.encode(file.text);
        const crc = crc32(data);

        const local = new DataView(new ArrayBuffer(30));
        local.setUint32(0, 0x04034b50, true);
        local.setUint16(4, 20, true);
        local.setUint16(6, 0x0800, true); // names in UTF-8
        local.setUint16(8, 0, true); // stored
        local.setUint16(10, time, true);
        local.setUint16(12, day, true);
        local.setUint32(14, crc, true);
        local.setUint32(18, data.length, true);
        local.setUint32(22, data.length, true);
        local.setUint16(26, name.length, true);
        local.setUint16(28, 0, true);
        parts.push(local, name, data);

        const entry = new DataView(new ArrayBuffer(46));
        entry.setUint32(0, 0x02014b50, true);
        entry.setUint16(4, 20, true);
        entry.setUint16(6, 20, true);
        entry.setUint16(8, 0x0800, true);
        entry.setUint16(10, 0, true);
        entry.setUint16(12, time, true);
        entry.setUint16(14, day, true);
        entry.setUint32(16, crc, true);
        entry.setUint32(20, data.length, true);
        entry.setUint32(24, data.length, true);
        entry.setUint16(28, name.length, true);
        entry.setUint32(42, offset, true);
        central.push(entry, name);

        offset += 30 + name.length + data.length;
    }

    const centralSize = central.reduce((sum, part) => sum + part.byteLength, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, files.length, true);
    end.setUint16(10, files.length, true);
    end.setUint32(12, centralSize, true);
    end.setUint32(16, offset, true);
    return new Blob([...parts, ...central, end], { type: WORD_TYPE });
}

/* ---------- WordprocessingML ---------- */

// Characters XML 1.0 cannot hold are dropped; the rest escaped.
const xml = (text) =>
    String(text ?? "")
        .replace(/[^\u0009\u000A\u000D -퟿-�\u{10000}-\u{10FFFF}]/gu, "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

function run(text, { bold = false, italic = false } = {}) {
    const props = `${bold ? "<w:b/>" : ""}${italic ? "<w:i/>" : ""}`;
    return `<w:r>${props ? `<w:rPr>${props}</w:rPr>` : ""}<w:t xml:space="preserve">${xml(text)}</w:t></w:r>`;
}

function para(runs, style = null, { pageBreakBefore = false } = {}) {
    const props = `${style ? `<w:pStyle w:val="${style}"/>` : ""}${pageBreakBefore ? "<w:pageBreakBefore/>" : ""}`;
    return `<w:p>${props ? `<w:pPr>${props}</w:pPr>` : ""}${Array.isArray(runs) ? runs.join("") : runs}</w:p>`;
}

/** Inline HTML (text, bold, italic, line breaks) as runs. */
function runsOf(nodes, marks = {}) {
    const runs = [];
    for (const node of nodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent) {
                runs.push(run(node.textContent, marks));
            }
        } else if (node.nodeName === "BR") {
            runs.push("<w:r><w:br/></w:r>");
        } else if (node.nodeName === "STRONG" || node.nodeName === "B") {
            runs.push(...runsOf(node.childNodes, { ...marks, bold: true }));
        } else if (node.nodeName === "EM" || node.nodeName === "I") {
            runs.push(...runsOf(node.childNodes, { ...marks, italic: true }));
        } else {
            runs.push(...runsOf(node.childNodes, marks));
        }
    }
    return runs;
}

/** An entry's body (the journal's small HTML) as paragraphs. */
function bodyParagraphs(html) {
    const root = new DOMParser().parseFromString(cleanBody(html), "text/html").body;
    const out = [];
    let loose = [];
    const flush = (style = "BodyText") => {
        const runs = runsOf(loose);
        if (runs.length) {
            out.push(para(runs, style));
        }
        loose = [];
    };
    const blocks = (parent, style) => {
        for (const node of parent.childNodes) {
            const name = node.nodeName;
            if (name === "P") {
                flush(style);
                const runs = runsOf(node.childNodes);
                if (runs.length) {
                    out.push(para(runs, style));
                }
            } else if (name === "BLOCKQUOTE") {
                flush(style);
                blocks(node, "Quote");
            } else if (name === "UL" || name === "OL") {
                flush(style);
                [...node.children].forEach((item, index) => {
                    const mark = name === "OL" ? `${index + 1}.\t` : "•\t";
                    out.push(para([run(mark), ...runsOf(item.childNodes)], "ListItem"));
                });
            } else {
                loose.push(node);
            }
        }
        flush(style);
    };
    blocks(root, "BodyText");
    return out;
}

/* ---------- Days ---------- */

const asDate = (iso) => new Date(`${iso}T12:00:00Z`);
const longDay = (iso) =>
    new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(asDate(iso));
const plainDay = (iso) =>
    new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(asDate(iso));
const monthOf = (iso) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", year: "numeric" }).format(asDate(iso));

/* ---------- The book ---------- */

/** Plain words as paragraphs: blank lines part them, single line breaks stay. */
function textParagraphs(text, style = "BodyText") {
    return String(text)
        .replace(/\r\n?/g, "\n")
        .split(/\n\s*\n/)
        .map((block) => block.trim())
        .filter(Boolean)
        .map((block) =>
            para(
                block.split("\n").flatMap((line, i) => (i ? ["<w:r><w:br/></w:r>", run(line)] : [run(line)])),
                style,
            ),
        );
}

function cardParagraphs(card, cardLabels) {
    const out = [para([run(`${cardLabels[card.kind] ?? "Bookmark"}: `, { bold: true }), run(card.title, { bold: true })], "Card")];
    if (card.text) {
        out.push(para(run(card.text), "Card"));
    }
    if (card.reference && card.reference !== card.title) {
        out.push(para(run(card.reference), "CardReference"));
    }
    return out;
}

function entryParagraphs(entry, { kindLabels, cardLabels }) {
    const out = [];
    const kind = kindLabels[entry.kind] ?? "Entry";
    out.push(para(run(entry.title ? `${kind}: ${entry.title}` : kind), "Heading3"));
    if (entry.verse) {
        out.push(para(run(entry.verse), "Verse"));
    }
    if (entry.prompt) {
        out.push(para(run(entry.prompt), "Prompt"));
    }
    // Each part of the kind that has something in it, under its label.
    for (const section of sections(entry)) {
        let parts = [];
        if (section.body) {
            parts = bodyParagraphs(entry.body);
        } else if (section.key) {
            parts = textParagraphs(entry.fields?.[section.key] ?? "");
        } else if (section.cards) {
            parts = (entry.cards ?? []).flatMap((card) => cardParagraphs(card, cardLabels));
        } else if (section.mood && entry.mood) {
            parts = [para(run(moodLabel(entry.mood)), "BodyText")];
        } else if (section.answer && entry.kind === "prayer" && entry.prayer) {
            const answered = entry.prayer.answered
                ? `Answered${entry.prayer.answeredOn ? ` on ${plainDay(entry.prayer.answeredOn)}` : ""}${entry.prayer.note ? `: ${entry.prayer.note}` : ""}`
                : "Still praying";
            parts = [para(run(answered, { bold: true }), "BodyText")];
        }
        if (parts.length) {
            out.push(para(run(section.label), "PartLabel"), ...parts);
        }
    }
    if (entry.categories?.length) {
        out.push(para(run(entry.categories.join(" · ")), "Meta"));
    }
    return out;
}

function documentXml({ year, entries, kindLabels, cardLabels }) {
    const days = [...new Set(entries.map((entry) => entry.day))];
    const body = [
        para(run("My Faith Journal"), "Title"),
        para(run(String(year)), "Subtitle"),
        para(
            run(
                entries.length
                    ? `${entries.length} ${entries.length === 1 ? "entry" : "entries"} on ${days.length} ${days.length === 1 ? "day" : "days"}`
                    : "No entries yet",
            ),
            "CoverNote",
        ),
        para(run("Kept with Daily Grace. Scripture quotations from the King James Version."), "CoverNote"),
    ];
    let month = null;
    let day = null;
    for (const entry of entries) {
        const name = monthOf(entry.day);
        if (name !== month) {
            month = name;
            day = null;
            body.push(para(run(name), "Heading1", { pageBreakBefore: true }));
        }
        if (entry.day !== day) {
            day = entry.day;
            body.push(para(run(longDay(entry.day)), "Heading2"));
        }
        body.push(...entryParagraphs(entry, { kindLabels, cardLabels }));
    }
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${NS_W}" xmlns:r="${NS_R}"><w:body>${body.join("")}<w:sectPr><w:footerReference w:type="default" r:id="rIdFooter"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1418" w:right="1418" w:bottom="1418" w:left="1418" w:header="709" w:footer="709" w:gutter="0"/><w:titlePg/></w:sectPr></w:body></w:document>`;
}

// Inside <w:pPr> and <w:rPr> Word requires the schema's order, so each
// style's settings below are written in that order.
const style = (id, name, { based = "Normal", next = null, run: rPr = "", paragraph: pPr = "", outline = null } = {}) =>
    `<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${name}"/>${based ? `<w:basedOn w:val="${based}"/>` : ""}${next ? `<w:next w:val="${next}"/>` : ""}<w:qFormat/><w:pPr>${pPr}${outline === null ? "" : `<w:outlineLvl w:val="${outline}"/>`}</w:pPr><w:rPr>${rPr}</w:rPr></w:style>`;

const HEADING_FONT = '<w:rFonts w:ascii="Georgia" w:hAnsi="Georgia" w:cs="Georgia"/>';

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="${NS_W}">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri" w:eastAsia="Calibri"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:lang w:val="en-US"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="288" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
${style("Title", "Title", { next: "Normal", paragraph: '<w:spacing w:before="3600" w:after="240"/><w:jc w:val="center"/>', run: `${HEADING_FONT}<w:color w:val="${NAVY}"/><w:sz w:val="72"/>` })}
${style("Subtitle", "Subtitle", { paragraph: '<w:spacing w:after="720"/><w:jc w:val="center"/>', run: `${HEADING_FONT}<w:color w:val="${GOLD}"/><w:sz w:val="44"/>` })}
${style("CoverNote", "Cover Note", { paragraph: '<w:jc w:val="center"/>', run: `<w:color w:val="${MUTED}"/>` })}
${style("Heading1", "heading 1", { next: "Heading2", outline: 0, paragraph: '<w:keepNext/><w:pBdr><w:bottom w:val="single" w:sz="8" w:space="4" w:color="C6922E"/></w:pBdr><w:spacing w:before="240" w:after="240"/>', run: `${HEADING_FONT}<w:color w:val="${NAVY}"/><w:sz w:val="44"/>` })}
${style("Heading2", "heading 2", { next: "Heading3", outline: 1, paragraph: '<w:keepNext/><w:spacing w:before="360" w:after="80"/>', run: `${HEADING_FONT}<w:color w:val="${GOLD}"/><w:sz w:val="28"/>` })}
${style("Heading3", "heading 3", { next: "BodyText", outline: 2, paragraph: '<w:keepNext/><w:spacing w:before="160" w:after="60"/>', run: `<w:b/><w:color w:val="${NAVY}"/><w:sz w:val="24"/>` })}
${style("BodyText", "Body Text")}
${style("PartLabel", "Entry Part", { next: "BodyText", paragraph: '<w:keepNext/><w:spacing w:before="120" w:after="20"/>', run: `<w:b/><w:caps/><w:color w:val="${GOLD}"/><w:sz w:val="17"/>` })}
${style("Verse", "Verse", { paragraph: '<w:keepNext/><w:spacing w:after="20"/>', run: `${HEADING_FONT}<w:color w:val="${NAVY}"/>` })}
${style("Prompt", "Prompt", { paragraph: '<w:keepNext/>', run: `<w:color w:val="${MUTED}"/>` })}
${style("Quote", "Quote", { paragraph: '<w:pBdr><w:left w:val="single" w:sz="12" w:space="8" w:color="E1B65D"/></w:pBdr><w:ind w:left="567"/>', run: '<w:color w:val="062944"/>' })}
${style("ListItem", "List Item", { paragraph: '<w:spacing w:after="40"/><w:ind w:left="567" w:hanging="283"/>' })}
${style("Card", "Bookmark", { paragraph: '<w:shd w:val="clear" w:color="auto" w:fill="F7EDDB"/><w:spacing w:after="40"/><w:ind w:left="340" w:right="340"/>' })}
${style("CardReference", "Bookmark Reference", { based: "Card", paragraph: '<w:spacing w:after="160"/>', run: `<w:color w:val="${MUTED}"/>` })}
${style("Meta", "Entry Note", { run: `<w:color w:val="${MUTED}"/><w:sz w:val="20"/>` })}
${style("Footer", "footer", { paragraph: '<w:jc w:val="center"/>', run: `<w:color w:val="${MUTED}"/><w:sz w:val="18"/>` })}
</w:styles>`;

const FOOTER_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="${NS_W}"><w:p><w:pPr><w:pStyle w:val="Footer"/></w:pPr><w:r><w:t xml:space="preserve">My Faith Journal · </w:t></w:r><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>2</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>`;

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`;

const ROOT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`;

const DOCUMENT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdFooter" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>`;

function coreXml(year, now) {
    const stamp = now.toISOString().replace(/\.\d+Z$/, "Z");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>My Faith Journal ${year}</dc:title><dc:creator>Daily Grace</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${stamp}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${stamp}</dcterms:modified></cp:coreProperties>`;
}

export function makeWordBook({ year, entries, kindLabels, cardLabels, includeDiary = false }) {
    const kept = entries
        .filter((entry) => includeDiary || entry.kind !== "diary")
        .sort((a, b) => a.day.localeCompare(b.day) || a.created.localeCompare(b.created));
    const now = new Date();
    const blob = zipFiles(
        [
            { name: "[Content_Types].xml", text: CONTENT_TYPES_XML },
            { name: "_rels/.rels", text: ROOT_RELS_XML },
            { name: "docProps/core.xml", text: coreXml(year, now) },
            { name: "word/document.xml", text: documentXml({ year, entries: kept, kindLabels, cardLabels }) },
            { name: "word/styles.xml", text: STYLES_XML },
            { name: "word/footer1.xml", text: FOOTER_XML },
            { name: "word/_rels/document.xml.rels", text: DOCUMENT_RELS_XML },
        ],
        now,
    );
    return { blob, fileName: `My Faith Journal ${year}.docx`, entries: kept.length };
}
