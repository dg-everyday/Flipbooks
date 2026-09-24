const MEDIA_BASE_URL = 'https://dailygrace.faith/media/';

// Citations use "Psalm"; the symbol library files that book under its plural name.
const SYMBOL_BOOK_NAMES = { Psalm: "Psalms" };
function bookSymbolUrl(mediaBase, book) {
    const name = SYMBOL_BOOK_NAMES[book] ?? book;
    return `${mediaBase}images/symbols/${encodeURIComponent(name)}-symbol.svg`;
}
// const MEDIA_BASE_URL = "http://localhost:9001/media/";
// Each day's devotional goes live on the Asia/Manila calendar, so "today" is
// Manila's date wherever the reader is.
const manilaToday = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "numeric",
        day: "numeric",
    })
    .formatToParts(new Date())
    .map(({ type, value }) => [type, Number(value)]),
);

// How many earlier days the banner can be swiped back to.
const PAST_DAYS = 7;

// Everything the page needs to name and fetch the devotional `daysAgo` days
// before today. The date is built at UTC midnight and formatted in UTC, so the
// day arithmetic never trips over a clock change.
// URL pattern adapted from update-social-image.mjs, which remains metadata-only.
function devotionalDay(daysAgo) {
    const date = new Date(Date.UTC(manilaToday.year, manilaToday.month - 1, manilaToday.day - daysAgo));
    const format = (options) => date.toLocaleDateString("en-US", { timeZone: "UTC", ...options });
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const iso = `${date.getUTCFullYear()}-${month}-${day}`;
    const name = format({ month: "long", day: "numeric", year: "numeric" });
    return {
        daysAgo,
        iso,
        // The key verses.json files each day under, e.g. "September 24, 2026".
        name,
        banner: `${MEDIA_BASE_URL}banner/${format({ month: "long" }).toLowerCase()}/daily-grace-${iso}.webp`,
    };
}

const dailyBanner = document.getElementById("daily-banner");

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

const dailyReflectionToggle = document.getElementById("daily-reflection-toggle");
const dailyReflectionText = document.getElementById("daily-reflection-text");
const dailyReflectionAction = document.getElementById("daily-reflection-action");

function setReflectionExpanded(expanded) {
    dailyReflectionToggle.setAttribute("aria-expanded", String(expanded));
    dailyReflectionAction.textContent = expanded ? "Collapse reflection" : "Expand reflection";
}

dailyReflectionToggle.addEventListener("click", () => {
    setReflectionExpanded(dailyReflectionToggle.getAttribute("aria-expanded") !== "true");
});

// The banner, its heading and the reflection beneath it follow the day being
// shown, which the reader can swipe back through the past week. The rest of
// the page stays on today.
const heroBanner = document.querySelector(".hero-banner");
const dailyHeading = document.getElementById("daily-heading-text");
const dailyBookSymbol = document.getElementById("daily-book-symbol");
const bannerFlipbookLink = document.querySelector(".banner-flipbook-link");
dailyBookSymbol.onload = () => { dailyBookSymbol.hidden = false; };
dailyBookSymbol.onerror = () => { dailyBookSymbol.hidden = true; };

let shownDay = devotionalDay(0);
// verses.json by day name, once it arrives; false if it could not be loaded.
let versesByDay = null;

function showDayVerse() {
    if (!versesByDay) {
        dailyReflectionToggle.disabled = true;
        dailyReflectionAction.textContent = "";
        dailyReflectionText.textContent = versesByDay === false
            ? "Today's reflection is unavailable. Please try again later."
            : "Loading today's reflection…";
        return;
    }
    const verse = versesByDay.get(shownDay.name);
    if (!verse) {
        dailyBookSymbol.hidden = true;
        dailyBookSymbol.removeAttribute("src");
        dailyReflectionToggle.disabled = true;
        dailyReflectionAction.textContent = "";
        dailyReflectionText.textContent = "This day's reflection is unavailable.";
        return;
    }
    const book = verse.verse.replace(/\s+\d.*$/, "").trim();
    const symbol = bookSymbolUrl(MEDIA_BASE_URL, book);
    if (dailyBookSymbol.getAttribute("src") !== symbol) dailyBookSymbol.src = symbol;
    dailyReflectionText.textContent = verse.reflection;
    dailyReflectionToggle.disabled = false;
    setReflectionExpanded(false);
}

