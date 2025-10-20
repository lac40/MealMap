/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
    extend: {
      colors: {
        ink: {
          900: '#0F172A',
          700: '#334155',
        },
        surface: {
          50: '#F8FAFC',
          100: '#F1F5F9',
        },
        divider: {
          200: '#E2E8F0',
        },
        primary: {
          50: '#ECFDF5',
          600: '#16A34A',
          700: '#15803D',
        },
        accent: {
          50: '#FFF7ED',
          600: '#EA580C',
        },
        secondary: {
          50: '#EFF6FF',
          600: '#2563EB',
        },
        success: {
          600: '#16A34A',
        },
        warning: {
          600: '#D97706',
        },
        danger: {
          600: '#DC2626',
        },
        info: {
          600: '#2563EB',
        },
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
        'modal': '16px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(2, 6, 23, 0.08)',
        'elevated': '0 8px 24px rgba(2, 6, 23, 0.18)',
      },
      spacing: {
        'header': '64px',
        'nav-collapsed': '80px',
        'nav-expanded': '240px',
      },
    },
  },
  plugins: [],
}
