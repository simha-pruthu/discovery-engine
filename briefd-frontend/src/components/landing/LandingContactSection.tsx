"use client";

import { motion } from "framer-motion";

export default function LandingContactSection() {
  return (
    <section
      style={{
        borderTop: "1px solid var(--border)",
        paddingTop: 120,
        paddingBottom: 120,
        textAlign: "center",
      }}
    >
      <div className="container-site">
        {/* Eyebrow */}
        <motion.div
          style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="eyebrow-group">
            <span className="eyebrow-dash" />
            <span className="eyebrow">Get Started</span>
            <span className="eyebrow-dash" />
          </div>
        </motion.div>

        <motion.h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            fontWeight: 300,
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
            color: "var(--ink)",
            maxWidth: 700,
            margin: "0 auto 20px",
          }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          Ready to hear what your users are actually saying?
        </motion.h2>

        <motion.p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.95rem",
            color: "var(--ink-mid)",
            marginBottom: 40,
          }}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.16 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          Pruthu Simha · Product Engineer · New York City
        </motion.p>

        <motion.div
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap" }}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.24 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <a href="mailto:pruthu@example.com" className="btn-primary">
            Get in touch
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            View on LinkedIn
            <motion.span
              style={{ display: "inline-block" }}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              →
            </motion.span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