// Warm the cache for the banners one swipe away, so they are ready to slide in.
const preloadedBanners = new Set();
function preloadBanner(daysAgo) {
    if (daysAgo < 0 || daysAgo > PAST_DAYS) return;
    const { banner } = devotionalDay(daysAgo);
    if (preloadedBanners.has(banner)) return;
    preloadedBanners.add(banner);
    new Image().src = banner;
}

function showDay(daysAgo) {
    const day = devotionalDay(daysAgo);
    shownDay = day;
    dailyBanner.src = day.banner;
    dailyBanner.alt = `Daily Grace devotional for ${day.name}`;
    dailyHeading.textContent = daysAgo
        ? `Your Daily Grace for ${day.name.replace(/, \d+$/, "")}`
        : "Your Daily Grace Today";
    // An earlier day opens the Flipbook on the week that day belongs to.
    const flipbookLabel = daysAgo
        ? `Open the Flipbook for the week of ${day.name}`
        : "Open this week's Flipbook";
    bannerFlipbookLink.href = daysAgo
        ? `apps/pages/flipbook.html?date=${day.iso}`
        : "apps/pages/flipbook.html";
    bannerFlipbookLink.setAttribute("aria-label", flipbookLabel);
    bannerFlipbookLink.title = flipbookLabel;
    showDayVerse();
    preloadBanner(daysAgo + 1);
    preloadBanner(daysAgo - 1);
}

fetch("assets/verses.json")
    .then((response) => {
        if (!response.ok)
            throw new Error(
                `Unable to load assets/verses.json (${response.status})`,
            );
        return response.json();
    })
    .then((verses) => {
        versesByDay = new Map(verses.map((item) => [item.id, item]));
        showDayVerse();
        const today = devotionalDay(0).name;
        const currentVerse = versesByDay.get(today);
        if (!currentVerse) throw new Error(`No verse found for ${today}`);
        document.getElementById("reflection-text").textContent =
            currentVerse.reflection;
    })
    .catch((error) => {
        console.warn("Today's devotional could not be loaded:", error);
        document.getElementById("reflection-text").textContent =
            "Please check the daily devotional data.";
        if (!versesByDay) {
            versesByDay = false;
            showDayVerse();
        }
    });

// Swiping the banner to the right pulls in the day before, up to a week back,
// like paging back through a book, and swiping left comes forward again. Today
// is as far forward as it goes: tomorrow's devotional is not out yet. With the
// banner focused, the arrow keys do the same.
// The reader's finger is followed only once a press has clearly moved sideways;
// an upward or downward one is left to scroll the page.
const DRAG_SLOP = 8;
// Share of the banner's width a swipe must travel to change the day.
const SWIPE_SHARE = 0.18;
// Longest a slide waits, in ms, for the next day's banner to finish loading.
const BANNER_DECODE_WAIT = 300;
let bannerDrag = null;
let bannerSliding = false;
let suppressBannerClick = false;

// -1 steps back a day (a swipe to the right), +1 steps forward.
function canStep(step) {
    const target = shownDay.daysAgo - step;
    return target >= 0 && target <= PAST_DAYS;
}

function setBannerOffset(px) {
    dailyBanner.style.transform = px ? `translateX(${px}px)` : "";
}

