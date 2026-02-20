from scrapers.reddit import fetch_signals
from scrapers.playstore import fetch_reviews

MAX_SIGNALS = 200


def collect_signals(product_name: str, competitors: list[str]) -> list[dict]:
    reddit_signals = fetch_signals(product_name, competitors)
    playstore_signals = fetch_reviews(product_name, competitors)

    all_signals = reddit_signals + playstore_signals
    total_collected = len(all_signals)

    seen_urls = set()
    deduped = []
    for signal in all_signals:
        url = signal.get("url", "")
        if url not in seen_urls:
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
