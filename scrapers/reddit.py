import requests
import os
import time
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()


def fetch_signals(product_name: str, competitors: list[str]) -> list[dict]:
    terms = [product_name] + competitors
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    seen_urls = set()
    results = []

    for term in terms:
        try:
            url = f"https://www.reddit.com/search.json?q={term}&sort=new&t=week&limit=100"
            headers = {"User-Agent": os.getenv("REDDIT_USER_AGENT")}
            response = requests.get(url, headers=headers, timeout=10)
            data = response.json()

            for post in data["data"]["children"]:
                post = post["data"]

                if post["url"] in seen_urls:
                    continue
                seen_urls.add(post["url"])

                if post["created_utc"] < cutoff.timestamp():
                    continue

                full_text = f"{post.get('title', '')} {post.get('selftext', '')}".strip()

                if len(full_text) < 20:
                    continue

                date_str = datetime.fromtimestamp(
                    post["created_utc"],
                    tz=timezone.utc
                ).strftime("%Y-%m-%d")

                results.append({
                    "source": "reddit",
                    "term": term,
                    "text": full_text[:2000],
                    "title": post.get("title", ""),
                    "score": float(post.get("score", 0)),
                    "url": post.get("url", ""),
                    "date": date_str
                })

        except Exception as e:
            print(f"Reddit error for {term}: {e}")
            continue

        time.sleep(1)

    print(f"Reddit: {len(results)} signals collected")
    return results
