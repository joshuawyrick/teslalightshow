/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#000000',
        charcoal: '#121828',
        steel: '#1A2030',
        slate: '#2A313C',
        'electric-cyan': '#00E5FF',
        'accent-red': '#FF2D2D',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A5ADB8',
        border: '#1E2A3A',
        tesla: {
          300: '#ff6b6b',
          400: '#FF2D2D',
          500: '#FF2D2D',
          600: '#E52828',
          700: '#CC2222',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'system-ui', 'sans-serif'],
        heading: ['Orbitron', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
