let db = null;
let sqlJsLoading = null;

const SQL_JS_BASE_URL = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.14.2/";

// ============================================================
// Initialize sql.js
//
// Every database on the page shares one instance, so the wasm
// runtime is only downloaded and started once. <did-you-know>
// uses this too, for assets/db/didyouknow.db.
//
// sql.js is only needed once a database is opened (the first
// search, the Did You Know card coming into view, the trivia
// quiz), so its script is fetched then, not with the page.
// ============================================================

function loadSqlJsScript() {
    if (typeof initSqlJs === "function") return Promise.resolve();

    return new Promise(function (resolve, reject) {
        const script = document.createElement("script");
        script.src = SQL_JS_BASE_URL + "sql-wasm.js";
        script.onload = function () {
            resolve();
        };
        script.onerror = function () {
            // Take the failed tag away so a retry adds a fresh one.
            script.remove();
            reject(new Error(`sql.js could not be loaded from ${script.src}`));
        };
        document.head.append(script);
    });
}

function loadSqlJs() {
    if (sqlJsLoading) return sqlJsLoading;

    sqlJsLoading = loadSqlJsScript().then(function () {
        return initSqlJs({
            locateFile: function (file) {
                return SQL_JS_BASE_URL + file;
            },
        });
    }).catch(function (error) {
        // Allow a later call to try again.
        sqlJsLoading = null;
        throw error;
    });

    return sqlJsLoading;
}

async function initDatabase() {

    // Load sql.js and the database side by side

    const [SQL, response] = await Promise.all([
        loadSqlJs(),
        fetch("assets/db/dailygrace.db", {
            cache: "force-cache",
        }),
    ]);

    if (!response.ok) {
        throw new Error(`Unable to load dailygrace.db (${response.status})`);
    }

    const buffer = await response.arrayBuffer();

    // Verify SQLite file
    const bytes = new Uint8Array(buffer);
    const header = new TextDecoder().decode(bytes.slice(0, 15));

    if (!header.startsWith("SQLite format 3")) {
        throw new Error("dailygrace.db is not a valid SQLite database.");
    }

    // Open database
    db = new SQL.Database(bytes);

    return db;
}

// ============================================================
// Parse Bible Reference
//
// Ephesians
// Ephesians 2
// Ephesians 2:8
// Ephesians 2:8-9
// Ephesians 2:8,9
// Ephesians 2:8,9,12
// Ephesians 2:8-10,15
// ============================================================

function parseBibleReference(reference) {
    if (typeof reference !== "string" || reference.trim() === "") {
        throw new Error("Bible reference is required.");
    }

    reference = reference.trim().replace(/\s+/g, " ").replace(/[–—]/g, "-");

    // --------------------------------------------------------
    // Try to separate book, chapter and verses
    //
    // Ephesians 2:8-9
    //
    // group 1 = Ephesians
    // group 2 = 2
    // group 3 = 8-9
    // --------------------------------------------------------
    const match = reference.match(/^(.+?)\s+(\d+)\s*(?::\s*(.*))?$/);

    // --------------------------------------------------------
    // Book only
    //
    // Ephesians
    // --------------------------------------------------------
    if (!match) {
        return {
            bookName: reference,
            chapter: null,
            verses: null,
        };
    }

    const bookName = match[1].trim();
    const chapter = Number(match[2]);
    const versePart = match[3];

    // Validate chapter
    if (!Number.isSafeInteger(chapter) || chapter < 1) {
        throw new Error("Invalid chapter number.");
    }

    // --------------------------------------------------------
    // Book + chapter only
    //
    // Ephesians 2
    // --------------------------------------------------------
    if (versePart === undefined) {
        return {
            bookName,
            chapter,
            verses: null,
        };
    }

    // Parse verses
    const verses = [];
    const parts = versePart.split(",");
    for (const part of parts) {
        const value = part.trim();

        if (!/^\d+(?:\s*-\s*\d+)?$/.test(value)) {
            throw new Error("Use verse numbers separated by commas or a range such as 8-9.");
        }

        // Range (8-9)
        if (value.includes("-")) {
            const range = value.split("-");

            if (range.length !== 2) {
                throw new Error(`Invalid verse range: ${value}`);
            }

            const start = Number(range[0].trim());
            const end = Number(range[1].trim());

            if (!Number.isSafeInteger(start)
                    || !Number.isSafeInteger(end)
                    || start < 1 
                    || end < start) 
            {
                throw new Error(`Invalid verse range: ${value}`);
            }

            // No Bible chapter has a range this large; avoid blocking the UI.
            if (end - start > 1000) {
                throw new Error("Verse range is too large. Try a book or chapter instead.");
            }

            for (let verse = start; verse <= end; verse++) {
                verses.push(verse);
            }

        } else {

            // Single verse
            const verse = Number(value);
            if (!Number.isSafeInteger(verse) || verse < 1) {
                throw new Error(`Invalid verse number: ${value}`);
            }

            verses.push(verse);
        }
    }

    // Remove duplicates and sort
    const uniqueVerses = [...new Set(verses)].sort((a, b) => a - b);

    return {
        bookName,
        chapter,
        verses: uniqueVerses,
    };
}

