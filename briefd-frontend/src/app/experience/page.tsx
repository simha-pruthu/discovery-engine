"use client";

import { useState } from "react";
import Navbar from "@/src/components/Navbar";
import Section from "@/src/components/Section";
import useScrollReveal from "@/src/hooks/useScrollReveal";

/* ─── Types ─────────────────────────────────────────────────────────── */
interface Quote  { text: string; source: string; url?: string }
interface Theme  { name: string; frequency: number; primary_segment: string; emotional_intensity: string; quotes: Quote[] }
interface Comp   { summary: { negative_rate: number } }
interface Cmp    { shared: string[]; unique_to_product: string[]; unique_to_competitor: string[] }
interface Results {
  product:     { summary: { total_signals: number; negative_rate: number }; themes: Theme[] };
  competitors: Record<string, Comp>;
  comparisons: Record<string, Cmp>;
}

/* ─── Normalizer ────────────────────────────────────────────────────── */
function normalize(raw: Record<string, unknown>, competitors: string[]): Results {
  const r   = raw || {};
  const sf  = (v: unknown) => { try { return parseFloat(String(v)); } catch { return 0; } };
  const si  = (v: unknown) => { try { return parseInt(String(v));   } catch { return 0; } };
  const sl  = (v: unknown): string[] => Array.isArray(v) ? v.map(String).filter(Boolean) : typeof v === "string" && v ? [v] : [];

  const pr  = (r.product  as Record<string, unknown>) || {};
  const sr  = (pr.summary as Record<string, unknown>) || {};
  const summary = { total_signals: si(sr.total_signals || 0), negative_rate: sf(sr.negative_rate || 0) };

  const rawThemes = Array.isArray(pr.themes) ? pr.themes : [];
  const themes: Theme[] = rawThemes.filter((t): t is Record<string, unknown> => typeof t === "object" && t !== null).map((t) => {
    const rawQ = Array.isArray(t.quotes) ? t.quotes : [];
    const quotes: Quote[] = rawQ.filter((q): q is Record<string, unknown> => typeof q === "object" && q !== null).map((q) => ({
      text:   String(q.text   || q.body     || "—"),
      source: String(q.source || q.platform || "Unknown"),
      url:    String(q.url    || q.link     || ""),
    }));
    return {
      name:               String(t.name               || t.theme     || "Unnamed Theme"),
      frequency:          si(t.frequency              || t.count     || 0),
      primary_segment:    String(t.primary_segment    || t.segment   || "General"),
      emotional_intensity:String(t.emotional_intensity || t.intensity || "Medium"),
      quotes,
    };
  });

  const rawComp = (r.competitors as Record<string, unknown>) || {};
  const competitors_data: Record<string, Comp> = {};
  for (const name of competitors) {
    let cr = rawComp[name] as Record<string, unknown> | undefined;
    if (!cr) cr = Object.entries(rawComp).find(([k]) => k.toLowerCase() === name.toLowerCase())?.[1] as Record<string, unknown>;
    cr = cr || {};
    const cs = (cr.summary as Record<string, unknown>) || {};
    competitors_data[name] = { summary: { negative_rate: sf(cs.negative_rate || cr.negative_rate || 0) } };
  }

  const rawCmp = (r.comparisons as Record<string, unknown>) || {};
  const comparisons: Record<string, Cmp> = {};
  for (const name of competitors) {
    let c = rawCmp[name] as Record<string, unknown> | undefined;
    if (!c) c = Object.entries(rawCmp).find(([k]) => k.toLowerCase() === name.toLowerCase())?.[1] as Record<string, unknown>;
    c = c || {};
    comparisons[name] = {
      shared:               sl(c.shared               || c.shared_frictions),
      unique_to_product:    sl(c.unique_to_product    || c.your_unique),
      unique_to_competitor: sl(c.unique_to_competitor || c.their_unique),
    };
  }

  return { product: { summary, themes }, competitors: competitors_data, comparisons };
}

