"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import KPIBlock from "@/components/dashboard/KPIBlock";
import ThemeCard from "@/components/dashboard/ThemeCard";
import InsightPanel from "@/components/dashboard/InsightPanel";
import CompetitiveAnalysis from "@/components/dashboard/CompetitiveAnalysis";
import HypothesisLab from "@/components/dashboard/HypothesisLab";

interface Quote {
  text: string;
  url?: string;
  source?: string;
  title?: string;
  date?: string;
}

interface Theme {
  name: string;
  frequency: number;
  emotional_intensity: number;
  primary_segment: string;
  quotes?: Quote[];
  confidence?: string;
}

interface Summary {
  total_signals: number;
  negative_rate: number;
  trend?: string;
}

interface ProductData {
  themes: Theme[];
  summary: Summary;
}

interface Competitor {
  name: string;
  negative_rate: number;
  shared: string[];
  unique_to_product: string[];
  unique_to_competitor: string[];
}

interface ApiResponse {
  product: ProductData;
  competitors: Competitor[];
}

type Status = "idle" | "loading" | "success" | "error";

// Shimmer skeleton block
function Skeleton({ height = 80, radius = 8 }: { height?: number; radius?: number }) {
  return (
    <div
      className="skeleton-shimmer"
      style={{ height, borderRadius: radius }}
    />
  );
}

