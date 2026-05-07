/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        royal: {
          gold: '#D4AF37',
          'gold-light': '#F5D76E',
          dark: '#0A0A0F',
          navy: '#0D1B2A',
          deep: '#1B2838',
        },
      },
    },
  },
  plugins: [],
};
