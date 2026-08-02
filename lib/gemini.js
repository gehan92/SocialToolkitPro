export async function callGemini(prompt, { maxOutputTokens = 1000 } = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Server misconfigured: GEMINI_API_KEY is not set");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens, temperature: 0.7 },
    }),
  });

  const d = await r.json();
  if (d.error) {
    throw new Error(d.error.message || "Google API error");
  }

  const text = d.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text) {
    throw new Error("No result returned. Please try again.");
  }
  return { text, tokensUsed: d.usageMetadata?.totalTokenCount ?? null };
}
