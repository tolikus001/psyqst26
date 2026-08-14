/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-bg, #0f172a)",
        foreground: "var(--color-text, #f8fafc)",
        primary: {
          DEFAULT: "var(--color-accent, #6366f1)",
          hover: "#4f46e5",
        },
      },
    },
  },
  plugins: [],
};
