/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        telegram: {
          blue: '#0088cc',
          blueLight: '#6ab3f3',
          blueDark: '#006699',
        }
      }
    },
  },
}
