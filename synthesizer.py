import os
import json
from datetime import datetime
from anthropic import Anthropic
from scrapers.reddit import fetch_signals
from scrapers.playstore import fetch_reviews
from db import SessionLocal
from models import Signal, WeeklySnapshot, ThemeSnapshot
from dotenv import load_dotenv

load_dotenv()

MAX_SIGNALS = 200


# ==========================================================
# JSON EXTRACTION
# ==========================================================
def extract_json(text: str):
    text = text.strip()
    start = text.find("[")
    if start == -1:
        raise ValueError("No JSON array found.")

    bracket_count = 0
    for i in range(start, len(text)):
        if text[i] == "[":
            bracket_count += 1
        elif text[i] == "]":
            bracket_count -= 1
            if bracket_count == 0:
                return json.loads(text[start:i+1])

    raise ValueError("Unbalanced JSON array.")


# ==========================================================
# SIGNAL COLLECTION
# ==========================================================
def collect_signals(product_name, competitors):
    reddit = fetch_signals(product_name, competitors)
    playstore = fetch_reviews(product_name, competitors)

    all_signals = reddit + playstore

    seen = set()
    deduped = []

    for s in all_signals:
        url = s.get("url")
        if url and url not in seen:
            seen.add(url)
            deduped.append(s)

    deduped.sort(key=lambda x: x.get("score", 0), reverse=True)

    print(f"Total deduped signals: {len(deduped)}")

    return deduped[:MAX_SIGNALS]


# ==========================================================
# CLASSIFICATION
# ==========================================================
def classify_signals(signals):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("No API key found for classification.")
        return signals

    client = Anthropic(api_key=api_key)

    for s in signals:
        s["sentiment"] = "negative"  # default fallback

    try:
        compact = []
        for i, s in enumerate(signals):
            text = (s.get("title", "") + " " + s.get("text", ""))[:300]
            compact.append(f"{i}. {text}")

        prompt = """
You are a strict JSON API.
Classify each item.

Return ONLY valid JSON array.
Format:
[
  {"id": number, "sentiment": "negative" | "mixed" | "positive"}
]
"""

        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1500,
            temperature=0,
            messages=[{
                "role": "user",
                "content": prompt + "\n\n" + "\n".join(compact)
            }]
        )

        response_text = response.content[0].text
        classified = extract_json(response_text)

        for item in classified:
            idx = item.get("id")
            if idx is not None and idx < len(signals):
                signals[idx]["sentiment"] = item.get("sentiment", "mixed")

    except Exception as e:
        print("Classification failed, using fallback:", e)

    return signals


# ==========================================================
# CLUSTERING WITH FALLBACK
# ==========================================================
def cluster_themes(signals):
    api_key = os.getenv("ANTHROPIC_API_KEY")

    if not signals:
        print("No signals for clustering.")
        return []

    if not api_key:
        print("No API key for clustering.")
        return fallback_cluster(signals)

    client = Anthropic(api_key=api_key)

    try:
        lines = []
        for i, s in enumerate(signals):
            text = s.get("text", "")[:300]
            lines.append(f"{i}. {text}")

        prompt = """
Cluster these complaints into 3-6 distinct root cause themes.
Return ONLY valid JSON array.

Format:
[
  {
    "name": "",
    "indices": [0,1],
    "emotional_intensity": 1-10,
    "primary_segment": ""
  }
]
"""

        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=2000,
            temperature=0,
            messages=[{
                "role": "user",
                "content": prompt + "\n\n" + "\n".join(lines)
            }]
        )

        response_text = response.content[0].text
        themes_raw = extract_json(response_text)

        themes = []

        for t in themes_raw:
            indices = t.get("indices", [])
            quotes = [signals[i] for i in indices if i < len(signals)]

            themes.append({
                "name": t.get("name", "Unnamed"),
                "frequency": len(indices),
                "emotional_intensity": t.get("emotional_intensity", 5),
                "primary_segment": t.get("primary_segment", "General"),
                "quotes": quotes[:5]
            })

        if not themes:
            return fallback_cluster(signals)

        return sorted(themes, key=lambda x: x["frequency"], reverse=True)

    except Exception as e:
        print("Clustering failed, using fallback:", e)
        return fallback_cluster(signals)


# ==========================================================
# SAFE FALLBACK CLUSTER
# ==========================================================
def fallback_cluster(signals):
    print("Using fallback clustering.")

    buckets = {}

    for s in signals:
        text = s.get("text", "").lower()

        if "crash" in text or "bug" in text:
            key = "Stability Issues"
        elif "slow" in text:
            key = "Performance Issues"
        elif "price" in text:
            key = "Pricing Concerns"
        else:
            key = "General Experience"

        buckets.setdefault(key, []).append(s)

    themes = []
    for name, items in buckets.items():
        themes.append({
            "name": name,
            "frequency": len(items),
            "emotional_intensity": 6,
            "primary_segment": "General",
            "quotes": items[:5]
        })

    return themes


# ==========================================================
# SUMMARY
# ==========================================================
def compute_summary(signals):
    total = len(signals)
    negative = len([s for s in signals if s.get("sentiment") == "negative"])
    return {
        "total_signals": total,
        "negative_rate": round((negative / total) * 100, 1) if total else 0
    }


# ==========================================================
# FULL PIPELINE
# ==========================================================
def run_pipeline(product_name, competitors):

    print(f"\nRunning pipeline for {product_name}")

    signals = collect_signals(product_name, competitors)

    signals = classify_signals(signals)

    negative_signals = [
        s for s in signals
        if s.get("sentiment") in ["negative", "mixed"]
    ]

    print("Negative signals:", len(negative_signals))

    themes = cluster_themes(negative_signals)

    summary = compute_summary(signals)

    print("Themes generated:", len(themes))

    return {
        "product": {
            "themes": themes,
            "summary": summary,
            "trend": None
        }
    }