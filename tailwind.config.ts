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
        ocean: {
          bg: "#0a1628",
          card: "#112240",
          panel: "#0f1d33",
          line: "#1b3558",
          accent: "#00d4aa",
        },
        risk: {
          green: "#22c55e",
          yellow: "#eab308",
          red: "#ef4444",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0, 212, 170, 0.22), 0 24px 80px rgba(0, 0, 0, 0.38)",
        "soft-panel": "0 18px 55px rgba(2, 11, 24, 0.36)",
      },
      backgroundImage: {
        "ocean-radial":
          "radial-gradient(circle at 20% 12%, rgba(0, 212, 170, 0.18), transparent 28%), radial-gradient(circle at 80% 0%, rgba(56, 189, 248, 0.12), transparent 26%), linear-gradient(135deg, #0a1628 0%, #071120 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
