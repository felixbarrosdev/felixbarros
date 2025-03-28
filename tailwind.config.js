/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
    content: [
      "./*.php",
      "./parts/**/*.php",
      "./templates/**/*.php"
    ],
    theme: {
      extend: {
        colors: {
            primary: '#4A828C',
            accent: '#D2A384',
            secondary: '#3F5776',
            dark: '#1E2A38',
        },
        fontFamily: {
          title: ['Montserrat', ...defaultTheme.fontFamily.sans],
          body: ['Nunito Sans', ...defaultTheme.fontFamily.sans],
        },
      },
    },
    plugins: [require('@tailwindcss/typography')],
}
  