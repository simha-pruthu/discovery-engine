import os
import json
from datetime import datetime
from anthropic import Anthropic
from scrapers.reddit import fetch_signals
from scrapers.playstore import fetch_reviews
from db import SessionLocal
from models import Signal, WeeklySnapshot, ThemeSnapshot

MAX_SIGNALS = 200


# ==========================================================
# JSON EXTRACTION (STABLE + SAFE)
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
                json_str = text[start:i + 1]
                return json.loads(json_str)

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
# CLASSIFICATION (BATCHED - PRODUCTION SAFE)
# ==========================================================
def classify_signals(signals):
    api_key = os.getenv("ANTHROPIC_API_KEY")

    if not api_key or not signals:
        return signals

    client = Anthropic(api_key=api_key)

    BATCH_SIZE = 25

    for start in range(0, len(signals), BATCH_SIZE):
        batch = signals[start:start + BATCH_SIZE]

        compact = []
        for i, s in enumerate(batch):
            text = (s.get("title", "") + " " + s.get("text", ""))[:300]
            compact.append(f"{i}. {text}")

        prompt = """
You are a strict JSON API.

Classify each item.

Return ONLY valid JSON.
No explanation.
No markdown.

Format:
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
                max_tokens=800,
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
                if idx is not None and idx < len(batch):
                    signals[start + idx]["sentiment"] = item.get("sentiment", "mixed")

        except Exception as e:
            print(f"Classification batch error ({start}):", e)

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
You are a strict JSON API.

Group the following user complaints into up to 6 themes.

Return ONLY valid JSON.
No explanation.
No markdown.

Format:
[
  {
    "name": "",
    "indices": [0,1,2],
    "emotional_intensity": number between 1 and 10,
    "primary_segment": ""
  }
]
"""

    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1500,
            temperature=0,
            messages=[{
                "role": "user",
                "content": prompt + "\n\nSignals:\n" + "\n".join(lines)
            }]
        )

        response_text = response.content[0].text
        themes_raw = extract_json(response_text)

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
                "name": t.get("name", "Unnamed"),
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
# DATABASE STORAGE
# ==========================================================
def store_signals(product_name, signals):
    db = SessionLocal()

    for s in signals:
        db_signal = Signal(
            product=product_name,
            source=s.get("source"),
            text=s.get("text"),
            url=s.get("url"),
            sentiment=s.get("sentiment")
        )
        db.add(db_signal)

    db.commit()
    db.close()
    print(f"Storing {len(signals)} signals for {product_name}")


def store_weekly_snapshot(product_name, summary, themes):
    db = SessionLocal()

    week_id = datetime.utcnow().strftime("%Y-W%U")

    avg_intensity = (
        sum(t["emotional_intensity"] for t in themes) / len(themes)
        if themes else 0
    )

    pfi = round((summary["negative_rate"] * 0.5) + (avg_intensity * 5), 2)

    snapshot = WeeklySnapshot(
        product=product_name,
        week_id=week_id,
        pfi_score=pfi,
        negative_rate=summary["negative_rate"],
        total_signals=summary["total_signals"]
    )
    db.add(snapshot)

    for t in themes:
        theme_row = ThemeSnapshot(
            product=product_name,
            week_id=week_id,
            theme_name=t["name"],
            frequency=t["frequency"],
            intensity=t["emotional_intensity"]
        )
        db.add(theme_row)

    db.commit()
    db.close()
    print(f"Storing weekly snapshot for {product_name}")


def get_trend(product_name):
    db = SessionLocal()

    snapshots = db.query(WeeklySnapshot)\
        .filter(WeeklySnapshot.product == product_name)\
        .order_by(WeeklySnapshot.created_at.desc())\
        .limit(2)\
        .all()

    db.close()

    if len(snapshots) < 2:
        return None

    current, previous = snapshots[0], snapshots[1]

    return {
        "pfi_change": round(current.pfi_score - previous.pfi_score, 2),
        "negative_rate_change": round(current.negative_rate - previous.negative_rate, 2)
    }


# ==========================================================
# FULL PIPELINE
# ==========================================================
def run_pipeline(product_name, competitors):

    product_signals = collect_signals(product_name, competitors)
    product_signals = classify_signals(product_signals)

    store_signals(product_name, product_signals)

    product_negative = [
        s for s in product_signals
        if s.get("sentiment") == "negative"
    ]

    product_themes = cluster_themes(product_negative)
    product_summary = compute_summary(product_signals)

    store_weekly_snapshot(product_name, product_summary, product_themes)

    trend = get_trend(product_name)

    return {
        "product": {
            "themes": product_themes,
            "summary": product_summary,
            "trend": trend
        }
    }