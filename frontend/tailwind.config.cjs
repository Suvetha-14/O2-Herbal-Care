module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#12372A',
        secondary: '#436850',
        accent: '#ADBC9F',
        cream: '#F8F6EF',
        gold: '#C6A15B',
        ink: '#152420'
      },
      fontFamily: {
        heading: ['"Abril Fatface"', 'cursive'],
        sans: ['"Jost"', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(18, 55, 42, 0.08)',
        card: '0 8px 24px -8px rgba(18, 55, 42, 0.18)',
        lift: '0 20px 40px -12px rgba(18, 55, 42, 0.28)',
        glow: '0 0 0 3px rgba(198, 161, 91, 0.25)'
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(18px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(3deg)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        growIn: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' }
        }
      },
      animation: {
        fadeUp: 'fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        floatSlow: 'floatSlow 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        growIn: 'growIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both'
      }
    }
  },
  plugins: []
}
