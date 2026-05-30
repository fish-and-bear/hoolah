import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        oxblood: '#5B0E11',
        ivory: '#F4EDE3',
        ink: '#0E0E0E',
        gold: '#D4A24C',
        sage: '#4F7942',
        amber: '#C8A04C',
        slate: '#3A3A3A',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'EB Garamond', 'Georgia', 'serif'],
        sans: [
          'var(--font-sans)',
          'Inter Tight',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      letterSpacing: {
        tight: '-0.01em',
        wordmark: '-0.02em',
      },
      animation: {
        'tile-flip': 'tileFlip 600ms ease-in-out forwards',
        'tile-pop': 'tilePop 120ms ease-out',
        'row-shake': 'rowShake 500ms ease-in-out',
        'win-bounce': 'winBounce 600ms ease-in-out',
        'fade-in': 'fadeIn 200ms ease-out',
      },
      keyframes: {
        tileFlip: {
          '0%': { transform: 'rotateX(0)' },
          '50%': { transform: 'rotateX(-90deg)' },
          '100%': { transform: 'rotateX(0)' },
        },
        tilePop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)' },
        },
        rowShake: {
          '10%, 90%': { transform: 'translateX(-1px)' },
          '20%, 80%': { transform: 'translateX(2px)' },
          '30%, 50%, 70%': { transform: 'translateX(-4px)' },
          '40%, 60%': { transform: 'translateX(4px)' },
        },
        winBounce: {
          '0%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-12px)' },
          '70%': { transform: 'translateY(-3px)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
