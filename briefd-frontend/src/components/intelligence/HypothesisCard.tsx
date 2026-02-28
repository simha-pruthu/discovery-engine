export default function HypothesisCard({
  index,
  themeName,
  segment,
}: {
  index: number;
  themeName: string;
  segment: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "96px 1fr",
        gap: 36,
        padding: "36px 0",
        borderBottom: "1px solid rgba(255,255,255,.08)",
      }}
    >
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 56,
          fontStyle: "italic",
          color: "rgba(255,255,255,.15)",
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>

      <div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 20,
            lineHeight: 1.6,
            marginBottom: 20,
          }}
        >
          If we improve <em>{themeName}</em>, we expect measurable gains among
          the {segment} segment.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          <div>
            <div className="micro">Primary Metric</div>
            <div>CSAT · Retention</div>
          </div>

          <div>
            <div className="micro">Expected Impact</div>
            <div>+8–12%</div>
          </div>

          <div>
            <div className="micro">Suggested Sprint</div>
            <div>4–6 weeks</div>
          </div>
        </div>
      </div>
    </div>
  );
}