const openRoute_url = "https://openrouter.ai/api/v1/chat/completions";

// Valid free models available on OpenRouter
const DEFAULT_MODELS = [
  "google/gemma-4-26b-a4b-it:free",
  "google/gemma-4-31b-it:free",
  "openai/gpt-oss-20b:free",
  "cohere/north-mini-code:free",
  "google/gemini-2.0-flash-001"
];

export const generateResponse = async (input, customModelOverride = null) => {
  const startTime = Date.now();
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
        content: "You are a JSON-only website generator. You MUST return ONLY valid raw JSON matching the requested schema without any markdown wrapping or preambles.",
      },
      {
        role: "user",
        content: input,
      },
    ];
  } else if (Array.isArray(input)) {
    messages = input;
  }

  // Model resolution strategy
  const configuredModel = process.env.AI_MODEL ? process.env.AI_MODEL.trim() : null;
  const candidateModels = customModelOverride
    ? [customModelOverride, ...DEFAULT_MODELS]
    : configuredModel
    ? [configuredModel, ...DEFAULT_MODELS]
    : DEFAULT_MODELS;

  // Deduplicate candidates while preserving order
  const modelsToTry = [...new Set(candidateModels)];

  let lastError = null;

  for (let idx = 0; idx < modelsToTry.length; idx++) {
    const modelToUse = modelsToTry[idx];
    const callStartTime = Date.now();

    console.log(`[AI Service] Attempt ${idx + 1}/${modelsToTry.length}: Sending request to OpenRouter using model: ${modelToUse}`);

    try {
      // 50 second timeout per AI API request to prevent pending connections
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000);

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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const callDuration = Date.now() - callStartTime;

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[AI Service Warning] OpenRouter (${modelToUse}) status ${res.status} after ${callDuration}ms: ${errText}`);
        lastError = new Error(`OpenRouter (${modelToUse}) status ${res.status}: ${errText}`);
        continue; // Try next model in fallback list
      }

      const data = await res.json();
      const totalDuration = Date.now() - startTime;

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content;
        console.log(`[AI Service Success] Website generation completed in ${callDuration}ms (Total: ${totalDuration}ms) using model: ${modelToUse}. Response size: ${content.length} chars.`);
        return content;
      } else {
        console.warn(`[AI Service Warning] Invalid response structure from OpenRouter (${modelToUse}):`, JSON.stringify(data));
        lastError = new Error(`OpenRouter (${modelToUse}) returned empty choices structure`);
        continue;
      }
    } catch (err) {
      const callDuration = Date.now() - callStartTime;
      const isAbort = err.name === "AbortError";
      const errReason = isAbort ? "Request timed out after 50s" : err.message;
      console.warn(`[AI Service Warning] Attempt ${idx + 1} (${modelToUse}) failed in ${callDuration}ms: ${errReason}`);
      lastError = new Error(`OpenRouter (${modelToUse}) failed: ${errReason}`);
    }
  }

  const totalDuration = Date.now() - startTime;
  console.error(`[AI Service Fatal] All model attempts failed after ${totalDuration}ms`);
  throw lastError || new Error("All AI model attempts failed");
};