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