import Link from "next/link";
import IntensityBar from "@/components/ui/IntensityBar";

const bullets = [
  "Ranked friction themes",
  "Emotional severity scoring",
  "Segment-level impact analysis",
];

export default function Hero() {
  return (
    <section className="relative py-28 border-b border-[#E2E8F0] px-8 overflow-hidden">
      {/* Faint geometric grid background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: 0.028 }}
        >
          <defs>
            <pattern
              id="hero-grid"
              width="64"
              height="64"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 64 0 L 0 0 0 64"
                fill="none"
                stroke="#0F172A"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-20 items-center relative">
        {/* Left: Headline + CTAs + bullets */}
        <div>
          <h1 className="text-5xl font-semibold tracking-tight leading-[1.1] text-[#0F172A] mb-6">
            Turn raw customer feedback into ranked product decisions.
          </h1>

          <p className="text-lg text-[#64748B] mb-10 max-w-[460px] leading-relaxed">
            Briefed transforms scattered reviews, forum threads, and user
            complaints into structured friction themes with measurable severity
            scoring and segment impact.
          </p>

          <div className="flex items-center gap-4 flex-wrap mb-8">
            <Link
              href="/experience"
              className="px-6 py-3 bg-[#D14E17] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
            >
              Run Analysis
            </Link>
            <Link
              href="/experience"
              className="px-6 py-3 border border-[#E2E8F0] bg-white text-[#0F172A] rounded-lg text-sm font-medium hover:bg-slate-50 transition"
            >
              View Sample Report
            </Link>
          </div>

          {/* Credibility bullets */}
          <ul className="space-y-2">
            {bullets.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 text-sm text-[#64748B]"
              >
                <span className="w-1 h-1 rounded-full bg-[#D14E17] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Dashboard preview card */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-[#64748B] uppercase tracking-wider font-medium">
              Live Preview
            </p>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-pulse inline-block" />
              LIVE
            </span>
          </div>

          <h3 className="text-xl font-semibold text-[#0F172A] mb-1">
            Onboarding Friction
          </h3>
          <p className="text-sm text-[#64748B] mb-6">Segment: New Users</p>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#64748B]">Emotional Intensity</span>
            <span className="text-sm font-semibold tabular-nums text-[#D14E17]">
              84%
            </span>
          </div>
          <IntensityBar value={84} />

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-[#64748B]">
              <span className="text-2xl font-semibold tabular-nums text-[#0F172A]">
                847
              </span>{" "}
              signals
            </p>
            <span className="text-xs font-medium px-2.5 py-1 bg-[#FDF4EE] border border-[#F3C6B2] text-[#D14E17] rounded-full uppercase tracking-wider">
              High Confidence
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
