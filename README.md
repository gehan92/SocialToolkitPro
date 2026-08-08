# SocialToolkit

AI content-generation tools for social media creators — hashtags, captions,
bios, video ideas, and more. Built with Next.js, Supabase, and Google Gemini.

Live at: https://www.socialtoolkitpro.com

---

## Tech stack

- **Framework:** Next.js 14 (Pages Router)
- **Database / Auth:** Supabase (Postgres + Supabase Auth, email/password with
  email confirmation required)
- **AI:** Google Gemini (`gemini-flash-latest`), called only from server-side
  API routes — the API key never reaches the browser
- **Hosting:** Vercel
- **Domain / DNS:** registered and DNS-managed through Netlify, pointed at
  Vercel via individual A/CNAME records (not full nameserver delegation)
- **Payments:** Stripe integration exists in code but isn't live — no
  Stripe-supported entity yet (see [Billing & payments](#billing--payments)).
  Migrating to **Paddle** (in progress as of this writing).
- **Email sending:** not yet configured — Supabase's built-in email sender is
  rate-limited and only meant for testing; see
  [Known gaps / next steps](#known-gaps--next-steps).

## Local development

```bash
npm install
cp .env.local.example .env.local   # fill in real values
npm run dev
```

Runs at `http://localhost:3000`. `npm run build` / `npm run start` for a
production build locally.

## Environment variables

See `.env.local.example` for the full list. Notable ones:

| Var | Purpose |
|---|---|
| `GEMINI_API_KEY` | Server-side only, powers all 14 generate tools |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side Supabase access |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side only, bypasses RLS for privileged reads/writes |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_PREMIUM(_ANNUAL)` / `STRIPE_PRICE_PRO(_ANNUAL)` | Not currently set in production — billing isn't live yet |
| `ADMIN_EMAILS` | Comma-separated bootstrap admin list, always grants admin access regardless of DB state |
| `NEXT_PUBLIC_URL` | Must be the real production domain in Vercel's env vars — used to build Stripe redirect URLs and SEO tags |

## Architecture

```
pages/
  index.js              Homepage — all 14 tools live in one page (lib/legacyHtml/home.js body)
  account.js             Profile, plan/billing, trial status, pay-as-you-go
  admin.js                Owner-only dashboard (users, revenue, settings)
  login.js / signup.js / forgot-password.js / reset-password.js
  saved.js / calendar.js / analytics.js   Premium+ features
  api/
    generate/*.js         14 tool endpoints, all gated by lib/rateLimit.js
    subscription/          Stripe checkout + cancel (not live yet)
    webhooks/stripe.js      Stripe webhook handler (signature-verified)
    credits/purchase.js     Pay-as-you-go purchase (stub, not wired to a processor)
    admin/*.js              Admin-only endpoints, gated by lib/isAdmin.js
    user/*.js               Saved outputs, calendar, templates, profile

lib/
  gemini.js               Single Gemini API wrapper — detects truncated/blocked responses
  rateLimit.js            Core access-control gate: auth, trial, credits, fair-use ceiling
  planConfig.js           Admin-editable pricing/limits, cached 60s
  getAuthUser.js           Resolves the logged-in user from a Bearer token
  isAdmin.js               Admin check (env-list + profiles.role)
  supabaseAdmin.js / supabaseClient.js   Service-role vs. anon Supabase clients

supabase/schema.sql       Full DB schema — run manually in Supabase's SQL editor
public/js/site.js          Frontend logic for the homepage tools (vanilla JS, no framework)
```

## Features

**14 AI generation tools**, gated by plan:

- Free/trial: Caption Writer, Hashtag Generator, Bio Maker, Video Ideas Generator, Thread Generator
- Premium adds: SEO Blog Intro Writer, Content Repurposer, YouTube Description Writer, Email Subject Line Writer, CTA Generator
- Pro adds: Ad Copy Writer, Viral Hook Generator, Technical Writing Assistant, Brand Pitch Writer

**Account features:** saved outputs, content calendar, templates, analytics dashboard (Premium+).

**Admin dashboard:** user management, revenue/profit stats, contact messages, plan pricing & limits editor.

**PWA:** installable on mobile (manifest + icons added — see `public/manifest.json`).

## Access model (free tier / trial / billing)

This was redesigned away from a permanent anonymous free tier to:

1. **Every user must create and verify an account** — no anonymous usage.
2. **3-day trial** with a declining daily cap (day 1: 3, day 2: 2, day 3: 1 —
   admin-configurable in `plan_config`). Deliberately does **not** show the
   exact day count or a reset countdown in the UI — only a percentage bar.
3. **After the trial**, the account must subscribe (Premium/Pro, monthly or
   annual) or spend purchased **pay-as-you-go credits** (one-time purchase,
   not yet wired to a real payment processor).
4. **Premium/Pro are "unlimited"** to the user but carry a hidden fair-use
   ceiling (default 500/day) to protect against a single abused account.

All of this is enforced in one place: `lib/rateLimit.js`, used by every
`pages/api/generate/*.js` route.

## Billing & payments

- **Stripe integration exists in code** (`checkout.js`, `cancel.js`,
  `webhooks/stripe.js`) and is secure (webhook signature verified, checkout
  requires auth, subscription updates linked via `client_reference_id` rather
  than trusting a client-supplied email) — but **no real Stripe account
  exists**. The account owner is based in Sri Lanka, which Stripe doesn't
  support directly, and only has a Payoneer account for receiving funds.
- **Direction: migrating to Paddle** (Merchant of Record — handles global
  tax/VAT automatically, doesn't require a foreign entity, and Payoneer can
  likely receive its payouts). Paddle vendor account created, onboarding
  in sandbox as of this writing.
- **Paddle integration is scaffolded but untested** (no sandbox credentials
  wired in yet): `lib/paddleClient.js` (server SDK), `pages/api/subscription/
  paddle-checkout.js` + `pages/api/credits/purchase.js` (both create a
  server-side draft transaction — `customData.userId` is set from the
  authenticated session, never client-editable — and return a `transactionId`
  for the frontend), `pages/api/webhooks/paddle.js` (signature-verified,
  handles `subscription.created/activated/updated/canceled` and
  `transaction.completed`/`transaction.payment_failed`), and `pages/
  account.js` (loads Paddle.js via `initializePaddle`, opens the checkout
  overlay with `Paddle.Checkout.open({ transactionId })` — Paddle Billing
  checkout is a client-side overlay, unlike Stripe's server-redirect flow, so
  this isn't just re-pointing the old Stripe code). `stripe_*` DB columns are
  left in place; `paddle_*` columns were added alongside them (see the
  migration note at the top of `supabase/schema.sql`) rather than reusing the
  Stripe-named ones.
- **Pay-as-you-go credits** (`pages/api/credits/purchase.js`) now creates a
  real Paddle transaction instead of a 501 stub, but still needs
  `PADDLE_PRICE_CREDIT_PACK` (a non-recurring price) to exist.

## Known gaps / next steps

- [ ] Finish Paddle account setup (business verification, catalog
      products/prices for Premium/Pro monthly+annual + the credit pack,
      confirm Sri Lanka + Payoneer payout support), then fill in
      `PADDLE_API_KEY`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`,
      `PADDLE_WEBHOOK_SECRET`, and the `PADDLE_PRICE_*` env vars (see
      `.env.local.example`) and test the whole flow end-to-end in sandbox —
      none of the code above has run against a real Paddle account yet.
- [ ] Run the Paddle migration lines at the top of `supabase/schema.sql`
      against the live Supabase project (additive `alter table` statements,
      safe to run alongside the existing Stripe columns).
- [ ] Set up a real email service (Resend recommended, domain verification
      DNS records already partially in progress) and connect it as Supabase's
      custom SMTP provider — the built-in sender is rate-limited and
      currently causes real signup/reset emails to fail.
- [ ] Admin settings UI covers all `plan_config` fields, but nothing else
      (e.g. email templates) has an admin UI yet.
- [ ] UI is English-only; generated *output* supports 18 languages already.
- [ ] Regional/PPP-based pricing not yet implemented (flagged as a "Year 2"
      idea in `idea/3_PRICING_STRATEGY.md`, may be worth pulling forward
      given the Paddle migration).
- [ ] `idea/3_PRICING_STRATEGY.md` describes the original (now superseded)
      permanent free-tier model — treat the [Access model](#access-model-free-tier--trial--billing)
      section above as the current source of truth instead.

## Deployment

- **Hosting:** Vercel project `social-toolkit-pro` (auto-deploys from `main`).
- **Domain:** `socialtoolkitpro.com` / `www.socialtoolkitpro.com`, registered
  and DNS-hosted at Netlify, A/CNAME records point to Vercel.
- **Database:** Supabase project — schema changes in `supabase/schema.sql`
  must be run manually in Supabase's SQL editor; there's no migration runner.
