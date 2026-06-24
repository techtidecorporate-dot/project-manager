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
          purple: '#453abc',
          cyan: '#60c3e3',
        },
        primary: {
          light: '#030213',
          dark: 'oklch(0.985 0 0)',
        },
        background: {
          light: '#ffffff',
          dark: 'oklch(0.145 0 0)',
        },
        foreground: {
          light: 'oklch(0.145 0 0)',
          dark: 'oklch(0.985 0 0)',
        },
        muted: {
          light: '#717182',
          dark: 'oklch(0.708 0 0)',
        },
        accent: {
          light: '#e9ebef',
          dark: 'oklch(0.269 0 0)',
        },
        destructive: {
          light: '#d4183d',
          dark: 'oklch(0.396 0.141 25.723)',
        },
        border: {
          light: 'rgba(0,0,0,0.1)',
          dark: 'oklch(0.269 0 0)',
        },
        heading: '#191a23',
        body: '#6b7280',
      },
      fontFamily: {
        growtext: ['Space Grotesk', 'Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #453abc 0%, #60c3e3 100%)',
        'solid-primary': 'linear-gradient(0deg, #030213 0%, #030213 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
