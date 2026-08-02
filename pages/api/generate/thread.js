import { callGemini } from "../../../lib/gemini";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getAuthUser } from "../../../lib/getAuthUser";
import { logApiUsage } from "../../../lib/logUsage";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { topic, count, tone, platform, language } = req.body || {};
  if (!topic || !String(topic).trim()) {
    return res.status(400).json({ success: false, error: "Topic is required" });
  }

  const rl = await checkRateLimit(req, "thread");
  if (!rl.allowed) {
    return res.status(429).json({ success: false, error: "Daily free limit reached. Upgrade to Premium for unlimited generations." });
  }

  const n = count || 7;
  const t = tone || "Educational";
  const plat = platform || "Twitter/X";
  const lang = language && language !== "English" ? ` Write the thread in ${language}.` : "";

  const charLimit = plat === "LinkedIn" ? "700 characters" : "280 characters";
  const prompt = `Write a ${t.toLowerCase()} ${plat} thread about: "${topic}".

The thread must have exactly ${n} posts.
Each post must be under ${charLimit}.
Format EXACTLY like this - each tweet on its own numbered line:

1/ [tweet text here]

2/ [tweet text here]

3/ [tweet text here]

Rules:
- Start with a strong hook on post 1/ that makes people want to read the rest
- End the last post with a CTA (follow, share, or retweet)
- Use line breaks naturally within tweets for readability
- Include relevant emojis naturally
- Do NOT add any commentary, headings, or explanations - only the numbered tweets${lang}`;

  const user = await getAuthUser(req);
  const startedAt = Date.now();
  try {
    const { text, tokensUsed } = await callGemini(prompt, { maxOutputTokens: 2500 });
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/thread", statusCode: 200, responseTimeMs: Date.now() - startedAt, tokensUsed });
    return res.status(200).json({ success: true, data: text.trim(), remaining: rl.remaining });
  } catch (e) {
    await logApiUsage({ userId: user?.id, endpoint: "/api/generate/thread", statusCode: 502, responseTimeMs: Date.now() - startedAt, tokensUsed: null });
    return res.status(502).json({ success: false, error: e.message });
  }
}
