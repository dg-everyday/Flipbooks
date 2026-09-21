// const MEDIA_BASE_URL = 'https://dailygrace.faith/media/';
const MEDIA_BASE_URL = "http://localhost:9001/media/";
const today = new Date();
const monthFolder = today.toLocaleString("en-US", { timeZone: "Asia/Manila", month: "long" });
const month = monthFolder.toLowerCase();
const dateName = today.toLocaleDateString("en-US", {
    timeZone: "Asia/Manila",
    month: "long",
    day: "numeric",
    year: "numeric",
});

// Build today's existing banner URL here using Asia/Manila dates.
// URL pattern adapted from update-social-image.mjs, which remains metadata-only.
const bannerParts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
    .formatToParts(today)
    .map(({ type, value }) => [type, value]),
);

const bannerMonth = today
    .toLocaleString("en-US", {
        timeZone: "Asia/Manila",
        month: "long",
    })
    .toLowerCase();
const dailyBanner = document.getElementById("daily-banner");
dailyBanner.src = `${MEDIA_BASE_URL}banner/${bannerMonth}/daily-grace-${bannerParts.year}-${bannerParts.month}-${bannerParts.day}.webp`;
dailyBanner.alt = `Daily Grace devotional for ${today.toLocaleDateString(
    "en-US",
    {
        timeZone: "Asia/Manila",
        month: "long",
        day: "numeric",
        year: "numeric",
    },
)}`;

const searchForm = document.getElementById("devotional-search");
const searchQuery = document.getElementById("search-query");
const searchClear = document.getElementById("search-clear");
const searchResults = document.getElementById("search-results");
const searchStatus = document.getElementById("search-status");
const bibleBookSuggestions = document.getElementById("bible-books");
let bibleBooksLoading = null;
let bibleBooks = [];
let activeBookIndex = -1;

function closeBookSuggestions() {
    bibleBookSuggestions.hidden = true;
    searchQuery.setAttribute("aria-expanded", "false");
    searchQuery.removeAttribute("aria-activedescendant");
    activeBookIndex = -1;
}

function renderBookSuggestions() {
    const query = searchQuery.value.trim().toLocaleLowerCase();
    const matches = bibleBooks.filter((book) => book.toLocaleLowerCase().includes(query));
    const options = matches.map((book, index) => {
        const option = document.createElement("li");
        option.id = `bible-book-${index}`;
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", "false");
        option.textContent = book;
        return option;
    });
    bibleBookSuggestions.replaceChildren(...options);
    activeBookIndex = -1;
    searchQuery.removeAttribute("aria-activedescendant");
    const open = document.activeElement === searchQuery && options.length > 0;
    bibleBookSuggestions.hidden = !open;
    searchQuery.setAttribute("aria-expanded", String(open));
}

function selectBook(option) {
    resetBibleSearch();
    searchQuery.value = option.textContent;
    searchClear.hidden = false;
    closeBookSuggestions();
}

function loadBibleBookSuggestions() {
    // Load the SQLite database only when the search field is first used.
    if (bibleBooksLoading) return bibleBooksLoading;
    bibleBooksLoading = initDatabase()
        .then(() => {
            bibleBooks = getBooks();
            return bibleBooks;
        })
        .catch((error) => {
            // Keep manual search available and retry on the next focus.
            bibleBooksLoading = null;
            throw error;
        });
    return bibleBooksLoading;
}

searchQuery.addEventListener("focus", () => {
    renderBookSuggestions();
    loadBibleBookSuggestions().then(renderBookSuggestions).catch((error) => {
        console.warn("Bible book suggestions could not be loaded:", error);
    });
});
searchQuery.addEventListener("click", renderBookSuggestions);
searchQuery.addEventListener("blur", closeBookSuggestions);
bibleBookSuggestions.addEventListener("pointerdown", (event) => {
    // Keep input focus while choosing with a mouse or touch screen.
    if (event.target.closest('[role="option"]')) event.preventDefault();
});
bibleBookSuggestions.addEventListener("click", (event) => {
    const option = event.target.closest('[role="option"]');
    if (option) selectBook(option);
});
searchQuery.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (!bibleBookSuggestions.hidden) event.preventDefault();
        closeBookSuggestions();
        return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        if (bibleBookSuggestions.hidden) renderBookSuggestions();
        const options = [...bibleBookSuggestions.children];
        if (!options.length) return;
        event.preventDefault();
        activeBookIndex = activeBookIndex < 0
            ? (event.key === "ArrowDown" ? 0 : options.length - 1)
            : (activeBookIndex + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
        options.forEach((option, index) => option.setAttribute("aria-selected", String(index === activeBookIndex)));
        const activeOption = options[activeBookIndex];
        searchQuery.setAttribute("aria-activedescendant", activeOption.id);
        activeOption.scrollIntoView({ block: "nearest" });
    } else if (event.key === "Enter" && !bibleBookSuggestions.hidden && activeBookIndex >= 0) {
        event.preventDefault();
        selectBook(bibleBookSuggestions.children[activeBookIndex]);
    }
});

