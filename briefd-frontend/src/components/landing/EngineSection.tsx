"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Ingest Signals",
    body: "Reddit posts, app store reviews, and public forum threads are collected and normalised into a unified signal corpus. Each source is timestamped and attributed.",
  },
  {
    number: "02",
    title: "Cluster Themes",
    body: "Recurring friction patterns are grouped by semantic similarity and ranked by frequency and recurrence rate. Noise is separated from signal automatically.",
  },
  {
    number: "03",
    title: "Quantify Severity",
    body: "Each theme receives an intensity score based on emotional language density, frequency across independent users, and user segment impact weighting.",
  },
];

export default function EngineSection() {
  return (
    <section id="how-it-works" className="section-py" style={{ borderBottom: "1px solid var(--border)" }}>
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
          <span className="eyebrow">Process</span>
        </motion.div>

        <motion.h2
          className="section-heading"
          style={{ marginBottom: 60 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          From signal to direction.
        </motion.h2>

        {/* Step rows */}
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {steps.map((s, i) => (
            <motion.div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr",
                gap: 40,
                alignItems: "start",
                padding: "36px 0",
                borderBottom: "1px solid var(--border)",
                cursor: "default",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.08 }}
              viewport={{ once: true, margin: "-80px" }}
              whileHover={{ x: 8 }}
            >
              {/* Step number */}
              <span
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "var(--orange)",
                  lineHeight: 1.4,
                  paddingTop: 2,
                }}
              >
                {s.number}
              </span>

              {/* Content */}
              <div>
                <h3
                  className="card-heading"
                  style={{ fontSize: "1.1rem", marginBottom: 10 }}
                >
                  {s.title}
                </h3>
                <p className="body-copy" style={{ maxWidth: 560 }}>
                  {s.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
