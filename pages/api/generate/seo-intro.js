import { callGemini } from "../../../lib/gemini";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getAuthUser, getUserTier } from "../../../lib/getAuthUser";
import { logApiUsage } from "../../../lib/logUsage";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { title, keyword, audience, tone, language } = req.body || {};
  if (!title || !String(title).trim()) {
    return res.status(400).json({ success: false, error: "Blog title or topic is required" });
  }

  const user = await getAuthUser(req);
  const tier = user ? await getUserTier(user.id, user.email) : "free";
  if (tier === "free") {
    return res.status(403).json({ success: false, error: "SEO Blog Intro is a Premium feature. Upgrade to unlock it." });
  }

  const rl = await checkRateLimit(req, "seo-intro");
  if (!rl.allowed) {
    return res.status(429).json({ success: false, error: "Daily limit reached.", resetAt: rl.resetAt });
  }

  const t = tone || "Professional";
  const kw = keyword ? ` The primary SEO keyword to include naturally is: "${keyword}".` : "";
  const aud = audience ? ` Target audience: ${audience}.` : "";
  const lang = language && language !== "English" ? ` Write in ${language}.` : "";

  const prompt = `Write a compelling, SEO-optimized blog introduction for the following blog post.

Blog title/topic: "${title}"${kw}${aud}

Requirements:
- Tone: ${t}
- Length: 150-200 words
- Hook the reader in the very first sentence (use a surprising fact, question, or bold statement)
- Naturally include the SEO keyword in the first 100 words if provided
- Clearly state what the reader will learn or gain
- End with a smooth transition into the main content (do NOT write "In this article..." as the opener)
- Use clear, readable sentences — no jargon unless tone is Expert
- Return ONLY the intro paragraph, nothing else${lang}`;

  const startedAt = Date.now();
  try {
    const { text, tokensUsed } = await callGemini(prompt, { maxOutputTokens: 2500 });
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/seo-intro", statusCode: 200, responseTimeMs: Date.now() - startedAt, tokensUsed });
    return res.status(200).json({ success: true, data: text.trim(), remaining: rl.remaining });
  } catch (e) {
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/seo-intro", statusCode: 502, responseTimeMs: Date.now() - startedAt, tokensUsed: null });
    return res.status(502).json({ success: false, error: e.message });
  }
}
