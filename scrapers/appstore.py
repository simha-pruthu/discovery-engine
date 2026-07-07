"""
App Store signal scraper.

Uses the public iTunes RSS customer-reviews feed (no external library required —
only `requests`, already in requirements.txt).

Feed URL pattern:
  https://itunes.apple.com/us/rss/customerreviews/page={n}/id={app_id}/sortBy=mostRecent/json

Each page returns up to 50 reviews; pages 1-10 are available (500 reviews max).
"""

import requests
import time
from datetime import datetime, timedelta, timezone
from config import KNOWN_APPS

_RSS_URL    = "https://itunes.apple.com/us/rss/customerreviews/page={page}/id={app_id}/sortBy=mostRecent/json"
_HEADERS    = {"User-Agent": "discovery-engine/1.0 (signal-collector)"}
_MAX_PER_APP = 150   # cap per product
_MAX_PAGES   = 5     # 5 × 50 = 250 candidates before filter


def _parse_date(label: str) -> datetime:
    """Parse iTunes date string to UTC-aware datetime. Handles Z and ±HH:MM."""
    label = label.strip()
    if label.endswith("Z"):
        label = label[:-1] + "+00:00"
    try:
        dt = datetime.fromisoformat(label)
    except ValueError:
        return datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def fetch_reviews(product_name: str, competitors: list) -> list:
    terms  = [product_name] + competitors
    cutoff = datetime.now(timezone.utc) - timedelta(days=90)
    results  = []
    seen_urls = set()

    for term in terms:
        term = term.lower()

        if term not in KNOWN_APPS or not KNOWN_APPS[term].get("appstore"):
            print(f"[AppStore] No ID for '{term}', skipping.")
            continue

        app_id = KNOWN_APPS[term]["appstore"]
        print(f"[AppStore] Fetching reviews for '{term}' (id={app_id})")
        collected = 0

        for page in range(1, _MAX_PAGES + 1):
            url = _RSS_URL.format(page=page, app_id=app_id)

            try:
                resp = requests.get(url, headers=_HEADERS, timeout=10)
            except Exception as e:
                print(f"[AppStore] Network error for '{term}' page {page}: {e}")
                break

            if resp.status_code == 404:
                break
            if resp.status_code != 200:
                print(f"[AppStore] HTTP {resp.status_code} for '{term}' page {page}")
                break

            try:
                data = resp.json()
            except Exception as e:
                print(f"[AppStore] JSON parse error for '{term}' page {page}: {e}")
                break

            entries = data.get("feed", {}).get("entry", [])

            # iTunes returns a dict (not list) when there is exactly one entry
            if isinstance(entries, dict):
                entries = [entries]

            if not entries:
                print(f"[AppStore] No entries on page {page} for '{term}'")
                break

            page_added = 0
            for entry in entries:
                # Entries without im:rating are app metadata rows — skip them
                if not entry.get("im:rating"):
                    continue

                review_id     = entry.get("id", {}).get("label", "")
                synthetic_url = f"https://apps.apple.com/app/id{app_id}#r{review_id}"

                if synthetic_url in seen_urls:
                    continue
                seen_urls.add(synthetic_url)

                text = entry.get("content", {}).get("label", "").strip()
                if len(text) < 20:
                    continue

                date_str    = entry.get("updated", {}).get("label", "")
                review_date = _parse_date(date_str)

                if review_date < cutoff:
                    continue

                rating_str = entry.get("im:rating", {}).get("label", "0")
                title_str  = entry.get("title",     {}).get("label", "")

                results.append({
                    "source": "appstore",
                    "term":   term,
                    "text":   text[:2000],
                    "title":  title_str,
                    "score":  float(rating_str) if rating_str.isdigit() else 0.0,
                    "url":    synthetic_url,
                    "date":   review_date.strftime("%Y-%m-%d"),
                })
                page_added += 1
                collected  += 1

                if collected >= _MAX_PER_APP:
                    break

            print(f"[AppStore] '{term}' page {page}: {page_added} reviews accepted")

            if collected >= _MAX_PER_APP:
                break

            time.sleep(0.5)

        print(f"[AppStore] '{term}': {collected} reviews total")

    print(f"[AppStore] Grand total: {len(results)} signals")
    return results
