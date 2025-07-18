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
          // Colores Primarios - mejorados para mejor contraste
          primary: {
            DEFAULT: '#4A828C',
            light: '#6B9BA4',
            dark: '#3A6B73',
          },
          // Colores Secundarios  
          accent: {
            DEFAULT: '#D2A384',
            light: '#E1B89C',
            dark: '#C4956B',
          },
          // Neutros - expandidos para mejor jerarquía
          dark: {
            DEFAULT: '#1E2A38',
            900: '#2D3748',
            700: '#4A5568',
            500: '#718096',
            300: '#CBD5E0',
            100: '#F7FAFC',
          },
          // Estados - nuevos para feedback
          success: '#48BB78',
          warning: '#ED8936',
          error: '#F56565',
          info: '#4299E1',
        },
        fontFamily: {
          heading: ['Montserrat', ...defaultTheme.fontFamily.sans],
          body: ['Nunito Sans', ...defaultTheme.fontFamily.sans],
          mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
        },
        fontSize: {
          // Escala tipográfica 1.25 ratio
          'xs': '0.75rem',    // 12px
          'sm': '0.875rem',   // 14px
          'base': '1rem',     // 16px
          'lg': '1.125rem',   // 18px
          'xl': '1.25rem',    // 20px
          '2xl': '1.5rem',    // 24px
          '3xl': '1.875rem',  // 30px
          '4xl': '2.25rem',   // 36px
          '5xl': '3rem',      // 48px
        },
        spacing: {
          // Sistema de espaciado consistente
          '18': '4.5rem',     // 72px
          '88': '22rem',      // 352px
        }
      },
    },
    plugins: [require('@tailwindcss/typography')],
}
  