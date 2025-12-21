/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // ⬅️ Required to use 'dark:' classes via HTML class
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        tight: ["Inter Tight", "Inter", "system-ui", "sans-serif"],
      },
      stroke: {
        green: '#22c55e',
        yellow: '#facc15',
        red: '#ef4444',
      },
      keyframes: {
        'fade-slide-in': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-top': {
          '0%': { opacity: 0, transform: 'translateY(-20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      animation: {
        'fade-slide-in': 'fade-slide-in 0.4s ease-out forwards',
        'slide-top': 'slide-top 0.4s ease-out forwards',
        'fade-in': 'fade-in .5s ease-in-out forwards',

      },
    },
  },
  plugins: [],
};
