import os
import json
from anthropic import Anthropic
from db import SessionLocal
from models import WeeklySnapshot, ThemeSnapshot


# ==========================================================
# FETCH SNAPSHOTS
# ==========================================================
def get_latest_snapshot(product_name):
    db = SessionLocal()

    snapshot = (
        db.query(WeeklySnapshot)
        .filter(WeeklySnapshot.product == product_name)
        .order_by(WeeklySnapshot.created_at.desc())
        .first()
    )

    db.close()
    return snapshot


def get_themes_for_week(product_name, week_id):
    db = SessionLocal()

    themes = (
        db.query(ThemeSnapshot)
        .filter(
            ThemeSnapshot.product == product_name,
            ThemeSnapshot.week_id == week_id
        )
        .all()
    )

    db.close()
    return themes


# ==========================================================
# LLM NORMALIZATION
# ==========================================================
def normalize_theme_names(theme_names):

    canonical_map = {}

    for name in theme_names:
        lower = name.lower()

        if any(word in lower for word in ["bug", "crash", "glitch", "instability"]):
            canonical_map[name] = "Stability & Reliability"

        elif any(word in lower for word in ["performance", "slow", "lag"]):
            canonical_map[name] = "Performance"

        elif any(word in lower for word in ["ui", "usability", "design"]):
            canonical_map[name] = "UX & Usability"

        elif any(word in lower for word in ["sync", "sharing", "collaboration"]):
            canonical_map[name] = "Sync & Collaboration"

        elif any(word in lower for word in ["pricing", "paywall", "monetization"]):
            canonical_map[name] = "Monetization & Pricing"

        elif any(word in lower for word in ["feature", "lack", "removal"]):
            canonical_map[name] = "Feature Gaps"

        elif any(word in lower for word in ["ai"]):
            canonical_map[name] = "AI & Automation"

        elif any(word in lower for word in ["compatibility", "android", "localization", "language"]):
            canonical_map[name] = "Platform & Compatibility"

        else:
            canonical_map[name] = "Other"

    return canonical_map

# ==========================================================
# COMPUTE NORMALIZED THEME GAPS
# ==========================================================
def compute_theme_gap(product_a, product_b, week_id_a, week_id_b):

    themes_a = get_themes_for_week(product_a, week_id_a)
    themes_b = get_themes_for_week(product_b, week_id_b)

    print("Themes A:", [t.theme_name for t in themes_a])
    print("Themes B:", [t.theme_name for t in themes_b])

    # Collect unique theme names
    theme_names = list(
        {t.theme_name for t in themes_a} |
        {t.theme_name for t in themes_b}
    )

    normalization_map = normalize_theme_names(theme_names)

    print("Normalization Map:", normalization_map)

    canonical_data = {}

    # Aggregate Product A
    for t in themes_a:
        canonical = normalization_map.get(t.theme_name, t.theme_name)
        if canonical not in canonical_data:
            canonical_data[canonical] = {"freq_a": 0, "freq_b": 0}
        canonical_data[canonical]["freq_a"] += t.frequency

    # Aggregate Product B
    for t in themes_b:
        canonical = normalization_map.get(t.theme_name, t.theme_name)
        if canonical not in canonical_data:
            canonical_data[canonical] = {"freq_a": 0, "freq_b": 0}
        canonical_data[canonical]["freq_b"] += t.frequency

    gaps = []

    for name, values in canonical_data.items():
        gap = values["freq_a"] - values["freq_b"]

        gaps.append({
            "theme": name,
            "freq_a": values["freq_a"],
            "freq_b": values["freq_b"],
            "gap": gap
        })

    gaps.sort(key=lambda x: abs(x["gap"]), reverse=True)

    return gaps[:5]

# ==========================================================
# MAIN COMPARISON
# ==========================================================
def compare_products(product_a, product_b):

    snap_a = get_latest_snapshot(product_a)
    snap_b = get_latest_snapshot(product_b)

    if not snap_a or not snap_b:
        return {
            "error": "Missing snapshots for one or both products."
        }

    pfi_delta = round(snap_a.pfi_score - snap_b.pfi_score, 2)
    negative_rate_delta = round(
        snap_a.negative_rate - snap_b.negative_rate,
        2
    )

    theme_gaps = compute_theme_gap(
        product_a,
        product_b,
        snap_a.week_id,
        snap_b.week_id
    )

    return {
        "product_a": product_a,
        "product_b": product_b,
        "pfi_a": snap_a.pfi_score,
        "pfi_b": snap_b.pfi_score,
        "pfi_delta": pfi_delta,
        "negative_rate_a": snap_a.negative_rate,
        "negative_rate_b": snap_b.negative_rate,
        "negative_rate_delta": negative_rate_delta,
        "normalized_theme_gaps": theme_gaps
    }