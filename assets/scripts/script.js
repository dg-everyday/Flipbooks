// const MEDIA_BASE_URL = 'https://dailygrace.faith/media/';
const MEDIA_BASE_URL = "http://localhost:9001/media/";
const today = new Date();
const monthFolder = today.toLocaleString("en-US", { month: "long" });
const month = monthFolder.toLowerCase();
const dateName = today.toLocaleDateString("en-US", {
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

let devotionalEntries = null;
let devotionalLoadFailed = false;
const searchForm = document.getElementById("devotional-search");
const searchQuery = document.getElementById("search-query");
const searchClear = document.getElementById("search-clear");
const searchResults = document.getElementById("search-results");
const bibleBookSuggestions = document.getElementById("bible-books");
let bibleBooksLoading = null;

function loadBibleBookSuggestions() {
    // Load the SQLite database only when the search field is first used.
    if (bibleBooksLoading) return bibleBooksLoading;
    bibleBooksLoading = initDatabase()
        .then(() => {
            const options = getBooks().map((book) => {
                const option = document.createElement("option");
                option.value = book;
                return option;
            });
            bibleBookSuggestions.replaceChildren(...options);
        })
        .catch((error) => {
            // Keep manual search available and retry on the next focus.
            bibleBooksLoading = null;
            console.warn("Bible book suggestions could not be loaded:", error);
        });
    return bibleBooksLoading;
}

searchQuery.addEventListener("focus", loadBibleBookSuggestions);

function searchDevotionals() {
    const query = searchQuery.value.trim().toLocaleLowerCase();
    searchResults.replaceChildren();
    searchResults.hidden = !query;
    if (!query) return;

    const status = document.createElement("p");
    status.setAttribute("role", "status");
    searchResults.append(status);
    if (!devotionalEntries) {
        status.textContent = devotionalLoadFailed
            ? "Devotionals could not be loaded. Please refresh the page to try again."
            : "Loading devotionals…";
        return;
    }

    const matches = devotionalEntries.filter((entry) =>
        [entry.id, entry.verse, entry.text, entry.reflection].some((value) =>
            String(value || "")
                .toLocaleLowerCase()
                .includes(query),
        ),
    );
    status.textContent = matches.length
        ? `${matches.length} devotional${matches.length === 1 ? "" : "s"} found.`
        : "No devotionals found. Try a date, Bible reference, or keyword.";
    for (const entry of matches) {
        const article = document.createElement("article");
        const heading = document.createElement("h2");
        heading.textContent = `${entry.verse} · ${entry.id}`;
        const verse = document.createElement("p");
        verse.textContent = entry.text;
        const reflection = document.createElement("p");
        reflection.textContent = entry.reflection;
        article.append(heading, verse, reflection);
        searchResults.append(article);
    }
}

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchDevotionals();
});
searchQuery.addEventListener("input", () => {
    searchClear.hidden = !searchQuery.value;
    if (!searchQuery.value.trim()) {
        searchResults.replaceChildren();
        searchResults.hidden = true;
    }
});
searchClear.addEventListener("click", () => {
    searchQuery.value = "";
    searchClear.hidden = true;
    searchResults.replaceChildren();
    searchResults.hidden = true;
    searchQuery.focus();
});

const posterCard = document.getElementById("poster-card");
const dailyPoster = document.getElementById("daily-poster");
const posterPath = `${MEDIA_BASE_URL}images/sources/${month}/${dateName}`;
const todayAudioUrl = `${MEDIA_BASE_URL}audio/${monthFolder}/mp3/${dateName}.mp3`;
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
        devotionalEntries = verses;
        if (!searchResults.hidden) searchDevotionals();
        const currentVerse = verses.find((item) => item.id === dateName);
        if (!currentVerse) throw new Error(`No verse found for ${dateName}`);

        document.getElementById("verse-text").textContent = currentVerse.text;
        document.getElementById("verse-reference").textContent =
            currentVerse.verse;
        document.getElementById("reflection-text").textContent =
            currentVerse.reflection;
    })
    .catch((error) => {
        devotionalLoadFailed = true;
        if (!searchResults.hidden) searchDevotionals();
        document.getElementById("verse-text").textContent = error.message;
        document.getElementById("reflection-text").textContent =
            "Please check the daily devotional data.";
    });

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

async function getSvgMetadataFromUrl(url) {
    const response = await fetch(url);
    if (!response.ok)
        throw new Error(`Failed to fetch SVG: ${response.status}`);
    return getSvgMetadata(await response.text());
}

async function getSvgMetadataFromFile(file) {
    return getSvgMetadata(await file.text());
}
