// Vercel serverless function: proxies any /api/anthropic/* call to api.anthropic.com,
// injecting the ANTHROPIC_API_KEY from server-side env so it never reaches the browser.

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ type: "error", error: { type: "config", message: "ANTHROPIC_API_KEY not set on server" } }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  const url = new URL(req.url);
  // Strip the leading /api/anthropic and forward the rest to api.anthropic.com
  const upstreamPath = url.pathname.replace(/^\/api\/anthropic/, "");
  const upstream = `https://api.anthropic.com${upstreamPath}${url.search}`;

  // Forward only safe headers; we inject our own auth + version.
  const headers = new Headers();
  headers.set("content-type", req.headers.get("content-type") || "application/json");
  headers.set("x-api-key", apiKey);
  headers.set("anthropic-version", "2023-06-01");

  let body;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.text();
  }

  const upstreamRes = await fetch(upstream, {
    method: req.method,
    headers,
    body,
  });

  // Pass through status and JSON body. Streaming responses aren't used here yet.
  const respBody = await upstreamRes.text();
  return new Response(respBody, {
    status: upstreamRes.status,
    headers: {
      "content-type": upstreamRes.headers.get("content-type") || "application/json",
    },
  });
}