/* ─── Input section ─────────────────────────────────────────────────── */
function InputBand({
  onRun,
  loading,
}: {
  onRun: (product: string, competitors: string[]) => void;
  loading: boolean;
}) {
  const [product,     setProduct]     = useState("");
  const [competitors, setCompetitors] = useState("");

  const handleRun = () => {
    if (!product.trim()) return;
    onRun(product.trim(), competitors.split(",").map((c) => c.trim()).filter(Boolean));
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    fontWeight: 300,
    color: "var(--ink)",
    background: "var(--bg-main)",
    border: "1px solid var(--border-soft)",
    borderRadius: 6,
    padding: "13px 16px",
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <div
      style={{
        background: "var(--bg-alt-1)",
        borderBottom: "1px solid var(--border-soft)",
        padding: "48px var(--pad) 52px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 28,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--ink-4)",
        }}
      >
        Run Intelligence
        <span style={{ flex: 1, height: 1, background: "var(--border-soft)", maxWidth: 200, display: "block" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "5fr 5fr 2fr", gap: 16, alignItems: "flex-end" }}>
        <div>
          <label
            style={{
              display: "block",
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--ink-4)",
              marginBottom: 8,
            }}
          >
            Product Name
          </label>
          <input
            style={inputStyle}
            placeholder="e.g. Linear, Notion, Figma"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRun()}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--sage)";
              e.target.style.boxShadow   = "0 0 0 3px rgba(42,92,63,.09)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border-soft)";
              e.target.style.boxShadow   = "none";
            }}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--ink-4)",
              marginBottom: 8,
            }}
          >
            Competitors
          </label>
          <input
            style={inputStyle}
            placeholder="Jira, Asana, Monday (comma-separated)"
            value={competitors}
            onChange={(e) => setCompetitors(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRun()}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--sage)";
              e.target.style.boxShadow   = "0 0 0 3px rgba(42,92,63,.09)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border-soft)";
              e.target.style.boxShadow   = "none";
            }}
          />
        </div>
        <button
          className="cta-button"
          onClick={handleRun}
          disabled={loading || !product.trim()}
          style={{
            opacity: loading || !product.trim() ? 0.55 : 1,
            cursor:  loading || !product.trim() ? "not-allowed" : "pointer",
            justifyContent: "center",
          }}
        >
          {loading ? "Pulling signals…" : "Run Analysis →"}
        </button>
      </div>
    </div>
  );
}

