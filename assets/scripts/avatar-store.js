/**
 * The reader's avatar: which Bible hero they chose as their picture in Daily
 * Grace, kept on this device.
 *
 * The avatars are assets/avatars.json; their pictures are on the media host
 * under images/avatars/adults/: <file> (512 × 512) and <thumbnail> (128 × 128),
 * round, on a transparent background. AV-00, the dove, stands for a reader who
 * has not chosen yet, so it is never offered as a choice.
 *
 * Kept in localStorage (when it is available), on this device only:
 *   dailygrace:avatar   the chosen avatar's id, "AV-01" … ; missing until chosen
 *
 * Exports      loadAvatars()          the avatars to choose from (without the dove)
 *              chosenAvatarId()       the chosen id, or null
 *              hasAvatar()            whether one has been chosen
 *              chooseAvatar(id)       keeps the choice and announces it
 *              avatarImage(avatar, { thumbnail })  its picture's URL
 * Events       "dailygrace:avatarchange" on window, detail: { id }
 */

import { MEDIA_BASE_URL } from "../../apps/settings/settings.js?v=20261009-1";

const AVATARS_URL = new URL("../avatars.json", import.meta.url).href;
const IMAGE_BASE = `${MEDIA_BASE_URL}images/avatars/adults/`;
const STORE_KEY = "dailygrace:avatar";
const UNCHOSEN = "AV-00";
export const AVATAR_CHANGE = "dailygrace:avatarchange";

let avatarsRequest = null;

/** The avatars to choose from, in their order, without the dove. */
export function loadAvatars() {
    if (!avatarsRequest) {
        avatarsRequest = fetch(AVATARS_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Unable to load ${AVATARS_URL} (${response.status})`);
                }
                return response.json();
            })
            .then((list) => list.filter((avatar) => avatar.id !== UNCHOSEN))
            .catch((error) => {
                avatarsRequest = null;
                throw error;
            });
    }
    return avatarsRequest;
}

/** The chosen avatar's id, or null when none has been chosen (or storage is blocked). */
export function chosenAvatarId() {
    try {
        const id = localStorage.getItem(STORE_KEY);
        return id && id !== UNCHOSEN ? id : null;
    } catch {
        return null;
    }
}

export function hasAvatar() {
    return chosenAvatarId() !== null;
}

/** Keeps the choice and tells the page; returns whether it could be kept. */
export function chooseAvatar(id) {
    let kept = true;
    try {
        localStorage.setItem(STORE_KEY, id);
    } catch {
        // Private window or blocked storage: the choice lasts for this visit.
        kept = false;
    }
    window.dispatchEvent(new CustomEvent(AVATAR_CHANGE, { detail: { id } }));
    return kept;
}

export function avatarImage(avatar, { thumbnail = false } = {}) {
    return `${IMAGE_BASE}${thumbnail ? avatar.thumbnail : avatar.file}`;
}
