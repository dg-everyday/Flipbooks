const MEDIA_BASE_URL = 'https://dailygrace.faith/media/';
// const MEDIA_BASE_URL = "http://localhost:9001/media/";

const searchForm = document.getElementById("devotional-search");
const searchQuery = document.getElementById("search-query");
const searchClear = document.getElementById("search-clear");
const searchResults = document.getElementById("search-results");
searchResults.setAttribute("media-base", MEDIA_BASE_URL);
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

// <banner-slider> shows the day's heading, banner and reflection, and lets the
// reader swipe back through the past week; the rest of the page stays on today.
document.getElementById("banner-slider").setAttribute("media-base", MEDIA_BASE_URL);

// <daily-strides> loads today's reflection from assets/verses.json itself.

// <did-you-know> loads its own facts; hand it the same media host used here.
document.getElementById("did-you-know").setAttribute("media-base", MEDIA_BASE_URL);
// <bible-sayings> loads its own sayings too; it shows the same book symbols.
document.getElementById("bible-sayings").setAttribute("media-base", MEDIA_BASE_URL);
// <poster-card> resolves the poster and narration files for the date itself.
document.getElementById("poster-card").setAttribute("media-base", MEDIA_BASE_URL);
// <bible-trivia> pops itself up after the page loads; it needs the book thumbnails.
document.getElementById("bible-trivia").setAttribute("media-base", MEDIA_BASE_URL);

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function thumbTransform(thumb, dialog) {
    const from = thumb.getBoundingClientRect();
    const to = dialog.getBoundingClientRect();
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    return `translate(${dx}px, ${dy}px) scale(${from.width / to.width})`;
}

// Grows a dialog out of the small control that opened it, or shrinks it back in.
function growDialog(thumb, dialog, direction, { open = 380, close = 240 } = {}) {
    const opening = direction === "open";
    const options = {
        duration: opening ? open : close,
        easing: opening ? "cubic-bezier(.2, .9, .25, 1)" : "cubic-bezier(.4, 0, 1, 1)",
        fill: "forwards",
    };
    const shrunk = { transform: thumbTransform(thumb, dialog), opacity: 0 };
    const full = { transform: "none", opacity: 1 };
    dialog.animate(opening ? [shrunk, full] : [full, shrunk], options);
    const backdrop = dialog.animate(
        opening ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }],
        { ...options, easing: "ease", pseudoElement: "::backdrop" },
    );
    return backdrop.finished.catch(() => {});
}

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

// Both the splash and the verse popup grow in with the same little overshoot.
// Sponsorship splash: the thank-you poster, with its sponsorships and donations
// code, opens only when the reader taps the footer QR code, and closes on any tap.
const splashDialog = document.getElementById("splash-dialog");
const qrOpen = document.getElementById("qr-open");
let splashClosing = false;

function popDialog(dialog, direction) {
    const opening = direction === "open";
    const options = {
        duration: opening ? 460 : 220,
        // A little overshoot on the way in gives the poster its pop.
        easing: opening ? "cubic-bezier(.2, .9, .25, 1.2)" : "cubic-bezier(.4, 0, 1, 1)",
        fill: "forwards",
    };
    const entering = { transform: "scale(.82) translateY(28px)", opacity: 0 };
    const full = { transform: "none", opacity: 1 };
    const leaving = { transform: "scale(.94)", opacity: 0 };
    dialog.animate(opening ? [entering, full] : [full, leaving], options);
    const backdrop = dialog.animate(
        opening ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }],
        { ...options, easing: "ease", pseudoElement: "::backdrop" },
    );
    return backdrop.finished.catch(() => {});
}

// The help guide slides in from the right edge, moving left into place, and
// slides back out the way it came.
function slideDialog(dialog, direction) {
    const opening = direction === "open";
    const options = {
        duration: opening ? 420 : 260,
        easing: opening ? "cubic-bezier(.22, 1, .36, 1)" : "cubic-bezier(.4, 0, 1, 1)",
        fill: "forwards",
    };
    // Half the viewport plus half the dialog puts it just past the right edge.
    const offscreen = { transform: "translateX(calc(50vw + 50%))", opacity: .6 };
    const full = { transform: "none", opacity: 1 };
    dialog.animate(opening ? [offscreen, full] : [full, offscreen], options);
    const backdrop = dialog.animate(
        opening ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }],
        { ...options, easing: "ease", pseudoElement: "::backdrop" },
    );
    return backdrop.finished.catch(() => {});
}

