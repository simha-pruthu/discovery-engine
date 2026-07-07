"use client";

import { motion } from "framer-motion";

const manualItems = [
  "Time-intensive and nearly impossible to scale across sources",
  "Subjective — the output is shaped entirely by who happens to read it",
  "Hard to quantify, compare over time, or present to stakeholders",
];

const briefedItems = [
  "Automated clustering across all signal sources simultaneously",
  "Severity scoring removes subjective bias from the prioritisation process",
  "Cohort-level insight with ranked, exportable themes and hypotheses",
];

export default function ComparisonSection() {
  return (
    <section className="section-py" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="container-site">
        {/* Eyebrow */}
        <motion.div
          className="eyebrow-group"
          style={{ marginBottom: 20 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <span className="eyebrow-dash" />
          <span className="eyebrow">The Shift</span>
        </motion.div>

        <motion.h2
          className="section-heading"
          style={{ marginBottom: 48 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          Stop reading noise. Start acting on signal.
        </motion.h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Left — Manual Review */}
          <motion.div
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "36px 32px",
            }}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.7rem",
                fontWeight: 400,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "rgba(17,17,16,0.5)",
                marginBottom: 28,
              }}
            >
              Manual Review
            </p>
            <ul style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {manualItems.map((item, i) => (
                <li
                  key={i}
                  style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.7rem",
                        color: "var(--ink-faint)",
                        fontWeight: 500,
                      }}
                    >
                      ✕
                    </span>
                  </span>
                  <p className="body-copy" style={{ margin: 0 }}>
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right — Briefd */}
          <motion.div
            style={{
              background: "var(--ink)",
              border: "1px solid var(--ink)",
              borderRadius: 14,
              padding: "36px 32px",
            }}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.7rem",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--orange)",
                marginBottom: 28,
              }}
            >
              Briefd
            </p>
            <ul style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {briefedItems.map((item, i) => (
                <li
                  key={i}
                  style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "var(--orange)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.7rem",
                        color: "white",
                        fontWeight: 500,
                      }}
                    >
                      ✓
                    </span>
                  </span>
                  <p
                    className="body-copy"
                    style={{
                      margin: 0,
                      color: "rgba(247,244,239,0.8)",
                    }}
                  >
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
