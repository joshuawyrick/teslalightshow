/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0B0F14',
        charcoal: '#12161C',
        steel: '#182129',
        slate: '#2A313C',
        'electric-blue': '#2D8CFF',
        cyan: '#00D4FF',
        'accent-red': '#FF3B30',
        'text-primary': '#EDEFF3',
        'text-secondary': '#A6ADBA',
        border: '#2F3947',
        'glow-blue': 'rgba(45, 140, 255, 0.4)',
        tesla: {
          300: '#ff6b6b',
          400: '#FF3B30',
          500: '#FF3B30',
          600: '#E5352B',
          700: '#CC2F26',
        },
      },
      fontFamily: {
        heading: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
