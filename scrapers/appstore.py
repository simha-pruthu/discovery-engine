from app_store_scraper import AppStore
from datetime import datetime, timedelta, timezone
import time
from config import KNOWN_APPS


def fetch_reviews(product_name: str, competitors: list[str]) -> list[dict]:
    terms = [product_name] + competitors
    results = []
    seen_urls = set()
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)

    for term in terms:
        try:
            term = term.lower()

            if term not in KNOWN_APPS or not KNOWN_APPS[term].get("appstore"):
                print(f"No App Store ID for {term}")
                continue

            app_id = KNOWN_APPS[term]["appstore"]

            app = AppStore(
                country="us",
                app_name=term,
                app_id=app_id,
            )
            app.review(how_many=200)

            for review in app.reviews:
                review_date = review.get("date")

                if review_date is None:
                    continue

                if isinstance(review_date, datetime):
                    if review_date.tzinfo is None:
                        review_date = review_date.replace(tzinfo=timezone.utc)
                else:
                    continue

                if review_date < cutoff:
                    continue

                text = review.get("review", "").strip()
                if len(text) < 20:
                    continue

                synthetic_url = f"https://apps.apple.com/app/id{app_id}?reviewId={review.get('id', '')}"

                if synthetic_url in seen_urls:
                    continue
                seen_urls.add(synthetic_url)

                formatted_date = review_date.strftime("%Y-%m-%d")

                results.append({
                    "source": "appstore",
                    "term": term,
                    "text": text[:2000],
                    "title": "",
                    "score": float(review.get("rating", 0)),
                    "url": synthetic_url,
                    "date": formatted_date,
                })

        except Exception as e:
            print(f"App Store error for {term}: {e}")
            continue

        time.sleep(1)

    print(f"App Store: {len(results)} signals collected")
    return results
