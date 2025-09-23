import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

interface DarkModeToggleProps {
  className?: string;
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ className = '' }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Vérifier le mode sombre au chargement
  useEffect(() => {
    // Vérifier si l'utilisateur a déjà une préférence sauvegardée
    const savedTheme = localStorage.getItem('theme');
    // Sinon, vérifier la préférence système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialDarkMode = savedTheme 
      ? savedTheme === 'dark' 
      : prefersDark;

    setIsDarkMode(initialDarkMode);
    applyTheme(initialDarkMode);
  }, []);

  // Appliquer le thème au document
  const applyTheme = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Basculer entre les modes
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    applyTheme(newDarkMode);
    
    // Sauvegarder la préférence dans le navigateur
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        flex items-center justify-center p-2 rounded-lg transition-all duration-200
        bg-gray-100 hover:bg-gray-200 dark:bg-dark-bg-tertiary dark:hover:bg-dark-hover-primary
        text-gray-700 dark:text-dark-text-primary
        ${className}
      `}
      title={isDarkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
};

export default DarkModeToggle;