// One-off utility: creates the real SocialToolkit product catalog in Paddle
// (Premium/Pro monthly+annual, one-time Credit Pack) via the API instead of
// manual dashboard clicking, then writes the resulting price IDs into
// .env.local. Safe to re-run - it just creates new products/prices each
// time, so only run this once per environment (sandbox now, live later).
//
// Usage: node scripts/paddle-setup-catalog.js
const fs = require("fs");
const path = require("path");
const { Paddle, Environment } = require("@paddle/paddle-node-sdk");

const envPath = path.join(__dirname, "..", ".env.local");
const envText = fs.readFileSync(envPath, "utf8");
for (const line of envText.split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
}

const apiKey = process.env.PADDLE_API_KEY;
if (!apiKey) {
  console.error("Missing PADDLE_API_KEY in .env.local");
  process.exit(1);
}

const env = process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? Environment.production : Environment.sandbox;
const paddle = new Paddle(apiKey, { environment: env });

const PLAN = [
  {
    key: "PREMIUM",
    name: "Premium",
    description: "SocialToolkit Premium",
    prices: [
      { key: "PADDLE_PRICE_PREMIUM", amount: "900", interval: "month", label: "$9/month" },
      { key: "PADDLE_PRICE_PREMIUM_ANNUAL", amount: "7900", interval: "year", label: "$79/year" },
    ],
  },
  {
    key: "PRO",
    name: "Pro",
    description: "SocialToolkit Pro",
    prices: [
      { key: "PADDLE_PRICE_PRO", amount: "2900", interval: "month", label: "$29/month" },
      { key: "PADDLE_PRICE_PRO_ANNUAL", amount: "29900", interval: "year", label: "$299/year" },
    ],
  },
  {
    key: "CREDIT_PACK",
    name: "Credit Pack",
    description: "SocialToolkit Pay-as-you-go Credit Pack (50 generations)",
    prices: [
      { key: "PADDLE_PRICE_CREDIT_PACK", amount: "500", interval: null, label: "$5 one-time" },
    ],
  },
];

async function main() {
  const results = {};

  for (const plan of PLAN) {
    console.log(`\nCreating product: ${plan.name}`);
    const product = await paddle.products.create({
      name: plan.name,
      description: plan.description,
      taxCategory: "saas",
    });
    console.log(`  product id: ${product.id}`);

    for (const price of plan.prices) {
      const body = {
        description: `${plan.name} - ${price.label}`,
        productId: product.id,
        unitPrice: { amount: price.amount, currencyCode: "USD" },
      };
      // No Paddle-level trialPeriod here: SocialToolkit's 3-day declining
      // trial is handled entirely in-app (lib/rateLimit.js,
      // profiles.trial_started_at), independent of billing - stacking a
      // second Paddle-native trial on top would just create a mismatched,
      // confusing second free period.
      if (price.interval) {
        body.billingCycle = { interval: price.interval, frequency: 1 };
      }
      const created = await paddle.prices.create(body);
      results[price.key] = created.id;
      console.log(`  price (${price.label}): ${created.id}`);
    }
  }

  let updatedEnv = envText;
  for (const [key, value] of Object.entries(results)) {
    const re = new RegExp(`^${key}=.*$`, "m");
    if (re.test(updatedEnv)) {
      updatedEnv = updatedEnv.replace(re, `${key}=${value}`);
    } else {
      updatedEnv += `\n${key}=${value}`;
    }
  }
  fs.writeFileSync(envPath, updatedEnv);

  console.log("\nDone. .env.local updated with:");
  for (const [key, value] of Object.entries(results)) console.log(`  ${key}=${value}`);
}

main().catch((e) => {
  console.error("\nFailed:", e.message || e);
  process.exit(1);
});
