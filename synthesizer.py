import os
import json
from anthropic import Anthropic
from scrapers.reddit import fetch_signals
from scrapers.playstore import fetch_reviews

MAX_SIGNALS = 200


# -----------------------------
# JSON EXTRACTION (STABLE)
# -----------------------------
def extract_json(text: str):
    """
    Extract first valid JSON array using bracket balancing.
    Prevents greedy parsing and handles partial text safely.
    """

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
                json_str = text[start:i + 1]
                return json.loads(json_str)

    raise ValueError("Unbalanced JSON array in model output.")


# -----------------------------
# THEME CLUSTERING
# -----------------------------
def cluster_themes(signals: list[dict]) -> list[dict]:
    """
    Send signals to Claude Haiku and return ranked themes.
    Applies polarity weighting to prioritize actionable friction.
    """

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("ANTHROPIC_API_KEY not found.")
        return []

    client = Anthropic(api_key=api_key)

    lines = []
    for s in signals:
        term = s.get("term", "")
        source = s.get("source", "")
        score = s.get("score", 0.0)
        text = s.get("text", "")[:200]

        lines.append(f"[{term}|{source}|score:{score}] {text}")

    input_text = "\n".join(lines)

    prompt = f"""
You are a product intelligence analyst.

Analyze the following user signals and identify up to 8 recurring themes.

For each theme return EXACTLY this JSON structure:

{{
  "name": "short theme name",
  "frequency": integer,
  "emotional_intensity": integer from 1 to 10,
  "quotes": ["quote 1", "quote 2"]
}}

Rules:
- Return ONLY a JSON array
- No markdown
- No explanation
- No code blocks
- Valid JSON only

SIGNALS:
{input_text}
"""

    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=3500,
            messages=[{"role": "user", "content": prompt}],
        )

        raw = response.content[0].text
        themes = extract_json(raw)

        negative_keywords = [
            "slow", "bug", "issue", "problem", "broken",
            "frustrating", "horrible", "crash", "difficult",
            "complicated", "inconvenient"
        ]

        positive_keywords = [
            "love", "great", "best", "amazing", "perfect",
            "awesome", "fantastic"
        ]

        for theme in themes:
            frequency = theme.get("frequency", 0)
            intensity = theme.get("emotional_intensity", 0)

            priority_score = frequency * intensity
            theme["priority_score"] = priority_score

            combined_quotes = " ".join(theme.get("quotes", [])).lower()

            negative_count = sum(combined_quotes.count(word) for word in negative_keywords)
            positive_count = sum(combined_quotes.count(word) for word in positive_keywords)

            # Strong friction prioritization
            if negative_count > positive_count:
                adjusted_score = priority_score * 1.5
            elif positive_count > negative_count:
                adjusted_score = priority_score * 0.2
            else:
                adjusted_score = priority_score

            theme["adjusted_score"] = adjusted_score

        themes.sort(
            key=lambda t: t.get("adjusted_score", 0),
            reverse=True
        )

        return themes

    except Exception as e:
        print("\ncluster_themes error:", e)
        print("\nRAW MODEL OUTPUT:\n")
        try:
            print(raw)
        except:
            pass
        return []


# -----------------------------
# BRIEF GENERATION
# -----------------------------
def generate_brief(product_name: str, themes: list[dict]) -> str:
    """
    Generate a structured weekly discovery brief.
    Focuses on actionable friction, not generic praise.
    """

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("ANTHROPIC_API_KEY not found.")
        return ""

    client = Anthropic(api_key=api_key)

    top_themes = themes[:5]

    theme_lines = []
    for t in top_themes:
        name = t.get("name", "")
        frequency = t.get("frequency", 0)
        intensity = t.get("emotional_intensity", 0)
        quote = t.get("quotes", [""])[0]

        theme_lines.append(
            f"- {name} | freq: {frequency} | intensity: {intensity}/10 | example: \"{quote}\""
        )

    theme_block = "\n".join(theme_lines)

    prompt = f"""
You are a senior product manager writing a sharp weekly discovery brief.

You are given ranked user themes with frequency and emotional intensity.

Focus on SPECIFIC friction.
Avoid generic wording like "limitations" or "improvements".
Use precise language grounded in the quotes.
Derive opportunity from the most emotionally intense friction.

Return EXACTLY this markdown structure:

# Weekly Discovery Brief — {product_name}

## 🔎 Top 3 Emerging Pain Points
(Numbered list.
Each point must include:
- A precise, specific theme title
- One sentence explaining concrete user impact
- One supporting quote.)

---

## 🧩 Opportunity Insight
(1 sharp strategic opportunity directly derived from the top pain point.
Be specific and directional.)

---

## 🧪 Suggested Experiment
(One narrowly scoped hypothesis with a measurable metric.
Be concrete, not vague.)

---

## 📈 Signal Trend
(Summarize which friction themes dominate vs praise themes,
referencing frequency and emotional intensity.
No generic commentary.)

Themes:
{theme_block}
"""

    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}],
        )

        return response.content[0].text.strip()

    except Exception as e:
        print("\ngenerate_brief error:", e)
        return ""


# -----------------------------
# SIGNAL COLLECTION
# -----------------------------
def collect_signals(product_name: str, competitors: list[str]) -> list[dict]:
    """
    Collect signals from Reddit + Play Store,
    deduplicate by URL,
    sort by score,
    cap to MAX_SIGNALS.
    """

    reddit_signals = fetch_signals(product_name, competitors)
    playstore_signals = fetch_reviews(product_name, competitors)

    all_signals = reddit_signals + playstore_signals
    total_collected = len(all_signals)

    seen_urls = set()
    deduped = []

    for signal in all_signals:
        url = signal.get("url", "")
        if url and url not in seen_urls:
            seen_urls.add(url)
            deduped.append(signal)

    total_after_dedupe = len(deduped)

    deduped.sort(key=lambda s: s.get("score", 0.0), reverse=True)

    final = deduped[:MAX_SIGNALS]
    final_count = len(final)

    print(f"Total collected before cap: {total_collected}")
    print(f"Total after dedupe: {total_after_dedupe}")
    print(f"Final count: {final_count}")

    return final