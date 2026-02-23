import streamlit as st
from synthesizer import run_pipeline
import pandas as pd

# ─────────────────────────────────────────────
# PAGE CONFIG
# ─────────────────────────────────────────────
st.set_page_config(
    page_title="Briefd — Product Intelligence",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ─────────────────────────────────────────────
# PREMIUM CSS SYSTEM
# ─────────────────────────────────────────────
st.markdown("""
<style>

/* ─────────────────────────────────────
   FONTS
─────────────────────────────────────*/
h1,h2,h3,h4 { font-family: 'Fraunces', serif !important; color: var(--ink) !important; }
html, body, [class*="css"], .stApp {
    font-family: 'Inter', sans-serif !important;
}

/* ─────────────────────────────────────
   ROOT VARIABLES
─────────────────────────────────────*/
:root {
    --bg: #F8F8F6;
    --card: #FFFFFF;
    --ink: #161615;
    --ink-soft: #6F6E6A;
    --accent: #C84C3A;
    --accent-soft: #F3E8E6;
    --border: #E8E6E2;
    --radius: 16px;
    --shadow-sm: 0 4px 16px rgba(0,0,0,0.04);
    --shadow-md: 0 12px 40px rgba(0,0,0,0.06);
}

/* GLOBAL RESET */
html, body, .stApp {
    background: var(--bg);
    font-family: 'Inter', sans-serif;
    color: var(--ink);
}

/* Remove Streamlit chrome */
#MainMenu, footer, header {visibility: hidden;}
.stDeployButton {display:none;}
[data-testid="stToolbar"] {display:none;}

/* Layout control */
.block-container {
    padding-top: 0;
    padding-bottom: 40px;
    max-width: 1280px;
}

/* Typography */
h1, h2, h3 {
    font-family: 'Playfair Display', serif !important;
    font-weight: 500 !important;
    letter-spacing: -0.5px;
}

.section-title {
    font-size: 28px;
    margin-bottom: 24px;
}

.muted {
    color: var(--ink-soft);
}

/* Navbar */
.navbar {
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding: 24px 0;
    border-bottom: 1px solid var(--border);
}

.logo {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 600;
}

.logo span {
    color: var(--accent);
}

/* Hero */
.hero {
    padding: 64px 0 48px 0;
}

.hero h1 {
    font-size: 48px;
    margin-bottom: 12px;
}

.hero p {
    max-width: 520px;
    font-size: 15px;
    color: var(--ink-soft);
}

/* Metrics */
.metric-row {
    display:flex;
    gap:60px;
    margin: 40px 0 80px 0;
}

.metric {
    display:flex;
    flex-direction:column;
}

.metric-label {
    font-size:12px;
    text-transform:uppercase;
    letter-spacing:1px;
    color: var(--ink-soft);
    margin-bottom:6px;
}

.metric-value {
    font-size:32px;
    font-weight:500;
}

.metric-value.accent {
    color: var(--accent);
}

/* Cards */
.card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 32px;
    margin-bottom: 24px;
    box-shadow: var(--shadow-sm);
    transition: all .2s ease;
}

.card:hover {
    box-shadow: var(--shadow-md);
}

/* Theme header */
.theme-header {
    display:flex;
    justify-content:space-between;
    margin-bottom:18px;
}

.theme-title {
    font-size:20px;
}

.theme-meta {
    font-size:12px;
    color: var(--ink-soft);
}

/* Quote */
.quote {
    border-left: 3px solid var(--border);
    padding-left: 14px;
    margin-bottom: 14px;
}

.quote-text {
    font-style: italic;
    font-size: 14px;
}

.quote-source {
    font-size: 11px;
    color: var(--ink-soft);
}

/* Competitive grid */
.comp-grid {
    display:grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap:40px;
}

/* Footer */
.footer {
    margin-top: 80px;
    padding-top: 40px;
    border-top: 1px solid var(--border);
    font-size:12px;
    color: var(--ink-soft);
}

</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────
# NAVBAR
# ─────────────────────────────────────────────
st.markdown("""
<div class="navbar">
  <div class="logo">Brie<span>fd</span></div>
  <div class="muted">Live Customer Intelligence</div>
</div>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────
# HERO
# ─────────────────────────────────────────────
st.markdown("""
<div class="hero">
  <h1>Customer signal.<br>Structured beautifully.</h1>
  <p>Transform scattered feedback into structured intelligence your product team can trust.</p>
</div>
""", unsafe_allow_html=True)

col1, col2, col3 = st.columns([3,3,1.5])
with col1:
    product_name = st.text_input("Product Name")
with col2:
    competitors_input = st.text_input("Competitors (comma separated)")
with col3:
    st.markdown("<div style='height:26px'></div>", unsafe_allow_html=True)
    analyze = st.button("Run Analysis")

# ─────────────────────────────────────────────
# RUN
# ─────────────────────────────────────────────
if analyze and product_name:

    competitors = [c.strip() for c in competitors_input.split(",") if c.strip()]
    results = run_pipeline(product_name, competitors)

    product = results.get("product", {})
    themes = product.get("themes", [])
    summary = product.get("summary", {})
    competitors_data = results.get("competitors", {})
    comparisons = results.get("comparisons", {})

    # Metrics
    st.markdown(f"""
    <div class="metric-row">
      <div class="metric">
        <div class="metric-label">Signals</div>
        <div class="metric-value">{summary.get("total_signals",0)}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Negative Rate</div>
        <div class="metric-value accent">{summary.get("negative_rate",0)}%</div>
      </div>
      <div class="metric">
        <div class="metric-label">Themes</div>
        <div class="metric-value">{len(themes)}</div>
      </div>
    </div>
    """, unsafe_allow_html=True)

    # THEMES
    st.markdown('<h2 class="section-title">Customer Themes</h2>', unsafe_allow_html=True)

    for theme in themes:

        st.markdown('<div class="card">', unsafe_allow_html=True)

        st.markdown(f"""
        <div class="theme-header">
          <div class="theme-title">{theme.get("name","—")}</div>
          <div class="theme-meta">
            {theme.get("frequency",0)} mentions · 
            {theme.get("primary_segment","General")} · 
            Intensity {theme.get("emotional_intensity","—")}
          </div>
        </div>
        """, unsafe_allow_html=True)

        for q in theme.get("quotes",[])[:5]:
            st.markdown(f"""
            <div class="quote">
              <div class="quote-text">"{q.get("text","")}"</div>
              <div class="quote-source">— {q.get("source","")}</div>
            </div>
            """, unsafe_allow_html=True)

        st.markdown('</div>', unsafe_allow_html=True)

    # COMPETITIVE
    if competitors_data:
        st.markdown('<h2 class="section-title" style="margin-top:80px;">Competitive Intelligence</h2>', unsafe_allow_html=True)

        for comp, data in competitors_data.items():

            comp_summary = data.get("summary",{})
            comp_compare = comparisons.get(comp,{})

            st.markdown('<div class="card">', unsafe_allow_html=True)

            st.markdown(f"<h3>{comp}</h3>", unsafe_allow_html=True)
            st.markdown(f"<p class='muted'>Negative Rate: {comp_summary.get('negative_rate',0)}%</p>", unsafe_allow_html=True)

            st.markdown('<div class="comp-grid">', unsafe_allow_html=True)

            for title, items in {
                "Shared Frictions": comp_compare.get("shared",[]),
                "Unique to You": comp_compare.get("unique_to_product",[]),
                f"Unique to {comp}": comp_compare.get("unique_to_competitor",[])
            }.items():

                st.markdown("<div>", unsafe_allow_html=True)
                st.markdown(f"<strong>{title}</strong>", unsafe_allow_html=True)

                if items:
                    for item in items:
                        st.markdown(f"<div class='muted'>– {item}</div>", unsafe_allow_html=True)
                else:
                    st.markdown("<div class='muted'>None detected</div>", unsafe_allow_html=True)

                st.markdown("</div>", unsafe_allow_html=True)

            st.markdown("</div></div>", unsafe_allow_html=True)

# FOOTER
st.markdown("""
<div class="footer">
Briefd · Product Intelligence · Built by Pruthu Simha
</div>
""", unsafe_allow_html=True)