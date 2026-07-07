import requests
import os
import time
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

# Reddit requires: <platform>:<app_id>:<version> (by /u/<username>)
# A bare string like "discovery-engine-v1" returns 403/429.
_USER_AGENT = os.getenv(
    "REDDIT_USER_AGENT",
    "python:briefd.signal.collector:v1.0 (by /u/briefd_signals)"
)
_HEADERS    = {"User-Agent": _USER_AGENT}
_MAX_PER_TERM = 75   # cap per term to stay cost-efficient


def _get_posts(url: str) -> list:
    """Hit a Reddit JSON endpoint and return raw children list."""
    try:
        resp = requests.get(url, headers=_HEADERS, timeout=10)
        if resp.status_code == 404:
            return []
        if resp.status_code != 200:
            print(f"[Reddit] HTTP {resp.status_code} for: {url[:80]}")
            return []
        return resp.json().get("data", {}).get("children", [])
    except Exception as e:
        print(f"[Reddit] Request error: {e}")
        return []


def _extract(posts: list, term: str, cutoff: datetime, seen: set) -> list:
    """Convert raw Reddit post data into normalised signal dicts."""
    out = []
    for post in posts:
        d = post.get("data", {})

        url_post = d.get("url", "")
        if not url_post or url_post in seen:
            continue
        seen.add(url_post)

        if d.get("created_utc", 0) < cutoff.timestamp():
            continue

        title     = d.get("title", "")
        body      = d.get("selftext", "")
        full_text = f"{title} {body}".strip()

        if len(full_text) < 40:
            continue

        lower = full_text.lower()
        if "try it:" in lower:
            continue
        if "built a" in lower and d.get("score", 0) < 5:
            continue

        date_str = datetime.fromtimestamp(
            d.get("created_utc", 0), tz=timezone.utc
        ).strftime("%Y-%m-%d")

        out.append({
            "source": "reddit",
            "term":   term,
            "text":   full_text[:2000],
            "title":  title,
            "score":  float(d.get("score", 0)),
            "url":    url_post,
            "date":   date_str,
        })
    return out


def fetch_signals(product_name: str, competitors: list) -> list:
    terms  = [product_name] + competitors
    cutoff = datetime.now(timezone.utc) - timedelta(days=30)
    seen   = set()
    results = []

    for term in terms:
        term_slug = term.lower().replace(" ", "")
        collected = []

        # ── Pass 1: product's own subreddit ──────────────────────────────
        sub_url = (
            f"https://www.reddit.com/r/{term_slug}/search.json?"
            f"q={requests.utils.quote(term)}"
            "&restrict_sr=1&sort=new&t=month&limit=50"
        )
        sub_posts = _get_posts(sub_url)
        sub_signals = _extract(sub_posts, term, cutoff, seen)
        collected.extend(sub_signals)
        print(f"[Reddit] '{term}' own-subreddit: {len(sub_signals)} signals")

        # ── Pass 2: broad Reddit search ───────────────────────────────────
        broad_url = (
            "https://www.reddit.com/search.json?"
            f"q={requests.utils.quote(term)}"
            "&sort=new&t=month&limit=100"
        )
        broad_posts   = _get_posts(broad_url)
        broad_signals = _extract(broad_posts, term, cutoff, seen)
        collected.extend(broad_signals)
        print(f"[Reddit] '{term}' broad search: {len(broad_signals)} signals")

        results.extend(collected[:_MAX_PER_TERM])
        time.sleep(1)

    print(f"[Reddit] Total: {len(results)} signals collected")
    return results
