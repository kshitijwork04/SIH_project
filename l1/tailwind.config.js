/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#16a34a",
          light: "#22c55e",
          dark: "#15803d",
        },
      },
    },
  },
  plugins: [],
};
