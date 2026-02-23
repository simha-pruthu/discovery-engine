"use client";
import useScrollReveal from "@/src/hooks/useScrollReveal";
import { ReactNode, CSSProperties } from "react";

interface SectionProps {
  id?: string;
  number: string;
  background?: string;
  children: ReactNode;
  hypothesis?: boolean;   // deep forest green section
  noPad?: boolean;
  fullBleed?: boolean;
  style?: CSSProperties;
}

export default function Section({
  id,
  number,
  background,
  children,
  hypothesis = false,
  noPad = false,
  fullBleed = false,
  style,
}: SectionProps) {
  const { ref, visible } = useScrollReveal({ threshold: 0.06 });

  return (
    <section
      id={id}
      /*
       * NO min-h-screen — was creating giant empty gaps.
       * overflow:hidden clips section-number so it never adds height.
       * hyp-section class uses hex directly in CSS (CSS vars don't
       * resolve reliably as inline style strings in JSX).
       */
      className={`relative overflow-hidden ${hypothesis ? "hyp-section" : ""}`}
      style={{
        background: hypothesis ? undefined : background,
        ...style,
      }}
    >
      <div
        ref={ref}
        className={`transition-all duration-700 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
        style={
          fullBleed
            ? {}
            : {
                paddingTop:    noPad ? 0 : "clamp(56px, 7vh, 96px)",
                paddingBottom: noPad ? 0 : "clamp(56px, 7vh, 96px)",
                paddingLeft:   "var(--pad)",
                paddingRight:  "var(--pad)",
              }
        }
      >
        {children}
      </div>

      {/* Section number — bottom-right always, decorative */}
      <div
        className={`section-number ${hypothesis ? "section-number-light" : ""}`}
        aria-hidden="true"
      >
        {number}
      </div>
    </section>
  );
}