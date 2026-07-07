"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Sample report data ─────────────────────────────────────────────────── */
const SAMPLE = {
  product: "Notion",
  timestamp: "Mar 1, 2026, 09:41 AM",
  summary: { total_signals: 1247, negative_rate: 67, trend: "worsening" },
  themes: [
    {
      name: "Onboarding Friction",
      frequency: 847,
      emotional_intensity: 84,
      primary_segment: "New Users",
      confidence: "High",
      quotes: [
        { text: "I literally gave up after 20 minutes. No idea where to even start.", source: "reddit" },
        { text: "The blank canvas is overwhelming. I need some kind of guided setup.", source: "appstore" },
      ],
    },
    {
      name: "Offline Sync Failures",
      frequency: 612,
      emotional_intensity: 71,
      primary_segment: "Mobile Users",
      confidence: "High",
      quotes: [
        { text: "Lost two hours of notes because sync silently failed while I was on the subway.", source: "reddit" },
      ],
    },
    {
      name: "Database Performance",
      frequency: 389,
      emotional_intensity: 58,
      primary_segment: "Power Users",
      confidence: "Medium",
      quotes: [
        { text: "Filtering a 500-row database takes 4–5 seconds. Unusable for real work.", source: "reddit" },
      ],
    },
    {
      name: "Pricing & Plan Limits",
      frequency: 274,
      emotional_intensity: 49,
      primary_segment: "Solo Users",
      confidence: "Medium",
      quotes: [
        { text: "Hitting the block limit with no warning and then being paywalled is awful UX.", source: "appstore" },
      ],
    },
  ],
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const HEADLINE = "Turn raw feedback into ranked product decisions.";
const words = HEADLINE.split(" ");

function LivePulseDot() {
  return (
    <motion.span
      style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--orange)", flexShrink: 0 }}
      animate={{ scale: [1, 0.8], opacity: [1, 0.5] }}
      transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
    />
  );
}

function MiniBar({ value, animate: doAnimate = true }: { value: number; animate?: boolean }) {
  const [width, setWidth] = useState(doAnimate ? 0 : value);
  useEffect(() => {
    if (!doAnimate) return;
    const t = setTimeout(() => setWidth(value), 400);
    return () => clearTimeout(t);
  }, [value, doAnimate]);
  return (
    <div className="intensity-track">
      <div className="intensity-fill" style={{ width: `${width}%` }} />
    </div>
  );
}