const VERSE_BATCH_SIZE = 24;
let searchGeneration = 0;
let verseObserver = null;
const bookMetadataCache = new Map();
let bundledBookMetadata = null;

function resetBibleSearch() {
    searchGeneration++;
    verseObserver?.disconnect();
    verseObserver = null;
    searchResults.replaceChildren();
    searchResults.hidden = true;
    searchResults.removeAttribute("aria-busy");
    searchStatus.textContent = "";
}

function showSearchMessage(message) {
    const paragraph = document.createElement("p");
    paragraph.className = "search-message";
    paragraph.textContent = message;
    searchResults.replaceChildren(paragraph);
    searchStatus.textContent = message;
}

function loadBundledBookMetadata() {
    if (!bundledBookMetadata) {
        bundledBookMetadata = fetch("assets/book-metadata.json")
            .then((response) => {
                if (!response.ok) throw new Error("Book metadata could not be loaded.");
                return response.json();
            })
            .catch((error) => {
                bundledBookMetadata = null;
                throw error;
            });
    }
    return bundledBookMetadata;
}

function loadBookMetadata(bookName, url) {
    if (!bookMetadataCache.has(url)) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const request = getSvgMetadataFromUrl(url, controller.signal)
            .then((metadata) => {
                if (!metadata.title || !metadata.description) throw new Error("Incomplete SVG metadata.");
                return metadata;
            })
            // This snapshot comes from the same SVGs and also works when the media
            // host permits <img> display but blocks cross-origin fetch requests.
            .catch(async () => {
                const metadata = (await loadBundledBookMetadata())[bookName];
                if (!metadata) throw new Error(`No book overview found for ${bookName}.`);
                return metadata;
            })
            .catch((error) => {
                bookMetadataCache.delete(url);
                throw error;
            })
            .finally(() => clearTimeout(timeout));
        bookMetadataCache.set(url, request);
    }
    return bookMetadataCache.get(url);
}

function createBookHeader(bookName, generation) {
    const header = document.createElement("header");
    header.className = "search-book-header";
    const symbol = document.createElement("img");
    symbol.className = "search-book-symbol";
    symbol.width = 64;
    symbol.height = 64;
    symbol.alt = "";
    const symbolUrl = `${MEDIA_BASE_URL}images/symbols/${encodeURIComponent(bookName)}-symbol.svg`;
    symbol.onerror = () => { symbol.hidden = true; };
    symbol.src = symbolUrl;

    const details = document.createElement("div");
    details.className = "search-book-details";
    const title = document.createElement("h2");
    title.id = "search-book-title";
    const englishName = document.createElement("span");
    englishName.textContent = bookName;
    title.append(englishName);
    details.append(title);
    header.append(symbol, details);

    // The verse text remains available even if the optional SVG metadata fails.
    loadBookMetadata(bookName, symbolUrl).then((metadata) => {
        if (generation !== searchGeneration) return;
        const hebrewName = metadata.title?.split("—")[2]?.trim();
        if (hebrewName) {
            const hebrew = document.createElement("bdi");
            hebrew.className = "search-book-hebrew";
            hebrew.lang = "he";
            hebrew.dir = "rtl";
            hebrew.textContent = hebrewName;
            title.append(hebrew);
        }
        if (metadata.description) {
            const description = document.createElement("p");
            description.className = "search-book-description";
            description.textContent = metadata.description;
            details.append(description);
        }
    }).catch((error) => {
        console.warn(`Book overview unavailable for ${bookName}:`, error);
    });
    return header;
}

