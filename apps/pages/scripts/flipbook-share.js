/**
 * Sharing the week from the Flipbook (apps/pages/flipbook.html). The week's
 * cover page carries a share button (<flip-book>'s `share` page option). A tap
 * sends the cover picture through the device's own share sheet, as the share
 * button on the home page's poster does (poster-card.js): as a picture where
 * the browser can share files, as a link where it can only share links, and by
 * copying the link where it has no share sheet at all.
 *
 * The link is the public Flipbook address with ?date=, so whoever opens it
 * sees the same week; its preview is the page's own Open Graph card.
 *
 * Usage   import { setUpShare } from "./scripts/flipbook-share.js";
 *         const share = setUpShare(flipBookElement, { date: "2026-11-20" });
 *         share.prepare(coverSrc); // make the picture ready while the reader looks
 *         // and give the cover page { share: true }
 */

const SITE_PAGE = "https://dailygrace.faith/apps/pages/flipbook.html";
// Safari refuses a share that comes too long after the tap, as the first one
// can while the picture is still being made; by the second tap it is ready.
const RETRY_NOTE = "Tap share again";
const NOTE_FOR = 1800; // ms a note shows

const SHARE_TYPE = "image/jpeg";
const SHARE_QUALITY = 0.9;
const SHARE_MAX_SIDE = 2048; // px on the picture's long side, as on the home page's poster
// Web Share with files: Chrome on Android and Windows, Safari on iPhone and Mac.
const CAN_SHARE_FILES = (() => {
    try {
        return Boolean(navigator.canShare?.({ files: [new File([""], "test.jpg", { type: SHARE_TYPE })] }));
    } catch {
        return false;
    }
})();

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

/** The picture at `src` as a JPEG file to share (sites take JPEG more readily than WebP). */
async function pictureFile(src, name) {
    const response = await fetch(src);
    if (!response.ok) {
        throw new Error(`Unable to load ${src} (${response.status})`);
    }
    const bitmap = await createImageBitmap(await response.blob());
    try {
        const scale = Math.min(1, SHARE_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        const context = canvas.getContext("2d");
        context.fillStyle = "#fff"; // JPEG has no see-through
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.imageSmoothingQuality = "high";
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(
                (result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(new Error("Unable to encode the picture"));
                    }
                },
                SHARE_TYPE,
                SHARE_QUALITY,
            );
        });
        return new File([blob], `${name}.jpg`, { type: SHARE_TYPE });
    } finally {
        bitmap.close();
    }
}

export function setUpShare(reader, { date } = {}) {
    const url = shareUrl(date);
    const week = weekName(date);
    const title = week ? `Daily Grace for the week of ${week}` : "Daily Grace";
    const text = `${title} · ${url}`;
    const fileName = week ? `Daily Grace - Week of ${week}` : "Daily Grace";
    const files = new Map(); // src → { file, promise }
    let sharing = false;

    // A short word at the foot of the screen: "Link copied", "Tap share again".
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

    /** The picture at `src` as a file to share, made once. */
    function fileFor(src) {
        if (!CAN_SHARE_FILES || !src) {
            return Promise.resolve(null);
        }
        let entry = files.get(src);
        if (!entry) {
            entry = { file: null, promise: null };
            entry.promise = pictureFile(src, fileName).then(
                (file) => {
                    entry.file = file;
                    return file;
                },
                (error) => {
                    // A blip loading the picture should not stop a later tap from trying again.
                    console.warn("The cover could not be prepared for sharing:", error);
                    files.delete(src);
                    return null;
                },
            );
            files.set(src, entry);
        }
        return entry.promise;
    }

    async function copy() {
        try {
            await navigator.clipboard.writeText(url);
            say("Link copied");
        } catch {
            say("Couldn't copy the link");
        }
    }

    async function share(src) {
        if (sharing) {
            return;
        }
        if (!navigator.share) {
            await copy();
            return;
        }
        sharing = true;
        // Ready already, the file goes straight to share() inside the tap; still
        // being made, the wait may cost Safari's permission (see the catch).
        let file = files.get(src)?.file;
        try {
            if (file == null) {
                file = await fileFor(src);
            }
            if (file && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title, text });
            } else {
                await navigator.share({ title, text, url });
            }
        } catch (error) {
            // The reader closed the share sheet without choosing anything.
            if (error.name === "AbortError") {
                return;
            }
            if (error.name === "NotAllowedError" && file) {
                say(RETRY_NOTE);
                return;
            }
            console.warn("The cover could not be shared:", error);
            await copy();
        } finally {
            sharing = false;
        }
    }

    reader.addEventListener("pageshare", (event) => {
        share(event.detail.src);
    });

    return {
        /** Makes the picture at `src` ready to share, when the browser is idle. */
        prepare(src) {
            if (!CAN_SHARE_FILES || !src) {
                return;
            }
            const idle = window.requestIdleCallback ?? ((callback) => setTimeout(callback, 200));
            idle(() => fileFor(src));
        },
    };
}
