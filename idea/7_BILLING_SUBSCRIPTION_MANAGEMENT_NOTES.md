# Billing & Subscription Management Notes

**Last Updated:** August 2, 2026
**Status:** Discussion notes — nothing here has been implemented yet unless marked ✅

---

## ✅ What's Already Built

- **Cancel subscription** (`pages/api/subscription/cancel.js`): cancels **at period end** — the standard, non-punishing approach. The customer keeps full access until the day they already paid for, then it turns off automatically. No refund logic needed, no mid-cycle cutoff. Frontend (`pages/account.js`) shows a confirmation dialog first and a clear "you'll keep access until your billing period ends" message after.
- **Upgrade button** on the account page (Free → Premium, Premium → Pro) via `/api/subscription/checkout.js`.

---

## 🐛 Two Gaps Found While Reviewing (Not Fixed Yet)

1. **Upgrading between paid tiers creates a brand-new Stripe Checkout session** instead of modifying the existing subscription (`pages/api/subscription/checkout.js`). In Stripe this risks producing a **second, separate subscription** rather than replacing the old plan — meaning a customer going Premium → Pro could end up billed for both at once instead of just Pro.
2. **"Downgrade" currently just fully cancels the subscription** (`pages/account.js`, the `btn-downgrade` button calls the same `handleCancel` as the Cancel button). So a Pro user trying to drop down to Premium today ends up back on Free, not Premium.

---

## 🏢 How Professional SaaS Sites Handle This

### Option A — Stripe Customer Portal (recommended for a solo owner)
Most small-to-mid SaaS companies don't build a custom plan-change/cancel UI at all. Instead, one "Manage Billing" button sends the customer to a page **hosted by Stripe itself**, where they can:
- Switch plans, with the price difference automatically prorated (charged/credited)
- Update their card
- View past invoices/receipts
- Cancel or reactivate

Advantage: Stripe already built, tested, and maintains this. It removes the double-subscription risk above entirely, and there's no custom billing UI to design or keep correct.

### Option B — Custom flow (what this app currently has, partially)
If keeping the current custom account-page flow instead:
- Upgrade/downgrade should call `stripe.subscriptions.update()` on the **existing** subscription with the new price ID (with `proration_behavior` set), not create a new Checkout session.
- Cancel: already correct (cancel-at-period-end).
- Should add: a way to **undo** a pending cancellation before the period actually ends (un-flag `cancel_at_period_end`).
- Optional, not required: a short "why are you leaving?" step before the cancel confirms, sometimes paired with a discount offer — helps with churn insight, common but not universal practice.

---

## Recommendation

Given solo ownership with no dedicated billing/support team, **Stripe's Customer Portal** is the safer default over maintaining custom upgrade/downgrade logic — it avoids the double-subscription bug entirely and gives customers a polished, familiar billing screen.

**Status:** Not implemented — decision (Portal vs. fixing the custom flow) and the actual code change are both pending explicit go-ahead.

---

## Related

- `pages/api/subscription/cancel.js`, `pages/api/subscription/checkout.js`, `pages/account.js` — current billing code.
- [idea/3_PRICING_STRATEGY.md](3_PRICING_STRATEGY.md) — pricing tiers and billing-cycle strategy (pre-existing doc).
- [idea/6_SCALING_RELIABILITY_NOTES.md](6_SCALING_RELIABILITY_NOTES.md) — related cost/reliability notes for the same subscription system.
