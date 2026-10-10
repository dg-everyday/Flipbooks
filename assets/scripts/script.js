// The media host comes from apps/settings/appsettings.json, which the
// components read for themselves (apps/settings/settings.js). This copy is not
// used by the page: assets/scripts/check-assets.mjs reads it to find the host
// it checks, so keep this line's form and keep it in step with appsettings.json.
const MEDIA_BASE_URL = 'https://dailygrace.faith/media/';

const searchForm = document.getElementById("devotional-search");
const searchQuery = document.getElementById("search-query");
const searchClear = document.getElementById("search-clear");
const searchResults = document.getElementById("search-results");
const bibleBookSuggestions = document.getElementById("bible-books");
const searchMode = document.getElementById("search-mode");
const searchQueryLabel = document.querySelector('label[for="search-query"]');
let bibleBooksLoading = null;
let bibleBooks = [];
let activeBookIndex = -1;

// The padlock beside the search field switches between the two searches.
// Locked (the default) finds a Bible reference; unlocked finds verses that
// contain every word typed, with no book suggestions.
const SEARCH_MODES = {
    reference: {
        placeholder: "Ephesians 2:8-9",
        label: "Search bible verse",
        title: "Locked: search by Bible reference. Tap to search by keywords.",
    },
    keywords: {
        placeholder: "Words, e.g. grace faith",
        label: "Search bible by keywords",
        title: "Unlocked: search by keywords. Tap to search by Bible reference.",
    },
};
let keywordSearch = false;

function setSearchMode(keywords) {
    keywordSearch = keywords;
    const mode = SEARCH_MODES[keywords ? "keywords" : "reference"];
    searchMode.setAttribute("aria-pressed", String(keywords));
    searchMode.title = mode.title;
    searchQuery.placeholder = mode.placeholder;
    searchQueryLabel.textContent = mode.label;
    // A reference makes a poor keyword search and vice versa, so start fresh.
    searchQuery.value = "";
    searchClear.hidden = true;
    resetBibleSearch();
    renderBookSuggestions();
}

searchMode.addEventListener("click", () => {
    setSearchMode(!keywordSearch);
    searchQuery.focus();
});

function closeBookSuggestions() {
    bibleBookSuggestions.hidden = true;
    searchQuery.setAttribute("aria-expanded", "false");
    searchQuery.removeAttribute("aria-activedescendant");
    activeBookIndex = -1;
}

