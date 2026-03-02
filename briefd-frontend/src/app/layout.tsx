import "./globals.css";
import { DM_Sans, Fraunces } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-fraunces",
});

export const metadata = {
  title: "Briefed — Product Intelligence Platform",
  description:
    "Turn raw feedback into ranked product decisions. Briefed transforms scattered reviews, forum threads, and user complaints into structured friction themes with measurable severity scoring.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body
        className={dmSans.className}
        style={{ background: "var(--bg)", color: "var(--ink)" }}
      >
        {children}
      </body>
    </html>
  );
}
