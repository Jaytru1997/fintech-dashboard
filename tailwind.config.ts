import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // From colors.json
        gray: {
          800: "#808080",
        },
        black: "#000000",
        primary: {
          DEFAULT: "#01B28B",
          dark: "#4EBE96",
        },
        blue: {
          DEFAULT: "#0C6CF2",
          light: "#B7C9E2",
          medium: "#3C54CC",
          bright: "#4763F0",
          sky: "#5F9FFF",
        },
        background: {
          DEFAULT: "#F8F6FF",
          dark: "#03050A",
          darker: "#050024",
          darkest: "#08091A",
        },
        white: "#FFFFFF",
        error: "#FF3344",
        purple: {
          DEFAULT: "#6226D9",
          light: "#DED9E8",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Arial", "Helvetica", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

