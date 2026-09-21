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

let posterFlipId = 0;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// Turn the poster like a page: it swings edge-on, the image swaps while it is
// invisible, then the other side swings back in.
async function togglePoster() {
    showingComic = !showingComic;
    posterCard.setAttribute(
        "aria-label",
        showingComic
            ? "Show today's regular poster"
            : "Show comic version of today's poster",
    );

    const flipId = ++posterFlipId;
    const nextSrc = `${posterPath}${showingComic ? " - Comic" : ""}.webp`;
    // Start loading now so the swap does not show a half-loaded image.
    const preload = new Image();
    preload.src = nextSrc;
    const ready = preload.decode().catch(() => {});

    if (reducedMotion.matches || !dailyPoster.animate) {
        await ready;
        if (flipId === posterFlipId) dailyPoster.src = nextSrc;
        return;
    }

    dailyPoster.getAnimations().forEach((animation) => animation.cancel());
    const turn = (angle) => `perspective(1400px) rotateY(${angle}deg)`;
    const out = dailyPoster.animate(
        [
            { transform: turn(0), opacity: 1 },
            { transform: turn(-90), opacity: 0.55 },
        ],
        { duration: 240, easing: "ease-in", fill: "forwards" },
    );
    await Promise.all([out.finished.catch(() => {}), ready]);
    // A newer click owns the image now; it has already cancelled this flip.
    if (flipId !== posterFlipId) return;

    dailyPoster.src = nextSrc;
    dailyPoster.animate(
        [
            { transform: turn(90), opacity: 0.55 },
            { transform: turn(0), opacity: 1 },
        ],
        { duration: 300, easing: "ease-out" },
    );
    out.cancel();
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
