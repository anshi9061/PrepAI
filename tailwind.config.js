/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#4B8BFF',
          purple: '#7C53FF',
          mint: '#6EE7B7',
          navy: '#1E293B',
        },
      },
      fontFamily: {
        sans: ['Inter'],
        display: ['Poppins'],
      },
    },
  },
  plugins: [],
};
