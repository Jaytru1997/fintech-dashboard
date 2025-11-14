import type { Config } from "tailwindcss";

// Tailwind CSS v4 configuration
// Content paths are still defined here
// Theme customization is done in globals.css using @theme directive
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;

