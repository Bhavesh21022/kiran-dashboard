import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          bg: "#0A0E14",
          panel: "#0F1420",
        },
        risk: {
          low: "#2DD4BF",
          moderate: "#F59E0B",
          high: "#FB6D3A",
          extreme: "#EF4444",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.35)",
        glowLow: "0 0 40px rgba(45,212,191,0.35)",
        glowModerate: "0 0 40px rgba(245,158,11,0.35)",
        glowHigh: "0 0 45px rgba(251,109,58,0.4)",
        glowExtreme: "0 0 55px rgba(239,68,68,0.5)",
      },
      keyframes: {
        pulseSlow: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.06)", opacity: "0.85" },
        },
        shockwave: {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
      },
      animation: {
        pulseSlow: "pulseSlow 3.2s ease-in-out infinite",
        shockwave: "shockwave 1.8s ease-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