// When the splash was opened, so a quick second tap can be told from a later
// one. See the secret gesture below.
let splashShownAt = 0;

function openSplash() {
    if (splashDialog.open) return;
    splashShownAt = Date.now();
    splashDialog.showModal();
    if (!reducedMotionQuery.matches) popDialog(splashDialog, "open");
}

qrOpen.addEventListener("click", openSplash);

async function closeSplash() {
    if (!splashDialog.open || splashClosing) return;
    splashClosing = true;
    if (!reducedMotionQuery.matches) await popDialog(splashDialog, "close");
    splashDialog.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    splashDialog.close();
    splashClosing = false;
}

// Escape would close instantly; route it through the closing animation instead.
splashDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeSplash();
});
// A click or tap anywhere closes it: on the poster, the hint or the backdrop.
splashDialog.addEventListener("click", closeSplash);

// Secret: double click or double tap the footer QR code to forget the trivia's
// daily tally and play a round on the spot. The first tap opens the splash, so
// the second lands on the open dialog, where it would otherwise just close it
// again — catching it there is what makes the gesture feel like a double tap.
// It listens on pointerup, because iOS can swallow the click of a double tap,
// and pointerup runs first, so the closing below finds the work already done.
const DOUBLE_TAP_MS = 450;
const bibleTrivia = document.getElementById("bible-trivia");

splashDialog.addEventListener("pointerup", async () => {
    if (!splashShownAt || Date.now() - splashShownAt > DOUBLE_TAP_MS) return;
    splashShownAt = 0;
    bibleTrivia.reset();
    // Close the splash before the quiz takes the screen.
    await closeSplash();
    bibleTrivia.open({ force: true });
});

// Verse popup: a Bible reference in a Did You Know card or a Bible saying opens
// that passage in the search results panel, shown as a modal that any tap closes.
const didYouKnow = document.getElementById("did-you-know");
const bibleSayings = document.getElementById("bible-sayings");
const verseDialog = document.getElementById("verse-dialog");
const verseResults = document.getElementById("verse-results");
verseResults.setAttribute("media-base", MEDIA_BASE_URL);
let verseClosing = false;
let verseGeneration = 0;

function openVerseDialog() {
    if (verseDialog.open) return;
    verseDialog.showModal();
    if (!reducedMotionQuery.matches) popDialog(verseDialog, "open");
}

async function showVerse(reference) {
    const generation = ++verseGeneration;
    openVerseDialog();
    verseResults.loading("Loading Bible verses…");
    try {
        const parsed = parseBibleReference(reference);
        await loadBibleBookSuggestions();
        if (generation !== verseGeneration || !verseDialog.open) return;
        const bookName = bibleBooks.find((book) =>
            book.toLocaleLowerCase() === parsed.bookName.toLocaleLowerCase(),
        );
        if (!bookName) {
            verseResults.showMessage(`${reference} could not be found in this Bible.`);
            return;
        }
        const rows = getVerses(bookName, parsed.chapter, parsed.verses);
        if (!rows.length) {
            verseResults.showMessage(`No verses found for ${reference}.`);
            return;
        }
        verseResults.showVerses(rows);
    } catch (error) {
        if (generation !== verseGeneration) return;
        console.warn(`Verse lookup failed for ${reference}:`, error);
        verseResults.showMessage("Bible verses could not be loaded. Please try again.");
    }
}

// Bookmarks: holding a verse, a fact or a saying saves it (each component keeps
// its own list), and holding the search field opens them all in the bookmarks
// popup, one kind at a time under a segmented switch. Unlike the verse popup
// it is browsed, so a tap inside it does not close it: only the close button,
// the backdrop or Escape do.
const bookmarksDialog = document.getElementById("bookmarks-dialog");
const bookmarksClose = document.getElementById("bookmarks-close");
const bookmarkVerses = document.getElementById("bookmark-verses");
const bookmarkFacts = document.getElementById("bookmark-facts");
const bookmarkSayings = document.getElementById("bookmark-sayings");
const bookmarkTabs = [...bookmarksDialog.querySelectorAll('[role="tab"]')];
// The component behind each tab, whose bookmarks the tab counts.
const bookmarkLists = new Map([
    [bookmarkTabs[0], bookmarkVerses],
    [bookmarkTabs[1], bookmarkFacts],
    [bookmarkTabs[2], bookmarkSayings],
]);
for (const list of bookmarkLists.values()) list.setAttribute("media-base", MEDIA_BASE_URL);
// The popup opens on the kind of bookmark looked at last.
let bookmarkTab = bookmarkTabs[0];
let bookmarksGeneration = 0;
let bookmarksClosing = false;

