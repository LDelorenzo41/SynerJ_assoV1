/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // NOUVEAU: Active le dark mode avec une classe
  theme: {
    extend: {
      colors: {
        // VOS COULEURS EXISTANTES (conservées)
        sidebar: {
          bg: '#ffffff',
          border: '#e5e7eb',
          hover: '#f3f4f6',
          active: '#dbeafe',
          text: '#374151',
          'text-active': '#1d4ed8',
        },
        
        // NOUVELLES COULEURS pour le dark mode
        dark: {
          // Backgrounds
          bg: {
            primary: '#0f172a',    // Fond principal
            secondary: '#1e293b',  // Cards, modals
            tertiary: '#334155',   // Éléments surélevés
          },
          
          // Bordures
          border: {
            primary: '#334155',
            secondary: '#475569',
          },
          
          // Textes
          text: {
            primary: '#f8fafc',    // Texte principal
            secondary: '#cbd5e1',  // Texte secondaire
            muted: '#94a3b8',      // Texte discret
          },
          
          // États hover/focus
          hover: {
            primary: '#475569',
            secondary: '#64748b',
          },
          
          // Accents (couleurs de votre brand)
          accent: {
            blue: '#3b82f6',
            green: '#10b981',
            purple: '#8b5cf6',
            orange: '#f59e0b',
            red: '#ef4444',
          }
        }
      }
    },
  },
  plugins: [],
};
