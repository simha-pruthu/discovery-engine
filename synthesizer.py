import os
import json
from anthropic import Anthropic
from scrapers.reddit import fetch_signals
from scrapers.playstore import fetch_reviews

MAX_SIGNALS = 200


def extract_json(text: str):
    """
    Extract first valid JSON array using bracket balancing.
    Avoids greedy regex issues and markdown wrappers.
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


def cluster_themes(signals: list[dict]) -> list[dict]:
    """
    Send signals to Claude Haiku and return ranked themes.
    Adds priority_score and adjusted_score.
    """

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("ANTHROPIC_API_KEY not found.")
        return []

    client = Anthropic(api_key=api_key)

    # Build compact structured input
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

            # Base priority score
            priority_score = frequency * intensity
            theme["priority_score"] = priority_score

            combined_quotes = " ".join(theme.get("quotes", [])).lower()

            negative_count = sum(combined_quotes.count(word) for word in negative_keywords)
            positive_count = sum(combined_quotes.count(word) for word in positive_keywords)

            # Adjust ranking toward actionable friction
            if negative_count > positive_count:
                adjusted_score = priority_score * 1.5
            elif positive_count > negative_count:
                adjusted_score = priority_score * 0.2
            else:
                adjusted_score = priority_score

            theme["adjusted_score"] = adjusted_score

        # Sort by adjusted score descending
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

    # Sort by review score descending
    deduped.sort(key=lambda s: s.get("score", 0.0), reverse=True)

    final = deduped[:MAX_SIGNALS]
    final_count = len(final)

    print(f"Total collected before cap: {total_collected}")
    print(f"Total after dedupe: {total_after_dedupe}")
    print(f"Final count: {final_count}")

    return final