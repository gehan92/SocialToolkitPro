import { Paddle, Environment } from "@paddle/paddle-node-sdk";

const apiKey = process.env.PADDLE_API_KEY;
const env = process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? Environment.production : Environment.sandbox;

// null until a real Paddle API key is added to .env.local - callers must check for this.
export const paddle = apiKey ? new Paddle(apiKey, { environment: env }) : null;
