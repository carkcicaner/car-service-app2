/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark-blue': '#0a366a',
        'brand-light-blue': '#229ed8',
        'brand-gray': '#a1a5a7',
      }
    },
  },
  plugins: [],
}

