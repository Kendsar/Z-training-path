/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF6E8',
          100: '#FEEACB',
          200: '#FDD49F',
          300: '#FCBE72',
          400: '#FBA845',
          500: '#FF9218', // Primary orange
          600: '#E67700',
          700: '#BF5C00',
          800: '#994000',
          900: '#722C00',
          950: '#4D1D00',
        },
        accent: {
          50: '#E8F5FF',
          100: '#D0EAFF',
          200: '#A1D5FF',
          300: '#72C0FF',
          400: '#42AAFF',
          500: '#1395FF', // Accent blue
          600: '#0080FF',
          700: '#0066CC',
          800: '#004D99',
          900: '#003366',
          950: '#002244',
        },
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981', // Success green
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        kai: {
          50: '#FFF2E6',
          100: '#FFE1CC',
          200: '#FFC499',
          300: '#FFA466',
          400: '#FF8533',
          500: '#FF6600', // Kai energy
          600: '#CC5200',
          700: '#993D00',
          800: '#662900',
          900: '#331400',
          950: '#1A0A00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'power-pulse': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'power-pulse': 'power-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      boxShadow: {
        'kai': '0 0 15px rgba(255, 102, 0, 0.5)',
      },
    },
  },
  plugins: [],
};