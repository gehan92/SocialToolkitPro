import { callGemini } from "../../../lib/gemini";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getAuthUser, getUserTier } from "../../../lib/getAuthUser";
import { logApiUsage } from "../../../lib/logUsage";

const LENGTH_MAP = {
  short: "1-2 lines",
  medium: "3-5 lines",
  long: "7-10 lines story style",
};

const PREMIUM_TONES = ["Funny", "Motivational", "Romantic", "Sarcastic", "Storytelling", "Custom"];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { description, tone, platform, length, variations, customVoice, language } = req.body || {};
  if (!description || !String(description).trim()) {
    return res.status(400).json({ success: false, error: "Description is required" });
  }

  const user = await getAuthUser(req);

  const needsPremium = variations || PREMIUM_TONES.includes(tone);
  if (needsPremium) {
    const tier = user ? await getUserTier(user.id, user.email) : "free";
    if (tier === "free") {
      const reason = variations ? "Variations" : `The "${tone}" tone`;
      return res.status(403).json({ success: false, error: `${reason} is a Premium feature. Upgrade to unlock it.` });
    }
  }

  const rl = await checkRateLimit(req, "caption");
  if (!rl.allowed) {
    return res.status(429).json({ success: false, error: "Daily free limit reached. Upgrade to Premium for unlimited generations." });
  }

  const plat = platform || "Instagram";
  const len = LENGTH_MAP[length] || LENGTH_MAP.medium;
  const toneDescriptor =
    tone === "Custom" && customVoice && String(customVoice).trim()
      ? `a ${plat} caption written in this specific voice/style: "${String(customVoice).trim()}"`
      : `a ${String(tone || "Inspirational").toLowerCase()} ${plat} caption`;
  const lang = language && language !== "English" ? ` Write it in ${language}.` : "";
  const base = `${toneDescriptor} for: "${description}". Length: ${len}. Include 2-3 emojis naturally. End with a call to action.${lang}`;
  const prompt = variations
    ? `Write 5 different variations of ${base} Each variation should use different wording but keep the same tone and meaning. Separate each variation with a line containing only ---. Return ONLY the 5 variations, nothing else - no numbering, no explanations, no commentary.`
    : `Write ${base} Return ONLY the caption.`;

  const startedAt = Date.now();
  try {
    const { text, tokensUsed } = await callGemini(prompt, { maxOutputTokens: variations ? 3000 : 2000 });
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/captions", statusCode: 200, responseTimeMs: Date.now() - startedAt, tokensUsed });
    return res.status(200).json({ success: true, data: text.trim(), remaining: rl.remaining });
  } catch (e) {
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/captions", statusCode: 502, responseTimeMs: Date.now() - startedAt, tokensUsed: null });
    return res.status(502).json({ success: false, error: e.message });
  }
}
