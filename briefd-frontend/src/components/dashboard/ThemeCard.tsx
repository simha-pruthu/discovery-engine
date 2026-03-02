"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export interface Quote {
  text: string;
  url?: string;
  source?: string;
  title?: string;
  date?: string;
}

export interface Theme {
  name: string;
  frequency: number;
  emotional_intensity: number;
  primary_segment: string;
  quotes?: Quote[];
  confidence?: string;
}

function deriveConfidence(intensity: number): string {
  if (intensity >= 70) return "High";
  if (intensity >= 45) return "Medium";
  return "Low";
}

function formatSource(source: string): string {
  const map: Record<string, string> = {
    reddit: "Reddit",
    playstore: "Google Play",
    google_play: "Google Play",
    appstore: "App Store",
    app_store: "App Store",
  };
  return map[source.toLowerCase()] ?? source;
}

function IntensityBarAnimated({ value }: { value: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 150);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="intensity-track">
      <div className="intensity-fill" style={{ width: `${width}%` }} />
    </div>
  );
}

export default function ThemeCard({ theme }: { theme: Theme }) {
  const confidence = theme.confidence ?? deriveConfidence(theme.emotional_intensity);
  const quotes = theme.quotes?.slice(0, 2) ?? [];

  return (
    <div
      style={{
        background: "var(--white)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "28px 28px",
        transition: "border-color 0.25s, box-shadow 0.25s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--orange)";
        el.style.boxShadow = "0 12px 32px rgba(0,0,0,0.07)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--border)";
        el.style.boxShadow = "none";
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h3 className="card-heading" style={{ fontSize: "1.1rem", marginBottom: 4 }}>
            {theme.name}
          </h3>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "var(--ink-faint)" }}>
            {theme.primary_segment}
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
          <p
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: "2rem",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: "var(--ink)",
              lineHeight: 1,
            }}
          >
            {theme.frequency.toLocaleString()}
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>
            Signals
          </p>
        </div>
      </div>

      {/* Intensity bar */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "var(--ink-faint)" }}>
            Emotional Intensity
          </span>
          <span
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "var(--orange)",
            }}
          >
            {theme.emotional_intensity}%
          </span>
        </div>
        <IntensityBarAnimated value={theme.emotional_intensity} />
      </div>

      {/* Quotes */}
      {quotes.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.68rem",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--ink-faint)",
              marginBottom: 12,
            }}
          >
            Citations
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {quotes.map((q, i) => (
              <div
                key={i}
                style={{
                  borderLeft: "2px solid var(--border)",
                  paddingLeft: 12,
                }}
              >
                <p className="body-copy" style={{ marginBottom: 6 }}>
                  &ldquo;{q.text}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {q.source && (
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "var(--ink-faint)", fontWeight: 500 }}>
                      {formatSource(q.source)}
                    </span>
                  )}
                  {q.url && (
                    <a
                      href={q.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.72rem",
                        color: "var(--ink-mid)",
                        textDecoration: "underline",
                        textUnderlineOffset: 2,
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--orange)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-mid)")}
                    >
                      View original →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 20,
          paddingTop: 20,
          borderTop: "1px solid var(--border)",
        }}
      >
        <p className="body-copy" style={{ margin: 0, fontSize: "0.8rem", color: "var(--ink)" }}>
          High friction among {theme.primary_segment.toLowerCase()}.
        </p>
        <span
          className="pill-badge pill-badge-outline"
          style={{ flexShrink: 0, marginLeft: 12 }}
        >
          {confidence}
        </span>
      </div>
    </div>
  );
}