function renderVerseResults(rows, generation) {
    const bookName = rows[0].book_name;
    const header = createBookHeader(bookName, generation);
    const summary = document.createElement("p");
    summary.className = "search-summary";

    const reader = document.createElement("div");
    reader.className = "search-verse-reader";
    reader.tabIndex = 0;
    reader.setAttribute("role", "region");
    reader.setAttribute("aria-label", `${bookName} verses, scroll to read more`);
    const list = document.createElement("div");
    list.className = "search-verse-list";
    list.setAttribute("role", "list");
    list.setAttribute("aria-labelledby", "search-book-title");
    const more = document.createElement("button");
    more.type = "button";
    more.className = "search-load-more";
    more.textContent = "Load more verses";
    const end = document.createElement("p");
    end.className = "search-end";
    end.textContent = "End of results";
    end.hidden = true;
    reader.append(list, more, end);
    searchResults.replaceChildren(header, summary, reader);

    let shown = 0;
    function appendBatch() {
        if (generation !== searchGeneration || shown >= rows.length) return;
        const fragment = document.createDocumentFragment();
        const next = Math.min(shown + VERSE_BATCH_SIZE, rows.length);
        for (let index = shown; index < next; index++) {
            const row = rows[index];
            const item = document.createElement("div");
            item.setAttribute("role", "listitem");
            const card = document.createElement("article");
            card.className = "search-verse-card";
            const reference = document.createElement("h3");
            reference.className = "search-verse-reference";
            const accessibleReference = document.createElement("span");
            accessibleReference.className = "visually-hidden";
            accessibleReference.textContent = `${bookName}, chapter ${row.chapter}, verse ${row.verse}`;
            const numbers = document.createElement("span");
            numbers.className = "search-verse-numbers";
            numbers.setAttribute("aria-hidden", "true");
            const chapter = document.createElement("span");
            chapter.className = "search-chapter-number";
            chapter.textContent = `${row.chapter}:`;
            const verse = document.createElement("span");
            verse.className = "search-verse-number";
            verse.textContent = row.verse;
            numbers.append(chapter, verse);
            reference.append(accessibleReference, numbers);
            const text = document.createElement("p");
            text.className = "search-verse-text";
            text.textContent = row.text;
            card.append(reference, text);
            item.append(card);
            fragment.append(item);
        }
        list.append(fragment);
        shown = next;
        summary.textContent = `${rows.length.toLocaleString()} verse${rows.length === 1 ? "" : "s"} found · ${shown.toLocaleString()} shown`;
        searchStatus.textContent = `${bookName}. ${summary.textContent}`;
        if (shown === rows.length) {
            verseObserver?.disconnect();
            end.hidden = false;
            // Preserve focus when the final batch is requested from the keyboard.
            if (document.activeElement === more) {
                more.textContent = "All verses loaded";
                more.setAttribute("aria-disabled", "true");
                more.addEventListener("blur", () => { more.hidden = true; }, { once: true });
            } else {
                more.hidden = true;
            }
        } else if (verseObserver) {
            // Re-observe after layout so a very tall viewport can fill another batch.
            verseObserver.unobserve(more);
            verseObserver.observe(more);
        }
    }

    more.addEventListener("click", appendBatch);
    appendBatch();
    if (shown < rows.length && "IntersectionObserver" in window) {
        verseObserver = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) appendBatch();
        }, { root: reader, rootMargin: "0px 0px 240px 0px" });
        verseObserver.observe(more);
    }
}

async function searchBibleVerses() {
    const query = searchQuery.value.trim();
    resetBibleSearch();
    closeBookSuggestions();
    if (!query) return;
    const generation = searchGeneration;
    searchResults.hidden = false;
    searchResults.setAttribute("aria-busy", "true");
    showSearchMessage("Loading Bible verses…");
    try {
        let reference;
        try {
            reference = parseBibleReference(query);
        } catch (error) {
            showSearchMessage(`${error.message} Try Ephesians 2:8-9.`);
            return;
        }
        await loadBibleBookSuggestions();
        if (generation !== searchGeneration) return;
        closeBookSuggestions();
        const bookName = bibleBooks.find((book) =>
            book.toLocaleLowerCase() === reference.bookName.toLocaleLowerCase(),
        );
        if (!bookName) {
            showSearchMessage("Book not found. Choose a Bible book from the suggestions, or try Ephesians 2:8-9.");
            return;
        }
        const rows = getVerses(bookName, reference.chapter, reference.verses);
        if (!rows.length) {
            showSearchMessage("No verses found. Check the chapter and verse numbers and try again.");
            return;
        }
        renderVerseResults(rows, generation);
    } catch (error) {
        if (generation !== searchGeneration) return;
        console.warn("Bible search failed:", error);
        showSearchMessage("Bible verses could not be loaded. Please search again to retry.");
    } finally {
        if (generation === searchGeneration) searchResults.removeAttribute("aria-busy");
    }
}

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchBibleVerses();
});
searchQuery.addEventListener("input", () => {
    resetBibleSearch();
    renderBookSuggestions();
    searchClear.hidden = !searchQuery.value;
});
searchClear.addEventListener("click", () => {
    searchQuery.value = "";
    searchClear.hidden = true;
    resetBibleSearch();
    searchQuery.focus();
    renderBookSuggestions();
});

