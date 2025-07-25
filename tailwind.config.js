/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/public/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ['business', 'corporate']
  }
}

