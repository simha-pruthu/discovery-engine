"use client";

import { motion } from "framer-motion";

const metrics = [
  {
    tag: "Emotional Intensity",
    heading: "Frustration at scale",
    body: "Measures how strongly users express frustration or urgency around a theme. Higher intensity strongly correlates with short-term churn risk.",
  },
  {
    tag: "Negative Signal Rate",
    heading: "Product health at a glance",
    body: "The percentage of collected signals expressing clear dissatisfaction. A leading indicator that moves before retention metrics do.",
  },
  {
    tag: "Theme Recurrence",
    heading: "Systemic vs isolated",
    body: "How frequently a specific friction pattern appears across independent users. This separates isolated incidents from systemic product failures.",
  },
  {
    tag: "Segment Impact",
    heading: "Who is most affected",
    body: "Identifies which user cohort experiences the most friction. Enables targeted prioritisation by audience rather than aggregate averages.",
  },
];

export default function MetricsSection() {
  return (
    <section id="metrics" className="section-py" style={{ borderBottom: "1px solid var(--border)" }}>
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
          <span className="eyebrow">What the Numbers Mean</span>
        </motion.div>

        <motion.h2
          className="section-heading"
          style={{ marginBottom: 60, maxWidth: 640 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          Every metric is traceable. Nothing is a black box.
        </motion.h2>

        {/* 2×2 border grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 1,
            background: "var(--border)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              style={{
                padding: "40px 36px",
                background: "var(--bg)",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "var(--card-bg)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "var(--bg)")
              }
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.08 }}
              viewport={{ once: true, margin: "-80px" }}
            >
              {/* Orange tag */}
              <span
                style={{
                  display: "inline-block",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.68rem",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--orange)",
                  marginBottom: 14,
                }}
              >
                {m.tag}
              </span>

              <h3
                className="card-heading"
                style={{ fontSize: "1.15rem", marginBottom: 12 }}
              >
                {m.heading}
              </h3>
              <p className="body-copy">{m.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
