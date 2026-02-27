import re
import requests
from google_play_scraper import search as gp_search
from db import SessionLocal
from models import Product


# ============================================
# HELPERS
# ============================================

def normalize_name(name: str):
    return re.sub(r"\s+", "", name.lower())


def get_existing_product(normalized_name):
    db = SessionLocal()
    product = db.query(Product)\
        .filter(Product.normalized_name == normalized_name)\
        .first()
    db.close()
    return product


def save_product(metadata):
    db = SessionLocal()

    product = Product(
        name=metadata["name"],
        normalized_name=normalize_name(metadata["name"]),
        category=metadata.get("category"),

        playstore_id=metadata.get("playstore_id"),
        playstore_installs=metadata.get("playstore_installs"),
        playstore_rating=metadata.get("playstore_rating"),

        appstore_id=metadata.get("appstore_id"),
        appstore_rating=metadata.get("appstore_rating"),
    )

    db.add(product)
    db.commit()
    db.refresh(product)
    db.close()

    return product


# ============================================
# GOOGLE PLAY DISCOVERY
# ============================================

def discover_playstore(product_name):
    try:
        results = gp_search(
            product_name,
            lang="en",
            country="us",
            n_hits=5
        )

        if not results:
            return None

        app = results[0]

        return {
            "playstore_id": app.get("appId"),
            "playstore_installs": app.get("installs"),
            "playstore_rating": app.get("score"),
            "category": app.get("genre")
        }

    except Exception as e:
        print("Playstore discovery error:", e)
        return None


# ============================================
# APPLE APP STORE DISCOVERY
# ============================================

def discover_appstore(product_name):
    try:
        url = "https://itunes.apple.com/search"
        params = {
            "term": product_name,
            "entity": "software",
            "country": "us",
            "limit": 5
        }

        response = requests.get(url, params=params)
        data = response.json()

        if data["resultCount"] == 0:
            return None

        app = data["results"][0]

        return {
            "appstore_id": app.get("trackId"),
            "appstore_rating": app.get("averageUserRating"),
            "category": app.get("primaryGenreName")
        }

    except Exception as e:
        print("App Store discovery error:", e)
        return None


# ============================================
# MAIN DISCOVERY ENTRY
# ============================================

def discover_product(product_name):
    normalized = normalize_name(product_name)

    # Check if exists
    existing = get_existing_product(normalized)
    if existing:
        print(f"Product already exists: {existing.name}")
        return existing

    print(f"Discovering new product: {product_name}")

    metadata = {
        "name": product_name
    }

    # Discover Play Store
    play_data = discover_playstore(product_name)
    if play_data:
        metadata.update(play_data)

    # Discover App Store
    app_data = discover_appstore(product_name)
    if app_data:
        metadata.update(app_data)

    # If nothing found, still create basic product entry
    product = save_product(metadata)

    print(f"Saved new product: {product.name}")

    return product