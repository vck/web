Got it. Then skip the hand-holding — here's the straight answer.

## TL;DR

**Astro + Cloudflare Pages.** Deploy via Wrangler or Git integration. Done.

## Why Astro over Hugo/Eleventy/Next

- **Content collections** with Zod schemas — type-safe frontmatter, catches typos at build time.
- **Islands architecture** — ship zero JS by default, hydrate only what needs it (theme toggle, search, etc).
- **MDX + Markdown** with full component access in posts.
- **View transitions** built in, no client-side router needed.
- **Framework-agnostic** — drop in React/Svelte/Vue/Solid components where you want interactivity.
- **`@astrojs/cloudflare` adapter** if you ever need SSR or API routes (Pages Functions).

Hugo is faster to build but the templating is painful and you'll fight Go templates for anything custom. Eleventy is fine but you'll wire up everything yourself. Astro hits the sweet spot.

## The Stack

```
Framework:    Astro (static output, or SSR via @astrojs/cloudflare)
Hosting:      Cloudflare Pages (unlimited bandwidth, 500 builds/mo free)
DNS:          Cloudflare (obviously)
Domain:       ~$10/yr at Porkbun or Cloudflare Registrar (at-cost)
Analytics:    Cloudflare Web Analytics (free, no cookies, no client JS blob)
Comments:     Giscus (GitHub Discussions) or skip
Search:       Pagefind (runs at build time, ships as static index)
Images:       Astro's <Image /> + Cloudflare Images if you want on-the-fly transforms
CMS (opt):    Decap CMS, Tina, or just write MDX in your editor
```

## Deploy options

**Git integration** (simplest):
```bash
# In CF dashboard: Pages → Connect to Git → select repo
# Build command: npm run build
# Output dir:   dist
```
Every push to `main` deploys. PRs get preview URLs automatically.

**Wrangler** (if you want CI elsewhere or direct deploys):
```bash
npm i -D wrangler
npx wrangler pages deploy dist --project-name=mysite
```

**GitHub Actions** if you want to build in CI and only push artifacts:
```yaml
- uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CF_API_TOKEN }}
    command: pages deploy dist --project-name=mysite
```

## Things worth knowing

- **Free tier limit is 20k files per deployment** (not 3MB total — that's per-file). You'll never hit this for a blog.
- **`_headers` and `_redirects`** files in `public/` are respected. Use them for CSP, cache-control, SPA fallback.
- **Pages Functions** (`/functions` dir) give you Workers runtime at the edge — free API endpoints, auth, form handling.
- **Custom domains**: add in Pages settings, CF handles cert. Use `www` → apex redirect via a Redirect Rule if you care.
- **Don't use Cloudflare Access** for a public blog unless you want to gate it — it's for private stuff.
- **Build caching**: CF caches `node_modules` between builds if you don't commit a lockfile that busts it. Keep deps lean.

## If you outgrow static

- **Workers + D1** for dynamic content (comments, likes, view counts).
- **Workers KV** for config/flags.
- **R2** for media if you exceed what you want in the repo.
- All of these are free-tier friendly and deploy from the same repo.

## What I'd actually do

1. `npm create astro@latest` → pick the blog template.
2. Add `@astrojs/sitemap`, `@astrojs/rss`, `astro-compress` (or `astro- compressor`), Pagefind.
3. Push to GitHub, connect to Pages.
4. Point domain, enable Web Analytics.
5. Write MDX, commit, done.

Total cost: domain only. Build time: one evening. Maintenance: near zero until you want to add features.
