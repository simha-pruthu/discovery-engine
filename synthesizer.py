import os
import json
from datetime import datetime
from anthropic import Anthropic
from scrapers.reddit import fetch_signals
from scrapers.playstore import fetch_reviews
from scrapers.appstore import fetch_reviews as fetch_appstore_reviews
from db import SessionLocal
from models import Signal, WeeklySnapshot, ThemeSnapshot
from dotenv import load_dotenv
from config import KNOWN_APPS

load_dotenv()

MAX_SIGNALS = 200
SIGNAL_THRESHOLD = 15  # minimum signals required for meaningful analysis


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
    # ── Fetch from all three sources ─────────────────────────────────────
    reddit   = fetch_signals(product_name, competitors)
    playstore = fetch_reviews(product_name, competitors)
    appstore  = fetch_appstore_reviews(product_name, competitors)

    print(f"[Signals] Reddit={len(reddit)}  PlayStore={len(playstore)}  AppStore={len(appstore)}")

    all_signals = reddit + playstore + appstore

    # ── Deduplicate by URL ───────────────────────────────────────────────
    seen = set()
    deduped = []
    for s in all_signals:
        url = s.get("url")
        if url and url not in seen:
            seen.add(url)
            deduped.append(s)

    deduped.sort(key=lambda x: x.get("score", 0), reverse=True)

    print(f"[Signals] Total deduped: {len(deduped)} -> capped at {MAX_SIGNALS}")
    return deduped[:MAX_SIGNALS]


# ==========================================================
# CLASSIFICATION
# ==========================================================
_CLASSIFY_PROMPT = (
    "You are a strict JSON API. Classify each item by sentiment.\n"
    "Return ONLY a valid JSON array. No explanation, no markdown.\n"
    "Format: [{\"id\": <number>, \"sentiment\": \"negative\" | \"mixed\" | \"positive\"}]"
)
_CLASSIFY_BATCH = 50   # signals per batch — keeps output well under token limits


def classify_signals(signals):
    if not signals:
        return signals

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("[Classify] No API key — defaulting all signals to 'negative'.")
        for s in signals:
            s["sentiment"] = "negative"
        return signals

    client = Anthropic(api_key=api_key)

    # Set fallback before any API calls so partial failures are safe
    for s in signals:
        s["sentiment"] = "negative"

    batches = range(0, len(signals), _CLASSIFY_BATCH)
    print(f"[Classify] {len(signals)} signals -> {len(list(batches))} batches of {_CLASSIFY_BATCH}")

    for batch_start in range(0, len(signals), _CLASSIFY_BATCH):
        batch = signals[batch_start: batch_start + _CLASSIFY_BATCH]
        try:
            lines = []
            for j, s in enumerate(batch):
                text = (s.get("title", "") + " " + s.get("text", ""))[:300]
                lines.append(f"{batch_start + j}. {text}")

            response = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=2048,   # 50 items × ~10 tokens + overhead = ~600; 2048 is safe
                temperature=0,
                messages=[{
                    "role": "user",
                    "content": _CLASSIFY_PROMPT + "\n\n" + "\n".join(lines)
                }]
            )

            classified = extract_json(response.content[0].text)
            for item in classified:
                idx = item.get("id")
                if idx is not None and 0 <= idx < len(signals):
                    signals[idx]["sentiment"] = item.get("sentiment", "negative")

            batch_num = batch_start // _CLASSIFY_BATCH + 1
            print(f"[Classify] Batch {batch_num}: {len(classified)} items classified")

        except Exception as e:
            batch_num = batch_start // _CLASSIFY_BATCH + 1
            print(f"[Classify] Batch {batch_num} failed (keeping 'negative' default): {e}")

    return signals