function updateBookmarkCounts() {
    for (const [tab, list] of bookmarkLists) {
        tab.querySelector(".bookmark-count").textContent = list.bookmarks.length || "";
    }
}

function selectBookmarkTab(tab, { focus = false } = {}) {
    bookmarkTab = tab;
    for (const other of bookmarkTabs) {
        const selected = other === tab;
        other.setAttribute("aria-selected", String(selected));
        other.tabIndex = selected ? 0 : -1;
        document.getElementById(other.getAttribute("aria-controls")).hidden = !selected;
    }
    bookmarksDialog.scrollTop = 0;
    if (focus) tab.focus();
}

for (const tab of bookmarkTabs) {
    tab.addEventListener("click", () => selectBookmarkTab(tab));
}
// The arrow keys move along the switch, as in any tab list.
bookmarksDialog.querySelector('[role="tablist"]').addEventListener("keydown", (event) => {
    const index = bookmarkTabs.indexOf(bookmarkTab);
    const last = bookmarkTabs.length - 1;
    const next = {
        ArrowLeft: index === 0 ? last : index - 1,
        ArrowRight: index === last ? 0 : index + 1,
        Home: 0,
        End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    selectBookmarkTab(bookmarkTabs[next], { focus: true });
});
for (const list of bookmarkLists.values()) {
    list.addEventListener("bookmarkchange", updateBookmarkCounts);
}

async function showBookmarks() {
    const generation = ++bookmarksGeneration;
    if (!bookmarksDialog.open) {
        bookmarksDialog.showModal();
        if (!reducedMotionQuery.matches) popDialog(bookmarksDialog, "open");
    }
    selectBookmarkTab(bookmarkTab);
    updateBookmarkCounts();
    // Bookmarks may have been added on the page since the lists were last drawn.
    bookmarkFacts.showBookmarks();
    bookmarkSayings.showBookmarks();
    const ids = bookmarkVerses.bookmarks;
    if (!ids.length) {
        bookmarkVerses.showBookmarks([]);
        return;
    }
    bookmarkVerses.loading("Loading your bookmarks…");
    try {
        await loadBibleBookSuggestions();
        if (generation !== bookmarksGeneration || !bookmarksDialog.open) return;
        bookmarkVerses.showBookmarks(getVersesByIds(ids));
    } catch (error) {
        if (generation !== bookmarksGeneration) return;
        console.warn("Bookmarks could not be loaded:", error);
        bookmarkVerses.showMessage("Your bookmarks could not be loaded. Please try again.");
    }
}

async function closeBookmarks() {
    if (!bookmarksDialog.open || bookmarksClosing) return;
    bookmarksClosing = true;
    bookmarksGeneration++;
    if (!reducedMotionQuery.matches) await popDialog(bookmarksDialog, "close");
    bookmarksDialog.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    bookmarksDialog.close();
    bookmarkVerses.reset();
    bookmarksClosing = false;
}

// Escape would close instantly; route it through the closing animation instead.
bookmarksDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeBookmarks();
});
bookmarksClose.addEventListener("click", closeBookmarks);
bookmarksDialog.addEventListener("click", (event) => {
    if (event.target === bookmarksDialog) closeBookmarks();
});

// The same half-second hold the verse cards use, with the search pill glowing
// gold while it builds.
const HOLD_MS = 500;
const HOLD_SLOP = 10;
let searchHold = null;
// The hold ends with the finger lifting, and the click that follows would
// land on the popup that has just opened and close it again.
let swallowClick = false;

function cancelSearchHold() {
    if (!searchHold) return;
    clearTimeout(searchHold.timer);
    searchHold = null;
    searchForm.classList.remove("holding");
}

