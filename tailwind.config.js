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
          bg: '#e8eae3',
          accent: '#fa2742',
          dark: '#373833',
          light: '#e8eae3',
        }
      },
      fontFamily: {
        growtext: ['Space Grotesk', 'Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'solid-primary': 'linear-gradient(0deg, #121a1b 0%, #121a1b 100%)', // Neutralized gradient
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
