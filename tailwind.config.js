/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tesla: {
          300: '#f28084',
          400: '#ed4f54',
          500: '#E82127',
          600: '#c91c22',
          700: '#9e151a',
        },
      },
    },
  },
  plugins: [],
};
