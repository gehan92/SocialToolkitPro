import { callGemini } from "../../../lib/gemini";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getAuthUser, getUserTier } from "../../../lib/getAuthUser";
import { logApiUsage } from "../../../lib/logUsage";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { niche, name, location, about, platform, vibe, variations, language } = req.body || {};
  if (!niche || !String(niche).trim()) {
    return res.status(400).json({ success: false, error: "Niche is required" });
  }

  const user = await getAuthUser(req);

  if (variations) {
    const tier = user ? await getUserTier(user.id, user.email) : "free";
    if (tier === "free") {
      return res.status(403).json({ success: false, error: "Variations is a Premium feature. Upgrade to generate multiple versions at once." });
    }
  }

  const rl = await checkRateLimit(req, "bio");
  if (!rl.allowed) {
    return res.status(429).json({ success: false, error: "Daily free limit reached. Upgrade to Premium for unlimited generations." });
  }

  const plat = platform || "Instagram";
  const v = vibe || "Fun & playful";
  const lang = language && language !== "English" ? ` Write it in ${language}.` : "";
  const base = `a ${String(v).toLowerCase()} ${plat} bio. Name:${name || "not given"}. Niche:${niche}. Location:${location || "not given"}. About:${about || "not given"}. Keep under 150 chars for IG/TikTok. Use 2-3 emojis. Use line breaks. Add CTA if IG or TikTok.${lang}`;
  const prompt = variations
    ? `Write 5 different variations of ${base} Each variation should use different wording but keep the same vibe. Separate each variation with a line containing only ---. Return ONLY the 5 variations, nothing else - no numbering, no explanations, no commentary.`
    : `Write ${base} Return ONLY the bio.`;

  const startedAt = Date.now();
  try {
    const { text, tokensUsed } = await callGemini(prompt, { maxOutputTokens: variations ? 2500 : 1000 });
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/bios", statusCode: 200, responseTimeMs: Date.now() - startedAt, tokensUsed });
    return res.status(200).json({ success: true, data: text.trim(), remaining: rl.remaining });
  } catch (e) {
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/bios", statusCode: 502, responseTimeMs: Date.now() - startedAt, tokensUsed: null });
    return res.status(502).json({ success: false, error: e.message });
  }
}
