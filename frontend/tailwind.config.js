/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          light: '#d2b48c',
          DEFAULT: '#8b5a2b',
          dark: '#5c3a21'
        },
        traditional: {
          red: '#8b0000',
          gold: '#ffd700',
          yellow: '#fdf5e6'
        }
      }
    },
  },
  plugins: [],
}
