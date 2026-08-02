# Scaling & Reliability Notes

**Last Updated:** August 2, 2026
**Status:** Discussion notes — nothing here has been implemented yet unless marked ✅

---

## 🚨 The Big One: Gemini API Free-Tier Quota

While testing a bug fix, we hit this live:

```
429 RESOURCE_EXHAUSTED
Quota exceeded for metric: generate_content_free_tier_requests
limit: 20, model: gemini-3.6-flash
```

**What this means:** `GEMINI_API_KEY` is currently on Google's free sandbox tier — capped at **20 AI requests per day, for the entire app combined.** Not per user. One shared bucket for everyone.

**Why it's worse than it sounds:**
- Free-plan users already get 10 generations/day each (per-app rule) — just 2 free users maxing that out would drain the *entire* daily Gemini budget.
- Premium/Pro users have **no cap at all** in the app (unlimited generations) — a single paying customer using the tools normally for a few minutes could burn through the whole daily quota alone, faster than free users would.
- Once the quota is gone (triggered by anyone, any tier), **every tool fails for every user** — free, Premium, Pro, even the admin — until Google resets it the next day.
- This also means: the more successful the app gets at attracting paying customers, the *faster* this breaks, not slower.

**The fix:** Enable billing (pay-as-you-go) on the Google AI Studio / Cloud project tied to this API key. This removes the 20/day wall entirely and replaces it with a much higher paid rate limit. This is the single most urgent item in this document — everything else is secondary until this is done.

*(Already added as the top entry in the admin dashboard's **Scaling** tab for ongoing visibility.)*

---

## ✅ Already Fixed: Silent Output Truncation

Separate from the quota issue — `gemini-flash-latest` is a "thinking" model that spends 600–1500+ variable tokens on invisible internal reasoning before writing visible output, and `maxOutputTokens` caps thinking + visible output combined. Several tools had budgets too close to that overhead, so Gemini would hit the cap mid-thought and silently return a partial result.

Confirmed and fixed live against the real API:
| Tool | Symptom found | Fix |
|---|---|---|
| Viral Hook Generator | Asked for 10 hooks, got 2 | Budget raised 800 → 3000 |
| Thread Writer | Asked for 10 LinkedIn posts, got 7 | Budget raised 2500 → 4500 |
| All other generate tools | Not yet individually broken, but same risk pattern | Budgets raised to a safe 2500–3000 floor |

---

## 🎬 Scenarios & Fixes (Simple Version)

### 1. The quota wall (what happened to us)
A few users use a few tools → Google says "quota exceeded" → nobody can generate anything for the rest of the day, even though the site itself is fine.
**Fix:** Enable billing (see above). This is the one that unblocks everything else.

### 2. The surprise bill
Billing is on. A bug or a bot loop calls the API repeatedly. Without billing this would've just hit the old wall and stopped — with billing, it keeps charging the card.
**Fix:** Set a budget alert in Google Cloud (e.g. "email me past $20/day"), optionally a hard spending cap.

### 3. Google has a bad minute
A customer clicks Generate right when Google's servers briefly hiccup (happens to every AI provider occasionally). Customer sees a scary raw error and assumes the app is broken.
**Fix:** Auto-retry once or twice with a short delay before showing an error. Most of the time the retry just quietly succeeds.

### 4. Nobody notices until it's too late
Usage grows past what anyone was tracking. One day it crosses the new paid plan's real limit — same failure as Scenario 1, but now with real paying customers and zero warning.
**Fix:** A simple usage banner in the admin dashboard once daily generations cross ~80% of the plan's real limit. The data already exists (Growth/Analytics tabs) — this is just a warning line on top of it.

### 5. Developer testing competes with real users
Today's incident, exactly: testing a bug fix ate into the same 20-request bucket a real customer would use.
**Fix:** Two separate API keys — one for development/testing, one for the live site. Completely separate quotas.

### 6. Google itself goes down (the advanced one, for later)
Not "busy for a second" — actually down for an hour. Every tool stops working for as long as the outage lasts. Retries (#3) don't help here since it's not transient.
**Fix:** A second AI provider as an automatic fallback. Real added cost/complexity — only worth it once outages have actually cost real money or customers. Not recommended right now.

---

## 📋 Priority Order

| # | Item | Effort | When |
|---|---|---|---|
| 1 | Enable Gemini billing | A few minutes (Google console) | **Now — blocks real usage** |
| 5 | Separate dev/prod API keys | Small | Now, alongside #1 |
| 3 | Retry/backoff on transient Gemini errors | Small (code) | Soon |
| 2 | Budget alert/cap in Google Cloud | Small (Google console) | Right after #1 |
| 4 | Usage warning banner in admin dashboard | Small–medium (code) | When convenient |
| 6 | Backup AI provider | Large | Later — only if it becomes a real problem |

---

## Related

- Admin dashboard → **Scaling** tab (`/admin`) — live reference list of these and other known scaling risks (database query limits, the 1,000-user pagination cap, in-memory rate limiting).
- `lib/gemini.js` — where the token-budget fixes and future retry logic would live.
