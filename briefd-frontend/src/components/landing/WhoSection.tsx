"use client";

import { motion } from "framer-motion";

const audiences = [
  {
    label: "Product Managers",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
    body: "Identify friction themes weeks before churn metrics move. Prioritise the backlog objectively — without gut feel or the loudest voice in the room driving decisions.",
  },
  {
    label: "Growth Teams",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    body: "Understand which user cohorts are silently dropping off and what specific friction is driving them away. Segment-level analysis, not just aggregate numbers.",
  },
  {
    label: "Founders",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    body: "Make prioritisation decisions grounded in real user signal — not the most vocal customer, the last support ticket read, or internal assumptions about what matters.",
  },
];

export default function WhoSection() {
  return (
    <section id="for-teams" className="section-py" style={{ borderBottom: "1px solid var(--border)" }}>
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
          <span className="eyebrow">Built For</span>
        </motion.div>

        <motion.h2
          className="section-heading"
          style={{ marginBottom: 60 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          Product operators.
        </motion.h2>

        {/* Three cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {audiences.map((a, i) => (
            <motion.div
              key={i}
              className="feature-card"
              style={{ padding: "32px 28px" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.08 }}
              viewport={{ once: true, margin: "-80px" }}
            >
              {/* Icon container */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "rgba(232,79,39,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                {a.icon}
              </div>

              <h3
                className="card-heading"
                style={{ fontSize: "1.1rem", marginBottom: 12 }}
              >
                {a.label}
              </h3>
              <p className="body-copy">{a.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
