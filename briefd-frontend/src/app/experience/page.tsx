"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import KPIBlock from "@/components/dashboard/KPIBlock";
import ThemeCard from "@/components/dashboard/ThemeCard";
import InsightPanel from "@/components/dashboard/InsightPanel";
import HypothesisLab from "@/components/dashboard/HypothesisLab";
import CompetitiveAnalysis from "@/components/dashboard/CompetitiveAnalysis";
import type { Competitor } from "@/components/dashboard/CompetitiveAnalysis";

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

interface ApiResponse {
  product: ProductData;
  competitors: Competitor[];
}

type Status = "idle" | "loading" | "success" | "error";

export default function DashboardPage() {
  const [productInput, setProductInput] = useState("Notion");
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
            // body wasn't JSON — keep the status message
          }
          throw new Error(msg);
        }
        return res.json();
      })
      .then((json: ApiResponse) => {
        if (!json?.product?.themes || !json?.product?.summary) {
          throw new Error(
            "Unexpected response shape. Check the backend terminal for errors."
          );
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
        setErrorMsg(
          err.message || "Analysis failed. Check the backend terminal for details."
        );
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

  return (
    <>
      <Navbar />

      <div className="bg-[#F8F9FA] min-h-screen">
        <div className="max-w-[1200px] mx-auto px-8">

          {/* ── Report Header ───────────────────────────────────────── */}
          <div className="py-10 border-b border-[#E2E8F0]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#64748B] font-medium mb-1">
                  Intelligence Report
                </p>
                <h1 className="text-2xl font-semibold text-[#0F172A]">
                  {analysisProduct || "—"}
                </h1>
                {timestamp && (
                  <p className="text-xs text-[#64748B] mt-1">{timestamp}</p>
                )}
              </div>

              {status === "success" && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-pulse inline-block" />
                  LIVE
                </span>
              )}
            </div>
          </div>

          {/* ── Input Card ──────────────────────────────────────────── */}
          <div className="py-8 border-b border-[#E2E8F0]">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-sm">
              <div className="grid md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#64748B] font-medium mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={productInput}
                    onChange={(e) => setProductInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") runAnalysis();
                    }}
                    placeholder="e.g. Notion"
                    disabled={status === "loading"}
                    className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder-[#A0AEC0] focus:outline-none focus:border-[#D14E17] transition bg-white disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#64748B] font-medium mb-2">
                    Competitors{" "}
                    <span className="normal-case text-[#A0AEC0] tracking-normal">
                      (optional, comma-separated)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={competitorsInput}
                    onChange={(e) => setCompetitorsInput(e.target.value)}
                    placeholder="e.g. Obsidian, Coda"
                    disabled={status === "loading"}
                    className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder-[#A0AEC0] focus:outline-none focus:border-[#D14E17] transition bg-white disabled:opacity-60"
                  />
                </div>

                <button
                  onClick={runAnalysis}
                  disabled={status === "loading" || !productInput.trim()}
                  className="px-6 py-2.5 bg-[#D14E17] text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {status === "loading" ? "Running…" : "Run Analysis"}
                </button>
              </div>
            </div>
          </div>

          {/* ── Idle ────────────────────────────────────────────────── */}
          {status === "idle" && (
            <div className="py-28 text-center">
              <p className="text-sm text-[#64748B]">
                Enter a product name to begin analysis.
              </p>
            </div>
          )}

          {/* ── Loading ─────────────────────────────────────────────── */}
          {status === "loading" && (
            <div className="py-28 flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-[#D14E17] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[#64748B]">Running analysis&hellip;</p>
              <p className="text-xs text-[#A0AEC0]">
                Collecting signals, classifying, and clustering themes.
                This typically takes 1–2 minutes.
              </p>
            </div>
          )}

          {/* ── Error ───────────────────────────────────────────────── */}
          {status === "error" && (
            <div className="py-28 text-center">
              <p className="text-sm text-[#64748B]">{errorMsg}</p>
              <button
                onClick={runAnalysis}
                className="mt-4 px-5 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#0F172A] hover:bg-white transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Results ─────────────────────────────────────────────── */}
          {status === "success" && data && (
            <>
              {/* 1. KPI Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-10 border-b border-[#E2E8F0]">
                <KPIBlock
                  label="Total Signals"
                  value={data.summary.total_signals}
                />
                <KPIBlock
                  label="Negative Rate"
                  value={Math.round(data.summary.negative_rate)}
                  suffix="%"
                />
                <KPIBlock
                  label="Themes Identified"
                  value={data.themes.length}
                />
                <KPIBlock
                  label="Avg Intensity"
                  value={avgIntensity}
                  suffix="%"
                />
              </div>

              {/* 2. Theme Cards + Insight Panel */}
              <div className="grid md:grid-cols-5 gap-8 py-10 border-b border-[#E2E8F0]">
                <div className="md:col-span-3 space-y-6">
                  {data.themes.map((t, i) => (
                    <ThemeCard key={i} theme={t} />
                  ))}
                </div>

                <div className="md:col-span-2">
                  <InsightPanel
                    summary={data.summary}
                    themes={data.themes}
                    productName={analysisProduct}
                    competitors={competitors}
                  />
                </div>
              </div>

              {/* 3. Competitive Analysis (only when competitors present) */}
              {competitors.length > 0 && (
                <CompetitiveAnalysis
                  competitors={competitors}
                  productName={analysisProduct}
                />
              )}

              {/* 4. Hypothesis Lab */}
              <div className="pb-16">
                <HypothesisLab themes={data.themes} />
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
