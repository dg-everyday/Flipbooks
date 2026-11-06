/**
 * My Faith Journal: the Backup & restore dialog (journal.js opens it).
 *
 *   Back up    a password, typed twice, locks a file holding the journal and
 *              everything else Daily Grace keeps on this device
 *              (assets/scripts/journal/backup.js). The phone's share sheet
 *              offers it to Files, Drive or email where it can; otherwise it
 *              downloads. The day of the last backup is kept in the journal.
 *   Restore    a backup file and its password: what it holds is shown first,
 *              then the reader chooses to join it with this device's journal
 *              or to put it in place of it. Bookmarks and their notes are
 *              always joined, never taken away. The page reloads afterwards.
 *
 * A forgotten password cannot be recovered, and the dialog says so.
 */

import {
    BackupError,
    MIN_PASSWORD,
    makeBackup,
    openBackup,
    restoreBackup,
} from "../../../assets/scripts/journal/backup.js?v=20261106-3";
import { getMeta, setMeta } from "../../../assets/scripts/journal/store.js?v=20261106-3";
import { ICONS, escapeHtml, formatDay } from "./journal-ui.js?v=20261106-2";

const LAST_BACKUP = "lastBackup";

/** The day of the last backup made on this device, or null. */
export async function lastBackup() {
    return getMeta(LAST_BACKUP, null);
}

function message(error) {
    return error instanceof BackupError ? error.message : "Something went wrong. Please try again.";
}

/**
 * Hands a file to the share sheet (Files, Drive, email), or downloads it.
 * Resolves to "shared", "cancelled" or "downloaded". The Word book uses it too.
 */
export async function deliver(blob, fileName, { title = "My Faith Journal backup" } = {}) {
    const file = new File([blob], fileName, { type: blob.type || "application/octet-stream" });
    if (navigator.canShare?.({ files: [file] })) {
        try {
            await navigator.share({ files: [file], title });
            return "shared";
        } catch (error) {
            if (error?.name === "AbortError") {
                return "cancelled";
            }
            // Sharing failed: download it instead.
        }
    }
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement("a"), { href: url, download: fileName });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return "downloaded";
}

export async function openBackupDialog(dialog) {
    const last = await lastBackup();
    dialog.innerHTML = `
      <div class="dialog-frame">
        <header class="dialog-head">
          <h2 id="backup-title">Backup &amp; restore</h2>
          <button class="icon-button" type="button" data-close aria-label="Close">${ICONS.close}</button>
        </header>
        <section class="backup-part">
          <h3>Back up</h3>
          <p>Your journal lives only on this device. A backup keeps it safe if the phone is lost or the browser clears its data.
          ${last ? `Your last backup was on ${escapeHtml(formatDay(last, { weekday: false }))}.` : "You have not made a backup yet."}</p>
          <form class="backup-form">
            <label>Password <input name="password" type="password" minlength="${MIN_PASSWORD}" autocomplete="new-password" required /></label>
            <label>Password again <input name="again" type="password" minlength="${MIN_PASSWORD}" autocomplete="new-password" required /></label>
            <p class="warning">Write the password down. No one, not even Daily Grace, can open the backup without it.</p>
            <button class="button primary" type="submit">${ICONS.backup} Make a backup</button>
            <p class="dialog-note" role="status" aria-live="polite"></p>
          </form>
        </section>
        <section class="backup-part">
          <h3>Restore</h3>
          <form class="restore-form">
            <label>Backup file <input name="file" type="file" accept=".dgjournal,application/json" required /></label>
            <label>Its password <input name="password" type="password" autocomplete="current-password" required /></label>
            <button class="button" type="submit">Open the backup</button>
            <p class="dialog-note" role="status" aria-live="polite"></p>
          </form>
          <div class="restore-choice" hidden></div>
        </section>
      </div>`;

    const backupForm = dialog.querySelector(".backup-form");
    const restoreForm = dialog.querySelector(".restore-form");
    const choice = dialog.querySelector(".restore-choice");
    const note = (form, text, { error = false } = {}) => {
        const element = form.querySelector(".dialog-note");
        element.textContent = text;
        element.classList.toggle("error", error);
    };

    backupForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const { password, again } = backupForm.elements;
        if (password.value !== again.value) {
            note(backupForm, "The two passwords are not the same.", { error: true });
            return;
        }
        const button = backupForm.querySelector("button");
        button.disabled = true;
        note(backupForm, "Making your backup…");
        try {
            const { blob, fileName, summary } = await makeBackup(password.value);
            const how = await deliver(blob, fileName);
            if (how === "cancelled") {
                note(backupForm, "The backup was not saved.");
                return;
            }
            const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
            await setMeta(LAST_BACKUP, today);
            note(
                backupForm,
                `Backed up: ${summary.entries} entries, ${summary.bookmarks} bookmarks, ${summary.stickers} stickers. Keep the file somewhere safe.`,
            );
            backupForm.reset();
        } catch (error) {
            note(backupForm, message(error), { error: true });
        } finally {
            button.disabled = false;
        }
    });

    restoreForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const { file, password } = restoreForm.elements;
        const button = restoreForm.querySelector("button");
        button.disabled = true;
        choice.hidden = true;
        note(restoreForm, "Opening the backup…");
        try {
            const payload = await openBackup(file.files[0], password.value);
            const { summary } = payload;
            note(restoreForm, "");
            choice.innerHTML = `
              <p>This backup was made on <strong>${escapeHtml(formatDay(summary.created.slice(0, 10), { weekday: false }))}</strong>.
              It holds ${summary.entries} journal entries${summary.years.length ? ` (${escapeHtml(summary.years.join(", "))})` : ""},
              ${summary.bookmarks} bookmarks and ${summary.stickers} stickers.</p>
              <p class="dialog-note">Your bookmarks and their notes are always kept: the backup's are added to them.</p>
              <div class="choice-buttons">
                <button class="button primary" type="button" data-mode="merge">Join it with this device's journal</button>
                <button class="button" type="button" data-mode="replace">Put it in place of this device's journal</button>
              </div>`;
            choice.hidden = false;
            choice.querySelectorAll("[data-mode]").forEach((choose) => {
                choose.addEventListener("click", async () => {
                    const mode = choose.dataset.mode;
                    if (
                        mode === "replace" &&
                        !confirm("Put the backup in place of this device's journal, stickers and progress? Your bookmarks and notes are kept.")
                    ) {
                        return;
                    }
                    choice.querySelectorAll("button").forEach((b) => (b.disabled = true));
                    try {
                        await restoreBackup(payload, { mode });
                        location.reload();
                    } catch (error) {
                        note(restoreForm, message(error), { error: true });
                    }
                });
            });
        } catch (error) {
            note(restoreForm, message(error), { error: true });
        } finally {
            button.disabled = false;
        }
    });

    // Set, not added: the dialog is opened again and again.
    dialog.onclick = (event) => {
        if (event.target === dialog || event.target.closest("[data-close]")) {
            dialog.close();
        }
    };
    dialog.showModal();
}