function renderBookSuggestions() {
    const query = searchQuery.value.trim().toLocaleLowerCase();
    // Only suggest books once something has been typed, so clearing the field
    // hides the list. Keyword search has no book suggestions at all.
    if (!query || keywordSearch) {
        bibleBookSuggestions.replaceChildren();
        closeBookSuggestions();
        return;
    }
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

let searchGeneration = 0;

function resetBibleSearch() {
    searchGeneration++;
    searchResults.reset();
}

async function searchBibleVerses() {
    const query = searchQuery.value.trim();
    resetBibleSearch();
    closeBookSuggestions();
    if (!query) return;
    const generation = searchGeneration;
    searchResults.loading("Loading Bible verses…");
    try {
        if (keywordSearch) {
            await searchBibleKeywords(query, generation);
            return;
        }
        let reference;
        try {
            reference = parseBibleReference(query);
        } catch (error) {
            searchResults.showMessage(`${error.message} Try Ephesians 2:8-9.`);
            return;
        }
        await loadBibleBookSuggestions();
        if (generation !== searchGeneration) return;
        closeBookSuggestions();
        const bookName = bibleBooks.find((book) =>
            book.toLocaleLowerCase() === reference.bookName.toLocaleLowerCase(),
        );
        if (!bookName) {
            searchResults.showMessage("Book not found. Choose a Bible book from the suggestions, or try Ephesians 2:8-9.");
            return;
        }
        const rows = getVerses(bookName, reference.chapter, reference.verses);
        if (!rows.length) {
            searchResults.showMessage("No verses found. Check the chapter and verse numbers and try again.");
            return;
        }
        searchResults.showVerses(rows);
    } catch (error) {
        if (generation !== searchGeneration) return;
        console.warn("Bible search failed:", error);
        searchResults.showMessage("Bible verses could not be loaded. Please search again to retry.");
    }
}

async function searchBibleKeywords(query, generation) {
    const words = parseSearchKeywords(query);
    if (!words.length) {
        searchResults.showMessage("Type one or more whole words, such as grace faith.");
        return;
    }
    await loadBibleBookSuggestions();
    if (generation !== searchGeneration) return;
    const rows = searchVersesByKeywords(words);
    if (!rows.length) {
        const list = words.map((word) => `“${word}”`).join(", ");
        searchResults.showMessage(`No verses contain all of ${list}. Try fewer or different words.`);
        return;
    }
    searchResults.showKeywordResults(rows, words);
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

// <daily-guidance> picks today's Questions We All Ask topic from
// assets/guidance-for-life.json itself. (The day's reflection is under the banner.)

// <daily-moment> walks through the day on the banner: today's Moment, or an
// earlier day's while the reader has swiped back to it.
const dailyMoment = document.getElementById("daily-moment");
document.getElementById("banner-slider").addEventListener("daychange", (event) => {
    if (event.detail.daysAgo) dailyMoment.setAttribute("date", event.detail.date);
    else dailyMoment.removeAttribute("date");
});

// Leaving for another page and coming back — the Flipbook's home button, the
// back button, a reload — should land the reader where they left off rather
// than at the top. The poster and the fact cards arrive after load, so the
// document starts too short to hold the old position: keep asking for it as the
// page grows, and stop the moment the reader takes over.
// The ways a reader takes the page over from a script.
const GESTURES = ["wheel", "touchmove", "keydown", "pointerdown"];

const SCROLL_KEY = "dailygrace:main-scroll";
// Long enough for the cards to land on a slow connection, short enough that a
// late jump never surprises someone who has started reading.
const RESTORE_TIMEOUT = 4000;
// How long the page height has to hold still before a restore counts as done.
const SETTLE_DELAY = 500;

function readSavedScroll() {
    try {
        return Number(sessionStorage.getItem(SCROLL_KEY)) || 0;
    } catch {
        return 0; // Private browsing can refuse storage; the page still works.
    }
}

function writeScroll() {
    try {
        sessionStorage.setItem(SCROLL_KEY, String(Math.round(scrollY)));
    } catch {}
}

let scrollSaveQueued = false;
addEventListener("scroll", () => {
    if (scrollSaveQueued) return;
    scrollSaveQueued = true;
    requestAnimationFrame(() => {
        scrollSaveQueued = false;
        writeScroll();
    });
}, { passive: true });
// A frame callback may never run once the page is going away, so take the
// closing position straight away. pagehide covers both leaving and the phone
// putting the tab to sleep.
addEventListener("pagehide", writeScroll);
addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") writeScroll();
});

function restoreScroll(target) {
    const root = document.documentElement;
    // Two of the page's habits get in the way of a restore and are put back as
    // soon as it is over: html scrolls smoothly, which would turn the jump into
    // a long ride down the page, and scroll anchoring nudges the position
    // whenever a card loads in above, which would walk us off the mark.
    const smooth = root.style.scrollBehavior;
    const anchor = root.style.overflowAnchor;
    root.style.scrollBehavior = "auto";
    root.style.overflowAnchor = "none";

    let observer;
    let settled;
    let deadline;
    let done = false;
    const finish = () => {
        if (done) return;
        done = true;
        observer?.disconnect();
        clearTimeout(settled);
        clearTimeout(deadline);
        root.style.scrollBehavior = smooth;
        root.style.overflowAnchor = anchor;
        for (const gesture of GESTURES) removeEventListener(gesture, finish);
    };
    const attempt = () => {
        if (done) return;
        const reach = document.scrollingElement.scrollHeight - innerHeight;
        scrollTo(0, Math.min(target, Math.max(reach, 0)));
        // The page is tall enough to hold the real position, but a card may
        // still be on its way: wait for the height to hold still before
        // calling it, rather than stopping at the first card that fits.
        clearTimeout(settled);
        if (reach >= target) settled = setTimeout(finish, SETTLE_DELAY);
    };

    // The reader wins: any scrolling of their own ends the restore where it is.
    for (const gesture of GESTURES) addEventListener(gesture, finish, { passive: true });
    observer = new ResizeObserver(attempt);
    observer.observe(root);
    deadline = setTimeout(finish, RESTORE_TIMEOUT);
    attempt();
}

