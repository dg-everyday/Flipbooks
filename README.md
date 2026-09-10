# Daily Grace Flipbooks

Runtime media is served from `https://dailygrace.faith/media/` (Cloudflare R2).

Publish the contents of `reader/images/` under `/media/images/` and
`reader/audio/` under `/media/audio/`, preserving filename case and spaces.
Keep `reader/flipbook-reader.html` on the website at `/reader/flipbook-reader.html`.
The homepage links to this application page; `/media/` is the R2 media endpoint.
The availability-page logo uses the local `assets/images/dg-icon-5.png`.
The flipbook's other decorative images from `assets/images/` must be available under
`/media/assets/images/` (including `wire-binding.svg`). The wire binding also has a bundled local fallback
so it remains visible if the R2 object is unavailable.
The reader continues to load scripts, styles, and verse data from `/assets/`.

Changing these source URLs does not upload files to R2 or configure Cloudflare routing.

See [Cloudflare R2 setup](docs/r2-setup.md) for Worker code, DNS configuration, and troubleshooting.