async function stepDay(step, fromOffset = 0) {
    if (bannerSliding || !canStep(step)) return;
    const target = shownDay.daysAgo - step;
    if (reducedMotionQuery.matches) {
        setBannerOffset(0);
        showDay(target);
        return;
    }
    bannerSliding = true;
    // Stepping back carries the old banner off to the right and brings the
    // earlier day in from the left, the way a swipe to the right pulls it in.
    const away = (step < 0 ? 1 : -1) * heroBanner.clientWidth;
    const leaving = dailyBanner.animate(
        [
            { transform: `translateX(${fromOffset}px)`, opacity: 1 },
            { transform: `translateX(${away}px)`, opacity: 0 },
        ],
        { duration: 180, easing: "cubic-bezier(.4, 0, 1, 1)", fill: "forwards" },
    );
    await leaving.finished.catch(() => {});
    setBannerOffset(0);
    showDay(target);
    // Hold the new banner off stage until it can be drawn, so it never slides
    // in half loaded, but only briefly: on a slow connection the reader keeps
    // swiping and the banner fills in where it lands. A missing banner still
    // comes in, showing its alt text.
    await Promise.race([
        dailyBanner.decode().catch(() => {}),
        new Promise((resolve) => setTimeout(resolve, BANNER_DECODE_WAIT)),
    ]);
    leaving.cancel();
    await dailyBanner.animate(
        [
            { transform: `translateX(${-away}px)`, opacity: 0 },
            { transform: "none", opacity: 1 },
        ],
        { duration: 280, easing: "cubic-bezier(.2, .9, .25, 1)" },
    ).finished.catch(() => {});
    bannerSliding = false;
}

function snapBannerBack(fromOffset) {
    setBannerOffset(0);
    if (!fromOffset || reducedMotionQuery.matches) return;
    dailyBanner.animate(
        [{ transform: `translateX(${fromOffset}px)` }, { transform: "none" }],
        { duration: 220, easing: "cubic-bezier(.2, .9, .25, 1)" },
    );
}

heroBanner.addEventListener("pointerdown", (event) => {
    if (bannerSliding || !event.isPrimary || event.button !== 0) return;
    bannerDrag = { id: event.pointerId, x: event.clientX, y: event.clientY, offset: 0, active: false };
});

heroBanner.addEventListener("pointermove", (event) => {
    if (!bannerDrag || event.pointerId !== bannerDrag.id) return;
    const dx = event.clientX - bannerDrag.x;
    const dy = event.clientY - bannerDrag.y;
    if (!bannerDrag.active) {
        if (Math.abs(dx) < DRAG_SLOP && Math.abs(dy) < DRAG_SLOP) return;
        if (Math.abs(dy) >= Math.abs(dx)) {
            bannerDrag = null;
            return;
        }
        bannerDrag.active = true;
        heroBanner.setPointerCapture(event.pointerId);
        heroBanner.classList.add("dragging");
    }
    // Pulling toward a day that is not there gives a little, then resists.
    const step = dx > 0 ? -1 : 1;
    bannerDrag.offset = canStep(step) ? dx : dx / 4;
    setBannerOffset(bannerDrag.offset);
});

function endBannerDrag(event) {
    if (!bannerDrag || event.pointerId !== bannerDrag.id) return;
    const { active, offset } = bannerDrag;
    bannerDrag = null;
    if (!active) return;
    heroBanner.classList.remove("dragging");
    // The press was a swipe, not a tap on the Flipbook button beneath it.
    suppressBannerClick = true;
    setTimeout(() => { suppressBannerClick = false; });
    const step = offset > 0 ? -1 : 1;
    const far = Math.abs(offset) >= heroBanner.clientWidth * SWIPE_SHARE;
    if (event.type === "pointerup" && far && canStep(step)) {
        stepDay(step, offset);
    } else {
        snapBannerBack(offset);
    }
}

heroBanner.addEventListener("pointerup", endBannerDrag);
heroBanner.addEventListener("pointercancel", endBannerDrag);
heroBanner.addEventListener("click", (event) => {
    if (!suppressBannerClick) return;
    event.preventDefault();
    event.stopPropagation();
}, true);

heroBanner.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    stepDay(event.key === "ArrowLeft" ? -1 : 1);
});

showDay(0);

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
