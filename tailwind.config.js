/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scans all your component files for Tailwind classes
    "./public/index.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
