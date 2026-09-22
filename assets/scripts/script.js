const MEDIA_BASE_URL = 'https://dailygrace.faith/media/';
// const MEDIA_BASE_URL = "http://localhost:9001/media/";
const today = new Date();
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
searchResults.setAttribute("media-base", MEDIA_BASE_URL);
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
    // Only suggest books once something has been typed, so clearing the field hides the list.
    if (!query) {
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
// <poster-card> resolves the poster and narration files for the date itself.
document.getElementById("poster-card").setAttribute("media-base", MEDIA_BASE_URL);
// <bible-trivia> pops itself up after the page loads; it needs the book thumbnails.
document.getElementById("bible-trivia").setAttribute("media-base", MEDIA_BASE_URL);

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

// Footer QR code: enlarge it in a modal that grows out of the small code and
// shrinks back into it when closed.
const qrDialog = document.getElementById("qr-dialog");
const qrOpen = document.getElementById("qr-open");
let qrClosing = false;

function qrThumbTransform() {
    const from = qrOpen.getBoundingClientRect();
    const to = qrDialog.getBoundingClientRect();
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    return `translate(${dx}px, ${dy}px) scale(${from.width / to.width})`;
}

function animateQr(direction) {
    const opening = direction === "open";
    const options = {
        duration: opening ? 380 : 240,
        easing: opening ? "cubic-bezier(.2, .9, .25, 1)" : "cubic-bezier(.4, 0, 1, 1)",
        fill: "forwards",
    };
    const shrunk = { transform: qrThumbTransform(), opacity: 0 };
    const full = { transform: "none", opacity: 1 };
    qrDialog.animate(opening ? [shrunk, full] : [full, shrunk], options);
    const backdrop = qrDialog.animate(
        opening ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }],
        { ...options, easing: "ease", pseudoElement: "::backdrop" },
    );
    return backdrop.finished.catch(() => {});
}

// When the code was enlarged, so a quick second tap can be told from a later
// one. See the secret gesture below.
let qrShownAt = 0;

qrOpen.addEventListener("click", () => {
    if (qrDialog.open) return;
    qrShownAt = Date.now();
    qrDialog.showModal();
    if (!reducedMotionQuery.matches) animateQr("open");
});

async function closeQr() {
    if (!qrDialog.open || qrClosing) return;
    qrClosing = true;
    if (!reducedMotionQuery.matches) await animateQr("close");
    qrDialog.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    qrDialog.close();
    qrClosing = false;
}

// Escape would close instantly; route it through the closing animation instead.
qrDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeQr();
});
// A click or tap anywhere closes it: on the code, its caption or the backdrop.
qrDialog.addEventListener("click", closeQr);

// Secret: double click or double tap the footer QR code to forget the trivia's
// daily tally and play a round on the spot. The first tap enlarges the code, so
// the second lands on the open dialog, where it would otherwise just close it
// again — catching it there is what makes the gesture feel like a double tap.
// It listens on pointerup, because iOS can swallow the click of a double tap,
// and pointerup runs first, so the closing below finds the work already done.
const DOUBLE_TAP_MS = 450;
const bibleTrivia = document.getElementById("bible-trivia");

qrDialog.addEventListener("pointerup", async () => {
    if (!qrShownAt || Date.now() - qrShownAt > DOUBLE_TAP_MS) return;
    qrShownAt = 0;
    bibleTrivia.reset();
    // Shrink the code back into the footer before the quiz takes the screen.
    await closeQr();
    bibleTrivia.open({ force: true });
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

// Both the splash and the verse popup grow in with the same little overshoot.
// End-of-page splash: a thank-you poster that pops up once the reader has
// browsed all the way to the bottom, and closes on any tap. Shown once a visit.
const splashDialog = document.getElementById("splash-dialog");
let splashShown = false;
let splashClosing = false;
let browsed = false;

// Reaching the end only counts when the reader took themselves there. A restored
// scroll position on reload fires a scroll event but no input, so it never counts.
for (const gesture of GESTURES) {
    addEventListener(gesture, () => { browsed = true; }, { passive: true, once: true });
}

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

function openSplash() {
    if (splashShown || splashDialog.open) return;
    splashShown = true;
    splashDialog.showModal();
    if (!reducedMotionQuery.matches) popDialog(splashDialog, "open");
}

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

// The last row of the footer ends up flush with the viewport edge, so ask the
// scroll position directly rather than watching an element cross a threshold.
function checkPageEnd() {
    const remaining = document.scrollingElement.scrollHeight - scrollY - innerHeight;
    if (!browsed || remaining > 2) return;
    removeEventListener("scroll", checkPageEnd);
    openSplash();
}

addEventListener("scroll", checkPageEnd, { passive: true });

// Verse popup: a Bible reference in a Did You Know card opens that passage in
// the search results panel, shown as a modal that any tap closes.
const didYouKnow = document.getElementById("did-you-know");
const verseDialog = document.getElementById("verse-dialog");
const verseResults = document.getElementById("verse-results");
verseResults.setAttribute("media-base", MEDIA_BASE_URL);
let verseClosing = false;
let verseGeneration = 0;

async function showVerse(reference) {
    const generation = ++verseGeneration;
    if (!verseDialog.open) {
        verseDialog.showModal();
        if (!reducedMotionQuery.matches) popDialog(verseDialog, "open");
    }
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

didYouKnow.addEventListener("verse-request", (event) => {
    showVerse(event.detail.reference);
});

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
