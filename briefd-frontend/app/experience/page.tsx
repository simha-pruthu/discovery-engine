"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function Experience() {

  const [product, setProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  async function analyze() {
    setLoading(true);
    const res = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product }),
    });

    const result = await res.json();
    setData(result);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#F8F7F4] px-6 py-16">

      <div className="max-w-6xl mx-auto">

        <h1 className="font-serif text-4xl mb-10">
          Customer Intelligence
        </h1>

        <div className="flex gap-4 mb-16">
          <input
            className="border border-gray-300 rounded-md px-4 py-3 w-96"
            placeholder="Product Name"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />

          <button
            onClick={analyze}
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-[#C84C3A] transition"
          >
            Run Analysis
          </button>
        </div>

        {loading && <p>Analyzing...</p>}

        {data && (
          <div className="space-y-8">
            {data.product.themes.map((theme: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm"
              >
                <h2 className="font-serif text-xl mb-2">{theme.name}</h2>
                <p className="text-gray-600 text-sm mb-4">
                  {theme.frequency} mentions · Intensity {theme.emotional_intensity}
                </p>

                {theme.quotes.map((q: any, j: number) => (
                  <div key={j} className="border-l-2 border-gray-200 pl-4 mb-4">
                    <p className="italic text-sm">"{q.text}"</p>
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}