module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        monad: {
          DEFAULT: '#6B46C1',
          50: '#F6F0FB',
          100: '#EADFF6',
          200: '#D5BFF0',
          300: '#C09FEA',
          400: '#AB7FE3',
          500: '#9660DC',
          600: '#6B46C1',
          700: '#523399',
          800: '#3A2271',
          900: '#221349'
        }
      },
      boxShadow: {
        'soft-xl': '0 10px 30px rgba(99,102,241,0.08), 0 2px 6px rgba(2,6,23,0.2)'
      }
    }
  },
  plugins: []
}
