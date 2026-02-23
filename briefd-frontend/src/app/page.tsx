"use client";

import Navbar from "@/src/components/Navbar";
import IntelligenceCard from "@/src/components/IntelligenceCard";
import Section from "@/src/components/Section";
import useScrollReveal from "@/src/hooks/useScrollReveal";

/* ─── Sub-components ───────────────────────────────────────────────── */

function SectionKicker({ label }: { label: string }) {
  return (
    <div className="kicker" style={{ marginBottom: 28 }}>
      {label}
    </div>
  );
}

function SectionHeadline({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="display-lg"
      style={{ color: "var(--ink)", marginBottom: 28 }}
    >
      {children}
    </h2>
  );
}

function BodyText({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <p className="body-text" style={{ maxWidth: 520, ...style }}>
      {children}
    </p>
  );
}

/* ─── Credibility band ─────────────────────────────────────────────── */
function CredibilityBand() {
  const { ref, visible } = useScrollReveal({ threshold: 0.1 });

  const stats = [
    {
      label:  "Signals Analyzed",
      value:  "1.2M+",
      sub:    "from Reddit & App Store",
      accent: true,
    },
    {
      label: "Live Data Sources",
      value: "2",
      sub:   "Reddit · App Store",
    },
    {
      label: "Built At",
      value: "Columbia",
      sub:   "University, NYC",
    },
  ];

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        background: "var(--bg-alt-1)",
        borderTop: "1px solid var(--border-soft)",
        borderBottom: "1px solid var(--border-soft)",
      }}
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="cred-cell"
          style={i === stats.length - 1 ? { borderRight: "none" } : {}}
        >
          {s.accent && (
            <div
              style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: 1.5,
                background: "var(--sage)",
              }}
            />
          )}
          <div className="micro" style={{ marginBottom: 12 }}>{s.label}</div>
          <div className="cred-val">{s.value}</div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 300,
              color: "var(--ink-4)",
              marginTop: 7,
            }}
          >
            {s.sub}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Metrics dark band ────────────────────────────────────────────── */
function MetricsBand({
  signals,
  negRate,
  themes,
  product,
}: {
  signals: number;
  negRate: number;
  themes: number;
  product: string;
}) {
  const { ref, visible } = useScrollReveal({ threshold: 0.1 });
  const cells = [
    { label: "Analysing",     value: product,           unit: "",  accent: true },
    { label: "Total Signals", value: signals.toString(), unit: "" },
    { label: "Negative Rate", value: negRate.toFixed(1), unit: "%", sage: true },
    { label: "Themes Found",  value: themes.toString(),  unit: "" },
  ];

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
        background: "var(--dark)",
      }}
    >
      {cells.map(({ label, value, unit, accent, sage }) => (
        <div key={label} className="metric-cell-dark">
          {accent && (
            <div
              style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: 1.5,
                background: "var(--sage-2)",
              }}
            />
          )}
          <div
            className="micro"
            style={{ color: "rgba(255,255,255,.3)", marginBottom: 12 }}
          >
            {label}
          </div>
          <div
            className={`metric-val-dark ${sage ? "sage" : ""}`}
            style={
              label === "Analysing"
                ? { fontSize: 30, letterSpacing: "-0.02em" }
                : {}
            }
          >
            {value}
            {unit && (
              <span style={{ fontSize: "0.5em", marginLeft: 2 }}>{unit}</span>
            )}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 300,
              color: "rgba(255,255,255,.26)",
              marginTop: 8,
            }}
          >
            {label === "Total Signals" && "captured"}
            {label === "Negative Rate" && "of all signals"}
            {label === "Themes Found"  && "identified"}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Theme block: two-column editorial ───────────────────────────── */