/* ─── Sample Report Modal ────────────────────────────────────────────────── */
function SampleReportModal({ onClose }: { onClose: () => void }) {
  const avgIntensity = Math.round(
    SAMPLE.themes.reduce((a, t) => a + t.emotional_intensity, 0) / SAMPLE.themes.length
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(17,17,16,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          style={{
            background: "var(--bg)",
            borderRadius: 20,
            width: "100%",
            maxWidth: 860,
            maxHeight: "88vh",
            overflowY: "auto",
            position: "relative",
            boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
          }}
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 28px",
            borderBottom: "1px solid var(--border)",
            position: "sticky", top: 0,
            background: "var(--bg)",
            zIndex: 10,
            borderRadius: "20px 20px 0 0",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div className="eyebrow-group">
                <span className="eyebrow-dash" />
                <span className="eyebrow">Sample Report</span>
              </div>
              <span style={{ width: 1, height: 12, background: "var(--border)", display: "inline-block" }} />
              <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: "1rem", color: "var(--ink)" }}>
                {SAMPLE.product}
              </span>
              <span className="pill-badge pill-badge-live" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <LivePulseDot />
                LIVE
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: "50%",
                border: "1px solid var(--border)",
                background: "var(--white)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "1rem", color: "var(--ink-mid)",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--card-bg)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--white)")}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: "28px 28px 36px" }}>
            {/* KPI row */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1, background: "var(--border)",
              border: "1px solid var(--border)", borderRadius: 12,
              overflow: "hidden", marginBottom: 28,
            }}>
              {[
                { label: "Total Signals", value: SAMPLE.summary.total_signals.toLocaleString(), accent: false },
                { label: "Negative Rate", value: `${SAMPLE.summary.negative_rate}%`, accent: true },
                { label: "Themes Found", value: String(SAMPLE.themes.length), accent: false },
                { label: "Avg Intensity", value: `${avgIntensity}%`, accent: true },
              ].map((k) => (
                <div key={k.label} style={{ padding: "18px 20px", background: "var(--bg)" }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-faint)", marginBottom: 8 }}>
                    {k.label}
                  </p>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: "1.8rem", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1, color: k.accent ? "var(--orange)" : "var(--ink)" }}>
                    {k.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Theme cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {SAMPLE.themes.map((t, i) => (
                <motion.div
                  key={i}
                  style={{
                    background: "var(--white)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    padding: "20px 22px",
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
                >
                  {/* Row 1: name + signals */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: "1rem", color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 3 }}>
                        {t.name}
                      </p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "var(--ink-faint)" }}>
                        {t.primary_segment}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                      <p style={{ fontFamily: "'Fraunces', serif", fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--ink)", lineHeight: 1 }}>
                        {t.frequency.toLocaleString()}
                      </p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        signals
                      </p>
                    </div>
                  </div>

                  {/* Intensity bar */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "var(--ink-faint)" }}>Emotional Intensity</span>
                    <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "0.85rem", color: "var(--orange)" }}>{t.emotional_intensity}%</span>
                  </div>
                  <MiniBar value={t.emotional_intensity} />

                  {/* Quote */}
                  {t.quotes?.[0] && (
                    <div style={{ marginTop: 14, borderLeft: "2px solid var(--border)", paddingLeft: 10 }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", fontWeight: 300, lineHeight: 1.65, color: "var(--ink-mid)" }}>
                        &ldquo;{t.quotes[0].text}&rdquo;
                      </p>
                      {t.quotes[0].source && (
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", color: "var(--ink-faint)", fontWeight: 500, marginTop: 4, display: "block" }}>
                          {{ reddit: "Reddit", appstore: "App Store", playstore: "Google Play" }[t.quotes[0].source] ?? t.quotes[0].source}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "var(--ink-mid)", fontWeight: 300 }}>
                      High friction among {t.primary_segment.toLowerCase()}.
                    </p>
                    <span className="pill-badge pill-badge-outline">{t.confidence}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA at bottom */}
            <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p className="body-copy" style={{ margin: 0 }}>
                Run a live analysis for your own product.
              </p>
              <Link href="/experience" className="btn-primary" onClick={onClose}>
                Run Analysis →
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Preview card (right side of hero) ─────────────────────────────────── */
function PreviewCard() {
  const themes = SAMPLE.themes.slice(0, 3);
  return (
    <motion.div
      className="float-card hidden md:block"
      style={{ width: 360, flexShrink: 0, overflow: "hidden" }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.8 }}
    >
      {/* Card header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div>
          <span className="eyebrow" style={{ display: "block", marginBottom: 2 }}>Live Preview</span>
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: "0.95rem", color: "var(--ink)" }}>
            {SAMPLE.product}
          </span>
        </div>
        <span className="pill-badge pill-badge-live" style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <LivePulseDot />
          LIVE
        </span>
      </div>

      {/* Mini KPI row */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: 1, background: "var(--border)",
        borderBottom: "1px solid var(--border)",
      }}>
        {[
          { label: "Signals", value: "1,247" },
          { label: "Neg. Rate", value: "67%", accent: true },
          { label: "Themes", value: "4" },
        ].map((k) => (
          <div key={k.label} style={{ padding: "12px 14px", background: "var(--bg)" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-faint)", marginBottom: 4 }}>
              {k.label}
            </p>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: "1.15rem", fontWeight: 600, letterSpacing: "-0.03em", color: k.accent ? "var(--orange)" : "var(--ink)", lineHeight: 1 }}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Theme rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)" }}>
        {themes.map((t, i) => (
          <div key={i} style={{ padding: "14px 20px", background: "var(--white)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: "0.88rem", color: "var(--ink)", letterSpacing: "-0.01em", marginBottom: 1 }}>
                  {t.name}
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", color: "var(--ink-faint)" }}>
                  {t.primary_segment} · {t.frequency.toLocaleString()} signals
                </p>
              </div>
              <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "0.9rem", color: "var(--orange)", flexShrink: 0, marginLeft: 12 }}>
                {t.emotional_intensity}%
              </span>
            </div>
            <MiniBar value={t.emotional_intensity} />
          </div>
        ))}
      </div>

      {/* Card footer */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "var(--ink-faint)", textAlign: "center" }}>
          Ranked by emotional intensity · Updated live
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */
export default function Hero() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          paddingTop: 100,
          paddingBottom: 80,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="container-site" style={{ width: "100%" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 60,
              alignItems: "center",
            }}
            className="hero-grid"
          >
            {/* Left: text content */}
            <div style={{ maxWidth: 520 }}>
              {/* Eyebrow */}
              <motion.div
                className="eyebrow-group"
                style={{ marginBottom: 24 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <span className="eyebrow-dash" />
                <span className="eyebrow">Product Intelligence Platform</span>
              </motion.div>

              {/* Headline — word stagger, slightly smaller */}
              <h1 style={{ marginBottom: 22 }}>
                <span
                  style={{
                    display: "block",
                    fontFamily: "'Fraunces', serif",
                    fontSize: "clamp(2.2rem, 4vw, 3.6rem)",
                    fontWeight: 300,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                    color: "var(--ink)",
                  }}
                >
                  {words.map((word, i) => {
                    const isRanked = word.toLowerCase() === "ranked";
                    return (
                      <motion.span
                        key={i}
                        style={{ display: "inline-block", marginRight: "0.26em", position: "relative" }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 + i * 0.08 }}
                      >
                        {word}
                        {isRanked && (
                          <motion.span
                            style={{ position: "absolute", bottom: -3, left: 0, height: 3, background: "var(--orange)", borderRadius: 2 }}
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 1.1 }}
                          />
                        )}
                      </motion.span>
                    );
                  })}
                </span>
              </h1>

              {/* Subheadline */}
              <motion.p
                className="body-copy"
                style={{ fontSize: "1rem", maxWidth: 460, marginBottom: 32 }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 1.2 }}
              >
                Briefd transforms scattered reviews, forum threads, and user complaints
                into structured friction themes — with measurable severity scoring and
                segment-level impact analysis.
              </motion.p>

              {/* CTAs */}
              <motion.div
                style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.35 }}
              >
                <Link href="/experience" className="btn-primary">
                  Run Analysis
                </Link>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-ghost"
                  style={{ background: "none", border: "none" }}
                >
                  View sample report
                  <motion.span
                    style={{ display: "inline-block" }}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    →
                  </motion.span>
                </button>
              </motion.div>
            </div>

            {/* Right: preview card */}
            <PreviewCard />
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .hero-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* Sample report modal */}
      {showModal && <SampleReportModal onClose={() => setShowModal(false)} />}
    </>
  );
}
