"use client";

interface MetricsBandProps {
  signals: number;
  negRate: number;
  themes: number;
  product: string;
}

export default function MetricsBand({
  signals,
  negRate,
  themes,
  product,
}: MetricsBandProps) {
  const cells = [
    { label: "Analysing", value: product, accent: true },
    { label: "Total Signals", value: signals.toLocaleString() },
    { label: "Negative Rate", value: negRate.toFixed(1) + "%", sage: true },
    { label: "Themes Found", value: themes.toString() },
  ];

  return (
    <div
      className="metrics-band"
      style={{
        gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
      }}
    >
      {cells.map(({ label, value, accent, sage }) => (
        <div key={label} className="metric-cell">
          {accent && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: "var(--sage)",
              }}
            />
          )}

          <div className="micro">{label}</div>

          <div className={`metric-val ${sage ? "sage" : ""}`}>
            {value}
          </div>

          <div className="metric-sub">
            {label === "Total Signals" && "captured"}
            {label === "Negative Rate" && "of all signals"}
            {label === "Themes Found" && "identified"}
          </div>
        </div>
      ))}
    </div>
  );
}