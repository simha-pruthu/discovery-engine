import requests
import os
import time
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()


def fetch_signals(product_name: str, competitors: list[str]) -> list[dict]:
    """
    Fetch Reddit signals for product and competitors using structured query.
    Returns standardized signal list following Data Contract.
    """

    terms = [product_name] + competitors
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)

    seen_urls = set()
    results = []

    # Expanded subreddit coverage for richer product discussion
    subreddit_filter = (
        "subreddit:productivity OR "
        "subreddit:saas OR "
        "subreddit:projectmanagement OR "
        "subreddit:startups OR "
        "subreddit:Notion OR "
        "subreddit:Linear OR "
        "subreddit:Entrepreneur OR "
        "subreddit:smallbusiness"
    )

    for term in terms:
        try:
            # Product-focused search (removed strict complaint filter)
            term_query = (
                f'"{term} app" OR '
                f'"{term} software" OR '
                f'"{term} workspace"'
            )

            q = f"({term_query}) AND ({subreddit_filter})"

            url = (
                "https://www.reddit.com/search.json?"
                f"q={requests.utils.quote(q)}"
                "&sort=new"
                "&t=week"
                "&limit=100"
            )

            headers = {
                "User-Agent": os.getenv("REDDIT_USER_AGENT", "discovery-engine-v1")
            }

            response = requests.get(url, headers=headers, timeout=10)

            if response.status_code != 200:
                print(f"Reddit request failed for {term}: {response.status_code}")
                continue

            data = response.json()

            for post in data.get("data", {}).get("children", []):
                post = post.get("data", {})

                url_post = post.get("url", "")
                if not url_post or url_post in seen_urls:
                    continue

                seen_urls.add(url_post)

                if post.get("created_utc", 0) < cutoff.timestamp():
                    continue

                title = post.get("title", "")
                body = post.get("selftext", "")
                full_text = f"{title} {body}".strip()

                if len(full_text) < 40:
                    continue

                # Light promo filtering
                lower_text = full_text.lower()
                if "try it:" in lower_text:
                    continue
                if "built a" in lower_text and post.get("score", 0) < 5:
                    continue

                date_str = datetime.fromtimestamp(
                    post.get("created_utc", 0),
                    tz=timezone.utc
                ).strftime("%Y-%m-%d")

                results.append({
                    "source": "reddit",
                    "term": term,
                    "text": full_text[:2000],
                    "title": title,
                    "score": float(post.get("score", 0)),
                    "url": url_post,
                    "date": date_str
                })

        except Exception as e:
            print(f"Reddit error for {term}: {e}")
            continue

        time.sleep(1)

    print(f"Reddit: {len(results)} signals collected")
    return results