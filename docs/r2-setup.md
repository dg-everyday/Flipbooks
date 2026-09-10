# Cloudflare R2 setup for Daily Grace

This guide describes the intended configuration for `dailygrace.faith`.
Dashboard changes are separate from Git commits and pushes. Verify the live
checks below before treating setup as complete.

## Routing

- GitHub Pages (`dg-everyday/Flipbooks`) serves `/`, `/reader/flipbook-reader.html`, and `/assets/`.
- Cloudflare Worker `calm-bush-ae3c` serves only `dailygrace.faith/media/*` from the existing R2 bucket `dailygrace`.
- Worker production URL: `https://calm-bush-ae3c.edwinvillapando.workers.dev`.
- Worker R2 binding variable: `MEDIA` (case-sensitive).

Do not attach the apex domain `dailygrace.faith` directly to the R2 bucket.
That sends the homepage to object storage and produces an R2 “Object not found”
response, even when individual media URLs work. DNS records cannot select URL
paths; the Worker route handles `/media/*`.

## Object paths

Keep the `media/` prefix in R2 object keys. For example:

```text
media/images/sources/october/October 12, 2026 - Comic.webp
media/images/coverpages/2026/2026-WEEK37.webp
media/images/coverpages/2026/2026-404.webp
media/audio/September/mp3/September 10, 2026.mp3
media/assets/images/specialty-paper.svg
media/assets/images/end-paper.svg
media/assets/images/wire-binding.svg
```

Upload former `reader/images/` contents under `media/images/` and former
`reader/audio/` contents under `media/audio/`. Preserve spaces, punctuation,
and capitalization: poster month folders are lowercase; audio month folders
use title case. Store actual spaces in object names, not literal `%20` strings.

The public URL is the domain followed by `/` and the object key. Do not strip
`media/` in the Worker and do not add a second `media/` prefix.

## 1. Create the Worker

1. Open Cloudflare **Workers & Pages → Create application**.
2. Choose **Start with Hello World**, then deploy. The generated name is fine;
   this setup uses `calm-bush-ae3c`.
3. Open the Worker and select **Edit code**.

Use the code editor, not the static-file upload screen. Uploading a JavaScript
file there does not configure it as executable Worker code.

## 2. Bind the existing R2 bucket

1. Open the Worker’s **Bindings → Add binding**.
2. Select **R2 bucket**, then **Add Binding**.
3. Set the variable name to `MEDIA`.
4. Select the existing `dailygrace` bucket and save.

The code displayed in the binding picker is an example, not replacement code
for this Worker. No API key is needed in the Worker source.

## 3. Deploy the Worker code

