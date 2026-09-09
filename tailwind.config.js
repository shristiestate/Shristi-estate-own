/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0284c7', // Primary corporate cyan-blue
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
          950: '#051d2d',
        },
        navy: {
          800: '#111827',
          900: '#0B132B',
          950: '#070C1E',
        },
        accent: {
          emerald: '#059669',
          teal: '#0d9488',
          cyan: '#06b6d4',
          indigo: '#4f46e5',
        }
      },
      backdropBlur: {
        xs: '2px',
        md: '12px',
        lg: '20px',
        xl: '28px',
      },
      boxShadow: {
        'glass-sm': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08), 0 2px 12px 0 rgba(0, 0, 0, 0.04)',
        'glass-lg': '0 12px 48px 0 rgba(0, 0, 0, 0.14), 0 4px 16px 0 rgba(0, 0, 0, 0.06)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'glow-cyan': '0 0 24px -4px rgba(2, 132, 199, 0.35)',
        'glow-teal': '0 0 24px -4px rgba(13, 148, 136, 0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
