from db import SessionLocal
from models import WeeklySnapshot, ThemeSnapshot


# ==========================================================
# FETCH LATEST SNAPSHOT
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


# ==========================================================
# FETCH THEMES FOR A GIVEN WEEK
# ==========================================================
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
# COMPUTE THEME GAPS
# ==========================================================
def compute_theme_gap(product_a, product_b, week_id_a, week_id_b):

    themes_a = get_themes_for_week(product_a, week_id_a)
    themes_b = get_themes_for_week(product_b, week_id_b)

    # Convert to dict for fast lookup
    theme_map_a = {t.theme_name: t for t in themes_a}
    theme_map_b = {t.theme_name: t for t in themes_b}

    all_theme_names = set(theme_map_a.keys()) | set(theme_map_b.keys())

    gaps = []

    for name in all_theme_names:

        freq_a = theme_map_a[name].frequency if name in theme_map_a else 0
        freq_b = theme_map_b[name].frequency if name in theme_map_b else 0

        intensity_a = theme_map_a[name].intensity if name in theme_map_a else 0
        intensity_b = theme_map_b[name].intensity if name in theme_map_b else 0

        gap = freq_a - freq_b

        gaps.append({
            "theme": name,
            "freq_a": freq_a,
            "freq_b": freq_b,
            "gap": gap,
            "intensity_a": intensity_a,
            "intensity_b": intensity_b
        })

    # Sort by biggest absolute gap
    gaps.sort(key=lambda x: abs(x["gap"]), reverse=True)

    return gaps[:5]  # Top 5 most different themes


# ==========================================================
# MAIN COMPARISON ENGINE
# ==========================================================
def compare_products(product_a, product_b):

    snap_a = get_latest_snapshot(product_a)
    snap_b = get_latest_snapshot(product_b)

    if not snap_a or not snap_b:
        return {
            "error": "Missing snapshots for one or both products. Run pipeline first."
        }

    # Metric comparison
    pfi_delta = round(snap_a.pfi_score - snap_b.pfi_score, 2)
    negative_rate_delta = round(
        snap_a.negative_rate - snap_b.negative_rate,
        2
    )

    # Theme gap analysis
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

        "top_theme_gaps": theme_gaps
    }