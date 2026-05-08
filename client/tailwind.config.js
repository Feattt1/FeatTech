/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    { pattern: /^bg-primary-/, variants: ['hover'] },
    { pattern: /^text-primary-/, variants: ['hover'] },
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        padel: {
          DEFAULT: '#ccff00', // Neon Padel Ball
          light: '#e6ff80',
          dark: '#99cc00',
        },
        accent: {
          400: '#ccff00', // Using neon yellow/green for accent
          500: '#b3e600',
          600: '#99cc00',
        },
        dark: {
          900: '#0f172a', // slate-900
          800: '#1e293b', // slate-800
          700: '#334155', // slate-700
        }
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 15px rgba(204, 255, 0, 0.4)',
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
};
