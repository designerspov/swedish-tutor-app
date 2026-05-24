// Vercel serverless function: proxies POST /api/messages -> https://api.anthropic.com/v1/messages,
// injecting the ANTHROPIC_API_KEY from server env so it never reaches the browser.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ type: "error", error: { type: "method_not_allowed", message: "POST only" } });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ type: "error", error: { type: "config", message: "ANTHROPIC_API_KEY not set on server" } });
    return;
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader("content-type", upstream.headers.get("content-type") || "application/json");
    res.send(text);
  } catch (err) {
    res.status(502).json({ type: "error", error: { type: "upstream", message: err.message || String(err) } });
  }
}
