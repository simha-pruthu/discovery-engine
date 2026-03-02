"use client";

import { motion } from "framer-motion";

interface Theme {
  name: string;
  frequency: number;
  emotional_intensity: number;
  primary_segment: string;
}

interface Props {
  themes: Theme[];
}

function deriveMetric(name: string, intensity: number): string {
  const n = name.toLowerCase();
  if (n.includes("onboard") || n.includes("setup") || n.includes("start"))
    return "trial-to-paid conversion rate";
  if (n.includes("crash") || n.includes("bug") || n.includes("error") || n.includes("stab") || n.includes("fail"))
    return "daily active user retention";
  if (n.includes("slow") || n.includes("perform") || n.includes("speed") || n.includes("load"))
    return "session depth and feature engagement";
  if (n.includes("pric") || n.includes("cost") || n.includes("plan") || n.includes("subscri"))
    return "paid tier conversion rate";
  if (n.includes("sync") || n.includes("collab") || n.includes("team"))
    return "team activation rate";
  if (intensity >= 75) return "30-day user retention rate";
  return "weekly active user rate";
}

function deriveTest(theme: Theme): string {
  const n = theme.name.toLowerCase();
  const seg = theme.primary_segment;
  if (n.includes("onboard") || n.includes("setup"))
    return `Run a ${seg} cohort experiment with a condensed onboarding sequence`;
  if (n.includes("crash") || n.includes("bug") || n.includes("stab"))
    return `Audit and resolve top failure paths within the ${theme.name} context`;
  if (n.includes("slow") || n.includes("perform") || n.includes("load"))
    return `Profile and optimise the critical path driving ${theme.name} among ${seg}`;
  if (n.includes("pric") || n.includes("cost"))
    return `A/B test a revised pricing model or extended trial window targeting ${seg}`;
  return `Redesign the ${theme.name} experience with fewer friction steps for ${seg}`;
}

function deriveImpact(theme: Theme): string {
  const target = Math.max(1, Math.round(theme.frequency * 0.55));
  return `Reduce ${theme.primary_segment} signal volume from ${theme.frequency.toLocaleString()} to under ${target.toLocaleString()} within 60 days`;
}

export default function HypothesisLab({ themes }: Props) {
  const top3 = themes.slice(0, 3);

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
          paddingBottom: 20,
          borderBottom: "1px solid var(--border)",
          marginBottom: 32,
        }}
      >
        <div className="eyebrow-group">
          <span className="eyebrow-dash" />
          <span className="eyebrow">Hypothesis Lab</span>
        </div>
        <p className="body-copy" style={{ marginTop: 10, maxWidth: 520 }}>
          Testable hypotheses derived from the top friction themes. Each pairs a risk statement with a concrete experiment direction.
        </p>
      </div>

      {/* Hypothesis cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {top3.map((theme, i) => {
          const metric = deriveMetric(theme.name, theme.emotional_intensity);
          const test = deriveTest(theme);
          const impact = deriveImpact(theme);

          return (
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
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
              viewport={{ once: true, margin: "-40px" }}
            >
              {/* Card header */}
              <div
                style={{
                  padding: "18px 28px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.68rem",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "var(--orange)",
                  }}
                >
                  Hypothesis {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  style={{
                    width: 1,
                    height: 12,
                    background: "var(--border)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.78rem",
                    color: "var(--ink-faint)",
                  }}
                >
                  {theme.name}
                </span>
              </div>

              {/* Card body — two columns */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1,
                  background: "var(--border)",
                }}
              >
                {/* If statement */}
                <div style={{ padding: "24px 28px", background: "var(--white)" }}>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.68rem",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "var(--ink-faint)",
                      marginBottom: 12,
                    }}
                  >
                    Risk Statement
                  </span>
                  <p
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontWeight: 300,
                      fontSize: "0.95rem",
                      lineHeight: 1.6,
                      color: "var(--ink)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    If{" "}
                    <span style={{ fontWeight: 400 }}>{theme.name}</span>{" "}
                    continues affecting{" "}
                    <span style={{ fontWeight: 400 }}>{theme.primary_segment}</span>,
                    then{" "}
                    <span style={{ color: "var(--orange)", fontWeight: 400 }}>{metric}</span>{" "}
                    may decline.
                  </p>
                </div>

                {/* We should test */}
                <div style={{ padding: "24px 28px", background: "var(--white)" }}>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.68rem",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "var(--ink-faint)",
                      marginBottom: 12,
                    }}
                  >
                    Test Direction
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[test, impact].map((bullet, bi) => (
                      <div
                        key={bi}
                        style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
                      >
                        <span
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background: "var(--orange)",
                            flexShrink: 0,
                            marginTop: 7,
                          }}
                        />
                        <p className="body-copy" style={{ margin: 0, fontSize: "0.82rem" }}>
                          {bullet}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
