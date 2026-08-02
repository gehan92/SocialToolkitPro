import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

// null until a real Stripe secret key is added to .env.local - callers must check for this.
export const stripe = secretKey ? new Stripe(secretKey, { apiVersion: "2024-06-20" }) : null;
