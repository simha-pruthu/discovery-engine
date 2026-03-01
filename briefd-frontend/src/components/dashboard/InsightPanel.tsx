"use client";

import { useState } from "react";

interface Quote {
  text: string;
  url?: string;
  source?: string;
}

interface Theme {
  name: string;
  emotional_intensity: number;
  primary_segment: string;
  frequency: number;
  quotes?: Quote[];
}

interface Summary {
  total_signals: number;
  negative_rate: number;
  trend?: string;
}

interface Competitor {
  name: string;
  negative_rate: number;
  shared: string[];
  unique_to_product: string[];
  unique_to_competitor: string[];
}

interface InsightPanelProps {
  summary: Summary;
  themes: Theme[];
  productName: string;
  competitors?: Competitor[];
}

// ── Hypothesis helpers (mirrors HypothesisLab derive logic) ──────────────────

function pdfDeriveMetric(name: string, intensity: number): string {
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

function pdfDeriveTest(theme: Theme): string {
  const n = theme.name.toLowerCase();
  const seg = theme.primary_segment;
  if (n.includes("onboard") || n.includes("setup"))
    return `Run a ${seg} cohort experiment with a condensed onboarding sequence`;
  if (n.includes("crash") || n.includes("bug") || n.includes("stab"))
    return `Audit and resolve top failure paths within the ${theme.name} context`;
  if (n.includes("slow") || n.includes("perform") || n.includes("load"))
    return `Profile and optimize the critical path driving ${theme.name} among ${seg}`;
  if (n.includes("pric") || n.includes("cost"))
    return `A/B test a revised pricing model or extended trial window targeting ${seg}`;
  return `Redesign the ${theme.name} experience with fewer friction steps for ${seg}`;
}

function pdfDeriveImpact(theme: Theme): string {
  const target = Math.max(1, Math.round(theme.frequency * 0.55));
  return `Reduce ${theme.primary_segment} signal volume from ${theme.frequency.toLocaleString()} to under ${target.toLocaleString()} within 60 days`;
}

// ── Raw feedback CSV download ────────────────────────────────────────────────

function downloadRawFeedback(themes: Theme[]): void {
  const header = "theme,segment,source,url,text\n";
  const rows = themes.flatMap((t) =>
    (t.quotes ?? []).map((q) => {
      const source = (q.source ?? "unknown").replace(/"/g, '""');
      const url = (q.url ?? "").replace(/"/g, '""');
      const text = q.text.replace(/"/g, '""').replace(/\n/g, " ");
      return `"${t.name}","${t.primary_segment}","${source}","${url}","${text}"`;
    })
  );
  const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "raw-feedback.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// ── PDF report generation ────────────────────────────────────────────────────

async function downloadAnalysisPDF(
  summary: Summary,
  themes: Theme[],
  productName: string,
  competitors: Competitor[]
): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const ml = 20; // left margin
  const mr = 20; // right margin
  const cw = pageW - ml - mr; // content width
  const mb = 18; // bottom margin clearance
  let y = 22;

  // ── helpers ────────────────────────────────────────────────────────────────

  function needsBreak(required: number) {
    if (y + required > pageH - mb) {
      doc.addPage();
      y = 22;
    }
  }

  function divider(gap = 5) {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(ml, y, ml + cw, y);
    y += gap;
  }

  function sectionLabel(text: string) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(text.toUpperCase(), ml, y);
    y += 5.5;
  }

  // ── HEADER ─────────────────────────────────────────────────────────────────

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("BRIEFED", ml, y);

  // Accent rule under the wordmark
  doc.setFillColor(209, 78, 23);
  doc.rect(ml, y + 1.5, 10, 0.8, "F");
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text("Intelligence Report", ml, y);
  y += 10;

  divider(7);

  // Product name + timestamp
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(productName, ml, y);
  y += 6.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Generated ${new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    ml,
    y
  );
  y += 10;

  divider(7);

  // ── EXECUTIVE SUMMARY ──────────────────────────────────────────────────────

  sectionLabel("Executive Summary");

  const avgIntensity = themes.length
    ? Math.round(
        themes.reduce((a, t) => a + t.emotional_intensity, 0) / themes.length
      )
    : 0;

  const kpis = [
    { label: "Total Signals", value: summary.total_signals.toLocaleString() },
    { label: "Negative Rate", value: `${Math.round(summary.negative_rate)}%` },
    { label: "Themes Found", value: String(themes.length) },
    { label: "Avg Intensity", value: `${avgIntensity}%` },
  ];

  const colW = cw / 4;
  kpis.forEach((k, i) => {
    const x = ml + i * colW;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(k.value, x, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(k.label, x, y + 5.5);
  });
  y += 16;

  divider(7);

  // ── FRICTION THEMES ────────────────────────────────────────────────────────

  sectionLabel("Friction Themes");

  themes.forEach((theme, idx) => {
    needsBreak(48);

    // Number + name row
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(209, 78, 23);
    doc.text(String(idx + 1).padStart(2, "0"), ml, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(theme.name, ml + 9, y);
    y += 6;

    // Segment · signals
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `${theme.primary_segment}  ·  ${theme.frequency.toLocaleString()} signals`,
      ml,
      y
    );
    y += 7;

    // Intensity label
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Emotional Intensity: ${theme.emotional_intensity}%`, ml, y);
    y += 4;

    // Intensity bar
    doc.setFillColor(226, 232, 240);
    doc.rect(ml, y, cw, 2.5, "F");
    doc.setFillColor(209, 78, 23);
    doc.rect(ml, y, cw * (theme.emotional_intensity / 100), 2.5, "F");
    y += 8;

    // Quotes
    const quotes = (theme.quotes ?? []).slice(0, 2);
    quotes.forEach((q) => {
      const rawText = `"${q.text.slice(0, 300)}"`;
      const lines = doc.splitTextToSize(rawText, cw - 5);
      const blockH = lines.length * 4.2;
      needsBreak(blockH + 8);

      // Left rule
      doc.setFillColor(226, 232, 240);
      doc.rect(ml, y - 1, 0.7, blockH + 2, "F");

      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(lines, ml + 4, y);
      y += blockH;

      if (q.source) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(160, 174, 192);
        const srcLabel =
          q.source.charAt(0).toUpperCase() + q.source.slice(1);
        doc.text(srcLabel, ml + 4, y + 1);
      }
      y += 6;
    });

    // Impact line
    needsBreak(8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `Impact: High friction among ${theme.primary_segment.toLowerCase()}.`,
      ml,
      y
    );
    y += 9;

    // Inter-theme rule
    if (idx < themes.length - 1) {
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(ml, y, ml + cw, y);
      y += 6;
    }
  });

  y += 4;
  divider(7);

  // ── COMPETITIVE FRICTION COMPARISON ────────────────────────────────────────

  if (competitors.length > 0) {
    sectionLabel("Competitive Friction Comparison");

    competitors.forEach((comp, ci) => {
      needsBreak(40);

      // Competitor name + negative rate
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(comp.name, ml, y);

      const rateLabel = `${Math.round(comp.negative_rate)}% negative rate`;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(rateLabel, pageW - mr, y, { align: "right" });
      y += 8;

      // Three columns: Shared / Unique to product / Unique to competitor
      const colW3 = cw / 3;
      const cols = [
        { label: "Shared Themes", items: comp.shared },
        { label: `Unique to ${productName}`, items: comp.unique_to_product, accent: true },
        { label: `Unique to ${comp.name}`, items: comp.unique_to_competitor },
      ] as const;

      const colStartY = y;
      let maxColY = y;

      cols.forEach((col, ci2) => {
        let colY = colStartY;
        const x = ml + ci2 * colW3;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(col.label.toUpperCase(), x, colY);
        colY += 5.5;

        if (col.items.length === 0) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8);
          doc.setTextColor(160, 174, 192);
          doc.text("None identified.", x, colY);
          colY += 5;
        } else {
          col.items.forEach((item) => {
            const bulletLines = doc.splitTextToSize(item, colW3 - 7);
            needsBreak(bulletLines.length * 4.2 + 3);
            if ("accent" in col && col.accent) {
              doc.setTextColor(209, 78, 23);
            } else {
              doc.setTextColor(100, 116, 139);
            }
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.text("\u2022", x, colY);
            doc.text(bulletLines, x + 4, colY);
            colY += bulletLines.length * 4.2 + 2;
          });
        }

        if (colY > maxColY) maxColY = colY;
      });

      y = maxColY + 4;

      if (ci < competitors.length - 1) {
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.line(ml, y, ml + cw, y);
        y += 7;
      }
    });

    y += 4;
    divider(7);
  }

  // ── HYPOTHESIS LAB ─────────────────────────────────────────────────────────

  sectionLabel("Hypothesis Lab");

  const top3 = themes.slice(0, 3);
  top3.forEach((theme, i) => {
    needsBreak(42);

    const metric = pdfDeriveMetric(theme.name, theme.emotional_intensity);
    const testDir = pdfDeriveTest(theme);
    const impact = pdfDeriveImpact(theme);

    // Hypothesis label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(209, 78, 23);
    doc.text(`HYPOTHESIS ${String(i + 1).padStart(2, "0")}`, ml, y);
    y += 6;

    // Statement
    const stmt = `If ${theme.name} continues affecting ${theme.primary_segment}, then ${metric} may decline.`;
    const stmtLines = doc.splitTextToSize(stmt, cw);
    needsBreak(stmtLines.length * 4.8 + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(stmtLines, ml, y);
    y += stmtLines.length * 4.8 + 5;

    // "We should test" label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("WE SHOULD TEST", ml, y);
    y += 5;

    // Bullet items
    [testDir, impact].forEach((bullet) => {
      const bulletLines = doc.splitTextToSize(bullet, cw - 6);
      needsBreak(bulletLines.length * 4.5 + 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("\u2022", ml, y);
      doc.text(bulletLines, ml + 5, y);
      y += bulletLines.length * 4.5 + 2;
    });

    if (i < top3.length - 1) {
      y += 4;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(ml, y, ml + cw, y);
      y += 7;
    }
  });

  // ── FOOTER on every page ───────────────────────────────────────────────────

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("Briefed — Product Intelligence", ml, pageH - 10);
    doc.text(`Page ${p} of ${totalPages}`, pageW - mr, pageH - 10, {
      align: "right",
    });
    // Bottom rule
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(ml, pageH - 13, ml + cw, pageH - 13);
  }

  const slug = productName.toLowerCase().replace(/\s+/g, "-");
  doc.save(`${slug}-analysis.pdf`);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function InsightPanel({
  summary,
  themes,
  productName,
  competitors = [],
}: InsightPanelProps) {
  const [downloading, setDownloading] = useState(false);

  const topTheme = themes[0];
  const trend = summary.trend ?? "worsening";
  const improving = trend === "improving";

  async function handleDownloadReport() {
    setDownloading(true);
    try {
      await downloadAnalysisPDF(summary, themes, productName, competitors);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-sm md:sticky md:top-24 self-start">
      <h2 className="text-xs uppercase tracking-wider text-[#64748B] font-medium mb-6">
        Executive Summary
      </h2>

      <p className="text-sm text-[#64748B] leading-relaxed mb-6">
        <span className="text-[#0F172A] font-semibold tabular-nums">
          {summary.total_signals.toLocaleString()}
        </span>{" "}
        signals analyzed.{" "}
        <span className="text-[#0F172A] font-semibold">
          {Math.round(summary.negative_rate)}%
        </span>{" "}
        classified as negative sentiment.
      </p>

      {/* Top risk theme */}
      <div className="pt-5 border-t border-[#E2E8F0] mb-5">
        <p className="text-xs uppercase tracking-wider text-[#64748B] font-medium mb-3">
          Top Risk Theme
        </p>
        <p className="text-sm font-semibold text-[#0F172A]">{topTheme?.name}</p>
        <p className="text-xs text-[#64748B] mt-1">
          {topTheme?.primary_segment} &middot;{" "}
          {topTheme?.frequency.toLocaleString()} signals
        </p>
      </div>

      {/* Trend */}
      <div className="pt-5 border-t border-[#E2E8F0] mb-6">
        <p className="text-xs uppercase tracking-wider text-[#64748B] font-medium mb-2">
          Trend
        </p>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              improving ? "bg-emerald-500" : "bg-[#D14E17]"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              improving ? "text-emerald-700" : "text-[#D14E17]"
            }`}
          >
            {improving ? "Improving" : "Worsening"}
          </span>
        </div>
      </div>

      {/* Downloads */}
      <div className="pt-5 border-t border-[#E2E8F0] space-y-3">
        <p className="text-xs uppercase tracking-wider text-[#64748B] font-medium mb-4">
          Export
        </p>

        <div>
          <button
            onClick={() => downloadRawFeedback(themes)}
            className="w-full px-4 py-2.5 border border-[#E2E8F0] bg-white text-[#0F172A] rounded-lg text-sm font-medium hover:bg-[#F8F9FA] hover:border-slate-300 transition"
          >
            Download Raw Feedback
          </button>
          <p className="text-xs text-[#A0AEC0] mt-1.5 px-1">
            Unprocessed signals as CSV.
          </p>
        </div>

        <div>
          <button
            onClick={handleDownloadReport}
            disabled={downloading}
            className="w-full px-4 py-2.5 bg-[#D14E17] text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {downloading ? "Generating PDF…" : "Download Analysis Report"}
          </button>
          <p className="text-xs text-[#A0AEC0] mt-1.5 px-1">
            Themes, intensity, and hypotheses as PDF.
          </p>
        </div>
      </div>
    </div>
  );
}
