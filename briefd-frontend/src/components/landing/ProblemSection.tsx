"use client";

import { useEffect, useRef } from "react";

const problems = [
  {
    title: "Feedback is scattered",
    body: "Signals live across reviews, support tickets, and forums — with no unified view of what users actually experience.",
  },
  {
    title: "Severity is unclear",
    body: "Not every complaint carries equal business impact. Without scoring, everything feels urgent and nothing gets prioritized.",
  },
  {
    title: "Decisions drift to opinion",
    body: "Backlogs grow around the loudest voices, not the most frequent friction. Direction loses its anchor in data.",
  },
];

export default function ProblemSection() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-up-show");
          }
        });
      },
      { threshold: 0.15 }
    );

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-28 px-8 bg-[#F8F9FA]">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-3xl font-semibold tracking-tight text-[#0F172A] mb-16">
          Why product teams miss what matters
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((p, i) => (
            <div
              key={i}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className="fade-up-init bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-sm"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <h3 className="text-base font-semibold text-[#0F172A] mb-3">
                {p.title}
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
