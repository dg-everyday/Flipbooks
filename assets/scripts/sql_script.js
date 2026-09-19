let db = null;

async function initDatabase() {

    // SQL.js must already be loaded by index.html
    if (typeof initSqlJs !== "function") {
        throw new Error(
            "sql.js was not loaded. Check the sql-wasm.js script in index.html.",
        );
    }

    // Initialize sql.js
    const SQL = await initSqlJs({
        locateFile: function (file) {
            return (
                "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.14.2/" + file
            );
        },
    });

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

    // Check tables
    const tables = db.exec(`
            SELECT name
            FROM sqlite_master
            WHERE type = 'table'
            ORDER BY name
        `);

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

    reference = reference.trim();

    // --------------------------------------------------------
    // Try to separate book, chapter and verses
    //
    // Ephesians 2:8-9
    //
    // group 1 = Ephesians
    // group 2 = 2
    // group 3 = 8-9
    // --------------------------------------------------------
    const match = reference.match(/^(.+?)\s+(\d+)(?::(.+))?$/);

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
    if (!Number.isInteger(chapter) || chapter < 1) {
        throw new Error("Invalid chapter number.");
    }

    // --------------------------------------------------------
    // Book + chapter only
    //
    // Ephesians 2
    // --------------------------------------------------------
    if (versePart === undefined || versePart.trim() === "") {
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

        if (!value) {
            continue;
        }

        // Range (8,9)
        if (value.includes("-")) {
            const range = value.split("-");

            if (range.length !== 2) {
                throw new Error(`Invalid verse range: ${value}`);
            }

            const start = Number(range[0].trim());
            const end = Number(range[1].trim());

            if (!Number.isInteger(start) 
                    || !Number.isInteger(end) 
                    || start < 1 
                    || end < start) 
            {
                throw new Error(`Invalid verse range: ${value}`);
            }

            for (let verse = start; verse <= end; verse++) {
                verses.push(verse);
            }

        } else {

            // Single verse
            const verse = Number(value);
            if (!Number.isInteger(verse) || verse < 1) {
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
        SELECT b.book_name, v.chapter, v.verse, v.text 
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

