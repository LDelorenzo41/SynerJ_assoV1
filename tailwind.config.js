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
        },

        // ============================================================
        // DESIGN SYSTEM "Direction A — papier chaleureux"
        // Tokens additifs : utilisables via bg-papier, text-encre, etc.
        // Les valeurs pointent vers les CSS variables de src/index.css
        // pour basculer automatiquement en dark mode (Phase 1b).
        // ============================================================
        papier: {
          DEFAULT: 'var(--papier)',
          2: 'var(--papier-2)',
          3: 'var(--papier-3)',
        },
        encre: {
          DEFAULT: 'var(--encre)',
          2: 'var(--encre-2)',
          3: 'var(--encre-3)',
        },
        terracotta: {
          DEFAULT: 'var(--terracotta)',
          deep: 'var(--terracotta-deep)',
          soft: 'var(--accent-soft)',
        },
        highlight: {
          DEFAULT: 'var(--highlight)',
          soft: 'var(--highlight-soft)',
        },
        ds: {
          success: 'var(--ds-success)',
          'success-soft': 'var(--ds-success-soft)',
          warning: 'var(--ds-warning)',
          'warning-soft': 'var(--ds-warning-soft)',
          danger: 'var(--ds-danger)',
          'danger-soft': 'var(--ds-danger-soft)',
          info: 'var(--ds-info)',
          'info-soft': 'var(--ds-info-soft)',
        },
        club: {
          volley: 'var(--club-volley)',
          'volley-soft': 'var(--club-volley-soft)',
          theatre: 'var(--club-theatre)',
          'theatre-soft': 'var(--club-theatre-soft)',
          photo: 'var(--club-photo)',
          'photo-soft': 'var(--club-photo-soft)',
          rando: 'var(--club-rando)',
          'rando-soft': 'var(--club-rando-soft)',
          echecs: 'var(--club-echecs)',
          'echecs-soft': 'var(--club-echecs-soft)',
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'ds-sm': '8px',
        'ds-md': '14px',
        'ds-lg': '20px',
      },
      boxShadow: {
        'ds-sm': '0 1px 2px rgba(31,27,22,.04), 0 2px 6px rgba(31,27,22,.04)',
        'ds-md': '0 2px 4px rgba(31,27,22,.05), 0 8px 18px rgba(31,27,22,.06)',
        'ds-lg': '0 4px 10px rgba(31,27,22,.06), 0 16px 36px rgba(31,27,22,.10)',
      },
      keyframes: {
        likepulse: {
          '0%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.3)' },
          '60%': { transform: 'scale(.92)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeup: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        likepulse: 'likepulse .4s ease',
        fadeup: 'fadeup .26s ease both',
      },
    },
  },
  plugins: [],
};
