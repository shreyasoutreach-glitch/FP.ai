/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        fp: {
          bg: '#090d0b',
          surface: '#101713',
          card: '#141c17',
          border: '#29372d',
          accent: '#9ab99a',
          'accent-glow': '#b2cbb0',
          critical: '#dc7770',
          high: '#d58b65',
          medium: '#c7aa70',
          low: '#8eae8c',
          text: '#f0f2ed',
          muted: '#9ba79b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
        'fade-up': 'fadeUp 0.4s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(154,185,154,0.12)' },
          '100%': { boxShadow: '0 0 18px rgba(154,185,154,0.24)' },
        }
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(154,185,154,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(154,185,154,0.035) 1px, transparent 1px)',
      },
      backgroundSize: { 'grid': '40px 40px' },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
