/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Groww-inspired green palette
        g: {
          50:  '#e6faf5',
          100: '#b3f0e1',
          200: '#80e6cd',
          300: '#4ddcb8',
          400: '#26d5a8',
          500: '#00d09c', // Groww primary green
          600: '#00b386',
          700: '#00916e',
          800: '#006e53',
          900: '#004b39',
        },
        // Zerodha-style navy/dark
        navy: {
          50:  '#eef3f8',
          100: '#d4e2ed',
          200: '#a9c4db',
          300: '#7ea7c9',
          400: '#5389b7',
          500: '#2d6ca5',
          600: '#1e4f7a',
          700: '#1a3d5f',
          800: '#0d2137',
          900: '#060f1e',
          950: '#030810',
        },
        // Status colors
        positive: '#00d09c',
        negative: '#f96b6b',
        warning: '#fbbf24',
        info: '#5b8eff',
        // Surface
        surface: {
          50:  '#f8fafc',
          100: '#f0f4f8',
          200: '#e2ecf4',
          300: '#c8daea',
          dark: '#0d1b2e',
          'dark-2': '#1a2a3d',
          'dark-3': '#243649',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        xs:   ['12px', { lineHeight: '16px' }],
        sm:   ['13px', { lineHeight: '18px' }],
        base: ['14px', { lineHeight: '20px' }],
        md:   ['15px', { lineHeight: '22px' }],
        lg:   ['16px', { lineHeight: '24px' }],
        xl:   ['18px', { lineHeight: '26px' }],
        '2xl':['20px', { lineHeight: '28px' }],
        '3xl':['24px', { lineHeight: '32px' }],
      },
      borderRadius: {
        'none':  '0',
        'sm':    '6px',
        DEFAULT: '8px',
        'md':    '10px',
        'lg':    '12px',
        'xl':    '14px',
        '2xl':   '16px',
        '3xl':   '20px',
        '4xl':   '24px',
        'full':  '9999px',
      },
      boxShadow: {
        'xs':       '0 1px 2px rgba(0,0,0,0.05)',
        'sm':       '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card':     '0 2px 8px rgba(0,0,0,0.06)',
        'elevated': '0 4px 20px rgba(0,0,0,0.10)',
        'modal':    '0 20px 60px rgba(0,0,0,0.25)',
        'glow-g':   '0 0 20px rgba(0,208,156,0.25)',
        'glow-red': '0 0 20px rgba(249,107,107,0.25)',
        'none':     'none',
      },
      spacing: {
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '68': '17rem',
        '72': '18rem',
        '76': '19rem',
        '80': '20rem',
      },
      animation: {
        'slide-up':     'slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in':      'fadeIn 0.2s ease',
        'shimmer':      'shimmer 1.5s infinite',
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gauge':        'dash 1s ease-in-out forwards',
        'spin-slow':    'spin 3s linear infinite',
      },
      keyframes: {
        slideUp: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        dash: {
          to: { strokeDashoffset: 0 },
        },
      },
    },
  },
  plugins: [],
};
