/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Inter', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        body: ['Inter', '-apple-system', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'sans-serif'],
      }
    }
  },
  plugins: []
};