searchQuery.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    cancelSearchHold();
    searchForm.classList.add("holding");
    searchHold = {
        x: event.clientX,
        y: event.clientY,
        timer: setTimeout(() => {
            cancelSearchHold();
            swallowClick = true;
            navigator.vibrate?.(15);
            showBookmarks();
        }, HOLD_MS),
    };
});
searchQuery.addEventListener("pointermove", (event) => {
    if (searchHold && Math.hypot(event.clientX - searchHold.x, event.clientY - searchHold.y) > HOLD_SLOP) {
        cancelSearchHold();
    }
});
for (const type of ["pointerup", "pointercancel", "pointerleave"]) {
    searchQuery.addEventListener(type, cancelSearchHold);
}
// A long press would otherwise open the phone's paste menu.
searchQuery.addEventListener("contextmenu", (event) => {
    if (searchHold || swallowClick) event.preventDefault();
});
addEventListener("pointerdown", () => { swallowClick = false; }, true);
addEventListener("click", (event) => {
    if (!swallowClick) return;
    swallowClick = false;
    event.preventDefault();
    event.stopPropagation();
}, true);

async function closeVerse() {
    if (!verseDialog.open || verseClosing) return;
    verseClosing = true;
    verseGeneration++;
    if (!reducedMotionQuery.matches) await popDialog(verseDialog, "close");
    verseDialog.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    verseDialog.close();
    verseResults.reset();
    verseClosing = false;
}

// A reference in a fact or a saying, on the page or among the bookmarks, opens
// the passage on top. A saying's popup, like the bookmarks popup, stays open
// underneath; closing the passage returns to it.
for (const source of [didYouKnow, bibleSayings, bookmarkFacts, bookmarkSayings]) {
    source.addEventListener("verse-request", (event) => {
        showVerse(event.detail.reference);
    });
}

// Escape would close instantly; route it through the closing animation instead.
verseDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeVerse();
});
// A click or tap anywhere closes it, except on the panel's own buttons.
verseDialog.addEventListener("click", (event) => {
    if (event.composedPath().some((node) => node.nodeName === "BUTTON")) return;
    closeVerse();
});

// Help: "Help" in the menu opens a guide to the page's gestures. Unlike the
// other popups it is read, and scrolled, so only the close button, the
// backdrop or Escape closes it.
const helpDialog = document.getElementById("help-dialog");
const helpClose = document.getElementById("help-close");
let helpClosing = false;

function openHelp() {
    if (helpDialog.open) return;
    helpDialog.showModal();
    helpDialog.scrollTop = 0;
    if (!reducedMotionQuery.matches) slideDialog(helpDialog, "open");
}

async function closeHelp() {
    if (!helpDialog.open || helpClosing) return;
    helpClosing = true;
    if (!reducedMotionQuery.matches) await slideDialog(helpDialog, "close");
    helpDialog.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    helpDialog.close();
    helpClosing = false;
}

// Escape would close instantly; route it through the closing animation instead.
helpDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeHelp();
});
helpClose.addEventListener("click", closeHelp);
// The dialog has no padding, so a click that lands on it rather than its
// contents came from the backdrop.
helpDialog.addEventListener("click", (event) => {
    if (event.target === helpDialog) closeHelp();
});

// About: "About" in the menu opens the story of Daily Grace. It grows out of
// the DG icon and shrinks back into it. Each section rises into view as it is
// scrolled to, the gold line along the top fills as the reader goes, and a
// compact header takes over from the big title, as the Help header does.
const aboutDialog = document.getElementById("about-dialog");
// The DG emblem: it opens the menu, and the About story grows out of it.
const dgButton = document.getElementById("menu-open");
const aboutClose = document.getElementById("about-close");
const aboutBegin = document.getElementById("about-begin");
const aboutSections = aboutDialog.querySelectorAll(".about-reveal");
const ABOUT_TIMING = { open: 560, close: 300 };
let aboutClosing = false;

const aboutObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        aboutObserver.unobserve(entry.target);
    }
}, { root: aboutDialog, rootMargin: "0px 0px -10% 0px" });

const aboutTitle = document.getElementById("about-title");
const aboutMini = aboutDialog.querySelector(".about-mini");

