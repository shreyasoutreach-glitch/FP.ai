/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        fp: {
          bg: '#0a0f1e',
          surface: '#0f1729',
          card: '#141e35',
          border: '#1e2d4a',
          accent: '#2563eb',
          'accent-glow': '#3b82f6',
          critical: '#dc2626',
          high: '#ea580c',
          medium: '#ca8a04',
          low: '#16a34a',
          text: '#e2e8f0',
          muted: '#64748b',
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
          '0%': { boxShadow: '0 0 5px #2563eb40' },
          '100%': { boxShadow: '0 0 20px #2563eb80, 0 0 40px #2563eb40' },
        }
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
