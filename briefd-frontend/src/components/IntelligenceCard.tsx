"use client";
import { useEffect, useState, useRef } from "react";

const THEMES = [
  {
    label: "Structural Friction",
    name: "Unintuitive Navigation",
    quote: "I keep getting lost trying to find what I need. The hierarchy makes no sense once you go two levels deep.",
    source: "App Store · iOS",
    intensity: "8/10",
    frequency: 27,
    segment: "Power Users",
  },
  {
    label: "Onboarding Breakdown",
    name: "First-Run Confusion",
    quote: "I didn't know what to do when I first opened the app. There's no guidance at all for new users.",
    source: "Reddit · r/ProductivityApps",
    intensity: "7/10",
    frequency: 19,
    segment: "New Users",
  },
  {
    label: "Performance Signal",
    name: "Search Response Lag",
    quote: "Search is just slow. Every time I try to find something older, I wait 3–4 seconds. That kills the flow.",
    source: "App Store · Android",
    intensity: "9/10",
    frequency: 34,
    segment: "Daily Active",
  },
];

export default function IntelligenceCard() {
  const [parallaxY, setParallaxY] = useState(0);
  const [themeIdx, setThemeIdx]   = useState(0);
  const rafRef = useRef<number>(0);

  // 2–3px parallax on scroll
  useEffect(() => {
    const onScroll = () => {
      rafRef.current = requestAnimationFrame(() => {
        setParallaxY(window.scrollY * 0.022);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Cycle themes every 3.5s — subtle animation showing the product works
  useEffect(() => {
    const id = setInterval(() => {
      setThemeIdx((i) => (i + 1) % THEMES.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const theme = THEMES[themeIdx];

  return (
    <div
      className="card-tilt mask-fade scale-in"
      style={{
        transform: `perspective(1200px) rotateY(-2.5deg) rotateX(1.5deg) translateY(${parallaxY}px)`,
        transition: "box-shadow 0.5s ease",
        willChange: "transform",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform =
          `perspective(1200px) rotateY(0deg) rotateX(0deg) translateY(calc(${parallaxY}px - 5px))`;
        e.currentTarget.style.transition =
          "transform 0.5s cubic-bezier(.22,.68,0,1.2), box-shadow 0.5s ease";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform =
          `perspective(1200px) rotateY(-2.5deg) rotateX(1.5deg) translateY(${parallaxY}px)`;
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          border: "1px solid var(--border-soft)",
          boxShadow: "0 48px 120px rgba(23,21,14,.20)",
          overflow: "hidden",
        }}
      >
        {/* Titlebar */}
        <div
          style={{
            padding: "13px 18px",
            borderBottom: "1px solid var(--border-soft)",
            background: "var(--bg-main)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#EC6A5E", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#F4BE4F", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#61C554", display: "inline-block" }} />
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.05em",
              color: "var(--ink-4)",
            }}
          >
            briefd — intelligence
          </span>
        </div>

        {/* Card body */}
        <div style={{ padding: "24px 24px 6px" }}>

          {/* Theme label */}
          <div
            className="micro"
            style={{ marginBottom: 14, color: "var(--sage)", letterSpacing: "0.18em" }}
          >
            {theme.label}
          </div>

          {/* Theme name */}
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 22,
              fontWeight: 400,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: 18,
              transition: "opacity 0.4s ease",
            }}
          >
            {theme.name}
          </div>

          {/* Metadata row — explicit numbers sell the product */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginBottom: 20,
            }}
          >
            {[
              { label: "Intensity",  value: theme.intensity },
              { label: "Frequency",  value: theme.frequency },
              { label: "Segment",    value: theme.segment },
            ].map(({ label, value }) => (
              <div key={label}>
                <div
                  className="micro"
                  style={{ marginBottom: 3, fontSize: 9 }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 18,
                    fontWeight: 400,
                    fontStyle: "italic",
                    color: "var(--ink)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--border-soft)", marginBottom: 18 }} />

          {/* Pull quote */}
          <div
            style={{
              borderLeft: "1.5px solid var(--sage)",
              paddingLeft: 16,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 14,
                fontStyle: "italic",
                fontWeight: 300,
                color: "var(--ink-2)",
                lineHeight: 1.6,
                marginBottom: 8,
                transition: "opacity 0.4s ease",
              }}
            >
              "{theme.quote}"
            </div>
            <div
              className="micro"
              style={{ fontSize: 9, color: "var(--ink-4)" }}
            >
              {theme.source}
            </div>
          </div>

          {/* Ghost metric strip at bottom — inside the fade */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              borderTop: "1px solid var(--border-soft)",
              margin: "18px -24px 0",
              padding: "16px 24px 20px",
            }}
          >
            {[
              { label: "Signals",  value: "2.4k" },
              { label: "Neg Rate", value: "34%" },
              { label: "Themes",   value: "8"    },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 22,
                    fontWeight: 300,
                    fontStyle: "italic",
                    color: "var(--ink)",
                    lineHeight: 1,
                  }}
                >
                  {value}
                </div>
                <div
                  className="micro"
                  style={{ marginTop: 4, fontSize: 8.5 }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}