/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#D14E17",
          soft: "#FDF4EE",
          border: "#F3C6B2"
        },
        bgAlt: "#F8F9FA"
      }
    }
  },
  plugins: []
};