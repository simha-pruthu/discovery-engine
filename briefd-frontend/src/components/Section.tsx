"use client";
import useScrollReveal from "@/src/hooks/useScrollReveal";
import { ReactNode } from "react";

interface SectionProps {
  id: string;
  number: string;
  background: string;
  children: ReactNode;
  dark?: boolean;            // inverts section number color
  noPad?: boolean;           // skip default top padding (for metric bands)
  fullBleed?: boolean;       // children fill full width
  minHeight?: string;
}

export default function Section({
  id,
  number,
  background,
  children,
  dark = false,
  noPad = false,
  fullBleed = false,
  minHeight = "min-h-screen",
}: SectionProps) {
  const { ref, visible } = useScrollReveal({ threshold: 0.06 });

  return (
    <section
      id={id}
      className={`relative ${minHeight} overflow-hidden`}
      style={{ background }}
    >
      {/* Section content */}
      <div
        ref={ref}
        className={`
          ${fullBleed ? "w-full" : ""}
          transition-all duration-700 ease-out
          ${visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-5"
          }
        `}
        style={
          fullBleed
            ? {}
            : {
                paddingTop: noPad ? 0 : "clamp(72px, 8vh, 112px)",
                paddingBottom: noPad ? 0 : "clamp(72px, 8vh, 112px)",
                paddingLeft: "var(--pad)",
                paddingRight: "var(--pad)",
                maxWidth: "none",
              }
        }
      >
        {children}
      </div>

      {/* Section number — bottom-right, always */}
      <div
        className={`section-number ${dark ? "section-number-light" : ""}`}
        aria-hidden="true"
      >
        {number}
      </div>
    </section>
  );
}