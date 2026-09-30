/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: "#00A896",
          dark: "#0F2F38",
          pine: "#0D7A70",
          light: "#E6FFFA",
        },
        emergency: {
          red: "#DC2626",
          crimson: "#E11D48",
          soft: "#FFF5F5",
        },
        pastel: {
          teal: "#E6FFFA",
          tealBorder: "#B2F5EA",
          red: "#FFF5F5",
          redBorder: "#FED7D7",
          blue: "#EBF8FF",
          blueBorder: "#BEE3F8",
          yellow: "#FEFCBF",
          yellowBorder: "#FEF08A",
          purple: "#FAF5FF",
          purpleBorder: "#E9D8FD",
          green: "#F0FFF4",
          greenBorder: "#C6F6D5",
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'Noto Sans Tamil', 'system-ui', 'sans-serif'],
        tamil: ['Noto Sans Tamil', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'glow-teal': '0 0 25px -5px rgba(0, 168, 150, 0.4)',
        'glow-red': '0 0 25px -5px rgba(220, 38, 38, 0.5)',
        'card': '0 4px 20px -2px rgba(15, 47, 56, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
