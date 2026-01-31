/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4caf50',
        secondary: '#2e7d32',
        accent: '#66bb6a',
        dark: '#1b5e20',
        'light-green': '#e8f5e9',
      },
    },
  },
  plugins: [],
}
