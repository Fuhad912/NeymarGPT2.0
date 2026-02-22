module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "GROQ_API_KEY is not configured" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (_error) {
      res.status(400).json({ error: "Invalid JSON body" });
      return;
    }
  }
  body = body && typeof body === "object" ? body : {};

  const message = String(body.message || "").trim();
  if (!message) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  const history = Array.isArray(body.history)
    ? body.history
        .filter(
          (entry) =>
            entry &&
            (entry.role === "user" || entry.role === "assistant") &&
            typeof entry.content === "string"
        )
        .map((entry) => ({
          role: entry.role,
          content: entry.content.trim()
        }))
        .filter((entry) => entry.content)
        .slice(-10)
    : [];

  const systemPrompt = [
    "You are NeymarGPT.",
    "You only answer questions about Neymar Jr.",
    "If the question is unrelated, reply exactly:",
    "Sorry, I only answer questions about Neymar Jr. Try asking about his clubs, Brazil goals, trophies, or injuries.",
    "Keep replies concise (1 to 3 short paragraphs).",
    "If exact detail is missing, reply exactly:",
    "I don't have that exact detail in my offline database yet - want the clubs, trophies, or Brazil stats instead?"
  ].join(" ");

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  try {
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        max_tokens: 320,
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: message }
        ]
      })
    });

    if (!groqResponse.ok) {
      const details = await groqResponse.text();
      res.status(502).json({
        error: "Groq request failed",
        details: details.slice(0, 500)
      });
      return;
    }

    const result = await groqResponse.json();
    const reply = result && result.choices && result.choices[0] && result.choices[0].message
      ? String(result.choices[0].message.content || "").trim()
      : "";

    if (!reply) {
      res.status(502).json({ error: "Empty response from Groq" });
      return;
    }

    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: String((error && error.message) || error)
    });
  }
};
