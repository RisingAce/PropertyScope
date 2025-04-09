/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          indigo: {
            950: '#1a1a4a',
          },
          violet: {
            900: '#44337a',
          },
        },
      },
    },
    plugins: [],
  }