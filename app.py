import streamlit as st
from synthesizer import run_pipeline

# -------------------------------------------------
# PAGE CONFIG
# -------------------------------------------------
st.set_page_config(page_title="Briefd", layout="wide")

# -------------------------------------------------
# CLEAN PRODUCT STYLING
# -------------------------------------------------
st.markdown("""
<style>
.block-container {
    padding-top: 2rem;
    max-width: 1100px;
}

body {
    background: #f6f8fc;
}

h1 {
    font-size: 2.8rem;
    font-weight: 700;
    color: #0f172a;
}

.subtitle {
    color: #64748b;
    margin-bottom: 2rem;
    font-size: 1.1rem;
}

.card {
    background: white;
    padding: 1.8rem;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    margin-bottom: 1.5rem;
}

.metric {
    background: #eef2ff;
    padding: 1rem;
    border-radius: 12px;
    text-align: center;
}

.metric h3 {
    margin: 0;
    font-size: 1.8rem;
    color: #4f46e5;
}

.metric p {
    margin: 0;
    font-size: 0.9rem;
    color: #475569;
}

.section-title {
    font-weight: 600;
    margin-bottom: 1rem;
    font-size: 1.2rem;
}

.footer {
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
    text-align: center;
    color: #64748b;
    font-size: 0.9rem;
}
</style>
""", unsafe_allow_html=True)

# -------------------------------------------------
# HEADER
# -------------------------------------------------
st.markdown("<h1>Briefd</h1>", unsafe_allow_html=True)
st.markdown(
    '<div class="subtitle">Continuous discovery intelligence from live user signals.</div>',
    unsafe_allow_html=True
)

# -------------------------------------------------
# INPUT PANEL
# -------------------------------------------------
st.markdown('<div class="card">', unsafe_allow_html=True)

product_name = st.text_input("Product Name", placeholder="e.g., Uber")
competitors_input = st.text_input("Competitors (comma separated, max 3)", placeholder="e.g., Lyft")

generate = st.button("Generate Intelligence")

st.markdown('</div>', unsafe_allow_html=True)

# -------------------------------------------------
# OUTPUT PANEL
# -------------------------------------------------
if generate and product_name:

    competitors = [c.strip() for c in competitors_input.split(",") if c.strip()]

    with st.spinner("Collecting signals and generating structured discovery intelligence..."):
        results = run_pipeline(product_name, competitors)

    themes = results.get("themes", [])
    summary = results.get("summary", {})
    emerging = results.get("emerging_risks", [])
    opportunities = results.get("opportunities", [])

    # ------------------------
    # METRIC SUMMARY ROW
    # ------------------------
    col1, col2, col3 = st.columns(3)

    col1.markdown(f"""
    <div class="metric">
        <h3>{results.get("signal_count", 0)}</h3>
        <p>Total Signals</p>
    </div>
    """, unsafe_allow_html=True)

    col2.markdown(f"""
    <div class="metric">
        <h3>{len(themes)}</h3>
        <p>Structural Frictions</p>
    </div>
    """, unsafe_allow_html=True)

    top_score = round(themes[0]["business_impact_score"], 1) if themes else 0

    col3.markdown(f"""
    <div class="metric">
        <h3>{top_score}</h3>
        <p>Top Impact Score</p>
    </div>
    """, unsafe_allow_html=True)

    # Guardrail
    if not themes:
        st.warning("No structural frictions detected. Signals may be neutral or insufficient.")
        st.stop()

    # ------------------------
    # MOST CRITICAL RISK
    # ------------------------
    top = themes[0]
    segment = top.get("primary_segment") or "General users"
    score = round(top["business_impact_score"], 1)

    color = "#dc2626" if score >= 8 else "#f59e0b" if score >= 5 else "#16a34a"

    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown('<div class="section-title">Most Critical Product Risk</div>', unsafe_allow_html=True)

    st.markdown(f"### {top['name']}")
    st.markdown(
        f"<b>Impact Score:</b> <span style='color:{color}; font-weight:700'>{score}</span>",
        unsafe_allow_html=True
    )
    st.markdown(f"**Primary Segment:** {segment}")
    st.markdown(f"**Root Cause Hypothesis:** {top.get('root_cause_hypothesis', '')}")

    st.markdown("**Supporting Evidence:**")
    for q in top.get("evidence_quotes", []):
        st.markdown(f"- \"{q}\"")

    st.markdown("**Recommended Discovery Actions:**")
    for action in top.get("recommended_actions", []):
        st.markdown(f"- {action}")

    st.markdown('</div>', unsafe_allow_html=True)

    # ------------------------
    # ADDITIONAL FRICTIONS
    # ------------------------
    if len(themes) > 1:
        st.markdown('<div class="card">', unsafe_allow_html=True)
        st.markdown('<div class="section-title">Additional Structural Frictions</div>', unsafe_allow_html=True)

        for theme in themes[1:3]:
            seg = theme.get("primary_segment") or "General users"
            st.markdown(f"### {theme['name']}")
            st.markdown(f"**Impact Score:** {round(theme['business_impact_score'],1)}")
            st.markdown(f"**Segment:** {seg}")
            st.markdown(f"**Root Cause:** {theme.get('root_cause_hypothesis', '')}")
            st.markdown("---")

        st.markdown('</div>', unsafe_allow_html=True)

    # ------------------------
    # EMERGING RISKS
    # ------------------------
    if emerging:
        st.markdown('<div class="card">', unsafe_allow_html=True)
        st.markdown('<div class="section-title">Emerging High-Intensity Risks</div>', unsafe_allow_html=True)

        for risk in emerging:
            st.markdown(
                f"- **{risk['name']}** — Intensity {risk['emotional_intensity']} | Frequency {risk['frequency']}"
            )

        st.markdown('</div>', unsafe_allow_html=True)

    # ------------------------
    # OPPORTUNITY SIGNALS
    # ------------------------
    if opportunities:
        st.markdown('<div class="card">', unsafe_allow_html=True)
        st.markdown('<div class="section-title">Opportunity Signals</div>', unsafe_allow_html=True)

        for opp in opportunities:
            st.markdown(f"- \"{opp}\"")

        st.markdown('</div>', unsafe_allow_html=True)

    # ------------------------
    # SIGNAL HEALTH SUMMARY
    # ------------------------
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown('<div class="section-title">Signal Health Overview</div>', unsafe_allow_html=True)

    st.markdown(f"""
**Total Signals Analyzed:** {summary.get('total', 0)}  
**Negative Signal Rate:** {summary.get('negative_rate', 0)}%  
**Performance Related Signals:** {summary.get('performance_count', 0)}  
**Mobile Related Signals:** {summary.get('mobile_count', 0)}
""")

    st.markdown('</div>', unsafe_allow_html=True)

# -------------------------------------------------
# FOOTER
# -------------------------------------------------
st.markdown("""
<div class="footer">
Built by <b>Pruthu Simha Hindupur</b><br>
Feedback or ideas? <a href="mailto:pvh2108@columbia.edu">pvh2108@columbia.edu</a>
</div>
""", unsafe_allow_html=True)