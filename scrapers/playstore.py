import time
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

from google_play_scraper import reviews, Sort
from config import KNOWN_APPS

load_dotenv()


def fetch_signals(product_name: str, competitors: list[str]) -> list[dict]:
    terms = [product_name] + competitors
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    seen_urls = set()
    results = []

    for term in terms:
        try:
            app_id = KNOWN_APPS.get(term.lower(), {}).get("playstore")
            if not app_id:
                print(f"Play Store: no app ID found for '{term}', skipping")
                continue

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

                date_str = at.strftime("%Y-%m-%d")

                results.append({
                    "source": "playstore",
                    "term": term,
                    "text": full_text[:2000],
                    "title": "",
                    "score": float(review.get("score", 0)),
                    "url": url,
                    "date": date_str,
                })

        except Exception as e:
            print(f"Play Store error for {term}: {e}")
            continue

        time.sleep(1)

    print(f"Play Store: {len(results)} signals collected")
    return results
