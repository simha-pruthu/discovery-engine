"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 1, suffix: ".2M +", label: "Signals processed per analysis" },
  { value: 84, suffix: "%", label: "Average emotional intensity on top themes" },
  { value: 3, suffix: "×", label: "Faster than manual review" },
];

function useCountUp(target: number, duration = 1400) {
  const [count, setCount] = useState(0);
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered) {
          setTriggered(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [triggered]);

  useEffect(() => {
    if (!triggered) return;
    const start = performance.now();
    const frame = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [triggered, target, duration]);

  return { count, ref };
}

function StatCell({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(value);
  return (
    <div
      ref={ref}
      style={{
        padding: "40px 36px",
        background: "var(--card-bg)",
        textAlign: "center",
      }}
    >
      <div className="metric-display" style={{ lineHeight: 1, marginBottom: 10 }}>
        {count}{suffix}
      </div>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.78rem",
          fontWeight: 400,
          color: "var(--ink-faint)",
          lineHeight: 1.5,
        }}
      >
        {label}
      </p>
    </div>
  );
}

export default function StatsBar() {
  return (
    <div
      style={{
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        background: "var(--border)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1,
        }}
      >
        {stats.map((s) => (
          <StatCell key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
        ))}
      </div>
    </div>
  );
}
