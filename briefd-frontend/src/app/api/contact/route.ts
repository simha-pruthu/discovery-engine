// Proxy route: forwards contact form submissions to FastAPI /contact
// Mirrors the pattern used in /api/analyze/route.ts

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });

    if (!response.ok) {
      let detail = `Request failed (${response.status})`;
      try {
        const errJson = await response.json();
        detail = errJson.detail ?? errJson.error ?? detail;
      } catch { /* ignore */ }
      return Response.json({ error: detail }, { status: response.status });
    }

    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      return Response.json({ error: "Request timed out." }, { status: 504 });
    }
    const cause =
      err instanceof Error && err.cause instanceof Error
        ? err.cause.message
        : null;
    const message =
      err instanceof Error ? err.message : "Unexpected error in contact route";
    return Response.json({ error: cause ?? message }, { status: 500 });
  }
}
