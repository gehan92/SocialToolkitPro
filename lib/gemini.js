// gemini-flash-latest is a "thinking" model - it spends ~600-800 tokens on
// internal reasoning before writing any visible output, and maxOutputTokens
// caps thinking + visible output combined. A budget too close to that
// overhead silently truncates the visible result (e.g. "generate 10 hooks"
// coming back with only 2) even though the API call itself succeeds - so
// every caller's budget needs real headroom above ~800, not just enough for
// the expected visible text.
export async function callGemini(prompt, { maxOutputTokens = 2500 } = {}) {
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

  const candidate = d.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text || "";

  if (candidate?.finishReason === "SAFETY" || candidate?.finishReason === "RECITATION") {
    throw new Error("The request was blocked by content safety filters. Please try different wording.");
  }
  if (!text) {
    throw new Error("No result returned. Please try again.");
  }
  // maxOutputTokens caps thinking + visible output combined (see note above) -
  // if the model ran out of budget mid-answer, `text` is a partial/cut-off
  // result, not a complete one. Surfacing that as an error instead of
  // silently returning broken content (e.g. "generate 10 hooks" quietly
  // coming back with only 6, or a description cut off mid-sentence).
  if (candidate?.finishReason === "MAX_TOKENS") {
    throw new Error("The response was too long and got cut off. Please try again, or ask for fewer items.");
  }
  return { text, tokensUsed: d.usageMetadata?.totalTokenCount ?? null };
}
