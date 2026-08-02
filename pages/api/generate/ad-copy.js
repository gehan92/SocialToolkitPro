import { callGemini } from "../../../lib/gemini";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getAuthUser, getUserTier } from "../../../lib/getAuthUser";
import { logApiUsage } from "../../../lib/logUsage";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { product, benefit, audience, platform, objective, language } = req.body || {};
  if (!product || !String(product).trim()) {
    return res.status(400).json({ success: false, error: "Product or service name is required" });
  }

  const user = await getAuthUser(req);
  const tier = user ? await getUserTier(user.id, user.email) : "free";
  if (tier !== "pro") {
    return res.status(403).json({ success: false, error: "Ad Copy Writer is a Pro feature. Upgrade to Pro to unlock it." });
  }

  const rl = await checkRateLimit(req, "ad-copy");
  if (!rl.allowed) {
    return res.status(429).json({ success: false, error: "Daily limit reached." });
  }

  const plat = platform || "Facebook/Instagram";
  const ben = benefit || "saves time and money";
  const aud = audience || "general audience";
  const obj = objective || "Conversions";
  const lang = language && language !== "English" ? ` Write the ad copy in ${language}.` : "";

  const prompt = `Write professional ad copy for a ${plat} advertisement.

Product/Service: "${product}"
Key benefit: ${ben}
Target audience: ${aud}
Campaign objective: ${obj}

Write 3 complete ad variations. Each variation must include:

HEADLINE: (under 40 characters — bold, attention-grabbing)
PRIMARY TEXT: (under 125 characters — lead with the benefit, speak to the audience's pain point)
DESCRIPTION: (under 30 characters — reinforce the offer or urgency)
CTA BUTTON: (choose one: Learn More / Shop Now / Sign Up / Get Started / Download / Book Now)

Rules:
- Variation 1: Benefit-led (focus on the transformation or gain)
- Variation 2: Problem-led (start with the audience's pain point)
- Variation 3: Social proof or urgency-led (use numbers, trust signals, or scarcity)
- Use clear, everyday language — no corporate jargon
- Make the audience feel like the ad was written for them specifically
- Return ONLY the 3 variations in the format above, separated by ---${lang}`;

  const startedAt = Date.now();
  try {
    const { text, tokensUsed } = await callGemini(prompt, { maxOutputTokens: 2500 });
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/ad-copy", statusCode: 200, responseTimeMs: Date.now() - startedAt, tokensUsed });
    return res.status(200).json({ success: true, data: text.trim(), remaining: rl.remaining });
  } catch (e) {
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/ad-copy", statusCode: 502, responseTimeMs: Date.now() - startedAt, tokensUsed: null });
    return res.status(502).json({ success: false, error: e.message });
  }
}
