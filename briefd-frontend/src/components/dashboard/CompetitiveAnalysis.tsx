"use client";

import { motion } from "framer-motion";

export interface Competitor {
  name: string;
  negative_rate: number;
  shared: string[];
  unique_to_product: string[];
  unique_to_competitor: string[];
}

interface Props {
  competitors: Competitor[];
  productName: string;
}

function TagList({ items, accent = false }: { items: string[]; accent?: boolean }) {
  if (items.length === 0) {
    return (
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "var(--ink-faint)", fontStyle: "italic" }}>
        None identified
      </p>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: accent ? "var(--orange)" : "var(--ink-faint)",
              flexShrink: 0,
              marginTop: 6,
            }}
          />
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.82rem",
              fontWeight: 300,
              lineHeight: 1.6,
              color: accent ? "var(--ink)" : "var(--ink-mid)",
            }}
          >
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}

function IntensityBar({ value }: { value: number }) {
  return (
    <div className="intensity-track" style={{ marginTop: 6 }}>
      <motion.div
        className="intensity-fill"
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        viewport={{ once: true }}
      />
    </div>
  );
}

export default function CompetitiveAnalysis({ competitors, productName }: Props) {
  const colLabel = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.68rem",
    fontWeight: 500 as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.12em",
    color: "var(--ink-faint)",
    marginBottom: 14,
    display: "block",
  };

  return (
    <motion.section
      style={{ marginTop: 64 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      viewport={{ once: true, margin: "-60px" }}
    >
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 20,
          borderBottom: "1px solid var(--border)",
          marginBottom: 32,
        }}
      >
        <div className="eyebrow-group">
          <span className="eyebrow-dash" />
          <span className="eyebrow">Competitive Analysis</span>
        </div>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.75rem",
            color: "var(--ink-faint)",
          }}
        >
          {competitors.length} competitor{competitors.length !== 1 ? "s" : ""} compared
        </span>
      </div>

      {/* One card per competitor */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {competitors.map((comp, i) => (
          <motion.div
            key={i}
            style={{
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              overflow: "hidden",
            }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.07 }}
            viewport={{ once: true, margin: "-40px" }}
          >
            {/* Card header */}
            <div
              style={{
                padding: "20px 28px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 className="card-heading" style={{ fontSize: "1.05rem" }}>
                {comp.name}
              </h3>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                    color: "var(--orange)",
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {Math.round(comp.negative_rate)}%
                </p>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.68rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--ink-faint)",
                  }}
                >
                  Negative Rate
                </span>
                <IntensityBar value={comp.negative_rate} />
              </div>
            </div>

            {/* Three columns */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1,
                background: "var(--border)",
              }}
            >
              {/* Shared */}
              <div style={{ padding: "20px 24px", background: "var(--white)" }}>
                <span style={colLabel}>Shared Themes</span>
                <TagList items={comp.shared} />
              </div>

              {/* Unique to product */}
              <div style={{ padding: "20px 24px", background: "var(--white)" }}>
                <span style={{ ...colLabel, color: "var(--orange)" }}>
                  Unique to {productName}
                </span>
                <TagList items={comp.unique_to_product} accent />
              </div>

              {/* Unique to competitor */}
              <div style={{ padding: "20px 24px", background: "var(--white)" }}>
                <span style={colLabel}>Unique to {comp.name}</span>
                <TagList items={comp.unique_to_competitor} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
