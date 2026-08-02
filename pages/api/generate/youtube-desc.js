import { callGemini } from "../../../lib/gemini";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getAuthUser, getUserTier } from "../../../lib/getAuthUser";
import { logApiUsage } from "../../../lib/logUsage";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { videoTitle, keywords, niche, language } = req.body || {};
  if (!videoTitle || !String(videoTitle).trim()) {
    return res.status(400).json({ success: false, error: "Video title is required" });
  }

  const user = await getAuthUser(req);
  const tier = user ? await getUserTier(user.id, user.email) : "free";
  if (tier === "free") {
    return res.status(403).json({ success: false, error: "YouTube Description Writer is a Premium feature. Upgrade to unlock it." });
  }

  const rl = await checkRateLimit(req, "youtube-desc");
  if (!rl.allowed) {
    return res.status(429).json({ success: false, error: "Daily limit reached." });
  }

  const kw = keywords ? ` Primary keywords to include: ${keywords}.` : "";
  const n = niche ? ` Channel niche: ${niche}.` : "";
  const lang = language && language !== "English" ? ` Write the description in ${language}.` : "";

  const prompt = `Write a complete, SEO-optimized YouTube video description for the following video.

Video title: "${videoTitle}"${kw}${n}

The description must include these sections in order:

1. HOOK (first 2 lines — these show before "show more", make them compelling)
2. VIDEO SUMMARY (2-3 sentences about what the video covers)
3. WHAT YOU'LL LEARN (3-5 bullet points using ▶ emoji)
4. TIMESTAMPS (placeholder format like: 0:00 - Intro, 1:30 - [Topic], etc.)
5. LINKS & RESOURCES (placeholder section with example links)
6. ABOUT THIS CHANNEL (1-2 sentences about the channel niche)
7. HASHTAGS (5-8 relevant hashtags at the very end)

Rules:
- Include keywords naturally throughout
- Use emojis sparingly for visual structure
- Keep total length 400-700 words
- Return ONLY the description, no meta-commentary${lang}`;

  const startedAt = Date.now();
  try {
    const { text, tokensUsed } = await callGemini(prompt, { maxOutputTokens: 2000 });
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/youtube-desc", statusCode: 200, responseTimeMs: Date.now() - startedAt, tokensUsed });
    return res.status(200).json({ success: true, data: text.trim(), remaining: rl.remaining });
  } catch (e) {
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/youtube-desc", statusCode: 502, responseTimeMs: Date.now() - startedAt, tokensUsed: null });
    return res.status(502).json({ success: false, error: e.message });
  }
}
