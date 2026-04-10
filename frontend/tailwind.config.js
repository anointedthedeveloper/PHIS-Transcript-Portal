/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fff1f1',
          100: '#ffe0e0',
          200: '#ffc5c5',
          300: '#ff9d9d',
          400: '#ff6464',
          500: '#f83535',
          600: '#e51717',
          700: '#c10e0e',
          800: '#9f0f0f',
          900: '#841414',
          950: '#480404',
        }
      }
    }
  },
  plugins: [],
}
