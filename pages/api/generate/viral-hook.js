import { callGemini } from "../../../lib/gemini";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getAuthUser, getUserTier } from "../../../lib/getAuthUser";
import { logApiUsage } from "../../../lib/logUsage";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { topic, platform, style, count, language } = req.body || {};
  if (!topic || !String(topic).trim()) {
    return res.status(400).json({ success: false, error: "Topic or niche is required" });
  }

  const user = await getAuthUser(req);
  const tier = user ? await getUserTier(user.id, user.email) : "free";
  if (tier !== "pro") {
    return res.status(403).json({ success: false, error: "Viral Hook Generator is a Pro feature. Upgrade to Pro to unlock it." });
  }

  const rl = await checkRateLimit(req, "viral-hook");
  if (!rl.allowed) {
    return res.status(429).json({ success: false, error: "Daily limit reached." });
  }

  const plat = platform || "TikTok";
  const s = style || "Educational";
  const n = count || 10;
  const lang = language && language !== "English" ? ` Write the hooks in ${language}.` : "";

  const prompt = `Generate ${n} scroll-stopping viral hooks for ${plat} ${s.toLowerCase()} content about: "${topic}".

These hooks must be the OPENING LINE of a video or post — the first thing the audience sees or hears in the first 3 seconds.

Rules:
- Each hook must create immediate curiosity, shock, or emotional response
- Keep each hook under 15 words (shorter is better)
- Use proven hook formulas — mix them across the ${n} hooks:
  • "Nobody talks about [surprising thing]..."
  • "I made [mistake] so you don't have to"
  • "Stop [common mistake] — here's why"
  • "The [number] [topic] mistakes you're making right now"
  • "[Unexpected result] after [timeframe]"
  • "This [thing] changed everything for me"
  • "[Hot take or controversial opinion]"
  • "What I wish I knew before..."
  • "POV: [relatable scenario]"
- Do NOT be generic — hooks must be specific to the topic
- Number each hook 1 to ${n}
- Return ONLY the numbered list, no commentary, no explanations${lang}`;

  const startedAt = Date.now();
  try {
    const { text, tokensUsed } = await callGemini(prompt, { maxOutputTokens: 3000 });
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/viral-hook", statusCode: 200, responseTimeMs: Date.now() - startedAt, tokensUsed });
    return res.status(200).json({ success: true, data: text.trim(), remaining: rl.remaining });
  } catch (e) {
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/viral-hook", statusCode: 502, responseTimeMs: Date.now() - startedAt, tokensUsed: null });
    return res.status(502).json({ success: false, error: e.message });
  }
}
