from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import uvicorn
import smtplib
import os
from email.mime.text import MIMEText

from synthesizer import (
    run_pipeline,
    collect_signals,
    classify_signals,
    cluster_themes,
    compute_summary,
    validate_and_classify,
    enrich_product_context,
)

app = FastAPI(title="Briefd API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)


class AnalyzeRequest(BaseModel):
    product: str
    competitors: List[str] = []


# ──────────────────────────────────────────────────────────────
# Lightweight competitor analysis (no enrichment, no routing)
# ──────────────────────────────────────────────────────────────
def lightweight_analysis(product_name: str) -> Dict[str, Any]:
    signals = collect_signals(product_name, [])
    signals = classify_signals(signals)

    negative = [s for s in signals if s.get("sentiment") == "negative"]
    themes = cluster_themes(negative)
    summary = compute_summary(signals)

    return {
        "themes": themes,
        "summary": summary
    }


# ──────────────────────────────────────────────────────────────
# Competitor comparison logic
# ──────────────────────────────────────────────────────────────
def compare_themes(product_data, competitor_data, competitor_name):
    product_themes = {t["name"] for t in product_data.get("themes", [])}
    competitor_themes = {t["name"] for t in competitor_data.get("themes", [])}

    return {
        "name": competitor_name,
        "negative_rate": competitor_data.get("summary", {}).get("negative_rate", 0),
        "shared": list(product_themes & competitor_themes),
        "unique_to_product": list(product_themes - competitor_themes),
        "unique_to_competitor": list(competitor_themes - product_themes),
    }


# ──────────────────────────────────────────────────────────────
# Main Analysis Endpoint
# ──────────────────────────────────────────────────────────────

@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    try:
        print("[Analyze] route hit")

        is_valid, category, error_msg = validate_and_classify(req.product)

        if not is_valid:
            raise HTTPException(status_code=400, detail=error_msg)

        if not category or category.lower() == "unknown":
            category = "Other"

        enrichment_context = enrich_product_context(req.product, category)

        pipeline_output = run_pipeline(
            req.product,
            [],
            category=category,
            enrichment_context=enrichment_context,
        )

        # ── Insufficient signal guard ─────────────────────────────────────
        if pipeline_output.get("insufficient_data"):
            print(f"[InsufficientData] Low signal for '{req.product}' - returning structured response.")
            return {
                "category": category,
                "product": {},
                "competitors": [],
                "insufficient_data": True,
                "message": pipeline_output.get(
                    "message", "Not enough public signals found."
                ),
            }
        # ─────────────────────────────────────────────────────────────────

        product_result = pipeline_output.get("product", {})
        competitor_results = []

        print(f"[Analyze] Returning category={category}, "
              f"themes={len(product_result.get('themes', []))}, "
              f"insights={'yes' if product_result.get('insights') else 'no'}")

        return {
            "category": category,
            "product": product_result,
            "competitors": competitor_results
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ──────────────────────────────────────────────────────────────
# Contact Endpoint
# Sends an email via SMTP if env vars are configured.
# Falls back to console-log stub if SMTP is not set up.
# Does NOT touch /analyze logic.
# ──────────────────────────────────────────────────────────────

CONTACT_TO = "pvh2108@columbia.edu"

class ContactRequest(BaseModel):
    name: str
    email: str
    type: str
    message: str


@app.post("/contact")
def contact(req: ContactRequest):
    smtp_host = os.getenv("SMTP_HOST", "")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASSWORD", "")

    subject = f"[Briefd] {req.type} from {req.name}"
    body = (
        f"Name:    {req.name}\n"
        f"Email:   {req.email}\n"
        f"Type:    {req.type}\n"
        f"\n{req.message}"
    )

    if smtp_host and smtp_user and smtp_pass:
        # ── SMTP send ────────────────────────────────────────────────────
        try:
            msg = MIMEText(body, "plain", "utf-8")
            msg["Subject"] = subject
            msg["From"] = smtp_user
            msg["To"] = CONTACT_TO
            msg["Reply-To"] = req.email
            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.ehlo()
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
            print(f"[Contact] Email sent to {CONTACT_TO} ({req.type})")
            return {"ok": True}
        except Exception as exc:
            print(f"[Contact] SMTP failed: {exc}")
            raise HTTPException(status_code=500, detail="Failed to send email.")
    else:
        # ── Console stub (SMTP not configured) ───────────────────────────
        print("\n[Contact] New submission (SMTP not configured, logging only)")
        print(f"  To:      {CONTACT_TO}")
        print(f"  From:    {req.name} <{req.email}>")
        print(f"  Type:    {req.type}")
        print(f"  Message: {req.message[:200]}")
        print("---\n")
        return {"ok": True}


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
