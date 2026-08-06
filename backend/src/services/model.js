const openRoute_url = "https://openrouter.ai/api/v1/chat/completions";

// Single primary AI model strictly used for website generation
const PRIMARY_MODEL = "google/gemini-2.0-flash-exp:free";

export const generateResponse = async (input) => {
  const apiKey = (
    process.env.OPEN_ROUTE_API_KEY ||
    process.env["OPEN_ROUTE_API_KEY "] ||
    ""
  ).trim();

  if (!apiKey) {
    const errorMsg = "[AI Service Error] OPEN_ROUTE_API_KEY is missing in environment variables";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  let messages = [];
  if (typeof input === "string") {
    messages = [
      {
        role: "system",
        content: "You must return only valid raw JSON without any markdown formatting or preambles.",
      },
      {
        role: "user",
        content: input,
      },
    ];
  } else if (Array.isArray(input)) {
    messages = input;
  }

  const modelToUse = (process.env.AI_MODEL && process.env.AI_MODEL.trim().startsWith("google/gemini"))
    ? process.env.AI_MODEL.trim()
    : PRIMARY_MODEL;

  console.log(`[AI Service] Sending request to OpenRouter using primary model: ${modelToUse}`);

  try {
    const res = await fetch(openRoute_url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://websitegenai.onrender.com",
        "X-Title": "GenWeb AI",
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: messages,
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[AI Service Error] OpenRouter (${modelToUse}) status ${res.status}: ${errText}`);
      throw new Error(`OpenRouter (${modelToUse}) status ${res.status}: ${errText}`);
    }

    const data = await res.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log(`[AI Service] Website generation successful using model: ${modelToUse}`);
      return data.choices[0].message.content;
    } else {
      console.error(`[AI Service Error] Invalid response structure from OpenRouter:`, JSON.stringify(data));
      throw new Error("OpenRouter returned empty or invalid choices structure");
    }
  } catch (err) {
    console.error(`[AI Service Exception] Website generation failed:`, err.message);
    throw err;
  }
};