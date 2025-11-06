/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        futuristic: ['Orbitron', 'sans-serif'],
        modern: ['Poppins', 'sans-serif'],
      },
      colors: {
        neon: {
          blue: '#00FFFF',
          pink: '#FF00FF',
          purple: '#8B5CF6',
        },
        glass: 'rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
