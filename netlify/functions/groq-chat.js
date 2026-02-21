exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ error: "GROQ_API_KEY is not configured" })
    };
  }

  let requestData;
  try {
    requestData = JSON.parse(event.body || "{}");
  } catch (_error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid JSON body" })
    };
  }

  const message = String(requestData.message || "").trim();
  if (!message) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Message is required" })
    };
  }

  const history = Array.isArray(requestData.history)
    ? requestData.history
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
    "Sorry, I only answer questions about Neymar Jr. 😅 Try asking about his clubs, Brazil goals, trophies, or injuries.",
    "Keep replies concise (1 to 3 short paragraphs).",
    "If exact detail is missing, reply exactly:",
    "I don’t have that exact detail in my offline database yet — want the clubs, trophies, or Brazil stats instead?"
  ].join(" ");

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  try {
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
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
      const errorText = await groqResponse.text();
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: "Groq request failed", details: errorText.slice(0, 500) })
      };
    }

    const result = await groqResponse.json();
    const reply = result?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: "Empty response from Groq" })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server error", details: String(error.message || error) })
    };
  }
};
