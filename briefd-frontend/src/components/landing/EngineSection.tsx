"use client";

import { useEffect, useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Ingest Signals",
    body: "Reddit posts, app reviews, and public feedback are collected and normalized into a unified signal corpus.",
  },
  {
    number: "02",
    title: "Cluster Themes",
    body: "Recurring friction patterns are grouped by semantic similarity and ranked by frequency and recurrence rate.",
  },
  {
    number: "03",
    title: "Quantify Severity",
    body: "Each theme receives an intensity score based on emotional language, frequency, and user segment impact.",
  },
];

export default function EngineSection() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && lineRef.current) {
            lineRef.current.style.width = "100%";
          }
        });
      },
      { threshold: 0.5 }
    );

    if (titleRef.current) observer.observe(titleRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-28 px-8 border-b border-[#E2E8F0]">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-16 inline-block">
          <h2
            ref={titleRef}
            className="text-3xl font-semibold tracking-tight text-[#0F172A] mb-2"
          >
            From signal to direction
          </h2>
          <div
            ref={lineRef}
            className="h-px bg-[#D14E17] transition-all duration-700 ease-out"
            style={{ width: 0 }}
          />
        </div>

        <div className="grid md:grid-cols-3 border border-[#E2E8F0] rounded-xl overflow-hidden">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`p-10 bg-white ${
                i < steps.length - 1 ? "md:border-r border-[#E2E8F0]" : ""
              } ${i > 0 ? "border-t md:border-t-0 border-[#E2E8F0]" : ""}`}
            >
              <span className="text-xs font-semibold text-[#D14E17] uppercase tracking-widest mb-5 block">
                {s.number}
              </span>
              <h3 className="text-base font-semibold text-[#0F172A] mb-3">
                {s.title}
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
