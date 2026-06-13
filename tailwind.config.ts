import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50:  '#f0fafa',
          100: '#d9f2f2',
          200: '#b2e5e5',
          300: '#7dd3d3',
          400: '#40b8b8',
          500: '#289e9e',
          600: '#1e8484',
          700: '#196b6b',
          800: '#175757',
          900: '#164848',
          950: '#0b2d2d',
        },
        sage: {
          50:  '#f4f8f4',
          100: '#e4ede4',
          200: '#c9dcca',
          300: '#a2c3a4',
          400: '#74a377',
          500: '#528555',
          600: '#3f6b42',
          700: '#345637',
          800: '#2c452e',
          900: '#253a27',
          950: '#101f12',
        },
        lavender: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
      },
      fontFamily: {
        display: ['var(--font-plus-jakarta)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans:    ['var(--font-dm-sans)',       'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-dm-mono)',       'ui-monospace',  'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft':       '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        'card':       '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
        'glow-teal':  '0 0 20px rgba(40,158,158,0.25)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'fade-up':    'fadeUp 0.5s ease-out',
        'slide-in':   'slideIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'typing':     'typing 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:     { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeUp:     { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideIn:    { '0%': { opacity: '0', transform: 'translateX(-10px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        pulseSoft:  { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        typing:     { '0%, 60%, 100%': { transform: 'translateY(0)' }, '30%': { transform: 'translateY(-6px)' } },
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #f0fafa 0%, #f5f5f4 50%, #f4f8f4 100%)',
        'gradient-teal': 'linear-gradient(135deg, #289e9e 0%, #196b6b 100%)',
        'gradient-hero': 'linear-gradient(160deg, #f0fafa 0%, #e4ede4 40%, #fafaf9 100%)',
      },
    },
  },
  plugins: [],
}

export default config
