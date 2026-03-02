"use client";

import { useEffect, useRef, useState } from "react";

interface KPIBlockProps {
  label: string;
  value: number;
  suffix?: string;
  accent?: boolean;
}

function useCountUp(target: number, duration = 1400) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, containerRef };
}

export default function KPIBlock({ label, value, suffix = "", accent = false }: KPIBlockProps) {
  const { count, containerRef } = useCountUp(value);

  return (
    <div
      ref={containerRef}
      style={{
        padding: "28px 24px",
        background: "var(--bg)",
      }}
    >
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.72rem",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "var(--ink-faint)",
          marginBottom: 12,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "2.5rem",
          fontWeight: 600,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          color: accent ? "var(--orange)" : "var(--ink)",
        }}
      >
        {count.toLocaleString()}
        {suffix}
      </p>
    </div>
  );
}
