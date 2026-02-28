export default function ThemeBlock({
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
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "210px 1fr",
        gap: 64,
        padding: "48px 0",
        borderBottom: "1px solid var(--border-soft)",
      }}
    >
      {/* LEFT */}
      <div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 11,
            fontStyle: "italic",
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
            color: "var(--ink)",
            marginBottom: 18,
          }}
        >
          {name}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="micro">Frequency</div>
          <div>{frequency} mentions</div>

          <div className="micro" style={{ marginTop: 8 }}>
            Segment
          </div>
          <div>{segment}</div>

          <div className="micro" style={{ marginTop: 8 }}>
            Intensity
          </div>
          <div>{intensity}</div>
        </div>
      </div>

      {/* RIGHT */}
      <div>
        <div className="micro" style={{ marginBottom: 22 }}>
          Customer Voice
        </div>

        {quotes.length === 0 && (
          <div style={{ fontStyle: "italic", color: "var(--ink-4)" }}>
            No quotes captured.
          </div>
        )}

        {quotes.slice(0, 6).map((q, i) => (
          <div key={i} className="pq-line" style={{ marginBottom: 24 }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: i === 0 ? 22 : 17,
                fontStyle: "italic",
                color: i === 0 ? "var(--ink)" : "var(--ink-2)",
                lineHeight: 1.6,
                marginBottom: 6,
              }}
            >
              {q.text}
            </div>

            <div style={{ fontSize: 11, color: "var(--ink-4)" }}>
              {q.url ? (
                <a
                  href={q.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--sage)" }}
                >
                  {q.source}
                </a>
              ) : (
                <>— {q.source}</>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}