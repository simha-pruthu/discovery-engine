"use client";

import { useState } from "react";
import Navbar from "@/src/components/Navbar";
import Section from "@/src/components/Section";
import MetricsBand from "@/src/components/intelligence/MetricsBand";
import ThemeBlock from "@/src/components/intelligence/ThemeBlock";
import CompetitorBlock from "@/src/components/intelligence/CompetitorBlock";
import HypothesisCard from "@/src/components/intelligence/HypothesisCard";

export default function Experience() {
  const [product, setProduct] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, competitors }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <Navbar />

      <Section number="01" background="var(--bg-main)">
        <div style={{ maxWidth: 640 }}>
          <div className="kicker">Run Intelligence</div>
          <h1 className="display-lg" style={{ marginBottom: 24 }}>
            Analyze a product.
          </h1>

          <input
            className="briefd-input"
            placeholder="Product name"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            style={{ marginBottom: 16 }}
          />

          <input
            className="briefd-input"
            placeholder="Competitors (comma separated)"
            value={competitors}
            onChange={(e) => setCompetitors(e.target.value)}
            style={{ marginBottom: 24 }}
          />

          <button className="cta-button" onClick={run}>
            Run Intelligence →
          </button>

          {error && (
            <div className="error-notice" style={{ marginTop: 24 }}>
              {error}
            </div>
          )}
        </div>
      </Section>

      {loading && (
        <Section number="02" background="var(--bg-alt-1)">
          <div style={{ textAlign: "center" }}>
            <div className="display-md">Structuring signal…</div>
            <div className="micro" style={{ marginTop: 12 }}>
              Clustering themes · Calculating intensity · Identifying patterns
            </div>
          </div>
        </Section>
      )}
    </main>
  );
}