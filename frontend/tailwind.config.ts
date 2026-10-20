import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        barbie: {
          50: '#fff1f8',
          100: '#ffe0f0',
          200: '#ffc2e2',
          300: '#ff94cb',
          400: '#ff5bb0',
          500: '#ff2d95',
          600: '#e5007d',
          700: '#b80063',
          800: '#8c004c',
          900: '#5c0032',
        },
        royal: {
          100: '#ece6ff',
          300: '#c9b8ff',
          500: '#8f6cff',
          700: '#5b3fd6',
        },
        gold: { 300: '#ffe58a', 500: '#f5c542', 700: '#c99a1a' },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
        sans: ['Quicksand', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 10px 40px -10px rgba(255, 45, 149, 0.45)',
        card: '0 20px 50px -20px rgba(140, 0, 76, 0.25)',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        twinkle: { '0%, 100%': { opacity: '0.2', transform: 'scale(0.7)' }, '50%': { opacity: '1', transform: 'scale(1.2)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        rise: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        twinkle: 'twinkle 2.4s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        rise: 'rise 0.7s ease-out both',
      },
    },
  },
  plugins: [],
} satisfies Config;
