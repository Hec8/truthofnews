import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs primaires du blog politique Bénin
        primary: {
          DEFAULT: "#1a3a6b",
          50: "#eff4ff",
          100: "#dbe8fe",
          200: "#bfd3fe",
          300: "#93b4fd",
          400: "#6090fa",
          500: "#3b6ef6",
          600: "#2550eb",
          700: "#1d3fd8",
          800: "#1e35af",
          900: "#1a3a6b",
          950: "#172554",
        },
        accent: {
          DEFAULT: "#c8a217",
          light: "#f5d65e",
        },
        benin: {
          green: "#008751",
          yellow: "#fcd116",
          red: "#e8112d",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#374151",
            h1: { fontFamily: "var(--font-playfair)" },
            h2: { fontFamily: "var(--font-playfair)" },
            h3: { fontFamily: "var(--font-playfair)" },
          },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
