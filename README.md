# Daily Grace Flipbooks

## Daily social preview image

The Pages workflow (`.github/workflows/pages.yml`) generates the `og:image` URL
directly in the published HTML using the current date in `Asia/Manila`.
It runs on pushes to `main`, manually, and daily at 00:07 Philippine time.
GitHub can delay scheduled runs, so the change is not guaranteed at midnight.

In GitHub repository Settings → Pages → Build and deployment, select
**GitHub Actions** as the source, then push this workflow to `main`.
Keep the custom domain set to `dailygrace.faith` in Pages settings.
The generated HTML is deployed as an artifact; it is not committed back to Git.
Social platforms may cache previously fetched previews.

For local previews, run `node assets/scripts/update-social-image.mjs` before starting
the local server. A plain static local server does not regenerate the date.

Runtime media is served from `https://dailygrace.faith/media/` (Cloudflare R2).

Publish the contents of `reader/images/` under `/media/images/` and
`reader/audio/` under `/media/audio/`, preserving filename case and spaces.
Keep `apps/pages/flipbook.html` on the website at `/apps/pages/flipbook.html`.
The homepage links to this application page; `/media/` is the R2 media endpoint.
The availability-page logo uses the local `assets/images/dg-icon-5.webp`.
The flipbook's other decorative images from `assets/images/` must be available under
`/media/assets/images/` (including `wire-binding.svg`). The wire binding also has a bundled local fallback
so it remains visible if the R2 object is unavailable.
The reader continues to load scripts, styles, and verse data from `/assets/`.

Changing these source URLs does not upload files to R2 or configure Cloudflare routing.

See [Cloudflare R2 setup](docs/r2-setup.md) for Worker code, DNS configuration, and troubleshooting.
