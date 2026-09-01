/** @type {import('tailwindcss').Config} */
// Shared design tokens — the same values are used in the web dashboard (this file)
// and, later, in the Expo/NativeWind mobile app config, so both read as one product.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand / primary (earthy green — recycling + environment)
        brand: {
          50: "#effaf1",
          100: "#d8f2de",
          200: "#b3e4c0",
          300: "#83d09a",
          400: "#4fb673",
          500: "#2c9c57",
          600: "#1e7d44",
          700: "#196438",
          800: "#17502f",
          900: "#144227",
          950: "#0a2516",
        },
        // Warm accent (earned rupee / positive signal)
        gold: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        // Danger / review
        warning: {
          50: "#fff7ed",
          500: "#f97316",
          600: "#ea580c",
        },
        // Offline / pending sync indicator
        offline: {
          50: "#fefce8",
          500: "#ca8a04",
          600: "#a16207",
        },
        // Neutral palette (warm grey, high contrast for sunlight)
        ink: {
          50: "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#454545",
          900: "#3d3d3d",
          950: "#262626",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Arial",
          "Noto Sans Devanagari",
          "Nirmala UI",
          "sans-serif",
        ],
      },
      borderRadius: {
        "2xl": "1rem",
      },
      fontSize: {
        // Large touch-target friendly scale for low-vision / outdoor use
        "2xs": "0.6875rem",
      },
    },
  },
  plugins: [],
};
