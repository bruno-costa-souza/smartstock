/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#0a0f1a',
        },
        brand: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8ecdff',
          400: '#59b0ff',
          500: '#338fff',
          600: '#1b6ef5',
          700: '#1457e1',
          800: '#1746b6',
          900: '#193e8f',
          950: '#142757',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        script: ['Yellowtail', 'cursive'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(56, 152, 255, 0.35), 0 4px 12px rgba(0, 0, 0, 0.35)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.30), 0 4px 12px rgba(0, 0, 0, 0.35)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.35)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.08)' },
          '66%': { transform: 'translate(-25px, 25px) scale(0.95)' },
        },
        'float-alt': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(-35px, 30px) scale(1.05)' },
          '66%': { transform: 'translate(25px, -30px) scale(0.92)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out both',
        'fade-in': 'fade-in 0.3s ease-out both',
        float: 'float 18s ease-in-out infinite',
        'float-alt': 'float-alt 22s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
