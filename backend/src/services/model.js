const openRoute_url = "https://openrouter.ai/api/v1/chat/completions";

const MODELS = [
  process.env.AI_MODEL || "google/gemini-2.0-flash-001",
  "deepseek/deepseek-chat",
  "qwen/qwen-2.5-coder-32b-instruct",
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
];

export const generateResponse = async (input) => {
  const apiKey =
    process.env.OPEN_ROUTE_API_KEY ||
    process.env["OPEN_ROUTE_API_KEY "] ||
    "";

  const cleanApiKey = apiKey ? apiKey.trim() : "";

  if (!cleanApiKey) {
    throw new Error("OPEN_ROUTE_API_KEY is missing in environment variables");
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

  let lastError = null;

  for (const model of MODELS) {
    try {
      console.log(`[AI Service] Attempting call to OpenRouter with model: ${model}`);
      const res = await fetch(openRoute_url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cleanApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "GenWeb AI",
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 0.2,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[AI Service] Model ${model} returned error status ${res.status}: ${errText}`);
        lastError = new Error(`OpenRouter (${model}) status ${res.status}: ${errText}`);
        continue; // Try next model
      }

      const data = await res.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        console.log(`[AI Service] Success with model: ${model}`);
        return data.choices[0].message.content;
      }
    } catch (err) {
      console.warn(`[AI Service] Model ${model} fetch exception:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("All AI models failed to return a response from OpenRouter");
};