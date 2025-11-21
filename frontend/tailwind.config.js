/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Enhanced color palette with CSS color-mix
      colors: {
        border: "color-mix(in oklab, var(--border) 100%, transparent 0%)",
        input: "color-mix(in oklab, var(--input) 100%, transparent 0%)",
        ring: "color-mix(in oklab var(--ring) 100%, transparent 0%)",
        background: "color-mix(in oklab var(--background) 100%, transparent 0%)",
        foreground: "color-mix(in oklab var(--foreground) 100%, transparent, 0%)",

        // Primary with color mixing for better gradients
        primary: {
          50: "color-mix(in oklab, var(--primary) 5%, white 95%)",
          100: "color-mix(in oklab, var(--primary) 10%, white 90%)",
          200: "color-mix(in oklab, var(--primary) 20%, white 80%)",
          300: "color-mix(in oklab, var(--primary) 30%, white 70%)",
          400: "color-mix(in oklab, var(--primary) 40%, white 60%)",
          DEFAULT: "hsl(var(--primary))",
          600: "color-mix(in oklab, var(--primary) 60%, white 40%)",
          700: "color-mix(in oklab, var(--primary) 70%, white 30%)",
          800: "color-mix(in oklab, var(--primary) 80%, white 20%)",
          900: "color-mix(in oklab, var(--primary) 90%, white 10%)",
          950: "color-mix(in oklab, var(--primary) 95%, white 5%)",
          foreground: "hsl(var(--primary-foreground))",
        },

        // Enhanced destructive colors
        destructive: {
          50: "color-mix(in oklab, var(--destructive) 5%, white 95%)",
          100: "color-mix(in oklab, var(--destructive) 10%, white 90%)",
          DEFAULT: "hsl(var(--destructive))",
          600: "color-mix(in oklab, var(--destructive) 60%, white 40%)",
          900: "color-mix(in oklab, var(--destructive) 90%, white 10%)",
          foreground: "hsl(var(--destructive-foreground))",
        },

        // Enhanced warning colors
        warning: {
          50: "color-mix(in oklab, var(--warning) 5%, white 95%)",
          100: "color-mix(in oklab, var(--warning) 10%, white 90%)",
          DEFAULT: "hsl(var(--warning))",
          600: "color-mix(in oklab, var(--warning) 60%, white 40%)",
          900: "color-mix(in oklab, var(--warning) 90%, white 10%)",
          foreground: "hsl(var(--warning-foreground))",
        },

        disaster: {
          earthquake: {
            light: '#fef3c7',
            DEFAULT: '#dd97706',
            dark: '#92400e',
          },
          flood: {
            light: '#dbeafe',
            DEFAULT: '#2563eb',
            dark: '#1e40af',
          },
          storm: {
            light: '#e0e7ff',
            DEFAULT: '#4f46e5',
            dark: '#3730a3',
          },
          wildfire: {
            light: '#fef2f2',
            DEFAULT: '#dc2626',
            dark: '#991b1b',
          },
          volcanic: {
            light: '#f5f5f4',
            DEFAULT: '#57534e',
            dark: '#292524',
          },
          tsunami: {
            light: '#ecfeff',
            DEFAULT: '#0d9488',
            dark: '#115e59',
          }
        }
      },

      // Enhanced spacing system
      spacing: {
        '0.5': '0.125rem',
        '1': '0.25rem',
        '1.5': '0.375rem',
        '2': '0.5rem',
        '2.5': '0.625rem',
        '3': '0.75rem',
        '3.5': '0.875rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
        '11': '2.75rem',
        '12': '3rem',
        '14': '3.5rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '28': '7rem',
        '32': '8rem',
        '36': '9rem',
        '40': '10rem',
        '44': '11rem',
        '48': '12rem',
        '52': '13rem',
        '56': '14rem',
        '60': '15rem',
        '64': '16rem',
        '72': '18rem',
        '80': '20rem',
        '96': '24rem',
      },

      // Enhanced typography
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },

      // Enhanced animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },

      // Container queries support
      containers: {
        'xs': '20rem',
        'sm': '24rem',
        'md': '28rem',
        'lg': '32rem',
        'xl': '36rem',
        '2xl': '42rem',
        '3xl': '48rem',
        '4xl': '56rem',
        '5xl': '64rem',
        '6xl': '72rem',
        '7xl': '80rem',
      },

      // Backdrop filters
      backdropBlur: {
        xs: '2px',
      },

      // Enhanced box shadow
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.5)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.1)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.25)',
        'glow': '0 0 20px rgb(59 130 246 / 0.1)',
        'glow-lg': '0 0 40px rgb(59 130 246 / 0.15)',
      },

      // Enhanced border radius
      borderRadius: {
        'lg': 'var(--radius)',
        'md': 'calc(var(--radius) - 2px)',
        'sm': 'calc(var(--radius) - 4px)',
        'xl': 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': 'calc(var(--radius) + 16px)',
      },
    },
  },
  plugins: [
    // Container queries plugin
    function({ addUtilities }) {
      addUtilities({
        '.@container': {
          'container-type': 'inline-size',
        },
        '.@container-normal': {
          'container-type': 'normal',
        },
        '.@container-size': {
          'container-type': 'size',
        },
      })
    },

    // Advanced gradient utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.bg-gradient-conic': {
          background: 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        },
        '.bg-gradient-radial': {
          background: 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        },
        '.bg-shimmer': {
          background: `linear-gradient(90deg, transparent, ${theme('colors.primary.100')}, transparent)`,
          backgroundSize: '200% 100%',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}