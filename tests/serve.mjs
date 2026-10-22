/**
 * A tiny static server for local testing: serves the repository folder the
 * way GitHub Pages serves the site, with no caching so every reload is fresh.
 *
 *   node tests/serve.mjs            → http://localhost:4173/
 *   PORT=8080 node tests/serve.mjs  → another port
 *
 * Playwright starts it by itself (see playwright.config.mjs).
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PORT = Number(process.env.PORT || 4173);

const TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mp3": "audio/mpeg",
    ".pdf": "application/pdf",
    ".wasm": "application/wasm",
    ".db": "application/octet-stream",
};

createServer(async (request, response) => {
    const url = new URL(request.url, `http://localhost:${PORT}`);
    let path = normalize(join(ROOT, decodeURIComponent(url.pathname)));
    // Never serve anything outside the repository folder.
    if (path !== ROOT && !path.startsWith(ROOT + sep)) {
        response.writeHead(403).end("Forbidden");
        return;
    }
    try {
        if ((await stat(path)).isDirectory()) {
            path = join(path, "index.html");
        }
        const body = await readFile(path);
        response.writeHead(200, {
            "Content-Type": TYPES[extname(path).toLowerCase()] || "application/octet-stream",
            "Cache-Control": "no-store",
        });
        response.end(body);
    } catch {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
    }
}).listen(PORT, () => {
    console.log(`Daily Grace on http://localhost:${PORT}/`);
});
