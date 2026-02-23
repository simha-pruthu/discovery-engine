"use client";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "nav-glass" : "bg-transparent border-b border-transparent"
      }`}
    >
      <div
        className="flex items-center justify-between"
        style={{ padding: "0 var(--pad)", height: "56px" }}
      >
        {/* Logo */}
        <div
          className="font-serif text-xl"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
          }}
        >
          Brie
          <span style={{ color: "var(--sage)" }}>fd</span>
        </div>

        {/* Center anchors */}
        <div className="flex items-center gap-8">
          {[
            { label: "Intelligence", href: "#signal" },
            { label: "Numbers",     href: "#numbers" },
            { label: "Direction",   href: "#hypothesis" },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="micro transition-colors duration-200 hover:text-[var(--ink)]"
              style={{ color: "var(--ink-4)" }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-5">
          {/* Live pip — personality touch */}
          <span
            className="flex items-center gap-2"
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--sage)",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "var(--sage)",
                display: "inline-block",
                animation: "pip 2.6s ease infinite",
              }}
            />
            Live
          </span>

          <a href="/experience" className="cta-button" style={{ padding: "8px 18px", fontSize: "12px" }}>
            Request Access
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes pip {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.15; }
        }
      `}</style>
    </nav>
  );
}