Replace the Hello World source with the following and click **Deploy**.
This is the basic GET/HEAD implementation supplied during setup; it serves
whole objects and does not implement byte-range audio seeking or edge caching.

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith("/media/")) {
      return new Response("Not found", { status: 404 });
    }

    if (!["GET", "HEAD"].includes(request.method)) {
      return new Response("Method not allowed", {
        status: 405,
        headers: { Allow: "GET, HEAD" }
      });
    }

    let key;
    try {
      // Preserve media/ and decode spaces in the existing R2 object key.
      key = decodeURIComponent(url.pathname.slice(1));
    } catch {
      return new Response("Invalid URL", { status: 400 });
    }

    const object = request.method === "HEAD"
      ? await env.MEDIA.head(key)
      : await env.MEDIA.get(key);

    if (!object) {
      return new Response("Object not found", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("ETag", object.httpEtag);
    headers.set("Content-Length", String(object.size));

    return new Response(
      request.method === "HEAD" ? null : object.body,
      { headers }
    );
  }
};
```

Set appropriate Content-Type metadata on uploaded objects, such as `image/webp`,
`image/png`, `image/svg+xml`, and `audio/mpeg`. The Worker preserves that metadata.

## 4. Test before switching the domain

In the Worker’s **Domains** tab, make sure the production `workers.dev` URL
is enabled. Open:

[Worker comic test](https://calm-bush-ae3c.edwinvillapando.workers.dev/media/images/sources/october/October%2012,%202026%20-%20Comic.webp)

The comic should appear. Stop and fix any error before changing the main domain.
Visiting the Worker’s root URL without `/media/...` intentionally returns 404.

## 5. Add the media route

Under the Worker’s **Domains → Add Route** (some dashboard versions put this
under **Settings → Domains & Routes**), enter:

- Zone: `dailygrace.faith`
- Route: `dailygrace.faith/media/*`
- Failure mode, if offered: **Fail closed**

Save the route. Use **Add Route**, not **Add Domain**. Do not use
`dailygrace.faith/*`, which would intercept the website as well.

## 6. Release the apex domain from R2

After the Worker image test succeeds and the route is configured:

1. Open **R2 Object Storage → dailygrace → Settings → Custom Domains**.
2. Remove the custom-domain connection for `dailygrace.faith`.
3. Keep the bucket and all objects.

This releases the locked R2 DNS record. The Worker continues to access the
bucket through its binding. Complete the DNS step immediately afterward;
the main domain can be temporarily unavailable during the switch.

## 7. Configure website DNS and GitHub Pages

In **dailygrace.faith → DNS → Records**, add four A records, each with name `@`,
TTL **Auto**, and proxy status **Proxied** (orange cloud):

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Keep the existing proxied `www` CNAME pointing to `dg-everyday.github.io`.
The apex records must remain proxied for the Worker route to run.

In GitHub **dg-everyday/Flipbooks → Settings → Pages**:

1. Confirm Pages is publishing the site successfully.
2. Confirm the custom domain is `dailygrace.faith`.
3. Enable **Enforce HTTPS** when its certificate is ready.

The repository’s root `CNAME` file must contain `dailygrace.faith`.

## Local UI images and application files

The availability-page logo intentionally uses the local file
`assets/images/dg-icon-5.png`. Its CSS URL is `../images/dg-icon-5.png`, resolved
relative to `assets/styles/flipbook-reader.css`.

The wire binding uses R2 with a bundled local fallback at
`assets/images/wire-binding.svg`. Publish that SVG with the website.
Other decorative images referenced under `/media/assets/images/` must exist
in R2 at the matching keys.

Keep the reader HTML on GitHub Pages at `/reader/flipbook-reader.html`.
Its scripts, stylesheets, and verse JSON remain under `/assets/`.
Both application scripts use `https://dailygrace.faith/media/` for media.
When changing CSS, increment its version query in `reader/flipbook-reader.html`
so browsers request the updated stylesheet.

## Verification and troubleshooting

After saving, allow a few minutes and check:

- `https://dailygrace.faith/` displays the homepage.
- `https://dailygrace.faith/reader/flipbook-reader.html` opens the flipbook.
- The same comic path tested above works under `https://dailygrace.faith`.
- Narration audio plays; regular posters, comics, covers, the logo, and wire binding appear.

If the homepage shows **R2 Object not found**, check whether the apex is still
attached to R2. If it shows the Worker’s plain **Not found**, check for an overly
broad Worker route.

If media works on `workers.dev` but fails on the main domain, check the route,
selected zone, and orange-cloud proxy status. If the Worker reports **Object
not found**, inspect the exact object key, including `media/`, case, and spaces.
If it reports a Worker exception, check that the `MEDIA` binding exists and
points to `dailygrace`.

If the homepage works but the availability logo is missing, verify the local
PNG was published and the updated stylesheet is loaded. A Git push does not
upload R2 objects or apply Cloudflare dashboard settings.

## References

- [Cloudflare: Use R2 from Workers](https://developers.cloudflare.com/r2/api/workers/workers-api-usage/)
- [Cloudflare: Worker routes](https://developers.cloudflare.com/workers/configuration/routing/routes/)
- [Cloudflare: Public buckets and custom domains](https://developers.cloudflare.com/r2/buckets/public-buckets/)
- [GitHub: Manage a Pages custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
