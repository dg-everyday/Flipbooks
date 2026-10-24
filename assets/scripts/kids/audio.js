/**
 * Daily Grace Kids: the voice and the sound effects.
 *
 * The voice (the story, Nari, the instructions) is one line at a time: a new
 * line stops the one playing. Sound effects can overlap. Phones only let a
 * page make sound once the reader has touched it, so the first touch unlocks
 * both. Nothing here ever holds up the page: a file that can't load or play
 * (offline, an old phone, sound blocked) is simply skipped, and say() still
 * resolves, so a step never waits for a sound.
 *
 * Usage
 *   const audio = createAudio(resolveMedia);
 *   audio.configure({ sound: true, narration: true });
 *   await audio.say(url);      // resolves when the line ends, fails or is stopped
 *   audio.sfx(url);            // fire and forget
 *   audio.stop();
 */

// A line that never reports its end (a stalled download) still lets go.
const MAX_LINE_MS = 45_000;

export function createAudio(resolve = (url) => url) {
    let sound = true;
    let narration = true;
    let unlocked = false;
    let ctx = null;
    const buffers = new Map();
    const voice = typeof Audio === "function" ? new Audio() : null;
    let current = null;
    const listeners = new Set();

    if (voice) {
        voice.preload = "auto";
    }

    function emit(state) {
        for (const fn of listeners) {
            try {
                fn(state);
            } catch {
                /* a listener's mistake is not the player's */
            }
        }
    }

    function unlock() {
        if (unlocked) {
            return;
        }
        unlocked = true;
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            ctx = Ctx ? new Ctx() : null;
            ctx?.resume?.().catch(() => {});
        } catch {
            ctx = null;
        }
    }

    if (typeof document !== "undefined") {
        const first = () => {
            unlock();
            document.removeEventListener("pointerdown", first, true);
            document.removeEventListener("keydown", first, true);
        };
        document.addEventListener("pointerdown", first, true);
        document.addEventListener("keydown", first, true);
    }

    function finish(line, result) {
        if (current === line) {
            current = null;
            emit({ playing: false });
        }
        clearTimeout(line.timer);
        line.resolve(result);
    }

    /** Plays a voice line; resolves to "ended", "stopped", "skipped" or "failed". */
    function say(url, { force = false } = {}) {
        stop();
        if (!voice || !url || !sound || (!narration && !force)) {
            return Promise.resolve("skipped");
        }
        return new Promise((resolveLine) => {
            const line = { resolve: resolveLine, timer: 0 };
            current = line;
            const src = resolve(url);
            const onEnded = () => finish(line, "ended");
            const onError = () => finish(line, "failed");
            voice.onended = onEnded;
            voice.onerror = onError;
            line.timer = setTimeout(() => finish(line, "failed"), MAX_LINE_MS);
            try {
                // The same line again plays from memory, unless it failed last
                // time (a dropped connection): then it is fetched again.
                if (voice.src !== src || voice.error) {
                    voice.src = src;
                }
                voice.currentTime = 0;
                const played = voice.play();
                emit({ playing: true, url });
                if (played && typeof played.catch === "function") {
                    played.catch(() => finish(line, "failed"));
                }
            } catch {
                finish(line, "failed");
            }
        });
    }

    function stop() {
        if (current) {
            const line = current;
            try {
                voice.pause();
            } catch {
                /* nothing to stop */
            }
            finish(line, "stopped");
        }
    }

    async function load(url) {
        if (!ctx) {
            return null;
        }
        if (!buffers.has(url)) {
            const request = fetch(resolve(url))
                .then((r) => {
                    if (!r.ok) {
                        throw new Error(String(r.status));
                    }
                    return r.arrayBuffer();
                })
                .then((data) => new Promise((ok, fail) => ctx.decodeAudioData(data, ok, fail)))
                .catch(() => null);
            buffers.set(url, request);
        }
        return buffers.get(url);
    }

    /** Plays a sound effect, overlapping anything else; never throws. */
    function sfx(url) {
        if (!sound || !url) {
            return;
        }
        if (ctx) {
            load(url).then((buffer) => {
                if (!buffer || !sound) {
                    return;
                }
                try {
                    const node = ctx.createBufferSource();
                    node.buffer = buffer;
                    node.connect(ctx.destination);
                    node.start();
                } catch {
                    /* the sound is a nicety */
                }
            });
            return;
        }
        if (typeof Audio === "function") {
            try {
                const a = new Audio(resolve(url));
                a.play()?.catch?.(() => {});
            } catch {
                /* the sound is a nicety */
            }
        }
    }

    /** Fetches and decodes sound effects ahead of use, once sound is unlocked. */
    function preload(urls) {
        for (const url of urls) {
            load(url);
        }
    }

    return {
        say,
        stop,
        sfx,
        preload,
        unlock,
        configure(options) {
            if (typeof options.sound === "boolean") {
                sound = options.sound;
            }
            if (typeof options.narration === "boolean") {
                narration = options.narration;
            }
            if (!sound || !narration) {
                stop();
            }
        },
        get playing() {
            return Boolean(current);
        },
        onchange(fn) {
            listeners.add(fn);
            return () => listeners.delete(fn);
        },
    };
}
