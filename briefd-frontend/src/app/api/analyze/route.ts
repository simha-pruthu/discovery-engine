import { NextRequest, NextResponse } from "next/server";

const PYTHON_SERVER = "http://127.0.0.1:8000";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${PYTHON_SERVER}/analyze`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Python server error ${res.status}: ${text}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log("RAW DATA:", data);
    return NextResponse.json(data);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/analyze]", message);
    return NextResponse.json(
      { error: `Failed to reach analysis server: ${message}` },
      { status: 502 }
    );
  }
}