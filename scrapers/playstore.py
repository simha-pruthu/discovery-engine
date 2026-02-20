import time
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

from google_play_scraper import reviews, Sort
from config import KNOWN_APPS

load_dotenv()


def fetch_reviews(product_name: str, competitors: list[str]) -> list[dict]:
    terms = [product_name] + competitors
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    results = []
    seen_urls = set()

    for term in terms:
        term = term.lower()

        app_id = KNOWN_APPS.get(term, {}).get("playstore")
        if not app_id:
            print(f"No Play Store ID for {term}")
            continue

        try:
            result, _ = reviews(
                app_id,
                lang="en",
                country="us",
                sort=Sort.NEWEST,
                count=200,
            )

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
            print(f"Play Store error for {term}: {e}")

        time.sleep(1)

    print(f"Play Store: {len(results)} signals collected")
    return results
