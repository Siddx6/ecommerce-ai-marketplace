const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export const parseSearchIntent = async (rawQuery) => {
  const prompt = `Extract search filters from this shopping query: "${rawQuery}"

Return ONLY a raw JSON object (no markdown, no explanation) with these exact fields:
{
  "keywords": "string of core product keywords, with filler words like 'cheap', 'under', 'best' removed",
  "maxPrice": number or null,
  "minPrice": number or null
}

Examples:
"cheap wireless headphones under 2000" -> {"keywords": "wireless headphones", "maxPrice": 2000, "minPrice": null}
"phone cases" -> {"keywords": "phone cases", "maxPrice": null, "minPrice": null}`;

  try {
    const response = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Strip markdown code fences if Gemini adds them anyway
    text = text.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(text);
    return parsed;
  } catch (err) {
    console.log("AI intent parsing failed, falling back to raw query:", err.message);
    // Fallback: treat the whole query as plain keywords, no price extracted
    return { keywords: rawQuery, maxPrice: null, minPrice: null };
  }
};

export const chatWithAssistant = async ({ message, history = [], viewingProduct = null, catalogSnapshot = [] }) => {
  const systemInstruction = `You are a helpful shopping assistant for an online marketplace.

Rules:
- Only recommend or describe products from the CATALOG below. Never invent products, prices, or stock that aren't listed.
- If asked about something not in the catalog, say it's not currently available.
-- Keep answers short, friendly, and focused on helping the buyer decide.
- All prices are in Indian Rupees (INR). Always show prices exactly as given, prefixed with ₹ (e.g., a price of 2499 should be shown as ₹2499). Never convert to another currency or reformat the number.

CATALOG (available products right now):
${JSON.stringify(catalogSnapshot)}
${viewingProduct ? `\nThe buyer is currently viewing this specific product:\n${JSON.stringify(viewingProduct)}` : ""}`;

  const contents = history.map((turn) => ({
    role: turn.role === "assistant" ? "model" : "user",
    parts: [{ text: turn.text }],
  }));
  contents.push({ role: "user", parts: [{ text: message }] });

  try {
    const response = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
    return reply;
  } catch (err) {
    console.log("Assistant chat failed:", err.message);
    return "Sorry, I'm having trouble responding right now. Please try again in a moment.";
  }
};