const dailyReflectionToggle = document.getElementById("daily-reflection-toggle");
const dailyReflectionText = document.getElementById("daily-reflection-text");
const dailyReflectionAction = document.getElementById("daily-reflection-action");
dailyReflectionToggle.addEventListener("click", () => {
    const expanded = dailyReflectionToggle.getAttribute("aria-expanded") !== "true";
    dailyReflectionToggle.setAttribute("aria-expanded", String(expanded));
    dailyReflectionAction.textContent = expanded ? "Collapse reflection" : "Expand reflection";
});

const posterCard = document.getElementById("poster-card");
const dailyPoster = document.getElementById("daily-poster");
const posterPath = `${MEDIA_BASE_URL}images/sources/${month}/${dateName}`;
const todayAudioUrl = `${MEDIA_BASE_URL}audio/${today.getFullYear()}/${monthFolder}/webm/${dateName}.webm`;

const playIcon =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
const pauseIcon =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>';
const verseAudioButton = document.getElementById("verse-audio-play");
const verseAudio = new Audio(todayAudioUrl);
let showingComic = false;

function syncVerseAudioButton() {
    const playing = !verseAudio.paused;
    const label = playing
        ? "Pause today's narration"
        : "Play today's narration";
    verseAudioButton.classList.toggle("is-playing", playing);
    verseAudioButton.setAttribute("aria-pressed", String(playing));
    verseAudioButton.setAttribute("aria-label", label);
    verseAudioButton.title = label;
    verseAudioButton.innerHTML = playing ? pauseIcon : playIcon;
}

verseAudioButton.addEventListener("click", (event) => {
    event.stopPropagation();
    if (verseAudio.paused) {
        verseAudio.play().catch(() => {});
    } else {
        verseAudio.pause();
        verseAudio.currentTime = 0;
    }
});
verseAudio.addEventListener("play", syncVerseAudioButton);
verseAudio.addEventListener("pause", syncVerseAudioButton);
verseAudio.addEventListener("ended", () => {
    verseAudio.currentTime = 0;
    syncVerseAudioButton();
});

function togglePoster() {
    showingComic = !showingComic;
    dailyPoster.src = `${posterPath}${showingComic ? " - Comic" : ""}.webp`;
    posterCard.setAttribute(
        "aria-label",
        showingComic
            ? "Show today's regular poster"
            : "Show comic version of today's poster",
    );
}

dailyPoster.src = `${posterPath}.webp`;
posterCard.addEventListener("click", togglePoster);
posterCard.addEventListener("keydown", (event) => {
    if (event.target !== posterCard) return;
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        togglePoster();
    }
});
fetch("assets/verses.json")
    .then((response) => {
        if (!response.ok)
            throw new Error(
                `Unable to load assets/verses.json (${response.status})`,
            );
        return response.json();
    })
    .then((verses) => {
        const currentVerse = verses.find((item) => item.id === dateName);
        if (!currentVerse) throw new Error(`No verse found for ${dateName}`);

        const book = currentVerse.verse.replace(/\s+\d.*$/, "").trim();
        const dailyBookSymbol = document.getElementById("daily-book-symbol");
        dailyBookSymbol.onload = () => { dailyBookSymbol.hidden = false; };
        dailyBookSymbol.onerror = () => { dailyBookSymbol.hidden = true; };
        dailyBookSymbol.src = `${MEDIA_BASE_URL}images/symbols/${encodeURIComponent(book)}-symbol.svg`;

        document.getElementById("reflection-text").textContent =
            currentVerse.reflection;
        dailyReflectionText.textContent = currentVerse.reflection;
        dailyReflectionToggle.disabled = false;
    })
    .catch((error) => {
        console.warn("Today's devotional could not be loaded:", error);
        document.getElementById("reflection-text").textContent =
            "Please check the daily devotional data.";
        dailyReflectionText.textContent = "Today's reflection is unavailable. Please try again later.";
        dailyReflectionAction.textContent = "";
    });

// <did-you-know> loads its own facts; hand it the same media host used here.
document.getElementById("did-you-know").setAttribute("media-base", MEDIA_BASE_URL);

function getSvgMetadata(svgString) {
    const doc = new DOMParser().parseFromString(svgString, "image/svg+xml");

    if (doc.querySelector("parsererror")) {
        throw new Error("Invalid SVG: could not be parsed");
    }

    const getText = (selector) => {
        const el = doc.querySelector(selector);
        return el ? el.textContent.trim() : null;
    };

    return {
        title: getText('title[id="title"]'),
        description: getText('desc[id="description"]'),
    };
}

async function getSvgMetadataFromUrl(url, signal) {
    const response = await fetch(url, { signal });
    if (!response.ok)
        throw new Error(`Failed to fetch SVG: ${response.status}`);
    return getSvgMetadata(await response.text());
}

async function getSvgMetadataFromFile(file) {
    return getSvgMetadata(await file.text());
}
