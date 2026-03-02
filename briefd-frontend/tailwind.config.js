/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["DM Sans", "sans-serif"],
      },
      colors: {
        bg: "#F7F4EF",
        ink: "#111110",
        "ink-mid": "#555450",
        "ink-faint": "#A8A5A0",
        orange: "#E84F27",
        "card-bg": "#F0EDE7",
        border: "#E0DDD7",
        white: "#FDFCFB",
      }
    }
  },
  plugins: []
};
