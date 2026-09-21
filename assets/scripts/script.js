// const MEDIA_BASE_URL = 'https://dailygrace.faith/media/';
const MEDIA_BASE_URL = "http://localhost:9001/media/";
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

qrOpen.addEventListener("click", () => {
    if (qrDialog.open) return;
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

document.getElementById("qr-close").addEventListener("click", closeQr);
// Escape would close instantly; route it through the closing animation instead.
qrDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeQr();
});
// The dialog has no padding of its own, so a click on it directly is a click on the backdrop.
qrDialog.addEventListener("click", (event) => {
    if (event.target === qrDialog) closeQr();
});