/* ─── Theme block ───────────────────────────────────────────────────── */
function ThemeBlock({ theme, index }: { theme: Theme; index: number }) {
  const { ref, visible } = useScrollReveal({ threshold: 0.05 });

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      style={{
        display: "grid",
        gridTemplateColumns: "210px 1fr",
        gap: 64,
        padding: "48px 0",
        borderBottom: "1px solid var(--border-soft)",
        alignItems: "start",
      }}
    >
      <div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 11, fontStyle: "italic", fontWeight: 300, color: "var(--ink-4)", marginBottom: 8 }}>
          Theme {String(index + 1).padStart(2, "0")}
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: "var(--ink)", lineHeight: 1.25, letterSpacing: "-0.02em", marginBottom: 22 }}>
          {theme.name}
        </div>
        {[
          { k: "Frequency",  v: `${theme.frequency} mentions` },
          { k: "Segment",    v: theme.primary_segment },
          { k: "Intensity",  v: theme.emotional_intensity },
        ].map(({ k, v }) => (
          <div key={k} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12, fontWeight: 300, color: "var(--ink-3)", marginBottom: 9 }}>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--ink-4)", flexShrink: 0, marginTop: 6 }} />
            <span><strong style={{ fontWeight: 500, color: "var(--ink-2)" }}>{k}:</strong> {v}</span>
          </div>
        ))}
      </div>

      <div>
        <div className="micro" style={{ marginBottom: 22 }}>Customer Voice</div>
        {theme.quotes.length === 0 && <p style={{ fontSize: 13, color: "var(--ink-4)", fontStyle: "italic" }}>No quotes captured.</p>}
        {theme.quotes.slice(0, 7).map((q, qi) => (
          <div key={qi} className={qi === 0 ? "pq-line" : "pq-line pq-line-subtle"} style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: qi === 0 ? 22 : 17, fontStyle: "italic", fontWeight: 300, color: qi === 0 ? "var(--ink)" : "var(--ink-2)", lineHeight: 1.6, letterSpacing: "-0.01em", marginBottom: 7 }}>
              "{q.text}"
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-4)" }}>
              {q.url ? <a href={q.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--sage)", textDecoration: "none" }}>{q.source}</a> : `— ${q.source}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Competitive block ─────────────────────────────────────────────── */
function CompBlock({ name, negRate, shared, uniqueP, uniqueC }: { name: string; negRate: number; shared: string[]; uniqueP: string[]; uniqueC: string[] }) {
  const { ref, visible } = useScrollReveal({ threshold: 0.05 });
  const cols = [
    { heading: "Shared Frictions",       items: shared  },
    { heading: "Unique to Your Product", items: uniqueP },
    { heading: `Unique to ${name}`,      items: uniqueC },
  ];

  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      style={{ padding: "44px 0", borderBottom: "1px solid var(--border-soft)" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 30 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, letterSpacing: "-0.03em", color: "var(--ink)" }}>{name}</div>
        <div style={{ fontSize: 13, fontWeight: 300, color: "var(--ink-3)" }}>
          Negative rate <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontStyle: "italic", fontWeight: 300, color: "var(--sage)", marginLeft: 6 }}>{negRate.toFixed(1)}%</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32 }}>
        {cols.map(({ heading, items }) => (
          <div key={heading}>
            <div className="comp-col-head">{heading}</div>
            {items.length === 0
              ? <p style={{ fontSize: 13, color: "var(--ink-4)", fontStyle: "italic" }}>None detected.</p>
              : <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {items.map((item, i) => (
                    <li key={i} style={{ fontSize: 13.5, fontWeight: 300, color: "var(--ink-2)", padding: "8px 0 8px 16px", borderBottom: i < items.length - 1 ? "1px solid var(--border-soft)" : "none", lineHeight: 1.5, position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, color: "var(--ink-4)" }}>—</span>{item}
                    </li>
                  ))}
                </ul>
            }
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Hypothesis card ───────────────────────────────────────────────── */
function HypCard({ index, theme }: { index: number; theme: Theme }) {
  const { ref, visible } = useScrollReveal({ threshold: 0.05 });
  return (
    <div
      ref={ref}
      className={`hyp-card-row transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 36, alignItems: "start" }}
    >
      {/* Index number — visible, not ghosted */}
      <div className="hyp-index">
        {String(index + 1).padStart(2, "0")}
      </div>

      <div>
        {/* Statement — prominent */}
        <div className="hyp-text" style={{ marginBottom: 22 }}>
          If we improve{" "}
          <em style={{ fontStyle: "italic", color: "#62A07A" }}>{theme.name}</em>
          , we expect measurable gains in retention among the{" "}
          <strong style={{ fontWeight: 500 }}>{theme.primary_segment}</strong> segment.
        </div>

        {/* Metadata row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {[
            ["Primary Metric",   "CSAT · Retention Rate"],
            ["Expected Change",  "+8–12% in segment"],
            ["Suggested Sprint", "4–6 weeks"],
          ].map(([l, v]) => (
            <div key={l}>
              <div className="micro" style={{ marginBottom: 5 }}>{l}</div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 400,
                color: "rgba(232,240,236,0.7)",
              }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Raw feedback table ────────────────────────────────────────────── */
function RawFeedback({ themes }: { themes: Theme[] }) {
  const [open, setOpen] = useState(false);
  const rows = themes.flatMap((t) => t.quotes.map((q) => ({ theme: t.name, ...q })));

  return (
    <div style={{ padding: "32px var(--pad)", borderTop: "1px solid var(--border-soft)" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 400, color: "var(--ink-3)", padding: 0 }}
      >
        <span>{open ? "▾" : "▸"}</span>
        <span>Raw Feedback Explorer — {rows.length} quotes</span>
      </button>

      {open && (
        <div style={{ marginTop: 20, overflowX: "auto" }}>
          {rows.length === 0
            ? <p style={{ fontSize: 13, color: "var(--ink-4)", fontStyle: "italic" }}>No quotes available.</p>
            : <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontWeight: 300 }}>
                <thead>
                  <tr>
                    {["Theme","Quote","Source","URL"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-4)", borderBottom: "1px solid var(--border-soft)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                      <td style={{ padding: "10px 12px", color: "var(--ink-3)" }}>{r.theme}</td>
                      <td style={{ padding: "10px 12px", color: "var(--ink-2)", fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 14 }}>{r.text}</td>
                      <td style={{ padding: "10px 12px", color: "var(--ink-4)" }}>{r.source}</td>
                      <td style={{ padding: "10px 12px" }}>
                        {r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--sage)", textDecoration: "none", fontSize: 11 }}>↗ Open</a> : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      )}
    </div>
  );
}

/* ─── Feedback form ─────────────────────────────────────────────────── */
function FeedbackSection() {
  const [msg,       setMsg]       = useState("");
  const [feature,   setFeature]   = useState("");
  const [email,     setEmail]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  const inputStyle: React.CSSProperties = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    fontWeight: 300,
    color: "var(--ink)",
    background: "var(--bg-alt-1)",
    border: "1px solid var(--border-soft)",
    borderRadius: 6,
    padding: "13px 16px",
    width: "100%",
    outline: "none",
  };

  return (
    <div style={{ background: "var(--bg-alt-2)", borderTop: "1px solid var(--border-soft)", padding: "72px var(--pad) 64px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, marginBottom: 44 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--sage)", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 24, height: 1, background: "var(--sage)", display: "block" }} />
            Help Improve Briefd
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px,4vw,44px)", fontWeight: 300, fontStyle: "italic", color: "var(--ink)", lineHeight: 1.08, letterSpacing: "-0.04em" }}>
            Your signal<br />matters too.
          </div>
        </div>
        <p style={{ fontSize: 15, fontWeight: 300, color: "var(--ink-3)", lineHeight: 1.75, paddingTop: 8 }}>
          Briefd is being built in the open. Drop feedback, suggest a feature,
          or just say hi — every message goes directly to the founder.
        </p>
      </div>

      {submitted ? (
        <div style={{ fontSize: 15, fontWeight: 300, color: "var(--sage)", fontStyle: "italic" }}>
          Received — Pruthu will review this personally. Thank you.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <textarea
              rows={4}
              style={{ ...inputStyle, resize: "none" }}
              placeholder="What's working? What's broken? What should Briefd do that it doesn't?"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="Feature request — e.g. Slack digest, Notion export…"
              value={feature}
              onChange={(e) => setFeature(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input
              style={inputStyle}
              placeholder="Your email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="cta-button"
              onClick={() => { if (msg.trim() || feature.trim()) setSubmitted(true); }}
              style={{ alignSelf: "flex-start" }}
            >
              Send Feedback ↗
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 28, fontSize: 12, fontWeight: 300, color: "var(--ink-4)" }}>
        Built by <strong style={{ fontWeight: 500 }}>Pruthu Simha</strong> ·{" "}
        <a href="mailto:pch2108@columbia.edu" style={{ color: "var(--sage)", textDecoration: "none" }}>pch2108@columbia.edu</a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   EXPERIENCE PAGE
═══════════════════════════════════════════════════════════════════════ */
export default function ExperiencePage() {
  const [results,  setResults]  = useState<Results | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [hypOpen,  setHypOpen]  = useState(false);
  const [lastKey,  setLastKey]  = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  const handleRun = async (product: string, competitors: string[]) => {
    const key = `${product}|${competitors.join(",")}`;
    if (key === lastKey) return;
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/analyze", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ product, competitors }),
      });

      // Guard: HTML response (e.g. 404) would crash res.json()
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(
          `Server returned non-JSON (${res.status}). ` +
          `Is the Python server running on port 8000? \n\n` +
          text.slice(0, 300)
        );
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Request failed: ${res.status}`);

      setResults(normalize(data, competitors));
      setLastKey(key);
      setHypOpen(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[handleRun]", msg);
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const d = results;
  const themes = d?.product.themes || [];
  const compNames = Object.keys(d?.competitors || {});

  return (
    <main>
      <Navbar />

      {/* Hero — minimal, functional */}
      <div
        style={{
          padding: "72px var(--pad) 0",
          background: "var(--bg-main)",
          borderBottom: "1px solid var(--border-soft)",
        }}
      >
        <div className="kicker anim-up delay-1" style={{ marginBottom: 20 }}>
          Intelligence Engine
        </div>
        <h1
          className="display-xl anim-up delay-2"
          style={{ marginBottom: 16, color: "var(--ink)" }}
        >
          Run your analysis.
        </h1>
        <p className="body-text anim-up delay-3" style={{ maxWidth: 440, paddingBottom: 48 }}>
          Enter a product and optional competitors. Briefd pulls live signals,
          clusters them into themes, and surfaces structured intelligence.
        </p>
      </div>

      {/* Input */}
      <InputBand onRun={handleRun} loading={loading} />

      {/* Error banner */}
      {apiError && (
        <div
          style={{
            padding: "20px var(--pad)",
            background: "#FDF0ED",
            borderLeft: "3px solid #C9523C",
            borderBottom: "1px solid var(--border-soft)",
            fontSize: 13,
            fontWeight: 300,
            color: "#8A3420",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}
        >
          <strong style={{ fontWeight: 600 }}>Analysis failed.</strong>{" "}
          {apiError}
        </div>
      )}

      {/* Results — only rendered after analysis */}
      {d && (
        <>
          {/* Metrics band — warm stone, light but distinct */}
          <div
            className="metrics-band"
            style={{
              gridTemplateColumns: `repeat(${compNames.length ? 5 : 4}, 1fr)`,
            }}
          >
            {[
              { label: "Analysing",     value: lastKey.split("|")[0],                    accent: true },
              { label: "Total Signals", value: String(d.product.summary.total_signals)  },
              { label: "Negative Rate", value: `${d.product.summary.negative_rate.toFixed(1)}%`, sage: true },
              { label: "Themes",        value: String(themes.length)                    },
              ...(compNames.length ? [{ label: "Competitors", value: String(compNames.length) }] : []),
            ].map(({ label, value, accent, sage }) => (
              <div key={label} className="metric-cell">
                <div className="micro">{label}</div>
                <div className={`metric-val${sage ? " sage" : ""}`}
                  style={label === "Analysing" ? { fontSize: "clamp(20px,2.5vw,28px)" } : {}}>
                  {value}
                </div>
                {label === "Total Signals" && <span className="metric-sub">captured</span>}
                {label === "Negative Rate" && <span className="metric-sub">of all signals</span>}
                {label === "Themes"        && <span className="metric-sub">identified</span>}
              </div>
            ))}
          </div>

          {/* 01 — Customer Themes */}
          <Section id="intelligence" number="01" background="var(--bg-main)">
            <div className="kicker" style={{ marginBottom: 24 }}>Customer Themes</div>
            <h2 className="display-lg" style={{ marginBottom: 0 }}>
              Voice of the customer.
            </h2>
          </Section>
          <div style={{ padding: "0 var(--pad)", background: "var(--bg-main)" }}>
            {themes.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--ink-4)", fontStyle: "italic", paddingBottom: 48 }}>
                No themes returned for this product.
              </p>
            )}
            {themes.map((t, i) => <ThemeBlock key={i} theme={t} index={i} />)}
          </div>

          {/* 02 — Competitive */}
          {compNames.length > 0 && (
            <>
              <Section id="competitive" number="02" background="var(--bg-alt-1)">
                <div className="kicker" style={{ marginBottom: 24 }}>Competitive Intelligence</div>
                <h2 className="display-lg" style={{ marginBottom: 0 }}>Benchmarked.</h2>
              </Section>
              <div style={{ padding: "0 var(--pad)", background: "var(--bg-alt-1)" }}>
                {compNames.map((name) => (
                  <CompBlock
                    key={name}
                    name={name}
                    negRate={d.competitors[name].summary.negative_rate}
                    shared={d.comparisons[name].shared}
                    uniqueP={d.comparisons[name].unique_to_product}
                    uniqueC={d.comparisons[name].unique_to_competitor}
                  />
                ))}
              </div>
            </>
          )}

          {/* 03 — Hypothesis Lab — forest green, all text forced visible via hyp-section CSS class */}
          <div
            id="hypothesis"
            className="hyp-section"
            style={{
              padding: "52px var(--pad) 48px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative section number */}
            <div className="section-number section-number-light" aria-hidden="true">
              {compNames.length ? "03" : "02"}
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <div className="kicker" style={{ marginBottom: 24 }}>
                Hypothesis Lab
              </div>

              <h2
                className="display-lg"
                style={{ marginBottom: 16, fontStyle: "italic" }}
              >
                Signal becomes direction.
              </h2>

              <p className="body-text" style={{ maxWidth: 440, marginBottom: 36 }}>
                Structured hypotheses generated from your top themes.
                Use as starting points, not conclusions.
              </p>

              <button
                onClick={() => setHypOpen(!hypOpen)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(232,240,236,0.2)",
                  borderRadius: 6,
                  cursor: "pointer",
                  padding: "10px 20px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "rgba(232,240,236,0.7)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 32,
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "0.04em",
                }}
              >
                {hypOpen ? "▾ Close Lab" : "▸ Open Hypothesis Lab"}
              </button>

              {hypOpen && (
                <div>
                  {themes.slice(0, 5).map((t, i) => <HypCard key={i} index={i} theme={t} />)}
                </div>
              )}
            </div>
          </div>

          {/* Raw feedback */}
          <RawFeedback themes={themes} />
        </>
      )}

      {/* Feedback */}
      <FeedbackSection />

      {/* Footer */}
      <footer className="footer-band">
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 16, letterSpacing: "-0.02em", color: "var(--ink)" }}>
          Brie<span style={{ color: "var(--sage)" }}>fd</span>
        </div>
        <div>Product Intelligence · Columbia University · 2025</div>
        <div>
          <a href="mailto:pch2108@columbia.edu" style={{ color: "var(--sage)", textDecoration: "none", fontSize: 12 }}>pch2108@columbia.edu</a>
          {" · "}Pruthu Simha
        </div>
      </footer>
    </main>
  );
}