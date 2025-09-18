/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: '#ffffff',
          border: '#e5e7eb',
          hover: '#f3f4f6',
          active: '#dbeafe',
          text: '#374151',
          'text-active': '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
};