// A link to a particular section is a destination of its own; leave it alone.
if (!location.hash) {
    const savedScroll = readSavedScroll();
    // Ours is the position that knows the full page height, so keep the browser
    // from also restoring a stale one and landing the reader between the two.
    if (savedScroll > 0 && "scrollRestoration" in history) {
        history.scrollRestoration = "manual";
        restoreScroll(savedScroll);
    }
}

// Secret: double click or double tap the footer QR code to forget the trivia's
// daily tally and play a round on the spot. The first tap opens the splash
// (apps/components/sponsor-splash.js), and a second one straight after closes it
// and says so.
const bibleTrivia = document.getElementById("bible-trivia");
document.getElementById("splash").addEventListener("doubletap", () => {
    bibleTrivia.reset();
    bibleTrivia.open({ force: true });
});

// Verse popup: every Bible reference on the page is a pill (a fact, a saying,
// today's question, the blueprint, an explanation, the bookmarks), and a tap
// on one opens the passage in <verse-popup> on top of whatever is open
// (apps/components/scripture-refs.js and verse-popup.js). It uses the
// database the search opens.

// Bookmarks: holding a verse, a fact or a saying saves it (each component keeps
// its own list), and holding the DG emblem opens them all in <bookmark-manager>
// (apps/components/bookmark-manager.js). Its verses come from the database the
// search opens.
const bookmarkManager = document.getElementById("bookmarks");
bookmarkManager.loadVerses = async (ids) => {
    await loadBibleBookSuggestions();
    return getVersesByIds(ids);
};

// The DG emblem: a tap opens the menu (<study-guide-menu>, which wires the tap
// itself and holds Help and About), a hold opens the bookmarks.
const dgButton = document.getElementById("menu-open");
// About's closing call to action takes the reader to today.
document.getElementById("site-menu").addEventListener("begin", () => {
    document.getElementById("daily-devotional").scrollIntoView({ behavior: "smooth" });
});

// Holding the DG emblem for half a second opens the bookmarks instead of the
// menu: the same half-second hold the verse cards use, with the emblem glowing
// gold while it builds. (This used to be on the search field, but a long press
// there belongs to the phone's own menu, so a verse copied elsewhere can be
// pasted in.)
const HOLD_MS = 500;
const HOLD_SLOP = 10;
let dgHold = null;
// The hold ends with the finger lifting, and the click that follows would open
// the menu, or land on the bookmarks popup that has just opened and close it.
let swallowClick = false;

function cancelDgHold() {
    if (!dgHold) return;
    clearTimeout(dgHold.timer);
    dgHold = null;
    dgButton.classList.remove("holding");
}

dgButton.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    cancelDgHold();
    dgButton.classList.add("holding");
    dgHold = {
        x: event.clientX,
        y: event.clientY,
        timer: setTimeout(() => {
            cancelDgHold();
            swallowClick = true;
            navigator.vibrate?.(15);
            bookmarkManager.open();
        }, HOLD_MS),
    };
});
dgButton.addEventListener("pointermove", (event) => {
    if (dgHold && Math.hypot(event.clientX - dgHold.x, event.clientY - dgHold.y) > HOLD_SLOP) {
        cancelDgHold();
    }
});
for (const type of ["pointerup", "pointercancel", "pointerleave"]) {
    dgButton.addEventListener(type, cancelDgHold);
}
// A long press would otherwise open the phone's menu for the emblem's image.
dgButton.addEventListener("contextmenu", (event) => {
    if (dgHold || swallowClick) event.preventDefault();
});
addEventListener("pointerdown", () => { swallowClick = false; }, true);
addEventListener("click", (event) => {
    if (!swallowClick) return;
    swallowClick = false;
    event.preventDefault();
    event.stopPropagation();
}, true);
