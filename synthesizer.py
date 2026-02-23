import os
import json
from datetime import datetime
from anthropic import Anthropic
from scrapers.reddit import fetch_signals
from scrapers.playstore import fetch_reviews

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
                return json.loads(text[start:i + 1])

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
    return deduped[:MAX_SIGNALS]


# ==========================================================
# CLASSIFICATION
# ==========================================================
def classify_signals(signals):
    api_key = os.getenv("ANTHROPIC_API_KEY")

    if not api_key or not signals:
        return signals

    client = Anthropic(api_key=api_key)

    compact = []
    for i, s in enumerate(signals[:200]):
        text = (s.get("title", "") + " " + s.get("text", ""))[:400]
        compact.append(f"{i}. {text}")

    prompt = """
Classify each item.

Return ONLY JSON:
[
  {
    "id": number,
    "sentiment": "negative" | "mixed" | "positive"
  }
]
"""

    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1500,
            messages=[{
                "role": "user",
                "content": prompt + "\n\n" + "\n".join(compact)
            }]
        )

        classified = extract_json(response.content[0].text)

        for item in classified:
            idx = item.get("id")
            if idx is not None and idx < len(signals):
                signals[idx]["sentiment"] = item.get("sentiment")

    except Exception as e:
        print("Classification error:", e)

    return signals


# ==========================================================
# THEME CLUSTERING
# ==========================================================
def cluster_themes(signals):
    api_key = os.getenv("ANTHROPIC_API_KEY")

    if not api_key or not signals:
        return []

    client = Anthropic(api_key=api_key)

    lines = []
    for i, s in enumerate(signals):
        text = s.get("text", "")[:250]
        lines.append(f"{i}. {text}")

    prompt = """
Group the following user complaints into up to 6 themes.

Return ONLY JSON:
[
  {
    "name": "",
    "indices": [0,1,2],
    "emotional_intensity": 1-10,
    "primary_segment": ""
  }
]
"""

    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=2500,
            messages=[{
                "role": "user",
                "content": prompt + "\n\nSignals:\n" + "\n".join(lines)
            }]
        )

        themes_raw = extract_json(response.content[0].text)

        themes = []

        for t in themes_raw:
            indices = t.get("indices", [])
            quotes = []

            for idx in indices[:8]:
                if idx < len(signals):
                    quotes.append({
                        "text": signals[idx].get("text", ""),
                        "source": signals[idx].get("source", "unknown"),
                        "url": signals[idx].get("url", "")
                    })

            themes.append({
                "name": t.get("name"),
                "frequency": len(indices),
                "emotional_intensity": t.get("emotional_intensity", 5),
                "primary_segment": t.get("primary_segment", "General"),
                "quotes": quotes
            })

        themes.sort(key=lambda x: x["frequency"], reverse=True)
        return themes

    except Exception as e:
        print("Theme clustering error:", e)
        return []


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
# COMPETITOR ANALYSIS
# ==========================================================
def analyze_competitor(name, competitors):
    signals = collect_signals(name, competitors)
    signals = classify_signals(signals)
    negative = [s for s in signals if s.get("sentiment") == "negative"]

    themes = cluster_themes(negative)
    summary = compute_summary(signals)

    return {
        "themes": themes,
        "summary": summary
    }


# ==========================================================
# COMPARISON
# ==========================================================
def compare_themes(product_themes, competitor_themes):
    product_names = {t["name"] for t in product_themes}
    competitor_names = {t["name"] for t in competitor_themes}

    return {
        "shared": list(product_names & competitor_names),
        "unique_to_product": list(product_names - competitor_names),
        "unique_to_competitor": list(competitor_names - product_names)
    }


# ==========================================================
# FULL PIPELINE
# ==========================================================
def run_pipeline(product_name, competitors):

    # PRODUCT
    product_signals = collect_signals(product_name, competitors)
    product_signals = classify_signals(product_signals)
    product_negative = [s for s in product_signals if s.get("sentiment") == "negative"]

    product_themes = cluster_themes(product_negative)
    product_summary = compute_summary(product_signals)

    # COMPETITORS
    competitor_data = {}
    for comp in competitors:
        competitor_data[comp] = analyze_competitor(comp, competitors)

    # COMPARISONS
    comparisons = {}
    for comp in competitor_data:
        comparisons[comp] = compare_themes(
            product_themes,
            competitor_data[comp]["themes"]
        )

    return {
        "product": {
            "themes": product_themes,
            "summary": product_summary
        },
        "competitors": competitor_data,
        "comparisons": comparisons
    }