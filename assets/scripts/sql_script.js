let db = null;
let sqlJsLoading = null;

const SQL_JS_BASE_URL = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.14.2/";

// ============================================================
// Initialize sql.js
//
// Every database on the page shares one instance, so the wasm
// runtime is only downloaded and started once. <did-you-know>
// uses this too, for assets/db/didyouknow.db.
// ============================================================

function loadSqlJs() {
    if (sqlJsLoading) return sqlJsLoading;

    // SQL.js must already be loaded by index.html
    if (typeof initSqlJs !== "function") {
        return Promise.reject(new Error(
            "sql.js was not loaded. Check the sql-wasm.js script in index.html.",
        ));
    }

    sqlJsLoading = initSqlJs({
        locateFile: function (file) {
            return SQL_JS_BASE_URL + file;
        },
    }).catch(function (error) {
        // Allow a later call to try again.
        sqlJsLoading = null;
        throw error;
    });

    return sqlJsLoading;
}

async function initDatabase() {

    const SQL = await loadSqlJs();

    // Load database

    const response = await fetch("assets/db/dailygrace.db", {
        cache: "force-cache",
    });

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
        SELECT b.book_name, b.book_id, v.chapter, v.verse, v.text
        FROM verses AS v
        INNER JOIN books AS b ON v.book = b.book_id
        WHERE ${conditions.join("\n AND ")}
        ORDER BY v.chapter, v.verse
    `;

    // Execute query
    const stmt = db.prepare(query);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }

    stmt.free();
    return results;
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
        SELECT b.book_name, b.book_id, v.chapter, v.verse, v.text
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
    return rows.filter((row) => {
        const haystack = `${row.book_name} ${row.text}`;
        return patterns.every((pattern) => pattern.test(haystack));
    });
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

