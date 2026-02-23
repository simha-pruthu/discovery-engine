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
        scrolled ? "nav-glass" : ""
      }`}
      style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        padding: "0 var(--pad)",
        borderBottom: scrolled ? undefined : "1px solid transparent",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        {/* Logo */}
        <a
          href="/"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          Brie<span style={{ color: "var(--sage)" }}>fd</span>
        </a>

        {/* Center section anchors */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {[
            { label: "Intelligence", href: "#signal"     },
            { label: "Numbers",      href: "#numbers"    },
            { label: "Direction",    href: "#hypothesis" },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="nav-link"
              style={{ textDecoration: "none" }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right: live pip + CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexShrink: 0 }}>
          <span className="live-pip">Live</span>

          {/*
           * Using <a> as button — must override ALL Tailwind link styles.
           * textDecoration: none is set both in CSS (.cta-button) and inline
           * to defeat Tailwind's base layer <a> rule.
           */}
          <a
            href="/experience"
            className="cta-button"
            style={{
              textDecoration: "none",
              padding: "9px 18px",
              fontSize: "12px",
              borderRadius: "6px",    /* explicit — no pill */
            }}
          >
            Request Access
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.15; }
        }
      `}</style>
    </nav>
  );
}