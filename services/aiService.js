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

export const generateProductCopy = async ({ roughTitle, category, keyFeatures }) => {
  const prompt = `Write professional eCommerce product copy for this listing.

Rough input from the seller:
- Product: "${roughTitle}"
- Category: "${category}"
- Key features/notes: "${keyFeatures || "none provided"}"

Return ONLY a raw JSON object (no markdown, no explanation) with these exact fields:
{
  "title": "a polished, concise product title (max 70 characters)",
  "description": "a compelling 2-4 sentence product description highlighting benefits, written for online shoppers"
}`;

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
    text = text.replace(/```json|```/g, "").trim();

    return JSON.parse(text);
  } catch (err) {
    console.log("Product copy generation failed:", err.message);
    return { title: roughTitle, description: keyFeatures || "" };
  }
};

export const suggestCategory = async ({ title, description, existingCategories }) => {
  const prompt = `Suggest a category and subcategory for this product listing.

Product title: "${title}"
Product description: "${description}"

Existing categories/subcategories already used on this marketplace:
${JSON.stringify(existingCategories)}

Rules:
- Prefer reusing an existing category/subCategory if it's a good fit, to keep the catalog organized.
- Only suggest a brand new category if none of the existing ones reasonably fit.

Return ONLY a raw JSON object (no markdown, no explanation):
{
  "category": "string",
  "subCategory": "string",
  "isNewCategory": true or false
}`;

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
    text = text.replace(/```json|```/g, "").trim();

    return JSON.parse(text);
  } catch (err) {
    console.log("Category suggestion failed:", err.message);
    return { category: "Uncategorized", subCategory: "", isNewCategory: true };
  }
};

export const summarizeReviews = async (reviews) => {
  if (!reviews || reviews.length === 0) {
    return { pros: [], cons: [] };
  }

  const reviewText = reviews
    .map((r, i) => `Review ${i + 1} (rating ${r.rating}/5): "${r.comment || "(no comment)"}"`)
    .join("\n");

  const prompt = `Summarize these product reviews into quick pros and cons for a shopper skimming a product page.

${reviewText}

Return ONLY a raw JSON object (no markdown, no explanation):
{
  "pros": ["short phrase", "short phrase"],
  "cons": ["short phrase", "short phrase"]
}

Keep each phrase under 8 words. Maximum 4 pros and 4 cons. Only include cons if reviews actually mention downsides — don't invent any.`;

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
    text = text.replace(/```json|```/g, "").trim();

    return JSON.parse(text);
  } catch (err) {
    console.log("Review summarization failed:", err.message);
    return { pros: [], cons: [] };
  }
};

export const generateWishlistNudge = async (wishlistItems) => {
  if (!wishlistItems || wishlistItems.length === 0) {
    return null;
  }

  const itemsText = wishlistItems
    .map((p) => `- ${p.title}: ₹${p.price}, ${p.stock} in stock`)
    .join("\n");

  const prompt = `A buyer has these items saved in their wishlist:

${itemsText}

Write ONE short, friendly nudge message (max 25 words) encouraging them to complete their purchase. Mention a specific item by name. If stock is low (under 10), you can mention urgency. Don't be pushy or use excessive exclamation marks.

Return ONLY the message text, no quotes, no JSON, no explanation.`;

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
    const message = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    return message;
  } catch (err) {
    console.log("Wishlist nudge generation failed:", err.message);
    return null;
  }
};

export const generateAnalyticsSummary = async (stats) => {
  const prompt = `All monetary values below are in Indian Rupees (INR). Always write them with a ₹ prefix (e.g. ₹2499), never $ or any other currency symbol.

Here is raw analytics data for an eCommerce platform/seller:

${JSON.stringify(stats, null, 2)}

Write a short, plain-English summary (2-3 sentences max) highlighting the most notable insight — e.g., a top-performing category, a standout product, or overall sales health. Be specific and reference actual numbers/names from the data. Don't invent trends the data doesn't support (we don't have historical time-series data, so don't claim something is "trending up" or "down" over time — just describe the current snapshot).

Return ONLY the summary text, no markdown, no JSON, no explanation.`;

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
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    return summary;
  } catch (err) {
    console.log("Analytics summary generation failed:", err.message);
    return null;
  }
};