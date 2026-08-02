import { callGemini } from "../../../lib/gemini";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getAuthUser, getUserTier } from "../../../lib/getAuthUser";
import { logApiUsage } from "../../../lib/logUsage";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { product, goal, platform, tone, language } = req.body || {};
  if (!product || !String(product).trim()) {
    return res.status(400).json({ success: false, error: "Product or service name is required" });
  }

  const user = await getAuthUser(req);
  const tier = user ? await getUserTier(user.id, user.email) : "free";
  if (tier === "free") {
    return res.status(403).json({ success: false, error: "CTA Generator is a Premium feature. Upgrade to unlock it." });
  }

  const rl = await checkRateLimit(req, "cta");
  if (!rl.allowed) {
    return res.status(429).json({ success: false, error: "Daily limit reached.", resetAt: rl.resetAt });
  }

  const g = goal || "Follow";
  const plat = platform || "Instagram";
  const t = tone || "Friendly";
  const lang = language && language !== "English" ? ` Write the CTAs in ${language}.` : "";

  const prompt = `Generate 8 high-converting call-to-action (CTA) lines for the following.

Product/Service: "${product}"
Goal: Get people to ${g}
Platform: ${plat}
Tone: ${t}

Rules:
- Each CTA must be punchy, specific, and action-oriented
- Use strong action verbs (Grab, Discover, Join, Start, Unlock, Get, Try, Claim)
- Keep each CTA under 15 words
- Make each one unique — different wording, angle, and verb
- Where it fits naturally, add 1 emoji
- For "Urgent" tone: include urgency (limited spots, today only, don't miss out)
- For "Playful" tone: use fun, casual language and wordplay
- Number each CTA 1 to 8
- Return ONLY the numbered list, no headings, no explanations${lang}`;

  const startedAt = Date.now();
  try {
    const { text, tokensUsed } = await callGemini(prompt, { maxOutputTokens: 2500 });
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/cta", statusCode: 200, responseTimeMs: Date.now() - startedAt, tokensUsed });
    return res.status(200).json({ success: true, data: text.trim(), remaining: rl.remaining });
  } catch (e) {
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/cta", statusCode: 502, responseTimeMs: Date.now() - startedAt, tokensUsed: null });
    return res.status(502).json({ success: false, error: e.message });
  }
}
