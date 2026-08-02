import { callGemini } from "../../../lib/gemini";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getAuthUser } from "../../../lib/getAuthUser";
import { logApiUsage } from "../../../lib/logUsage";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { niche, audience, platform, count, style, language } = req.body || {};
  if (!niche || !String(niche).trim()) {
    return res.status(400).json({ success: false, error: "Niche is required" });
  }

  const rl = await checkRateLimit(req, "ideas");
  if (!rl.allowed) {
    return res.status(429).json({ success: false, error: "Daily free limit reached. Upgrade to Premium for unlimited generations.", resetAt: rl.resetAt });
  }

  const plat = platform || "TikTok";
  const n = count || 10;
  const s = style || "Trending & popular";
  const lang = language && language !== "English" ? ` Write the titles and descriptions in ${language}.` : "";
  const prompt = `Generate exactly ${n} ${String(s).toLowerCase()} ${plat} video ideas for a "${niche}" creator targeting "${audience || "general audience"}".

Format each idea EXACTLY like this with a number, title and description on separate lines:
1. Title of video idea here
Description of the video concept in one sentence here.

2. Another title here
Another description here.

Do NOT use JSON. Do NOT use brackets. Just plain numbered list.${lang}`;

  const user = await getAuthUser(req);
  const startedAt = Date.now();
  try {
    const { text, tokensUsed } = await callGemini(prompt);
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/ideas", statusCode: 200, responseTimeMs: Date.now() - startedAt, tokensUsed });
    return res.status(200).json({ success: true, data: text, remaining: rl.remaining });
  } catch (e) {
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/ideas", statusCode: 502, responseTimeMs: Date.now() - startedAt, tokensUsed: null });
    return res.status(502).json({ success: false, error: e.message });
  }
}