// Fills the progress line, and swaps in the compact header once the big
// title has slid up under where it sits.
function updateAboutScroll() {
    const { scrollTop, scrollHeight, clientHeight } = aboutDialog;
    const scrollable = scrollHeight - clientHeight;
    const read = scrollable > 0 ? scrollTop / scrollable : 1;
    aboutDialog.style.setProperty("--read", Math.min(1, read).toFixed(3));
    const titleGone = aboutTitle.offsetTop + aboutTitle.offsetHeight - aboutMini.offsetHeight;
    aboutDialog.classList.toggle("condensed", scrollTop > titleGone);
}

function openAbout() {
    if (aboutDialog.open) return;
    aboutDialog.showModal();
    aboutDialog.scrollTop = 0;
    updateAboutScroll();
    const animate = !reducedMotionQuery.matches;
    // Hide the sections afresh each time, so the story unfolds again on every visit.
    aboutDialog.classList.toggle("revealing", animate);
    for (const section of aboutSections) {
        section.classList.remove("is-visible");
        if (animate) aboutObserver.observe(section);
    }
    if (animate) growDialog(dgButton, aboutDialog, "open", ABOUT_TIMING);
}

async function closeAbout() {
    if (!aboutDialog.open || aboutClosing) return;
    aboutClosing = true;
    if (!reducedMotionQuery.matches) await growDialog(dgButton, aboutDialog, "close", ABOUT_TIMING);
    aboutDialog.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    aboutObserver.disconnect();
    aboutDialog.close();
    aboutClosing = false;
}

aboutDialog.addEventListener("scroll", updateAboutScroll, { passive: true });
// Escape would close instantly; route it through the closing animation instead.
aboutDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeAbout();
});
aboutClose.addEventListener("click", closeAbout);
// The dialog has no padding, so a click that lands on it rather than its
// contents came from the backdrop.
aboutDialog.addEventListener("click", (event) => {
    if (event.target === aboutDialog) closeAbout();
});
// The closing call to action: fold the story away and take the reader to today.
aboutBegin.addEventListener("click", async () => {
    await closeAbout();
    document.getElementById("daily-devotional").scrollIntoView({ behavior: "smooth" });
});

// Menu: the DG emblem opens a drawer that slides in from the left, with the
// study pages (Books and Peoples of the Bible) at the top and Help and About
// at the foot. It has no close button: a swipe to the left, a tap on the page
// beside it, or Escape closes it.
const menuDialog = document.getElementById("site-menu");
let menuClosing = false;
// Closing the menu hands focus back to the DG emblem, and Chrome then draws its
// focus ring. Keep the ring only when the menu was opened from the keyboard; a
// menu opened by a click or tap leaves no ring, however it is closed.
let menuOpenedByKeyboard = false;

function drawerDialog(dialog, direction) {
    const opening = direction === "open";
    const options = {
        duration: opening ? 380 : 240,
        easing: opening ? "cubic-bezier(.22, 1, .36, 1)" : "cubic-bezier(.4, 0, 1, 1)",
        fill: "forwards",
    };
    const offscreen = { transform: "translateX(-100%)" };
    const full = { transform: "none" };
    dialog.animate(opening ? [offscreen, full] : [full, offscreen], options);
    const backdrop = dialog.animate(
        opening ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }],
        { ...options, easing: "ease", pseudoElement: "::backdrop" },
    );
    return backdrop.finished.catch(() => {});
}

function openMenu() {
    if (menuDialog.open) return;
    menuDialog.showModal();
    dgButton.setAttribute("aria-expanded", "true");
    if (!reducedMotionQuery.matches) drawerDialog(menuDialog, "open");
}

async function closeMenu() {
    if (!menuDialog.open || menuClosing) return;
    menuClosing = true;
    if (!reducedMotionQuery.matches) await drawerDialog(menuDialog, "close");
    finishCloseMenu();
}

function finishCloseMenu() {
    menuDialog.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    menuDialog.close();
    if (!menuOpenedByKeyboard) dgButton.blur();
    dgButton.setAttribute("aria-expanded", "false");
    menuClosing = false;
}

