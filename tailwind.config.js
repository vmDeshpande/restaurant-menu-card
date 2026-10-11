/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f2f6f3",
          100: "#e4ece6",
          200: "#c9dacd",
          300: "#a7c7b1",
          400: "#6f9a7a",
          500: "#4f7a5c",
          600: "#3f6348",
          700: "#355039",
          800: "#2a402d",
          900: "#1f3324",
        },
        cream: {
          50: "#fbfaf7",
          100: "#f6f3ed",
          200: "#efe9dd",
          300: "#e4dccd",
          400: "#d6cab8",
          500: "#c8bca5",
          600: "#a89c85",
          700: "#7a705c",
          800: "#554c3d",
          900: "#2e2820",
        },
        gold: {
          50: "#fcfaf5",
          100: "#f7f2e3",
          200: "#efe2c0",
          300: "#e5cf95",
          400: "#d4b56a",
          500: "#b8943f",
          600: "#96762f",
          700: "#745a25",
          800: "#57431d",
          900: "#3a2e15",
        },
        charcoal: {
          50: "#f6f6f5",
          100: "#ebebe9",
          200: "#d6d6d3",
          300: "#b8b8b3",
          400: "#8a8a84",
          500: "#5c5c56",
          600: "#454540",
          700: "#33332f",
          800: "#232320",
          900: "#141412",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["4.5rem", { lineHeight: "1.05" }],
        "display-lg": ["3.5rem", { lineHeight: "1.1" }],
        "display-md": ["2.75rem", { lineHeight: "1.15" }],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
        lift: "0 4px 6px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)",
        glow: "0 0 0 1px rgba(212,181,106,0.25), 0 8px 32px rgba(0,0,0,0.12)",
      },
      backgroundImage: {
        "gradient-warm":
          "linear-gradient(135deg, rgba(31,51,36,0.85) 0%, rgba(20,20,18,0.7) 100%)",
        "gradient-gold":
          "linear-gradient(135deg, #d4b56a 0%, #b8943f 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.5s ease both",
        "scale-in": "scale-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-up": "slide-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};