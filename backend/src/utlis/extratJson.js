export const extrajson = (text) => {
    if (!text) return null;

    try {
        const cleaned = text
            .replace(/^```json/i, "")
            .replace(/^```/gm, "")
            .trim();

        const first = cleaned.indexOf("{");
        const last = cleaned.lastIndexOf("}");

        if (first === -1 || last === -1) {
            return null;
        }

        const jsonString = cleaned.slice(first, last + 1);

        return JSON.parse(jsonString);

    } catch (err) {
        console.error("JSON Parse Error:", err.message);
        console.log("Received Response:\n", text);
        return null;
    }
};