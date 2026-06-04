/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{jsx,js}",
    "./components/**/*.{jsx,js}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0f0f0f',
          sidebar: '#1a1a2e',
          card: '#1c1c1e',
          border: '#2d2d3a',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#5558e6',
        },
        income: '#22c55e',
        expense: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
