import { callGemini } from "../../../lib/gemini";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getAuthUser, getUserTier } from "../../../lib/getAuthUser";
import { logApiUsage } from "../../../lib/logUsage";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { topic, tone, count, language } = req.body || {};
  if (!topic || !String(topic).trim()) {
    return res.status(400).json({ success: false, error: "Email topic or offer is required" });
  }

  const user = await getAuthUser(req);
  const tier = user ? await getUserTier(user.id, user.email) : "free";
  if (tier === "free") {
    return res.status(403).json({ success: false, error: "Email Subject Line Writer is a Premium feature. Upgrade to unlock it." });
  }

  const rl = await checkRateLimit(req, "email-subject");
  if (!rl.allowed) {
    return res.status(429).json({ success: false, error: "Daily limit reached.", resetAt: rl.resetAt });
  }

  const t = tone || "Friendly";
  const n = count || 10;
  const lang = language && language !== "English" ? ` Write the subject lines in ${language}.` : "";

  const prompt = `Generate exactly ${n} email subject lines for the following email topic or offer.

Topic/offer: "${topic}"
Tone: ${t}

Rules:
- Each subject line must be unique and use a different angle or hook
- Keep each under 60 characters (ideal for mobile display)
- Mix different techniques across the ${n} lines: curiosity gap, urgency, personal, benefit-led, question, number/list, emoji-led
- Add one relevant emoji at the start of lines where it fits naturally
- For "Urgent" tone: use time-pressure words (last chance, expires, today only)
- For "Curious" tone: use intrigue without revealing everything (teaser style)
- Number each subject line 1 to ${n}
- Return ONLY the numbered list, no commentary, no explanations${lang}`;

  const startedAt = Date.now();
  try {
    const { text, tokensUsed } = await callGemini(prompt, { maxOutputTokens: 2500 });
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/email-subject", statusCode: 200, responseTimeMs: Date.now() - startedAt, tokensUsed });
    return res.status(200).json({ success: true, data: text.trim(), remaining: rl.remaining });
  } catch (e) {
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/email-subject", statusCode: 502, responseTimeMs: Date.now() - startedAt, tokensUsed: null });
    return res.status(502).json({ success: false, error: e.message });
  }
}