function ThemeBlock({
  index,
  name,
  frequency,
  segment,
  intensity,
  quotes,
}: {
  index: number;
  name: string;
  frequency: number;
  segment: string;
  intensity: string;
  quotes: { text: string; source: string; url?: string }[];
}) {
  const { ref, visible } = useScrollReveal({ threshold: 0.06 });

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
      style={{
        display: "grid",
        gridTemplateColumns: "210px 1fr",
        gap: 64,
        padding: "48px 0",
        borderBottom: "1px solid var(--border-soft)",
        alignItems: "start",
      }}
    >
      {/* Left: index + name + meta */}
      <div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 11,
            fontStyle: "italic",
            fontWeight: 300,
            color: "var(--ink-4)",
            marginBottom: 8,
          }}
        >
          Theme {String(index + 1).padStart(2, "0")}
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 22,
            fontWeight: 400,
            color: "var(--ink)",
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
            marginBottom: 22,
          }}
        >
          {name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {[
            { key: "Frequency",  val: `${frequency} mentions` },
            { key: "Segment",    val: segment },
            { key: "Intensity",  val: intensity },
          ].map(({ key, val }) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                fontSize: 12,
                fontWeight: 300,
                color: "var(--ink-3)",
              }}
            >
              <span
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  background: "var(--ink-4)",
                  flexShrink: 0,
                  marginTop: 6,
                }}
              />
              <span>
                <strong style={{ fontWeight: 500, color: "var(--ink-2)" }}>
                  {key}:
                </strong>{" "}
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: pull quotes */}
      <div>
        <div className="micro" style={{ marginBottom: 22 }}>
          Customer Voice
        </div>
        {quotes.slice(0, 7).map((q, qi) => (
          <div
            key={qi}
            className={qi === 0 ? "pq-line" : "pq-line pq-line-subtle"}
            style={{ marginBottom: 24 }}
          >
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: qi === 0 ? 22 : 17,
                fontStyle: "italic",
                fontWeight: 300,
                color: qi === 0 ? "var(--ink)" : "var(--ink-2)",
                lineHeight: 1.6,
                letterSpacing: "-0.01em",
                marginBottom: 7,
                transition: "opacity 0.2s",
              }}
            >
              {q.text}
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-4)" }}>
              {q.url ? (
                <a
                  href={q.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--sage)", textDecoration: "none" }}
                >
                  {q.source}
                </a>
              ) : (
                <>— {q.source}</>
              )}
            </div>
          </div>
        ))}
        {quotes.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--ink-4)", fontStyle: "italic" }}>
            No quotes captured.
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Competitive block ─────────────────────────────────────────────── */
function CompetitorBlock({
  name,
  negRate,
  shared,
  uniqueToProduct,
  uniqueToCompetitor,
}: {
  name: string;
  negRate: number;
  shared: string[];
  uniqueToProduct: string[];
  uniqueToCompetitor: string[];
}) {
  const { ref, visible } = useScrollReveal({ threshold: 0.06 });
  const cols = [
    { heading: "Shared Frictions",       items: shared },
    { heading: "Unique to Your Product", items: uniqueToProduct },
    { heading: `Unique to ${name}`,      items: uniqueToCompetitor },
  ];

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
      style={{
        padding: "44px 0",
        borderBottom: "1px solid var(--border-soft)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 30,
        }}
      >
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 28,
            fontWeight: 300,
            letterSpacing: "-0.03em",
            color: "var(--ink)",
          }}
        >
          {name}
        </div>
        <div
          style={{ fontSize: 13, fontWeight: 300, color: "var(--ink-3)" }}
        >
          Negative rate{" "}
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 20,
              fontStyle: "italic",
              fontWeight: 300,
              color: "var(--sage)",
              marginLeft: 6,
            }}
          >
            {negRate.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Three columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 32,
        }}
      >
        {cols.map(({ heading, items }) => (
          <div key={heading}>
            <div className="comp-col-head">{heading}</div>
            {items.length === 0 ? (
              <p
                style={{
                  fontSize: 13,
                  color: "var(--ink-4)",
                  fontStyle: "italic",
                }}
              >
                None detected.
              </p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {items.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: 13.5,
                      fontWeight: 300,
                      color: "var(--ink-2)",
                      padding: "8px 0 8px 16px",
                      borderBottom:
                        i < items.length - 1
                          ? "1px solid var(--border-soft)"
                          : "none",
                      lineHeight: 1.5,
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        color: "var(--ink-4)",
                      }}
                    >
                      —
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Hypothesis card ───────────────────────────────────────────────── */
function HypothesisCard({
  index,
  themeName,
  segment,
}: {
  index: number;
  themeName: string;
  segment: string;
}) {
  const { ref, visible } = useScrollReveal({ threshold: 0.06 });

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
      style={{
        display: "grid",
        gridTemplateColumns: "96px 1fr",
        gap: 36,
        padding: "36px 0",
        borderBottom: "1px solid rgba(255,255,255,.06)",
        alignItems: "start",
      }}
    >
      {/* Big index number */}
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 64,
          fontWeight: 300,
          fontStyle: "italic",
          color: "rgba(255,255,255,.08)",
          lineHeight: 1,
          letterSpacing: "-4px",
          paddingTop: 4,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Content */}
      <div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 20,
            fontWeight: 300,
            color: "rgba(255,255,255,.9)",
            lineHeight: 1.5,
            letterSpacing: "-0.02em",
            marginBottom: 22,
          }}
        >
          If we improve{" "}
          <em style={{ fontStyle: "italic", color: "var(--sage-3)" }}>
            {themeName}
          </em>
          , we expect measurable gains in retention and satisfaction
          among the {segment} segment.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {[
            { label: "Primary Metric",     value: "CSAT · Retention Rate" },
            { label: "Expected Change",    value: "+8–12% in segment"      },
            { label: "Suggested Sprint",   value: "4–6 weeks"              },
          ].map(({ label, value }) => (
            <div key={label}>
              <div
                className="micro"
                style={{ color: "rgba(255,255,255,.3)", marginBottom: 5 }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 300,
                  color: "rgba(255,255,255,.6)",
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════ */
export default function Home() {
  // ── These would be populated by your run_pipeline results in production.
  // For the landing page, they drive the static editorial narrative.
  const heroRef = useScrollReveal({ threshold: 0.01 });

  return (
    <main>
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════
          HERO — 100vh, 60/40, left-aligned
      ══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          minHeight: "calc(100vh - 56px)",
          display: "grid",
          gridTemplateColumns: "60fr 40fr",
          alignItems: "center",
          gap: 56,
          padding: "80px var(--pad)",
          background: "var(--bg-main)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Radial depth — warmth behind title, never distracting */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-10%",
            top: "-20%",
            width: "70%",
            height: "140%",
            background:
              "radial-gradient(ellipse at 40% 50%, rgba(42,92,63,.06) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* Watermark glyph — bottom-right, consistent with section number system */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: "var(--pad)",
            bottom: 30,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(160px, 22vw, 260px)",
            fontWeight: 300,
            fontStyle: "italic",
            color: "var(--border-soft)",
            lineHeight: 1,
            pointerEvents: "none",
            userSelect: "none",
            letterSpacing: -12,
            zIndex: 0,
          }}
        >
          ◈
        </div>

        {/* Left — 60% */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            className="anim-up delay-1"
            style={{ marginBottom: 32 }}
          >
            <div className="kicker">Intelligence Infrastructure</div>
          </div>

          <h1
            className="display-xl anim-up delay-2"
            style={{ marginBottom: 26, color: "var(--ink)" }}
          >
            Real customer signal.
            <br />
            <em
              style={{
                fontStyle: "italic",
                fontWeight: 300,
                color: "var(--sage)",
              }}
            >
              Structured as insight.
            </em>
          </h1>

          <p
            className="body-text anim-up delay-3"
            style={{ maxWidth: 420, marginBottom: 44 }}
          >
            Briefd transforms scattered public feedback into structured
            product intelligence — built for teams who ship with conviction.
          </p>

          <div
            className="anim-up delay-4"
            style={{ display: "flex", alignItems: "center", gap: 22 }}
          >
            <a href="/experience" className="cta-button">
              Experience Briefd →
            </a>

            <a
              href="/experience"
              className="cta-button-ghost"
              style={{ padding: "12px 24px", fontSize: 12 }}
            >
              Try Live Demo
            </a>
            <span
              style={{
                fontSize: 12,
                fontWeight: 300,
                color: "var(--ink-4)",
                fontStyle: "italic",
              }}
            >
              {/* personality touch */}
              No login required.
            </span>
          </div>
        </div>

        {/* Right — 40%: Intelligence Card */}
        <div
          className="anim-up delay-5"
          style={{ position: "relative", zIndex: 1 }}
        >
          <IntelligenceCard />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CREDIBILITY BAND — always visible, no section reveal
      ══════════════════════════════════════════════════════════════ */}
      <CredibilityBand />

      {/* ══════════════════════════════════════════════════════════════
          01 — THE PROBLEM
      ══════════════════════════════════════════════════════════════ */}
      <Section id="problem" number="01" background="var(--bg-alt-1)">
        <SectionKicker label="The Problem" />
        <SectionHeadline>
          Feedback lives everywhere.
          <br />
          <em style={{ color: "var(--sage)" }}>Structure lives nowhere.</em>
        </SectionHeadline>
        <BodyText>
          Customer sentiment is scattered across Reddit threads, App Store
          reviews, support tickets, and public forums. Product teams read
          the noise. They miss the signal.
        </BodyText>
        <div
          style={{
            marginTop: 48,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
            maxWidth: 580,
          }}
        >
          {[
            {
              problem: "No structure",
              detail: "Raw opinions have no hierarchy, severity, or context.",
            },
            {
              problem: "No frequency",
              detail: "One loud voice looks identical to twenty quiet ones.",
            },
            {
              problem: "No theme",
              detail: "Related complaints are never connected automatically.",
            },
            {
              problem: "No action",
              detail: "Insights sit in Notion pages. They don't become experiments.",
            },
          ].map(({ problem, detail }) => (
            <div key={problem}>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 18,
                  fontWeight: 400,
                  color: "var(--ink)",
                  marginBottom: 6,
                  letterSpacing: "-0.02em",
                }}
              >
                {problem}
              </div>
              <p style={{ fontSize: 13, fontWeight: 300, color: "var(--ink-3)", lineHeight: 1.6 }}>
                {detail}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          02 — THE SIGNAL  (pull quote breaks grid)
      ══════════════════════════════════════════════════════════════ */}
      <Section id="signal" number="02" background="var(--bg-alt-2)">
        <SectionKicker label="The Signal" />
        <SectionHeadline>We structure the noise.</SectionHeadline>

        <BodyText style={{ marginBottom: 56 }}>
          Briefd pulls from Reddit and App Store in real time, clusters
          feedback into named themes, and surfaces emotional intensity,
          frequency, and segment — automatically.
        </BodyText>

        {/* Primary pull quote — first quote is larger, breaks the grid */}
        <div
          className="pq-line"
          style={{ marginBottom: 32, maxWidth: 640 }}
        >
          <div
            className="pull-quote"
            style={{ color: "var(--ink)", marginBottom: 10 }}
          >
            "The app works fine — until you try to customize it.
            Then everything breaks."
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-4)" }}>
            — App Store · iOS · 3.2★
          </div>
        </div>

        {/* Secondary quotes — smaller, subtle */}
        {[
          { text: "I've filed the same bug three times. Nobody responds.", source: "Reddit · r/SaaS" },
          { text: "Great for solo use. Falls apart the moment you add a team.", source: "App Store · Android" },
        ].map((q, i) => (
          <div
            key={i}
            className="pq-line pq-line-subtle"
            style={{ marginBottom: 20, maxWidth: 560 }}
          >
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 17,
                fontStyle: "italic",
                fontWeight: 300,
                color: "var(--ink-2)",
                lineHeight: 1.6,
                marginBottom: 5,
              }}
            >
              "{q.text}"
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-4)" }}>
              — {q.source}
            </div>
          </div>
        ))}
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          03 — UNDERSTANDING THE NUMBERS
      ══════════════════════════════════════════════════════════════ */}
      <Section id="numbers" number="03" background="var(--bg-main)">
        <SectionKicker label="The Intelligence" />
        <SectionHeadline>
          Every number
          <br />
          <em style={{ color: "var(--sage)" }}>has a meaning.</em>
        </SectionHeadline>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 40,
            marginTop: 48,
            maxWidth: 680,
          }}
        >
          {[
            {
              term:  "Emotional Intensity",
              range: "1 – 10",
              body:  "Severity of friction — from mild inconvenience to product-breaking breakdown. 8+ demands immediate attention.",
            },
            {
              term:  "Negative Rate",
              range: "% of signals",
              body:  "Proportion of feedback carrying genuine dissatisfaction. Above 30% is a pattern. Above 50% is a crisis.",
            },
            {
              term:  "Theme",
              range: "Cluster",
              body:  "A named friction pattern across multiple independent sources. One voice is anecdote. Twenty voices is a theme.",
            },
          ].map(({ term, range, body }) => (
            <div key={term}>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20,
                  fontWeight: 400,
                  color: "var(--ink)",
                  letterSpacing: "-0.02em",
                  marginBottom: 4,
                }}
              >
                {term}
              </div>
              <div
                className="micro"
                style={{ marginBottom: 10, color: "var(--sage)" }}
              >
                {range}
              </div>
              <p style={{ fontSize: 13, fontWeight: 300, color: "var(--ink-3)", lineHeight: 1.7 }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          04 — HYPOTHESIS (dark room — final section, closes the arc)
      ══════════════════════════════════════════════════════════════ */}
      <Section
        id="hypothesis"
        number="05"
        background="var(--bg-dark)"
        dark
      >
        {/* Dark kicker */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <div style={{ width: 28, height: 1, background: "var(--sage-2)" }} />
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--sage-2)",
            }}
          >
            Signal becomes direction
          </span>
        </div>

        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(40px, 5.5vw, 64px)",
            fontWeight: 300,
            fontStyle: "italic",
            color: "white",
            lineHeight: 1.06,
            letterSpacing: "-0.03em",
            marginBottom: 20,
          }}
        >
          From friction to experiment.
        </h2>

        <p
          style={{
            fontSize: 17,
            fontWeight: 300,
            color: "rgba(255,255,255,.4)",
            lineHeight: 1.75,
            maxWidth: 480,
            marginBottom: 56,
          }}
        >
          Structured friction becomes a measurable hypothesis.
          Insight becomes action. Briefd closes the loop.
        </p>

        {/* Sample hypothesis cards */}
        {[
          { themeName: "Unintuitive Navigation", segment: "Power Users" },
          { themeName: "Search Response Lag",    segment: "Daily Active" },
        ].map((h, i) => (
          <HypothesisCard
            key={i}
            index={i}
            themeName={h.themeName}
            segment={h.segment}
          />
        ))}

        {/* Final CTA */}
        <div style={{ marginTop: 56, display: "flex", alignItems: "center", gap: 20 }}>
          <a href="/experience" className="cta-button">
            Enter Briefd →
          </a>
          <span
            style={{
              fontSize: 12,
              fontWeight: 300,
              color: "rgba(255,255,255,.28)",
              fontStyle: "italic",
            }}
          >
            Built at Columbia University
          </span>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════ */}
      <footer className="footer-band">
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontSize: 16,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
          }}
        >
          Brie<span style={{ color: "var(--sage)" }}>fd</span>
        </div>
        <div>
          Product Intelligence · Columbia University · 2025
        </div>
        <div>
          <a
            href="mailto:pch2108@columbia.edu"
            style={{
              color: "var(--sage)",
              textDecoration: "none",
              fontSize: 12,
              fontWeight: 400,
            }}
          >
            pch2108@columbia.edu
          </a>
          {" · "}
          <span>Pruthu Simha</span>
        </div>
      </footer>
    </main>
  );
}