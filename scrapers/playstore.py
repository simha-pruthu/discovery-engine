from typing import Optional
import time
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

from google_play_scraper import reviews, Sort
from config import KNOWN_APPS

load_dotenv()


# ----------------------------------------------------------
# DYNAMIC PLAY STORE ID DISCOVERY
# KNOWN_APPS is an enrichment layer (preferred IDs).
# If not found there, attempt discovery via search.
# ----------------------------------------------------------

def _discover_app_id(term: str) -> Optional[str]:
    """Search Play Store to find app ID for unknown products."""
    try:
        from google_play_scraper import search as ps_search
        results = ps_search(term, lang="en", country="us", n_hits=5)
        term_lower = term.lower().replace(" ", "")
        for r in results:
            app_id = r.get("appId", "")
            title = r.get("title", "").lower()
            # Accept if term appears in app ID or title
            if term_lower in app_id.lower() or term.lower() in title:
                print(f"Discovered Play Store ID for '{term}': {app_id}")
                return app_id
    except Exception as e:
        print(f"Dynamic Play Store discovery failed for '{term}': {e}")
    return None


def fetch_reviews(product_name: str, competitors: list) -> list:
    terms = [product_name] + competitors
    # Bug fix: 7 days was too narrow — most apps' 200 newest reviews span
    # 30–90 days. Extending to 90 days captures meaningful signal volume.
    cutoff = datetime.now(timezone.utc) - timedelta(days=90)
    results = []
    seen_urls = set()

    for term in terms:
        term = term.lower()

        # KNOWN_APPS preferred; fall back to dynamic discovery
        app_id = KNOWN_APPS.get(term, {}).get("playstore")
        if not app_id:
            app_id = _discover_app_id(term)
        if not app_id:
            print(f"[PlayStore] No ID found for '{term}', skipping.")
            continue

        print(f"[PlayStore] Fetching reviews for '{term}' (id={app_id})")
        before_count = len(results)

        try:
            result, _ = reviews(
                app_id,
                lang="en",
                country="us",
                sort=Sort.NEWEST,
                count=200,
            )

            print(f"[PlayStore] API returned {len(result)} raw reviews for '{term}'")

            for review in result:
                review_id = review.get("reviewId", "")
                url = f"https://play.google.com/store/apps/details?id={app_id}&reviewId={review_id}"

                if url in seen_urls:
                    continue
                seen_urls.add(url)

                at = review.get("at")
                if not at:
                    continue

                # google-play-scraper returns timezone-naive datetimes; treat as UTC
                if at.replace(tzinfo=timezone.utc) < cutoff:
                    continue

                full_text = review.get("content", "").strip()
                if len(full_text) < 20:
                    continue

                results.append({
                    "source": "playstore",
                    "term": term,
                    "text": full_text[:2000],
                    "title": "",
                    "score": float(review.get("score", 0)),
                    "url": url,
                    "date": at.strftime("%Y-%m-%d"),
                })

        except Exception as e:
            print(f"[PlayStore] Error for '{term}': {e}")

        accepted = len(results) - before_count
        print(f"[PlayStore] '{term}': {accepted} reviews passed date filter")
        time.sleep(1)

    print(f"[PlayStore] Total: {len(results)} signals collected")
    return results
