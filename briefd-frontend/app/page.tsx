import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8F7F4] text-[#161615]">

      {/* NAV */}
      <div className="max-w-6xl mx-auto flex justify-between items-center py-8 px-6">
        <div className="font-serif text-2xl">
          Brie<span className="text-[#C84C3A]">fd</span>
        </div>
        <Link href="/experience">
          <button className="bg-black text-white px-6 py-2 rounded-md hover:bg-[#C84C3A] transition">
            Experience Briefd →
          </button>
        </Link>
      </div>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 py-32">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-6xl font-serif leading-tight mb-6"
        >
          Real customer signal.<br />
          <span className="text-[#C84C3A]">Structured for product teams.</span>
        </motion.h1>

        <p className="text-gray-600 text-lg max-w-xl">
          Pull live feedback from Reddit and review platforms. Transform it
          into structured themes, intensity scores, and competitive insight.
        </p>
      </section>

      {/* FEATURES */}
      <section className="border-t border-gray-200 py-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 gap-12">

          <Feature
            title="Customer Themes"
            desc="AI groups repeated friction into structured product patterns."
          />

          <Feature
            title="Emotional Intensity"
            desc="Measure severity from mild frustration to critical breakdown."
          />

          <Feature
            title="Competitive Intelligence"
            desc="See what is unique to you versus industry-wide friction."
          />

        </div>
      </section>

      {/* CTA */}
      <section className="py-32 text-center border-t border-gray-200">
        <h2 className="text-4xl font-serif mb-6">
          Understand your product the way your customers do.
        </h2>

        <Link href="/experience">
          <button className="bg-black text-white px-8 py-4 rounded-md hover:bg-[#C84C3A] transition">
            Try Briefd Now →
          </button>
        </Link>
      </section>

    </main>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-lg transition">
      <h3 className="font-serif text-xl mb-4">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}