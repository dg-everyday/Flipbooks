/**
 * Sharing an earned sticker through the phone's share sheet (Messenger,
 * Viber, Facebook and the rest), the way the poster is shared
 * (poster-card.js): as a picture where the browser can share files, as a link
 * where it can only share links, and by copying the link where it has no
 * share sheet at all.
 *
 * The picture is a JPEG, which every chat app accepts; the WebP files are not
 * taken everywhere. JPEG has no transparency, so the die-cut sticker sits on
 * a cream square with a margin round it: the app's 600 px sticker, drawn at
 * its own size on an 800 px square, so it stays sharp and is quick to make.
 *
 * Safari refuses a share that comes too long after the tap, so call
 * prepareShare(sticker) when the sticker is shown: the picture is then ready
 * by the time the reader taps Share. If it was not, the first tap may only
 * finish making it, and shareSticker() says "retry".
 *
 * Usage
 *   import { prepareShare, shareSticker, SHARE_NOTES } from "./sticker-share.js";
 *   prepareShare(sticker);                     // when the sticker is shown
 *   const result = await shareSticker(sticker); // inside the Share tap
 *   note.textContent = SHARE_NOTES[result];
 *
 * shareSticker() resolves to one of:
 *   image        the picture went to the share sheet
 *   link         the link went to the share sheet (no file sharing here)
 *   cancelled    the reader closed the share sheet
 *   retry        Safari wants a second tap, now that the picture is ready
 *   copied       no share sheet: the sticker's link was copied
 *   copy-failed  no share sheet, and the link could not be copied
 */

import { stickerImage } from "./sticker-awards.js?v=20261018-1";

const SITE_URL = "https://dailygrace.faith/";
const SHARE_TYPE = "image/jpeg";
const SHARE_QUALITY = 0.9;
const BACKGROUND = "#fbf6ea";
// The margin round the sticker, as a share of the sticker's width.
const MARGIN = 1 / 6;

export const SHARE_NOTES = {
    image: "",
    link: "",
    cancelled: "",
    retry: "Tap Share again",
    copied: "Link to the sticker copied",
    "copy-failed": "Couldn't copy the link",
};

// Web Share with files: Chrome on Android and Windows, Safari on iPhone and Mac.
const CAN_SHARE_FILES = (() => {
    try {
        return Boolean(
            navigator.canShare?.({
                files: [new File([""], "test.jpg", { type: SHARE_TYPE })],
            }),
        );
    } catch {
        return false;
    }
})();

// The pictures made so far, by sticker id: { promise, file }.
const files = new Map();

async function makeFile(sticker) {
    const response = await fetch(stickerImage(sticker));
    if (!response.ok) {
        throw new Error(`Unable to load the sticker (${response.status})`);
    }
    const bitmap = await createImageBitmap(await response.blob());
    const margin = Math.round(bitmap.width * MARGIN);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width + margin * 2;
    canvas.height = bitmap.height + margin * 2;
    const context = canvas.getContext("2d");
    context.fillStyle = BACKGROUND;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, margin, margin);
    bitmap.close();
    const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
            (result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(new Error("Unable to encode the sticker"));
                }
            },
            SHARE_TYPE,
            SHARE_QUALITY,
        );
    });
    return new File([blob], `Daily Grace sticker - ${sticker.title}.jpg`, {
        type: SHARE_TYPE,
    });
}

/** Starts making the sticker's picture to share, once; resolves to the file. */
export function prepareShare(sticker) {
    if (!CAN_SHARE_FILES) {
        return Promise.resolve(null);
    }
    let entry = files.get(sticker.id);
    if (!entry) {
        entry = { file: null };
        entry.promise = makeFile(sticker).then(
            (file) => {
                entry.file = file;
                return file;
            },
            (error) => {
                // Forgotten, so the next try starts again.
                files.delete(sticker.id);
                throw error;
            },
        );
        entry.promise.catch(() => {});
        files.set(sticker.id, entry);
    }
    return entry.promise;
}

/** Shares the sticker; call it inside the reader's tap. See the outcomes above. */
export async function shareSticker(sticker) {
    const url = stickerImage(sticker, { full: true });
    const title = `${sticker.title} · a Daily Grace sticker`;
    const text = `I earned the "${sticker.title}" sticker in Daily Grace! ${SITE_URL}`;

    if (!navigator.share) {
        return (await copy(url)) ? "copied" : "copy-failed";
    }
    // Ready already, the file goes straight to share() inside the tap; still
    // being made, the wait may cost Safari's permission (see the catch).
    let file = files.get(sticker.id)?.file ?? null;
    try {
        if (CAN_SHARE_FILES && !file) {
            file = await prepareShare(sticker);
        }
        if (file && navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title, text });
            return "image";
        }
        await navigator.share({ title, text, url });
        return "link";
    } catch (error) {
        if (error.name === "AbortError") {
            return "cancelled";
        }
        if (error.name === "NotAllowedError" && file) {
            return "retry";
        }
        console.warn("The sticker could not be shared:", error);
        return (await copy(url)) ? "copied" : "copy-failed";
    }
}

async function copy(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // No Clipboard API (an insecure origin) or the write was refused: fall
        // back to the old selection copy.
        const field = document.createElement("textarea");
        field.value = text;
        field.setAttribute("readonly", "");
        field.style.cssText =
            "position:fixed;top:0;left:0;opacity:0;pointer-events:none;";
        document.body.append(field);
        field.select();
        let copied = false;
        try {
            copied = document.execCommand("copy");
        } catch {
            copied = false;
        }
        field.remove();
        return copied;
    }
}
