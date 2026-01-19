/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif', 'system-ui'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#05020a', // Fundo ultra profundo
          deepPurple: '#240a3a', // Roxo para profundidade
          purple: '#7c3aed', // Roxo vibrante
          pink: '#ec4899', // Rosa mágico
          orange: '#f59e0b', // Laranja para contraste (pouco usado)
        }
      },
      dropShadow: {
        // Novo glow muito mais forte para o título principal
        'magical': [
            '0 0 5px rgba(236, 72, 153, 0.8)',
            '0 0 20px rgba(124, 58, 237, 0.6)',
            '0 0 40px rgba(236, 72, 153, 0.4)'
        ],
        'card-hover': '0 0 30px rgba(124, 58, 237, 0.5)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shine': 'shine 3s linear infinite',
        // Animação para as brasas subindo
        'ember-rise': 'emberRise var(--duration, 10s) linear infinite var(--delay, 0s)',
        'twinkle': 'twinkle 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        shine: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        emberRise: {
            '0%': { transform: 'translateY(100vh) scale(0.5)', opacity: 0 },
            '20%': { opacity: 0.8 },
            '80%': { opacity: 0.6 },
            '100%': { transform: 'translateY(-20vh) scale(1.2)', opacity: 0 },
        },
        twinkle: {
            '0%, 100%': { opacity: 0.2, transform: 'scale(0.8)' },
            '50%': { opacity: 1, transform: 'scale(1.2)' },
        }
      },
      backgroundImage: {
        'gradient-magical': 'linear-gradient(to top right, var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}