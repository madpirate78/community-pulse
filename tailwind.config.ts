import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: "var(--bg)",
        surface: "var(--bg-surface)",
        foreground: "var(--text)",
        muted: "var(--text-muted)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          subtle: "var(--accent-subtle)",
          glow: "var(--accent-glow)",
        },
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out both",
        "slide-up": "slide-up 0.6s ease-out both",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "cursor-pulse": "cursor-pulse 1s ease-in-out infinite",
      },
      boxShadow: {
        warm: "0 1px 3px rgba(28, 25, 23, 0.06), 0 4px 12px rgba(28, 25, 23, 0.04)",
        "warm-lg": "0 4px 6px rgba(28, 25, 23, 0.06), 0 10px 24px rgba(28, 25, 23, 0.08)",
        "warm-xl": "0 8px 16px rgba(28, 25, 23, 0.06), 0 20px 40px rgba(28, 25, 23, 0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
