"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: "rgba(247,244,239,0.85)",
        borderBottom: scrolled
          ? "1px solid var(--border)"
          : "1px solid transparent",
        transition: "border-color 0.3s ease",
      }}
    >
      <div
        className="container-site"
        style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Wordmark */}
        <Link href="/" className="wordmark">
          Brief<span className="accent">d</span>
        </Link>

        {/* Centre links — desktop only */}
        <div className="hidden md:flex" style={{ gap: 32, alignItems: "center" }}>
          {[
            { label: "Why", href: "#why" },
            { label: "How it works", href: "#how-it-works" },
            { label: "Metrics", href: "#metrics" },
            { label: "For teams", href: "#for-teams" },
          ].map(({ label, href }) => (
            <a key={label} href={href} className="nav-link">
              {label}
            </a>
          ))}
        </div>

        {/* Right CTA */}
        <Link href="/experience" className="btn-ink">
          Run Analysis
        </Link>
      </div>
    </nav>
  );
}