// ============================================================
// Clean verse text
//
// splitVerseText("Ps", "...trust in him.    Psalm 3  A Psalm of David...")
//   -> { text: "...trust in him.",
//        title: { chapter: 3, text: "A Psalm of David..." } }
//
// dailygrace.db stores each psalm's title on the end of the
// previous psalm's last verse, after a run of spaces, and Psalm
// 119's letters ("BETH.") after each section's last verse. Some
// hyphenated names were split at a line break ("Beth- shemesh").
// The functions below return verse text with these taken out or
// rejoined, the way tools/concordance/build_concordance.py does.
//
// Only Psalms lose text, and only at the end of a verse, and the
// split names are all in the Old Testament, so the red-letter
// character ranges (New Testament) still line up.
// ============================================================

const PSALM_HEADING = /\s{3,}Psalm (\d+)\s*(.*?)\s*$/;
const ACROSTIC = /(?:^|\s+)(?:ALEPH|BETH|GIMEL|DALETH|HE|VAU|ZAIN|CHETH|TETH|JOD|CAPH|LAMED|MEM|NUN|SAMECH|AIN|PE|TZADDI|KOPH|RESH|SCHIN|TAU)\.\s*$/;
const BROKEN_HYPHEN = /(?<=[A-Za-z])-\s+(?=[a-z])/g;

function splitVerseText(bookId, rawText) {
    let text = String(rawText ?? "");
    let title = null;

    if (bookId === "Ps") {
        const heading = text.match(PSALM_HEADING);
        if (heading) {
            text = text.slice(0, heading.index);
            // Psalm 119 has no title, only its first letter.
            const titleText = heading[2].replace(ACROSTIC, "").replace(/\s+/g, " ").trim();
            if (titleText) title = { chapter: Number(heading[1]), text: titleText };
        }
        text = text.replace(ACROSTIC, "");
    }

    return { text: text.replace(BROKEN_HYPHEN, "-").trimEnd(), title };
}

function readVerseRows(stmt) {
    const rows = [];
    while (stmt.step()) {
        const row = stmt.getAsObject();
        row.text = splitVerseText(row.book_id, row.text).text;
        rows.push(row);
    }
    stmt.free();
    return rows;
}

// ============================================================
// Get verses
//
// getVerses("Ephesians")
// getVerses("Ephesians", 2)
// getVerses("Ephesians", 2, [8, 9])
// ============================================================

function getVerses(bookName, chapter = null, verses = null) {
    if (!db) {
        throw new Error("Database has not been initialized.");
    }

    // Validate book
    if (typeof bookName !== "string" || bookName.trim() === "") {
        throw new Error("Book name is required.");
    }

    bookName = bookName.trim();

    // Build WHERE conditions
    const conditions = ["b.book_name = ?"];
    const params = [bookName];

    // Add chapter condition
    if (chapter !== null && chapter !== undefined) {
        conditions.push("v.chapter = ?");
        params.push(Number(chapter));
    }

    // Add verse condition
    if (Array.isArray(verses) && verses.length > 0) {
        const placeholders = verses.map(() => "?").join(",");
        conditions.push(`v.verse IN (${placeholders})`);
        params.push(...verses.map(Number));
    }

    // Build SQL
    const query = `
        SELECT v.docid, b.book_name, b.book_id, v.chapter, v.verse, v.text
        FROM verses AS v
        INNER JOIN books AS b ON v.book = b.book_id
        WHERE ${conditions.join("\n AND ")}
        ORDER BY v.chapter, v.verse
    `;

    // Execute query
    const stmt = db.prepare(query);
    stmt.bind(params);
    return readVerseRows(stmt);
}

