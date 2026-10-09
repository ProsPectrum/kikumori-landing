# Kikumori link-in-bio

SFW creator landing on Next.js 15 App Router. Public social links are normal anchors. The **Exclusive Content 18+** destination is never sent to the browser until Cloudflare Turnstile succeeds and a one-time server token is redeemed.

## Directory structure

```text
app/
  page.js
  layout.js
  privacy/page.js
  terms/page.js
  report/page.js
  api/
    verify-human/route.js
    analytics/route.js
    destination/route.js
    block/[id]/route.js
  r/[token]/route.js
components/
  CreatorProfile.jsx
  SocialLinks.jsx
  ExclusiveButton.jsx
  TurnstileModal.jsx
  InAppBrowserModal.jsx
lib/
  destination.js
  turnstile.js
  redirectTokens.js
  rateLimit.js
  analytics.js
  browser.js
  origin.js
  verifyHuman.js
  redeemRedirect.js
  store/
tests/
middleware.js
```

## Install

```bash
npm install
cp .env.example .env.local
npm run dev
```

```bash
npm test
npm run build
npm start
ACCEPTANCE_BASE_URL=http://localhost:3000 npm run test:acceptance
```

## Cloudflare Turnstile

1. Create a widget at [Cloudflare Turnstile](https://dash.cloudflare.com/).
2. Widget mode: **Managed** (or Non-Interactive).
3. Add your production hostname and `localhost`.
4. Copy the **site key** to `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
5. Copy the **secret key** to `TURNSTILE_SECRET_KEY` (server only).
6. Local dummy keys from Cloudflare always-pass widgets are fine for development:
   - site: `1x00000000000000000000AA`
   - secret: `1x0000000000000000000000000000000AA`

   The dummy secret **accepts any token**. Use a real production secret before going live, or fake tokens will also issue a redirect path.

The server always calls `https://challenges.cloudflare.com/turnstile/v0/siteverify`. Frontend success is ignored.

## Environment variables

See `.env.example`. Critical:

| Name | Where | Purpose |
| --- | --- | --- |
| `EXCLUSIVE_DESTINATION_URL` | server | Age-gated destination. Never `NEXT_PUBLIC_`. |
| `TURNSTILE_SECRET_KEY` | server | Siteverify secret. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | browser | Turnstile widget. |
| `SITE_URL` | server | Canonical origin for CSRF checks. |
| `TOKEN_STORE` | server | `memory` for one Node process. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | server | Required on Netlify so tokens and rate limits are shared. |

## Launch: Cloudflare Turnstile, kikurae.com, Netlify

Production hostname: **kikurae.com**. Hosting is **Netlify** (not Vercel). Dummy Turnstile keys stay local only.

### 1. Netlify site

1. Push this repo to GitHub/GitLab.
2. [Netlify](https://app.netlify.com/) → Add new site → Import from Git.
3. Build command: `npm run build` (already in `netlify.toml`). Publish directory: `.next`.
4. Add environment variables (Production), then redeploy:

| Variable | Value |
| --- | --- |
| `SITE_URL` | `https://kikurae.com` |
| `ALLOWED_ORIGINS` | `https://kikurae.com,https://www.kikurae.com` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | from Cloudflare Turnstile |
| `TURNSTILE_SECRET_KEY` | from Cloudflare Turnstile (server only) |
| `EXCLUSIVE_DESTINATION_URL` | fallback OF URL if source is unknown |
| `EXCLUSIVE_DESTINATION_URL_IG_ITSKIORAE` | OF tracking link for Instagram itskiorae |
| `EXCLUSIVE_DESTINATION_URL_IG_REALKIORAE` | OF tracking link for Instagram realkiorae |
| `EXCLUSIVE_DESTINATION_URL_X_KIKUMORII` | OF tracking link for X KikuMorii |
| `EXCLUSIVE_DESTINATION_URL_X_REALKIORAE` | OF tracking link for X RealKioRae |
| `EXCLUSIVE_DESTINATION_URL_REDDIT_KIKUMORI` | OF tracking link for Reddit kikumori |
| `STATS_PASSWORD` | password for `https://kikurae.com/stats` |
| `UPSTASH_REDIS_REST_URL` | from [Upstash](https://upstash.com/) |
| `UPSTASH_REDIS_REST_TOKEN` | from Upstash |
| `TOKEN_STORE` | leave unset (or do not set `memory`) |
| `NEXT_PUBLIC_INSTAGRAM_URL` | `https://www.instagram.com/itskiorae/` |
| `NEXT_PUBLIC_X_URL` | `https://x.com/KikuMorii` |
| `NEXT_PUBLIC_THREADS_URL` | `https://www.threads.net/@itskiorae` |
| `NEXT_PUBLIC_REDDIT_URL` | `https://www.reddit.com/user/kikumori` |

`SECRETS_SCAN_OMIT_KEYS` in `netlify.toml` covers the public Turnstile site key plus the server destination env names so Netlify’s scan does not fail on the server bundle. Do not omit `TURNSTILE_SECRET_KEY`.

In-memory token storage does not work across Netlify functions. Production must use Upstash.

### 2. Domain kikurae.com

1. Netlify site → Domain management → Add custom domain `kikurae.com` and `www.kikurae.com`.
2. Set **kikurae.com** as the primary domain; redirect www → apex (or the reverse — pick one).
3. At the registrar (or Cloudflare DNS, if nameservers are on Cloudflare):

   - **Apex `kikurae.com`:** Netlify ALIAS/ANAME or the A records Netlify shows.
   - **`www`:** CNAME to the Netlify hostname (e.g. `something.netlify.app`).

4. Wait for HTTPS. Netlify issues Let’s Encrypt automatically.

If the domain uses **Cloudflare DNS with the orange proxy**, set SSL/TLS mode to **Full (strict)** so Netlify’s certificate is trusted. Grey-cloud (DNS only) is simpler while first going live.

Docs: [Netlify custom domains](https://docs.netlify.com/manage/domains/overview/), [Next.js on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/).

### 3. Cloudflare Turnstile

Turnstile does **not** require the site to be proxied through Cloudflare. You only need a Cloudflare account.

1. Open [Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile).
2. Create a widget, mode **Managed**.
3. Hostnames: `kikurae.com`, `www.kikurae.com`, and `localhost` (for local testing with the real keys).
4. Put the **site key** and **secret key** into Netlify env (table above).
5. Redeploy so `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is baked into the client bundle.

### Tracking links for bios

Put these in each social profile, not the bare domain:

| Account | Bio URL |
| --- | --- |
| Instagram itskiorae | `https://kikurae.com/s/ig-itskiorae` |
| Instagram realkiorae | `https://kikurae.com/s/ig-realkiorae` |
| X KikuMorii | `https://kikurae.com/s/x-kikumorii` |
| X RealKioRae | `https://kikurae.com/s/x-realkiorae` |
| Reddit kikumori | `https://kikurae.com/s/reddit-kikumori` |

Stats: `https://kikurae.com/stats` (password = `STATS_PASSWORD`). Daily counters live in Upstash Redis — no extra SQL database.

### 4. After go-live

1. Open `https://kikurae.com` — SFW landing, no exclusive URL in View Source.
2. Exclusive card → real Turnstile (not the dummy always-pass widget).
3. After success, one-time `/r/...` then OnlyFans.
4. Repeat `/r/...` → 410/403.

## Security checklist

- [ ] Destination exists only in server env / allowlist (`lib/destination.js`).
- [ ] No `NEXT_PUBLIC_` destination, no `?url=`, no destination cookies or JWT payloads.
- [ ] `server-only` on destination, Turnstile secret usage, token store, and redeem path.
- [ ] Turnstile validated with Siteverify, not the widget callback.
- [ ] One-time hashed redirect tokens, 30–120s TTL, atomic consume.
- [ ] `GET /r/exclusive` does not redirect.
- [ ] Rate limits on `/api/verify-human` and `/r/[token]`.
- [ ] Origin/Referer checks on POST APIs.
- [ ] Session cookie is opaque, `HttpOnly`, `Secure` (prod), `SameSite=Lax`.
- [ ] Analytics events never include the destination URL.
- [ ] Same SFW HTML for every visitor (no crawler cloaking).
- [ ] Client build scan fails if the destination string appears in `.next/static` or prerendered HTML/RSC.

## Chrome DevTools manual test

1. Open `/` → Network → Doc. Response HTML must not contain the exclusive host/path.
2. Sources / `_next/static` search for the destination host. Zero hits.
3. Application → Cookies: `kiku_sid` is HttpOnly; no destination cookie. Storage is empty of destination.
4. Click Instagram/X/Threads: normal navigation; Network shows `social_click` analytics without exclusive URL.
5. Click **Exclusive Content 18+**: Turnstile modal. `POST /api/verify-human` JSON has `token` + `blockId` only. Response JSON is `{ redirectPath: "/r/..." }` only.
6. Follow `/r/...` once: 302 to the server destination. Repeat the same URL: 410 or 403, no Location.
7. Open `/r/exclusive`: 404/403, no redirect.
8. Device toolbar + UA `Instagram`: Exclusive click shows **Open in your browser** and **Copy link**, no immediate redirect.
9. Privacy / Terms / Report load as SFW pages.
10. Disable JS: landing still SFW; exclusive destination still absent from HTML.