# ==========================================================
# CLUSTERING WITH FALLBACK
# ==========================================================
def cluster_themes(signals, category_hint: str = ""):
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

        hint_line = f"\n{category_hint}\n" if category_hint else ""
        prompt = f"""
Cluster these complaints into 3-6 distinct root cause themes.{hint_line}
Return ONLY valid JSON array.

Format:
[
  {{
    "name": "",
    "indices": [0,1],
    "emotional_intensity": 1-10,
    "primary_segment": ""
  }}
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
# PRODUCT CATEGORY CLASSIFICATION
# ==========================================================
VALID_CATEGORIES = {"SaaS", "Marketplace", "Consumer App", "Developer Tool", "Fintech"}

def classify_product_category(product_name: str) -> str:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return "Other"

    client = Anthropic(api_key=api_key)

    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=20,
            temperature=0,
            messages=[{
                "role": "user",
                "content": (
                    "Classify the following product into ONE of these categories:\n"
                    "- SaaS\n"
                    "- Marketplace\n"
                    "- Consumer App\n"
                    "- Developer Tool\n"
                    "- Fintech\n"
                    "- Unknown\n\n"
                    f"Product: {product_name}\n\n"
                    "Return ONLY the category name."
                )
            }]
        )

        category = response.content[0].text.strip()
        return category if category in VALID_CATEGORIES else "Other"

    except Exception as e:
        print("Category classification failed:", e)
        return "Other"


# ==========================================================
# COMBINED VALIDATION + CLASSIFICATION  (one haiku call)
# ==========================================================
def validate_and_classify(product_name: str) -> tuple:
    """
    Returns (is_valid: bool, category: str, error_msg: str).
    Validates the product is a digital platform and classifies it.
    Falls back permissively on LLM failure.

    KNOWN_APPS products skip the INVALID gate — they are curated digital
    platforms and should never be rejected by the LLM validation step.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return True, "Other", ""

    client = Anthropic(api_key=api_key)
    name_lower = product_name.strip().lower()

    # ── Fast path: KNOWN_APPS products are definitively valid digital platforms ──
    if name_lower in KNOWN_APPS:
        try:
            response = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=20,
                temperature=0,
                messages=[{
                    "role": "user",
                    "content": (
                        "Classify the following product into ONE of these categories. "
                        "Reply with ONLY the category name, nothing else.\n"
                        "Categories: SaaS | Marketplace | Consumer App | Developer Tool | Fintech | Other\n\n"
                        f"Product: {product_name}"
                    )
                }]
            )
            category = response.content[0].text.strip()
            category = category if category in VALID_CATEGORIES else "Other"
            return True, category, ""
        except Exception as e:
            print("validate_and_classify (known app) failed, using defaults:", e)
            return True, "Other", ""

    # ── Unknown products: full validate + classify ────────────────────────────
    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=30,
            temperature=0,
            messages=[{
                "role": "user",
                "content": (
                    "Evaluate the product below.\n"
                    "Reply INVALID only if it has NO digital presence at all "
                    "(e.g. a physical-only store, hardware device, or offline-only business with no app or website).\n"
                    "Any company with a mobile app, web app, or SaaS platform is valid.\n"
                    "Otherwise reply with exactly ONE of: "
                    "SaaS | Marketplace | Consumer App | Developer Tool | Fintech | Other\n\n"
                    f"Product: {product_name}"
                )
            }]
        )
        text = response.content[0].text.strip()
        if text == "INVALID":
            return False, "", "Currently supports digital product platforms only."
        category = text if text in VALID_CATEGORIES else "Other"
        return True, category, ""
    except Exception as e:
        print("validate_and_classify failed, using defaults:", e)
        return True, "Other", ""


# ==========================================================
# OPTIONAL REAL-TIME ENRICHMENT
# ==========================================================

# Category-specific clustering hints for deeper analysis routing
CATEGORY_ANALYSIS_HINTS: dict[str, str] = {
    "SaaS": (
        "Focus on: onboarding friction, feature gaps, pricing value perception, "
        "integration failures, performance/reliability."
    ),
    "Marketplace": (
        "Focus on: trust and safety issues, supply-demand imbalance, fee complaints, "
        "fulfilment reliability, matching quality."
    ),
    "Consumer App": (
        "Focus on: UX friction, notification fatigue, social feature failures, "
        "content quality, retention drop-off."
    ),
    "Developer Tool": (
        "Focus on: documentation quality, API reliability, developer experience friction, "
        "debugging pain points, rate limits."
    ),
    "Fintech": (
        "Focus on: security and trust concerns, transaction failures, fee transparency, "
        "customer support quality, compliance friction."
    ),
}


