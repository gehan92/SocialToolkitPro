import { callGemini } from "../../../lib/gemini";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getAuthUser, getUserTier } from "../../../lib/getAuthUser";
import { logApiUsage } from "../../../lib/logUsage";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { creatorName, niche, stats, brandName, offer, format, language } = req.body || {};
  if (!niche || !String(niche).trim()) {
    return res.status(400).json({ success: false, error: "Your niche is required" });
  }

  const user = await getAuthUser(req);
  const tier = user ? await getUserTier(user.id) : "free";
  if (tier !== "pro") {
    return res.status(403).json({ success: false, error: "Pitch Writer is a Pro feature. Upgrade to Pro to unlock it." });
  }

  const rl = await checkRateLimit(req, "pitch");
  if (!rl.allowed) {
    return res.status(429).json({ success: false, error: "Daily limit reached." });
  }

  const name = creatorName || "the creator";
  const brand = brandName || "the brand";
  const fmt = format || "Email";
  const offr = offer || "sponsored content and product reviews";
  const lang = language && language !== "English" ? ` Write the pitch in ${language}.` : "";

  const fmtGuide = {
    Email: "Write a professional email with Subject line, greeting, body paragraphs, and sign-off. Total length: 200-280 words.",
    DM: "Write a short, friendly Instagram/TikTok DM pitch. Maximum 100 words. Casual but professional. Get to the point fast.",
    LinkedIn: "Write a LinkedIn connection message + follow-up pitch. Message 1 (connection request): under 300 characters. Message 2 (pitch): 150-200 words, professional tone.",
  }[fmt] || "Write a professional pitch message.";

  const statsLine = stats ? `My current audience stats: ${stats}.` : "";

  const prompt = `Write a brand collaboration pitch for a content creator to send to a brand.

Creator name: ${name}
Creator niche: ${niche}
${statsLine}
Brand to pitch: ${brand}
What the creator is offering: ${offr}
Pitch format: ${fmt}

${fmtGuide}

Requirements:
- Sound confident but not arrogant
- Show genuine knowledge of and interest in the brand
- Lead with value to the brand (not just "I love your products")
- Include a clear, specific proposal of what the collaboration would look like
- End with a clear next step (schedule a call, reply to discuss, etc.)
- Sound like a real human, not a template — avoid clichés like "I have been following you for years"
- Return ONLY the pitch content, nothing else${lang}`;

  const startedAt = Date.now();
  try {
    const { text, tokensUsed } = await callGemini(prompt, { maxOutputTokens: 1200 });
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/pitch", statusCode: 200, responseTimeMs: Date.now() - startedAt, tokensUsed });
    return res.status(200).json({ success: true, data: text.trim(), remaining: rl.remaining });
  } catch (e) {
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/pitch", statusCode: 502, responseTimeMs: Date.now() - startedAt, tokensUsed: null });
    return res.status(502).json({ success: false, error: e.message });
  }
}
