import { callGemini } from "../../../lib/gemini";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getAuthUser, getUserTier } from "../../../lib/getAuthUser";
import { logApiUsage } from "../../../lib/logUsage";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { content, sourcePlatform, targets, language } = req.body || {};
  if (!content || !String(content).trim()) {
    return res.status(400).json({ success: false, error: "Original content is required" });
  }

  const user = await getAuthUser(req);
  const tier = user ? await getUserTier(user.id, user.email) : "free";
  if (tier === "free") {
    return res.status(403).json({ success: false, error: "Content Repurposer is a Premium feature. Upgrade to unlock it." });
  }

  const rl = await checkRateLimit(req, "repurpose");
  if (!rl.allowed) {
    return res.status(429).json({ success: false, error: "Daily limit reached." });
  }

  const source = sourcePlatform || "Instagram";
  const targetList = Array.isArray(targets) && targets.length > 0
    ? targets
    : ["LinkedIn", "Twitter/X", "TikTok"];
  const lang = language && language !== "English" ? ` Write all versions in ${language}.` : "";

  const targetInstructions = targetList.map((plat) => {
    if (plat === "Twitter/X") return `- Twitter/X: Condense to under 280 characters. Keep the core message, add 1-2 hashtags.`;
    if (plat === "LinkedIn") return `- LinkedIn: Professional tone, 3-5 sentences, no slang, end with a thoughtful question to drive engagement.`;
    if (plat === "TikTok") return `- TikTok: Casual, punchy, start with a hook, add trending-style language and emojis. Under 150 characters.`;
    if (plat === "Instagram") return `- Instagram: Engaging, use emojis naturally, add a CTA, keep it 3-5 lines, end with a question or invitation.`;
    if (plat === "Facebook") return `- Facebook: Conversational, slightly longer (5-8 lines), warm and friendly tone, end with a question.`;
    if (plat === "YouTube") return `- YouTube Community Post: Friendly and direct, 2-3 sentences, invite comments.`;
    return `- ${plat}: Adapt tone and length appropriately for the platform.`;
  }).join("\n");

  const prompt = `Repurpose the following ${source} content for other social media platforms.

ORIGINAL CONTENT:
"${content}"

Rewrite it for each platform below, adapting the tone, length, and style to match each platform's culture:
${targetInstructions}

Format your response EXACTLY like this — use the platform name as a heading on its own line, then the content:

PLATFORM NAME
[content here]

---

PLATFORM NAME
[content here]

Do NOT add any commentary, explanations, or labels beyond the platform name heading.${lang}`;

  const startedAt = Date.now();
  try {
    const { text, tokensUsed } = await callGemini(prompt, { maxOutputTokens: 2500 });
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/repurpose", statusCode: 200, responseTimeMs: Date.now() - startedAt, tokensUsed });
    return res.status(200).json({ success: true, data: text.trim(), remaining: rl.remaining });
  } catch (e) {
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/repurpose", statusCode: 502, responseTimeMs: Date.now() - startedAt, tokensUsed: null });
    return res.status(502).json({ success: false, error: e.message });
  }
}