def enrich_product_context(product_name: str, category: str) -> str:
    """
    Returns a brief enrichment string using model knowledge.
    Non-blocking: gracefully returns empty string on failure.
    Used to seed the analysis with product context when live data is sparse.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return ""

    client = Anthropic(api_key=api_key)
    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=250,
            temperature=0,
            messages=[{
                "role": "user",
                "content": (
                    f"Briefly describe {product_name} ({category}) covering:\n"
                    "- Business model\n"
                    "- Target users\n"
                    "- Monetization\n"
                    "- Main competitors\n"
                    "4 bullet points max. Be factual and concise."
                )
            }]
        )
        return response.content[0].text.strip()
    except Exception as e:
        print("Enrichment failed, continuing without context:", e)
        return ""


# ==========================================================
# PAIN POINT & BOTTLENECK SYNTHESIS
# One haiku call. Uses top themes only. Returns structured dict.
# Appended under product_result["insights"] — does NOT alter
# any existing field (themes, summary, trend).
# ==========================================================
_INSIGHTS_EMPTY: dict = {
    "core_painpoints": [],
    "critical_bottlenecks": [],
    "user_frustration_drivers": [],
    "retention_risk_areas": [],
}

def extract_insights(themes: list, category: str) -> dict:
    """
    Synthesises top complaint themes into structured pain point intelligence.
    Single haiku call, ≤400 tokens. Safe: returns empty dict on any failure.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key or not themes:
        return dict(_INSIGHTS_EMPTY)

    client = Anthropic(api_key=api_key)

    # Use top 5 themes only to keep the prompt cheap
    top = themes[:5]
    theme_lines = "\n".join(
        f"- {t.get('name', 'Unknown')} "
        f"(freq: {t.get('frequency', 0)}, "
        f"intensity: {t.get('emotional_intensity', 5)}, "
        f"segment: {t.get('primary_segment', 'General')})"
        for t in top
    )

    prompt = (
        f"You are a product analyst. These are top complaint themes for a {category} product:\n\n"
        f"{theme_lines}\n\n"
        "Return ONLY a valid JSON object. No markdown. No explanation.\n"
        "{\n"
        '  "core_painpoints": ["phrase", ...],\n'
        '  "critical_bottlenecks": ["phrase", ...],\n'
        '  "user_frustration_drivers": ["phrase", ...],\n'
        '  "retention_risk_areas": ["phrase", ...]\n'
        "}\n"
        "Each array: 2-4 short phrases max."
    )

    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=400,
            temperature=0,
            messages=[{"role": "user", "content": prompt}]
        )
        text = response.content[0].text.strip()
        start = text.find("{")
        end = text.rfind("}") + 1
        if start == -1 or end == 0:
            raise ValueError("No JSON object in insight response")
        parsed = json.loads(text[start:end])
        return {
            "core_painpoints":          parsed.get("core_painpoints", []),
            "critical_bottlenecks":     parsed.get("critical_bottlenecks", []),
            "user_frustration_drivers": parsed.get("user_frustration_drivers", []),
            "retention_risk_areas":     parsed.get("retention_risk_areas", []),
        }
    except Exception as e:
        print(f"[Insights] Extraction failed, returning empty: {e}")
        return dict(_INSIGHTS_EMPTY)


# ==========================================================
# FULL PIPELINE
# ==========================================================
def run_pipeline(product_name, competitors, category: str = "", enrichment_context: str = ""):

    print(f"\n[Pipeline] === START '{product_name}' (category={category or 'unknown'}) ===", flush=True)

    # ── Stage 1: Collect ─────────────────────────────────────────────────
    signals = collect_signals(product_name, competitors)
    total_raw = len(signals)
    print(f"[Pipeline] Stage 1 collect_signals: {total_raw} signals", flush=True)

    if total_raw < SIGNAL_THRESHOLD:
        print(f"[Pipeline] INSUFFICIENT DATA: {total_raw} < threshold {SIGNAL_THRESHOLD} — aborting.", flush=True)
        return {
            "insufficient_data": True,
            "message": "Not enough public review signals to generate reliable insights.",
            "product": {},
        }

    # ── Stage 2: Classify ────────────────────────────────────────────────
    signals = classify_signals(signals)
    print(f"[Pipeline] Stage 2 classify_signals: {len(signals)} signals returned", flush=True)

    sentiments = {}
    for s in signals:
        k = s.get("sentiment", "none")
        sentiments[k] = sentiments.get(k, 0) + 1
    print(f"[Pipeline] Sentiment distribution: {sentiments}", flush=True)

    # ── Stage 3: Cluster (negative + mixed only) ─────────────────────────
    negative_signals = [s for s in signals if s.get("sentiment") in ["negative", "mixed"]]
    print(f"[Pipeline] Stage 3 negative filter: {len(negative_signals)} signals for clustering", flush=True)

    category_hint = CATEGORY_ANALYSIS_HINTS.get(category, "")
    themes = cluster_themes(negative_signals, category_hint=category_hint)
    print(f"[Pipeline] Stage 3 cluster_themes: {len(themes)} themes generated", flush=True)

    # ── Stage 4: Summary (full signal set, not just negative) ────────────
    summary = compute_summary(signals)
    print(f"[Pipeline] Stage 4 compute_summary: total_signals={summary['total_signals']}, "
          f"negative_rate={summary['negative_rate']}", flush=True)

    # ── Stage 5: Insights ────────────────────────────────────────────────
    print(f"[Pipeline] Stage 5 extract_insights (category={category or 'unknown'})", flush=True)
    insights = extract_insights(themes, category)

    print(f"[Pipeline] === DONE: {summary['total_signals']} signals, "
          f"{len(themes)} themes, insights={'yes' if any(insights.values()) else 'empty'} ===", flush=True)

    return {
        "product": {
            "themes": themes,
            "summary": summary,
            "trend": None,
            "insights": insights,
        }
    }