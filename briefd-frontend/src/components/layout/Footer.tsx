import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer-band">
      <Link href="/" className="wordmark" style={{ fontSize: "0.78rem", color: "var(--ink-faint)" }}>
        Brief<span className="accent">·ed</span>
      </Link>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.78rem",
          color: "var(--ink-faint)",
        }}
      >
        © 2026 Briefed — Pruthu Simha. All rights reserved.
      </p>
    </footer>
  );
}
