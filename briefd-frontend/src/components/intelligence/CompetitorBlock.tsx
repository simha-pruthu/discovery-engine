export default function CompetitorBlock({
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
  const cols = [
    { heading: "Shared Frictions", items: shared },
    { heading: "Unique to Your Product", items: uniqueToProduct },
    { heading: `Unique to ${name}`, items: uniqueToCompetitor },
  ];

  return (
    <div style={{ padding: "44px 0", borderBottom: "1px solid var(--border-soft)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 30,
        }}
      >
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 26,
            color: "var(--ink)",
          }}
        >
          {name}
        </div>

        <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
          Negative rate{" "}
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              color: "var(--sage)",
              fontSize: 20,
            }}
          >
            {negRate.toFixed(1)}%
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32 }}>
        {cols.map((col) => (
          <div key={col.heading}>
            <div className="comp-col-head">{col.heading}</div>

            {col.items.length === 0 ? (
              <div style={{ fontStyle: "italic", color: "var(--ink-4)" }}>
                None detected.
              </div>
            ) : (
              col.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: "8px 0",
                    borderBottom:
                      i < col.items.length - 1
                        ? "1px solid var(--border-soft)"
                        : "none",
                  }}
                >
                  {item}
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}