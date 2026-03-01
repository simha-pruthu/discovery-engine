// Allow up to 2 minutes for the scraping + Claude pipeline
export const maxDuration = 120;

interface RawTheme {
  name: string;
  frequency: number;
  emotional_intensity: number;
  primary_segment: string;
  quotes?: unknown[];
  confidence?: string;
  [key: string]: unknown;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // 110 s — leaves headroom under maxDuration
      signal: AbortSignal.timeout(110_000),
      cache: "no-store",
    });

    if (!response.ok) {
      // Forward the actual backend error so the UI can show it
      let detail = `Backend returned ${response.status}`;
      try {
        const errJson = await response.json();
        detail = errJson.detail ?? errJson.error ?? detail;
      } catch {
        // response body wasn't JSON, keep the status text
      }
      return Response.json({ error: detail }, { status: response.status });
    }

    const data = await response.json();

    // ----------------------------------------------------------------
    // Normalize emotional_intensity from the Claude 1-10 scale → 0-100
    // The prompt in synthesizer.py asks for 1-10, but the UI treats it
    // as a percentage (IntensityBar, display label).
    // ----------------------------------------------------------------
    if (Array.isArray(data.product?.themes)) {
      data.product.themes = data.product.themes.map((t: RawTheme) => {
        const raw = Number(t.emotional_intensity ?? 5);
        return {
          ...t,
          emotional_intensity: raw <= 10 ? Math.round(raw * 10) : raw,
        };
      });
    }

    return Response.json(data);
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      return Response.json(
        {
          error:
            "Analysis timed out after 110 s. The backend pipeline may still be running — check the server terminal.",
        },
        { status: 504 }
      );
    }

    // Unwrap the underlying cause (e.g. ECONNREFUSED) if present
    const cause = err instanceof Error && err.cause instanceof Error
      ? err.cause.message
      : null;
    const message = err instanceof Error ? err.message : "Unexpected error in proxy route";
    return Response.json({ error: cause ?? message }, { status: 500 });
  }
}
