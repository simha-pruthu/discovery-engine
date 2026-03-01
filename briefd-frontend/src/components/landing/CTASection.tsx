import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-40 px-8 text-center">
      <div className="max-w-[560px] mx-auto">
        <h2 className="text-4xl font-semibold tracking-tight text-[#0F172A] leading-[1.15] mb-10">
          Stop reading noise.
          <br />
          Start acting on signal.
        </h2>
        <Link
          href="/experience"
          className="inline-block px-8 py-4 bg-[#D14E17] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          Run Analysis
        </Link>
      </div>
    </section>
  );
}