// ============================================================
// Get verses by id
//
// getVersesByIds([49, 29155])
//
// The ids are verse docids, as saved by the bookmarks. Rows come
// back in the order of the ids given; an id with no verse is
// skipped.
// ============================================================

function getVersesByIds(ids) {
    if (!db) {
        throw new Error("Database has not been initialized.");
    }

    const docids = [...new Set((ids ?? []).map(Number))].filter(Number.isSafeInteger);
    if (docids.length === 0) return [];

    const placeholders = docids.map(() => "?").join(",");
    const query = `
        SELECT v.docid, b.book_name, b.book_id, v.chapter, v.verse, v.text
        FROM verses AS v
        INNER JOIN books AS b ON v.book = b.book_id
        WHERE v.docid IN (${placeholders})
    `;

    const stmt = db.prepare(query);
    stmt.bind(docids);
    const byId = new Map(readVerseRows(stmt).map((row) => [row.docid, row]));
    return docids.map((id) => byId.get(id)).filter(Boolean);
}

// ============================================================
// Search by keywords
//
// parseSearchKeywords("Grace,  faith grace")  -> ["grace", "faith"]
// searchVersesByKeywords(["grace", "faith"])
//
// Every word must appear as a whole word in the book name or
// the verse text, so "love" does not match "loved" or "glove",
// and "1 john love" finds the verses of 1 John that say love.
// A psalm's title is searched too, and comes back as verse 0.
// Results run in Bible order.
// ============================================================

function parseSearchKeywords(query) {
    const words = String(query ?? "")
        .toLowerCase()
        .replace(/[’‘]/g, "'")
        .match(/[a-z0-9']+/g) ?? [];

    // Drop apostrophes left at the edges by quoting, as in 'grace'
    const cleaned = words
        .map((word) => word.replace(/^'+|'+$/g, ""))
        .filter(Boolean);

    return [...new Set(cleaned)];
}

function searchVersesByKeywords(words) {
    if (!db) {
        throw new Error("Database has not been initialized.");
    }

    if (!Array.isArray(words) || words.length === 0) {
        throw new Error("At least one keyword is required.");
    }

    // LIKE narrows the rows cheaply (case-insensitive for ASCII);
    // the whole-word check below then drops partial matches.
    // Keywords are only letters, digits and apostrophes, so the
    // only wildcard is the _ that stands in for an apostrophe:
    // the text uses a curly one (brother’s), keywords a straight one.
    const conditions = words.map(() => "(b.book_name || ' ' || v.text) LIKE ?");
    const params = words.map((word) => `%${word.replace(/'/g, "_")}%`);

    const query = `
        SELECT v.docid, b.book_name, b.book_id, v.chapter, v.verse, v.text
        FROM verses AS v
        INNER JOIN books AS b ON v.book = b.book_id
        WHERE ${conditions.join("\n AND ")}
        ORDER BY b.book_number, v.chapter, v.verse
    `;

    const stmt = db.prepare(query);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
        rows.push(stmt.getAsObject());
    }

    stmt.free();

    const patterns = words.map((word) => new RegExp(`\\b${word.replace(/'/g, "['’]")}\\b`, "i"));
    const matches = (bookName, text) => patterns.every((pattern) => pattern.test(`${bookName} ${text}`));
    const results = [];
    for (const row of rows) {
        const { text, title } = splitVerseText(row.book_id, row.text);
        if (matches(row.book_name, text)) results.push({ ...row, text });
        // A psalm's title is stored on the verse before the psalm, so it
        // comes right after that verse: ahead of the psalm's verse 1. It
        // is verse 0, with no docid, so it cannot be bookmarked.
        if (title && matches(row.book_name, title.text)) {
            results.push({
                book_name: row.book_name,
                book_id: row.book_id,
                chapter: title.chapter,
                verse: 0,
                text: title.text,
            });
        }
    }
    return results;
}

function getBooks(asJsonString = false) {
    if (!db) {
        throw new Error("Database has not been initialized.");
    }

    const stmt = db.prepare(`
        SELECT book_name
        FROM books
        ORDER BY book_name
    `);

    const books = [];
    while (stmt.step()) {
        books.push(stmt.getAsObject().book_name);
    }

    stmt.free();

    return asJsonString ? JSON.stringify(books) : books;
}

