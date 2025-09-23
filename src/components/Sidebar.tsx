// Sidebar.tsx - Version corrigée avec alignement dark mode fixé
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LogOut, 
  Building, 
  User, 
  X, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';

interface AssociationInfo {
  id: string;
  name: string;
  logo_url: string | null;
}

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  profile: any;
  associationInfo: AssociationInfo | null;
  navigationItems: NavigationItem[];
  onSignOut: () => void;
  loading?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onToggle, 
  profile, 
  associationInfo, 
  navigationItems, 
  onSignOut,
  loading = false
}) => {
  const location = useLocation();

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full dark-bg-secondary border-r border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-16'}
        lg:relative lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 h-16">
          <div className={`transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-0'}`}>
            <Link 
              to="/dashboard"
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              SynerJ
            </Link>
          </div>
          
          {/* Toggle button mobile */}
          <button
            onClick={onToggle}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5 dark-text" />
          </button>
          
          {/* Collapse button desktop */}
          <button
            onClick={onToggle}
            className="hidden lg:flex p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            aria-label={isOpen ? "Réduire la sidebar" : "Étendre la sidebar"}
          >
            {isOpen ? <ChevronLeft className="h-5 w-5 dark-text" /> : <ChevronRight className="h-5 w-5 dark-text" />}
          </button>
        </div>

        {/* CORRIGÉ: Dark Mode Toggle avec alignement correct */}
        <div className={`p-4 border-b border-gray-200 dark:border-gray-700 transition-all duration-200 ${!isOpen ? 'lg:px-2' : ''}`}>
          {isOpen ? (
            // Version étendue : label + toggle alignés
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium dark-text-muted">
                Thème
              </span>
              <DarkModeToggle />
            </div>
          ) : (
            // Version repliée : toggle centré uniquement
            <div className="flex justify-center">
              <DarkModeToggle />
            </div>
          )}
        </div>

        {/* Association info */}
        {!loading && associationInfo && (
          <div className={`p-4 border-b border-gray-200 dark:border-gray-700 transition-all duration-200 ${!isOpen ? 'lg:px-2' : ''}`}>
            <div className={`flex items-center space-x-3 ${!isOpen ? 'lg:justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                {associationInfo.logo_url ? (
                  <img 
                    src={associationInfo.logo_url} 
                    alt={`Logo ${associationInfo.name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent && !parent.querySelector('.fallback-icon')) {
                        const fallback = document.createElement('div');
                        fallback.className = 'fallback-icon flex items-center justify-center w-full h-full';
                        fallback.innerHTML = '<svg class="w-5 h-5 text-gray-400 dark:text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4l-1-1-1 1-1-1-1 1V5z" clip-rule="evenodd"></path></svg>';
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <Building className="w-5 h-5 text-gray-400 dark:text-slate-400" />
                )}
              </div>
              <div className={`transition-all duration-200 min-w-0 ${isOpen ? 'opacity-100 flex-1' : 'opacity-0 w-0 lg:opacity-0 lg:w-0'} overflow-hidden`}>
                <div className="text-sm font-medium dark-text truncate">
                  {associationInfo.name}
                </div>
                <div className="text-xs dark-text-muted">Association</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    // Fermer la sidebar mobile après navigation
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                  className={`
                    group flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
                      : 'dark-text-muted hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }
                    ${!isOpen ? 'lg:justify-center lg:px-2' : ''}
                  `}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className={`ml-3 transition-all duration-200 whitespace-nowrap ${
                    isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 lg:opacity-0 lg:-translate-x-2'
                  } overflow-hidden`}>
                    {item.label}
                  </span>
                  
                  {/* Tooltip pour mode collapsed sur desktop */}
                  {!isOpen && (
                    <div className="hidden lg:group-hover:block absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-200 text-xs rounded whitespace-nowrap z-50 pointer-events-none">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Profil utilisateur et déconnexion */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          {/* Info profil */}
          <div className={`flex items-center space-x-3 mb-3 ${!isOpen ? 'lg:justify-center lg:px-0' : ''}`}>
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Photo de profil"
                className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600 flex-shrink-0">
                <User className="h-4 w-4 text-gray-400 dark:text-slate-400" />
              </div>
            )}
            <div className={`transition-all duration-200 min-w-0 ${
              isOpen ? 'opacity-100 flex-1' : 'opacity-0 w-0 lg:opacity-0 lg:w-0'
            } overflow-hidden`}>
              <div className="text-sm font-medium dark-text truncate">
                {profile?.first_name} {profile?.last_name}
              </div>
              <div className="text-xs dark-text-muted">{profile?.role}</div>
            </div>
          </div>

          {/* Bouton déconnexion */}
          <button
            onClick={onSignOut}
            className={`
              group w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors relative
              ${!isOpen ? 'lg:justify-center lg:px-2' : ''}
            `}
            title={!isOpen ? 'Déconnexion' : undefined}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className={`ml-3 transition-all duration-200 whitespace-nowrap ${
              isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 lg:opacity-0 lg:-translate-x-2'
            } overflow-hidden`}>
              Déconnexion
            </span>
            
            {/* Tooltip pour mode collapsed */}
            {!isOpen && (
              <div className="hidden lg:group-hover:block absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-200 text-xs rounded whitespace-nowrap z-50 pointer-events-none">
                Déconnexion
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  );
};