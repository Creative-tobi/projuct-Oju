/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // This enables manual dark mode switching by adding the 'dark' class to the HTML tag
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"], // A clean, modern font for healthcare
      },
      colors: {
        primary: {
          light: "#d8b4e2", // Lighter purple for accents/backgrounds
          DEFAULT: "#8e24aa", // Main brand purple
          dark: "#4a148c", // Darker purple for text/hover states
        },
      },
    },
  },
  plugins: [],
};