// Swipe left to close: once a touch moves mostly leftward, the drawer and its
// backdrop follow the finger. On release it slides the rest of the way out if
// it was dragged past a third of its width or flicked, and springs back
// otherwise. Vertical moves are left to the browser so the menu still scrolls.
const MENU_SWIPE_SLOP = 10;          // px before a touch counts as a swipe
const MENU_SWIPE_DISTANCE = 1 / 3;   // of the drawer's width
const MENU_SWIPE_FLICK = 0.5;        // px/ms leftward
const MENU_SWIPE_SETTLE = 240;       // ms for a full width, as in drawerDialog
let menuSwipe = null;
let menuSwipeSwallowClick = false;

function scrubMenu(keyframes, pseudoElement) {
    const animation = menuDialog.animate(keyframes, {
        duration: 1000, easing: "linear", fill: "forwards", pseudoElement,
    });
    animation.pause();
    return animation;
}

menuDialog.addEventListener("pointerdown", (event) => {
    menuSwipeSwallowClick = false;
    if (event.pointerType === "mouse" || !event.isPrimary || menuClosing) return;
    menuSwipe = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, t: event.timeStamp, v: 0 };
});

menuDialog.addEventListener("pointermove", (event) => {
    const swipe = menuSwipe;
    if (!swipe || event.pointerId !== swipe.id) return;
    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    if (!swipe.animations) {
        if (Math.abs(dx) < MENU_SWIPE_SLOP && Math.abs(dy) < MENU_SWIPE_SLOP) return;
        if (dx >= 0 || Math.abs(dy) >= Math.abs(dx)) {
            menuSwipe = null;
            return;
        }
        menuDialog.setPointerCapture(swipe.id);
        // The opening animation holds its end state; replace it with ones the
        // finger can scrub.
        menuDialog.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
        swipe.width = menuDialog.getBoundingClientRect().width;
        swipe.animations = [
            scrubMenu([{ transform: "none" }, { transform: "translateX(-100%)" }]),
            scrubMenu([{ opacity: 1 }, { opacity: 0 }], "::backdrop"),
        ];
    }
    const elapsed = event.timeStamp - swipe.t;
    if (elapsed > 0) swipe.v = (dx - swipe.dx) / elapsed;
    swipe.dx = dx;
    swipe.t = event.timeStamp;
    const progress = Math.min(1, Math.max(0, -dx / swipe.width));
    swipe.animations.forEach((animation) => { animation.currentTime = progress * 1000; });
});

async function endMenuSwipe(event) {
    const swipe = menuSwipe;
    if (!swipe || event.pointerId !== swipe.id) return;
    menuSwipe = null;
    if (!swipe.animations) return;
    menuSwipeSwallowClick = true;
    const progress = swipe.animations[0].currentTime / 1000;
    const close = event.type === "pointerup"
        && (progress > MENU_SWIPE_DISTANCE || swipe.v < -MENU_SWIPE_FLICK);
    if (close) menuClosing = true;
    if (close && reducedMotionQuery.matches) {
        finishCloseMenu();
        return;
    }
    const rate = 1000 / MENU_SWIPE_SETTLE;
    swipe.animations.forEach((animation) => {
        animation.playbackRate = close ? rate : -rate;
        animation.play();
    });
    await Promise.all(swipe.animations.map((animation) => animation.finished.catch(() => {})));
    if (close) finishCloseMenu();
    else swipe.animations.forEach((animation) => animation.cancel());
}

menuDialog.addEventListener("pointerup", endMenuSwipe);
menuDialog.addEventListener("pointercancel", endMenuSwipe);
// A swipe that ends over a link or the backdrop must not also count as a tap.
menuDialog.addEventListener("click", (event) => {
    if (!menuSwipeSwallowClick) return;
    menuSwipeSwallowClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
}, true);

// A click from Enter or Space has no pointer behind it, so its detail is 0.
dgButton.addEventListener("click", (event) => {
    menuOpenedByKeyboard = event.detail === 0;
    openMenu();
});
// Escape would close instantly; route it through the closing animation instead.
menuDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeMenu();
});
// The dialog has no padding, so a click that lands on it rather than its
// contents came from the backdrop.
menuDialog.addEventListener("click", (event) => {
    if (event.target === menuDialog) closeMenu();
});
// Help and About replace the menu rather than stacking on top of it.
document.getElementById("menu-help").addEventListener("click", async () => {
    await closeMenu();
    openHelp();
});
document.getElementById("menu-about").addEventListener("click", async () => {
    await closeMenu();
    openAbout();
});
