/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
    content: [
      "./*.php",
      "./parts/**/*.php",
      "./templates/**/*.php",
      "./assets/js/**/*.js"
    ],
    safelist: [
      'hidden',
      'md:hidden',
      'md:block',
      'flex',
      'flex-col',
      'justify-center',
      'items-center',
      'space-y-1',
      'space-y-2',
      'mt-4',
      'pb-4',
      'pt-4',
      'border-t',
      'border-dark-700',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-accent-light',
      'rounded',
      'block',
      'px-4',
      'py-3',
      'hover:bg-dark-700',
      'text-3xl',
      'text-2xl',
      'text-xl',
      'text-lg',
      'text-base',
      'text-sm',
      'md:text-5xl',
      'md:text-4xl',
      'md:text-3xl',
      'md:text-2xl',
      'md:text-xl',
      'md:text-lg',
      'fixed',
      'top-0',
      'left-0',
      'right-0',
      'z-50',
      'transition-transform',
      'duration-300',
      'ease-in-out',
      'bg-dark-100',
      'border-l-4',
      'border-primary',
      'rounded-lg',
      'p-6',
      'space-x-4',
      'flex-shrink-0',
      'rounded-full',
      'flex-1',
      'min-w-0',
      'space-x-2',
      'mb-2',
      'font-semibold',
      'text-dark',
      'text-dark-500',
      'text-dark-700',
      'leading-relaxed',
      'mt-3',
      'space-x-4',
      'text-primary',
      'hover:text-primary-dark',
      'font-medium',
      'space-y-6',
      'mb-8'
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
  