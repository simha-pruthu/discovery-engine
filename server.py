from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import uvicorn

from synthesizer import (
    run_pipeline,
    collect_signals,
    classify_signals,
    cluster_themes,
    compute_summary
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


@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    try:
        # FULL pipeline for main product
        product_raw = run_pipeline(req.product, [])
        product_result = product_raw["product"]

        competitor_results = []

        for comp in req.competitors:
            comp_result = lightweight_analysis(comp)

            if comp_result["summary"]["total_signals"] < 10:
                continue

            comparison = compare_themes(
                product_result,
                comp_result,
                comp
            )

            competitor_results.append(comparison)

        return {
            "product": product_result,
            "competitors": competitor_results
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)