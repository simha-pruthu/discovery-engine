"use client";

import { useTheme } from "@/src/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="text-sm border px-4 py-2 rounded-full transition"
      style={{ borderColor: "var(--border)" }}
    >
      {theme === "light" ? "Dark Mode" : "Light Mode"}
    </button>
  );
}