export default function ExperiencePage() {
  const [productInput, setProductInput] = useState("");
  const [competitorsInput, setCompetitorsInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<ProductData | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [analysisProduct, setAnalysisProduct] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  function runAnalysis() {
    const product = productInput.trim();
    if (!product) return;

    setStatus("loading");
    setData(null);
    setCompetitors([]);
    setErrorMsg("");

    const competitorList = competitorsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, competitors: competitorList }),
    })
      .then(async (res) => {
        if (!res.ok) {
          let msg = `Request failed (${res.status})`;
          try {
            const body = await res.json();
            if (body.error) msg = body.error;
          } catch {
            // body wasn't JSON
          }
          throw new Error(msg);
        }
        return res.json();
      })
      .then((json: ApiResponse) => {
        if (!json?.product?.themes || !json?.product?.summary) {
          throw new Error("Unexpected response shape. Check the backend terminal.");
        }
        setData(json.product);
        setCompetitors(json.competitors ?? []);
        setAnalysisProduct(product);
        setTimestamp(
          new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        );
        setStatus("success");
      })
      .catch((err: Error) => {
        setErrorMsg(err.message || "Analysis failed. Check the backend terminal.");
        setStatus("error");
      });
  }

  const avgIntensity =
    data && data.themes.length > 0
      ? Math.round(
          data.themes.reduce((acc, t) => acc + t.emotional_intensity, 0) /
            data.themes.length
        )
      : 0;

  const canRun = productInput.trim().length > 0;

  return (
    <>
      <Navbar />

      <main style={{ minHeight: "100vh", paddingTop: 80 }}>
        <div className="container-site" style={{ paddingTop: 48, paddingBottom: 80 }}>

          {/* Page label */}
          <div className="eyebrow-group" style={{ marginBottom: 32 }}>
            <span className="eyebrow-dash" />
            <span className="eyebrow">Intelligence Report</span>
          </div>

          {/* ── Form Card ───────────────────────────────────────────────── */}
          <div
            className="float-card"
            style={{
              padding: 40,
              maxWidth: 600,
              marginBottom: status !== "idle" ? 48 : 0,
            }}
          >
            {/* Product Name */}
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "var(--ink-faint)",
                  marginBottom: 8,
                }}
              >
                Product Name
              </label>
              <input
                type="text"
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") runAnalysis(); }}
                placeholder="e.g. Notion, Figma, Linear"
                disabled={status === "loading"}
                className="site-input"
              />
            </div>

            {/* Competitors */}
            <div style={{ marginBottom: 32 }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "var(--ink-faint)",
                  marginBottom: 8,
                }}
              >
                Competitors{" "}
                <span
                  style={{
                    textTransform: "none",
                    letterSpacing: "normal",
                    fontWeight: 400,
                    color: "var(--ink-faint)",
                    opacity: 0.7,
                  }}
                >
                  (optional, comma-separated)
                </span>
              </label>
              <input
                type="text"
                value={competitorsInput}
                onChange={(e) => setCompetitorsInput(e.target.value)}
                placeholder="e.g. Obsidian, Coda"
                disabled={status === "loading"}
                className="site-input"
              />
            </div>

            {/* Submit */}
            <button
              onClick={runAnalysis}
              disabled={!canRun || status === "loading"}
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              {status === "loading" ? "Running…" : "Run Analysis"}
            </button>
          </div>

          {/* ── Loading skeletons ─────────────────────────────────────── */}
          {status === "loading" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.85rem",
                  color: "var(--ink-faint)",
                  marginBottom: 8,
                }}
              >
                Collecting signals, clustering themes…
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border)", borderRadius: 12, overflow: "hidden" }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ padding: 24, background: "var(--bg)" }}>
                    <Skeleton height={18} radius={4} />
                    <div style={{ marginTop: 12 }}><Skeleton height={36} radius={4} /></div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[0,1,2].map(i => (
                  <Skeleton key={i} height={120} radius={14} />
                ))}
              </div>
            </div>
          )}

          {/* ── Error ────────────────────────────────────────────────── */}
          {status === "error" && (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                border: "1px solid var(--border)",
                borderRadius: 14,
                background: "var(--white)",
              }}
            >
              <p className="body-copy" style={{ marginBottom: 16 }}>{errorMsg}</p>
              <button onClick={runAnalysis} className="btn-ink">
                Retry
              </button>
            </div>
          )}

          {/* ── Results ──────────────────────────────────────────────── */}
          <AnimatePresence>
            {status === "success" && data && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Results header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 32,
                    paddingBottom: 24,
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <h1
                      className="card-heading"
                      style={{ fontSize: "1.5rem", marginBottom: 4 }}
                    >
                      {analysisProduct}
                    </h1>
                    {timestamp && (
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "var(--ink-faint)" }}>
                        {timestamp}
                      </p>
                    )}
                  </div>

                  <span className="pill-badge pill-badge-live" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <motion.span
                      style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--orange)" }}
                      animate={{ scale: [1, 0.8], opacity: [1, 0.5] }}
                      transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse" }}
                    />
                    LIVE
                  </span>
                </div>

                {/* KPI grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 1,
                    background: "var(--border)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    overflow: "hidden",
                    marginBottom: 48,
                  }}
                >
                  <KPIBlock label="Total Signals" value={data.summary.total_signals} />
                  <KPIBlock label="Negative Rate" value={Math.round(data.summary.negative_rate)} suffix="%" accent />
                  <KPIBlock label="Themes Identified" value={data.themes.length} />
                  <KPIBlock label="Avg Intensity" value={avgIntensity} suffix="%" accent />
                </div>

                {/* Themes + sidebar */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 320px",
                    gap: 32,
                    alignItems: "start",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {data.themes.map((t, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.07 }}
                      >
                        <ThemeCard theme={t} />
                      </motion.div>
                    ))}
                  </div>

                  <div style={{ position: "sticky", top: 80 }}>
                    <InsightPanel
                      summary={data.summary}
                      themes={data.themes}
                      productName={analysisProduct}
                      competitors={competitors}
                    />
                  </div>
                </div>

                {/* Competitive Analysis */}
                {competitors.length > 0 && (
                  <CompetitiveAnalysis
                    competitors={competitors}
                    productName={analysisProduct}
                  />
                )}

                {/* Hypothesis Lab */}
                <HypothesisLab themes={data.themes} />

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      <Footer />
    </>
  );
}
