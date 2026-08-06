export const extrajson = (text) => {
  if (!text || typeof text !== "string") return null;

  try {
    // 1. Try direct parse first if raw JSON was returned
    const trimmed = text.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        // Fall through to extraction logic
      }
    }

    // 2. Strip markdown code fence markers
    let cleaned = trimmed
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // 3. Find first '{' and last '}'
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");

    if (first === -1 || last === -1 || last <= first) {
      console.warn("[JSON Extractor Warning] No JSON object braces found in response");
      return null;
    }

    let jsonString = cleaned.slice(first, last + 1);

    // 4. Try parsing extracted string
    try {
      return JSON.parse(jsonString);
    } catch (err) {
      // Clean invalid control characters (e.g., raw unescaped tabs or newlines inside string literals)
      const sanitized = jsonString
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, (c) =>
          c === "\n" ? "\\n" : c === "\r" ? "\\r" : c === "\t" ? "\\t" : ""
        );
      return JSON.parse(sanitized);
    }
  } catch (err) {
    console.error("[JSON Extractor Error] Failed to parse JSON:", err.message);
    return null;
  }
};