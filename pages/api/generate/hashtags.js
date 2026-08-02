import { callGemini } from "../../../lib/gemini";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getAuthUser } from "../../../lib/getAuthUser";
import { logApiUsage } from "../../../lib/logUsage";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { topic, platform, count, language } = req.body || {};
  if (!topic || !String(topic).trim()) {
    return res.status(400).json({ success: false, error: "Topic is required" });
  }

  const rl = await checkRateLimit(req, "hashtag");
  if (!rl.allowed) {
    return res.status(429).json({ success: false, error: "Daily free limit reached. Upgrade to Premium for unlimited generations.", resetAt: rl.resetAt });
  }

  const plat = platform || "Instagram";
  const n = count || 20;
  const lang = language && language !== "English" ? ` Write the hashtags in ${language}.` : "";
  const prompt = `Generate exactly ${n} hashtags for a ${plat} post about: "${topic}". Return ONLY hashtags, one per line, each starting with #. No numbers, no text. Mix popular, medium, and niche tags.${lang}`;

  const user = await getAuthUser(req);
  const startedAt = Date.now();
  try {
    const { text, tokensUsed } = await callGemini(prompt);
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/hashtags", statusCode: 200, responseTimeMs: Date.now() - startedAt, tokensUsed });
    return res.status(200).json({ success: true, data: text, remaining: rl.remaining });
  } catch (e) {
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/hashtags", statusCode: 502, responseTimeMs: Date.now() - startedAt, tokensUsed: null });
    return res.status(502).json({ success: false, error: e.message });
  }
}
