/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#4caf50',
        'primary-dark': '#1b5e20',
        'primary-light': '#e8f5e9',
      },
    },
  },
  plugins: [],
}
