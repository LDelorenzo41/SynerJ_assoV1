// src/components/MobileBottomNav.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, Settings, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  onMenuClick: () => void;
  userRole?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
  onMenuClick,
  userRole 
}) => {
  const location = useLocation();

  // Navigation adaptée selon le rôle
  const getNavItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Accueil', icon: Home },
    ];

    if (userRole === 'Super Admin') {
      baseItems.push(
        { path: '/clubs', label: 'Clubs', icon: Users },
        { path: '/communications', label: 'Comm', icon: Calendar },
      );
    } else if (userRole === 'Club Admin') {
      baseItems.push(
        { path: '/events', label: 'Événements', icon: Calendar },
        { path: '/my-club', label: 'Mon Club', icon: Users },
      );
    } else {
      baseItems.push(
        { path: '/events', label: 'Événements', icon: Calendar },
        { path: '/clubs', label: 'Clubs', icon: Users },
      );
    }

    baseItems.push({ path: '/settings', label: 'Réglages', icon: Settings });

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
        
        {/* Bouton Menu pour accéder au reste */}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center flex-1 h-full text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Menu className="h-6 w-6" />
          <span className="text-xs mt-1">Menu</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;