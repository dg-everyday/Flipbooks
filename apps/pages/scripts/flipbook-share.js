/**
 * Sharing the week from the Flipbook (apps/pages/flipbook.html). The week's
 * cover page carries a share button (<flip-book>'s `share` page option). A tap
 * shares a link to the Flipbook itself, never a picture, so whoever receives it
 * taps it and the Flipbook opens on the same week: through the device's own
 * share sheet where there is one, and by copying the link where there is not.
 *
 * The link is the public Flipbook address with ?date=; its preview in a chat or
 * a post is the page's own Open Graph card.
 *
 * Usage   import { setUpShare } from "./scripts/flipbook-share.js";
 *         setUpShare(flipBookElement, { date: "2026-11-20" });
 *         // and give the cover page { share: true }
 */

const SITE_PAGE = "https://dailygrace.faith/apps/pages/flipbook.html";
const NOTE_FOR = 1800; // ms a note shows

/** The public link to the week holding `date` (YYYY-MM-DD). */
export function shareUrl(date) {
    const url = new URL(SITE_PAGE);
    if (/^\d{4}-\d{2}-\d{2}$/.test(date ?? "")) {
        url.searchParams.set("date", date);
    }
    return url.href;
}

/** "November 15 – 21, 2026": the Sunday-to-Saturday week holding `date`. */
export function weekName(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? "")) {
        return "";
    }
    const day = new Date(`${date}T00:00:00Z`);
    const sunday = new Date(day.getTime() - day.getUTCDay() * 86_400_000);
    const saturday = new Date(sunday.getTime() + 6 * 86_400_000);
    return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).formatRange(
        sunday,
        saturday,
    );
}

export function setUpShare(reader, { date } = {}) {
    const url = shareUrl(date);
    const week = weekName(date);
    const title = week ? `Daily Grace Flipbook for the week of ${week}` : "Daily Grace Flipbook";
    let sharing = false;

    // A short word at the foot of the screen: "Link copied".
    const note = document.createElement("p");
    note.className = "share-note";
    note.setAttribute("role", "status");
    note.hidden = true;
    document.body.append(note);
    let noteTimer = 0;
    function say(words) {
        clearTimeout(noteTimer);
        note.textContent = words;
        note.hidden = false;
        noteTimer = setTimeout(() => {
            note.hidden = true;
        }, NOTE_FOR);
    }

    async function copy() {
        try {
            await navigator.clipboard.writeText(url);
            say("Link copied");
        } catch {
            say("Couldn't copy the link");
        }
    }

    async function share() {
        if (sharing) {
            return;
        }
        if (!navigator.share) {
            await copy();
            return;
        }
        sharing = true;
        try {
            // The link goes in `url` alone; putting it in `text` as well makes
            // some apps paste it twice.
            await navigator.share({ title, text: title, url });
        } catch (error) {
            // The reader closed the share sheet without choosing anything.
            if (error.name === "AbortError") {
                return;
            }
            console.warn("The Flipbook link could not be shared:", error);
            await copy();
        } finally {
            sharing = false;
        }
    }

    reader.addEventListener("pageshare", () => {
        share();
    });
}
