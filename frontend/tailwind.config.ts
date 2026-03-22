import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Deep warm charcoal palette
        charcoal: {
          950: "#141111", // Deepest background
          900: "#1A1515", // Base app background
          800: "#251C1C", // Dark surfaces, sidebars
          700: "#352B2B", // Elevated cards
          600: "#4C4141", // Borders, secondary elements
          500: "#6B5B5B"
        },
        // The dashboard palette
        coral: {
          DEFAULT: "#EF534F",
          light: "#F27572",
          dark: "#C62828"
        },
        pink: {
          DEFAULT: "#FB7E96",
          dark: "#E3627B"
        },
        flamingo: {
          DEFAULT: "#FFCDD2", // Tertiary light pink
          dim: "#4D3638"
        },
        // Utility
        cream: "#FAF9F9",
        muted: "#B4A6A6"
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem"
      },
      boxShadow: {
        // Replacing glowing with clean, flat drop shadows
        flat: "0 8px 30px rgba(0, 0, 0, 0.4)",
        "flat-sm": "0 4px 20px rgba(0, 0, 0, 0.3)"
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.3s ease-out"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
