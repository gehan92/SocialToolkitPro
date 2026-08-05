import { callGemini } from "../../../lib/gemini";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getAuthUser, getUserTier } from "../../../lib/getAuthUser";
import { logApiUsage } from "../../../lib/logUsage";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { topic, type, expertise, language } = req.body || {};
  if (!topic || !String(topic).trim()) {
    return res.status(400).json({ success: false, error: "Topic is required" });
  }

  const user = await getAuthUser(req);
  const tier = user ? await getUserTier(user.id, user.email) : "free";
  if (tier !== "pro") {
    return res.status(403).json({ success: false, error: "Technical Writing Assistant is a Pro feature. Upgrade to Pro to unlock it." });
  }

  const rl = await checkRateLimit(req, "tech-writing");
  if (!rl.allowed) {
    return res.status(rl.code || 429).json({ success: false, error: rl.message, resetAt: rl.resetAt });
  }

  const t = type || "How-to Guide";
  const exp = expertise || "Beginner";
  const lang = language && language !== "English" ? ` Write the content in ${language}.` : "";

  const expGuide = {
    Beginner: "Use plain language. Define all technical terms when first used. Avoid assumed knowledge. Include 'why' explanations before 'how'.",
    Intermediate: "Assume basic familiarity with the field. Skip basic definitions but explain advanced concepts. Include practical examples.",
    Expert: "Use technical terminology freely. Skip fundamentals. Focus on edge cases, best practices, and nuanced detail.",
  }[exp] || "";

  const typeGuide = {
    "How-to Guide": "Structure: Introduction → Prerequisites → Step-by-step instructions (numbered) → Expected result → Troubleshooting tips → Summary",
    "Tutorial": "Structure: Overview → Learning objectives (bullet list) → Concepts explained → Hands-on walkthrough (numbered steps with explanations) → Practice exercise → Key takeaways",
    "Documentation": "Structure: Overview → Parameters/Options (table format) → Usage examples (code blocks marked with ```) → Return values → Error handling → Examples",
    "FAQ": "Structure: 8-10 common questions formatted as Q: and A: pairs. Each answer should be 2-4 sentences. Cover both basic and advanced questions.",
  }[t] || "Structure the content logically with clear headings.";

  const prompt = `Write professional technical content for the following topic.

Topic: "${topic}"
Content type: ${t}
Audience expertise level: ${exp}

${expGuide}

${typeGuide}

Additional rules:
- Use clear H2 and H3 headings (format as ## and ###)
- Use bullet points and numbered lists where appropriate
- Keep sentences concise and scannable
- Use bold for key terms or important notes
- Include a brief introduction and a conclusion/summary
- Return ONLY the content, no meta-commentary${lang}`;

  const startedAt = Date.now();
  try {
    const { text, tokensUsed } = await callGemini(prompt, { maxOutputTokens: 3000 });
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/tech-writing", statusCode: 200, responseTimeMs: Date.now() - startedAt, tokensUsed });
    return res.status(200).json({ success: true, data: text.trim(), remaining: rl.remaining });
  } catch (e) {
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/tech-writing", statusCode: 502, responseTimeMs: Date.now() - startedAt, tokensUsed: null });
    return res.status(502).json({ success: false, error: e.message });
  }
}
