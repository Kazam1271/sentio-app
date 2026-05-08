/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#111111',
        primary: '#00f0ff',
        secondary: '#0066ff',
        accent: '#ff9900',
        textMain: '#e0e0e0',
        textMuted: '#888888',
        border: '#222222',
        success: '#00ff66',
        error: '#ff3333'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
