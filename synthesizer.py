import os
import json
from anthropic import Anthropic
from scrapers.reddit import fetch_signals
from scrapers.playstore import fetch_reviews

MAX_SIGNALS = 200


# ==========================================================
# SAFE JSON EXTRACTION
# ==========================================================
def extract_json(text: str):
    text = text.strip()
    start = text.find("[")

    if start == -1:
        raise ValueError("No JSON array found in model output.")

    bracket_count = 0
    for i in range(start, len(text)):
        if text[i] == "[":
            bracket_count += 1
        elif text[i] == "]":
            bracket_count -= 1
            if bracket_count == 0:
                return json.loads(text[start:i + 1])

    raise ValueError("Unbalanced JSON array in model output.")


# ==========================================================
# SIGNAL CLASSIFICATION
# ==========================================================
def classify_signals(signals: list[dict]) -> list[dict]:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key or not signals:
        return signals

    client = Anthropic(api_key=api_key)
    signals = signals[:200]

    compact = []
    for i, s in enumerate(signals):
        text = (s.get("title", "") + " " + s.get("text", ""))[:400]
        compact.append(f"{i}. {text}")

    joined = "\n\n".join(compact)

    prompt = f"""
You are a strict product intelligence classifier.

Classify each numbered item below.

Return ONLY valid JSON array.

Each object must contain:
{{
  "id": number,
  "category": "bug" | "ux" | "performance" | "pricing" | "feature_request" | "praise" | "other",
  "sentiment": "negative" | "mixed" | "positive",
  "context": "mobile" | "desktop" | "onboarding" | "ai" | "database" | "general"
}}

If unsure, default sentiment to "negative" only if clearly complaint.
Otherwise use "mixed".
"""

    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt + "\n\nSIGNALS:\n" + joined}],
        )

        classified = extract_json(response.content[0].text)

        for item in classified:
            idx = item.get("id")
            if idx is not None and idx < len(signals):
                signals[idx]["category"] = item.get("category")
                signals[idx]["sentiment"] = item.get("sentiment")
                signals[idx]["context"] = item.get("context")

        return signals

    except Exception as e:
        print("Classification error:", e)
        return signals


# ==========================================================
# STRUCTURAL FRICTION INTELLIGENCE
# ==========================================================
def cluster_themes(signals: list[dict]) -> list[dict]:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key or not signals:
        return []

    client = Anthropic(api_key=api_key)

    lines = []
    for s in signals:
        text = s.get("text", "")[:300]
        context = s.get("context", "general")
        category = s.get("category", "other")
        lines.append(f"[{context} | {category}] {text}")

    input_text = "\n".join(lines)

    prompt = f"""
You are a senior product discovery strategist.

Analyze the NEGATIVE user signals below.

Identify up to 6 structural friction insights.

Return ONLY valid JSON array.

Each object must contain:

{{
  "name": "specific friction theme",
  "frequency": integer,
  "emotional_intensity": integer 1-10,
  "primary_segment": "specific segment like 'mobile app users', 'desktop users', 'new onboarding users'. Do NOT use vague terms like 'device' or 'user'.",
  "root_cause_hypothesis": "probable systemic cause",
  "journey_criticality": integer 1-10,
  "evidence_quotes": ["quote1", "quote2"]
}}
"""

    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=3500,
            messages=[{"role": "user", "content": prompt + "\n\nSignals:\n" + input_text}],
        )

        themes = extract_json(response.content[0].text)

        total_negative = len(signals)

        for theme in themes:
            freq = theme.get("frequency", 0)
            intensity = theme.get("emotional_intensity", 5)
            criticality = theme.get("journey_criticality", 5)

            normalized_freq = freq / total_negative if total_negative else 0

            impact_score = (
                (normalized_freq * 10 * 0.4) +
                (intensity * 0.3) +
                (criticality * 0.3)
            )

            theme["business_impact_score"] = round(impact_score, 2)

            rc = theme.get("root_cause_hypothesis", "").lower()

            if "performance" in rc or "latency" in rc:
                theme["recommended_actions"] = [
                    "Measure API latency across affected flows",
                    "Segment performance by device and region",
                    "Run performance stress tests"
                ]
            elif "navigation" in rc:
                theme["recommended_actions"] = [
                    "Map navigation drop off points",
                    "Run usability tests on core journeys",
                    "Simplify information architecture prototype"
                ]
            else:
                theme["recommended_actions"] = [
                    "Conduct targeted discovery interviews",
                    "Add telemetry at friction points",
                    "Prototype improvement and test"
                ]

        themes.sort(key=lambda t: t["business_impact_score"], reverse=True)
        return themes

    except Exception as e:
        print("cluster_themes error:", e)
        return []


# ==========================================================
# EMERGING RISK DETECTOR
# ==========================================================
def detect_emerging_risks(themes):
    emerging = []
    for t in themes:
        if t["emotional_intensity"] >= 8 and t["frequency"] <= 3:
            t["emerging_risk"] = True
            emerging.append(t)
    return emerging


# ==========================================================
# OPPORTUNITY DETECTOR
# ==========================================================
def detect_opportunities(signals):
    opportunities = []
    for s in signals:
        text = s.get("text", "").lower()
        if "wish" in text or "would love" in text:
            opportunities.append(s.get("text", ""))
    return opportunities[:5]


# ==========================================================
# FULL PIPELINE
# ==========================================================
def run_pipeline(product_name: str, competitors: list[str]) -> dict:

    signals = collect_signals(product_name, competitors)
    signals = classify_signals(signals)

    # fallback: if classification fails, infer negativity from language
    negative_signals = [
        s for s in signals
        if s.get("sentiment") == "negative"
        or any(w in s.get("text", "").lower() for w in ["bug", "slow", "broken", "confusing", "lost"])
    ]

    themes = cluster_themes(negative_signals)

    emerging = detect_emerging_risks(themes)
    opportunities = detect_opportunities(signals)

    total = len(signals)
    negative_count = len(negative_signals)

    performance_issues = len([
        s for s in signals
        if s.get("category") == "performance"
        or "slow" in s.get("text", "").lower()
    ])

    mobile_issues = len([
    s for s in signals
    if s.get("context") == "mobile"
    or "mobile" in s.get("text", "").lower()
    or "android" in s.get("text", "").lower()
    or "fold" in s.get("text", "").lower()
    ])

    signal_summary = {
        "total": total,
        "negative_rate": round((negative_count / total) * 100, 1) if total else 0,
        "performance_count": performance_issues,
        "mobile_count": mobile_issues,
    }

    return {
        "themes": themes,
        "emerging_risks": emerging,
        "opportunities": opportunities,
        "summary": signal_summary,
        "signal_count": total,
    }


# ==========================================================
# SIGNAL COLLECTION
# ==========================================================
def collect_signals(product_name: str, competitors: list[str]):

    reddit_signals = fetch_signals(product_name, competitors)
    playstore_signals = fetch_reviews(product_name, competitors)

    all_signals = reddit_signals + playstore_signals

    seen_urls = set()
    deduped = []

    for signal in all_signals:
        url = signal.get("url", "")
        if url and url not in seen_urls:
            seen_urls.add(url)
            deduped.append(signal)

    deduped.sort(key=lambda s: s.get("score", 0.0), reverse=True)

    return deduped[:MAX_SIGNALS]