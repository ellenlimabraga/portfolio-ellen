/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#050403",
        "bg-2": "#0b0806",
        ink: "#f4ede2",
        muted: "#a99e8f",
        faint: "#6a6156",
        gold: "#f5b642",
        amber: "#ff9838",
        magenta: "#ff2d78",
        pink: "#ff5fa2",
        violet: "#a855f7",
      },
      fontFamily: {
        display: ["var(--font-display)", "Space Grotesk", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      keyframes: {
        "spin-slow": { to: { "--a": "360deg" } },
        marquee: { to: { transform: "translateX(-50%)" } },
        blink: { "50%": { opacity: "0" } },
        pulse2: { "0%,100%": { opacity: ".5" }, "50%": { opacity: "1" } },
      },
      animation: {
        marquee: "marquee 26s linear infinite",
        blink: "blink 1s steps(1) infinite",
        pulse2: "pulse2 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
