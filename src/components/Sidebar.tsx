// ============================================
// SIDEBAR AVEC INTÉGRATION NOTIFICATIONS
// Modifications minimales appliquées à Sidebar.tsx
// ============================================

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

// ============ NOUVEAUX IMPORTS POUR NOTIFICATIONS ============
import { useNotificationBadges } from '../hooks/useNotifications';
import { SidebarNotificationBadge } from './NotificationBadge';

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

  // ============ HOOK NOTIFICATIONS (NOUVEAU) ============
  const { badges, markTypeAsRead } = useNotificationBadges();

  // ============ FONCTION UTILITAIRE (NOUVELLE) ============
  // Détermine le nombre de notifications à afficher pour un item
  const getBadgeCountForItem = (itemPath: string): number => {
    // Mapping : path → types de notifications
    const pathNotificationMap: Record<string, Array<keyof typeof badges>> = {
      '/clubs': ['nouveau_club'],
      '/events': ['nouvel_event'],
      '/equipment-management': ['demande_materiel'],
      '/equipment-reservation': ['reponse_materiel'],
      '/dashboard': ['nouveau_club', 'nouvel_event', 'demande_materiel', 'reponse_materiel']
    };

    const relevantTypes = pathNotificationMap[itemPath] || [];
    return relevantTypes.reduce((total, type) => total + badges[type], 0);
  };

  // ============================================
  // FONCTION handleNavItemClick MODIFIÉE AVEC LOGS
  // ============================================
  const handleNavItemClick = (itemPath: string) => {
    console.log('🔍 Navigation vers:', itemPath); // LOG AJOUTÉ
  
    const pathNotificationMap: Record<string, Array<keyof typeof badges>> = {
      '/clubs': ['nouveau_club'],
      '/events': ['nouvel_event'],
      '/equipment-management': ['demande_materiel'],
      '/equipment-reservation': ['reponse_materiel']
    };
  
    const relevantTypes = pathNotificationMap[itemPath] || [];
    console.log('🔍 Types de notification concernés:', relevantTypes); // LOG AJOUTÉ
    console.log('🔍 Badges actuels:', badges); // LOG AJOUTÉ
  
    relevantTypes.forEach(type => {
      if (badges[type] > 0) {
        console.log(`🔍 Suppression des notifications de type: ${type}`); // LOG AJOUTÉ
        markTypeAsRead(type);
      } else {
        console.log(`🔍 Pas de notification de type ${type} à supprimer`); // LOG AJOUTÉ
      }
    });
  
    // Fermer la sidebar mobile après navigation (LOGIQUE EXISTANTE)
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      {/* Overlay pour mobile - INCHANGÉ */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar - STRUCTURE IDENTIQUE */}
      <div className={`
        fixed left-0 top-0 h-full dark-bg-secondary border-r border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-16'}
        lg:relative lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Header sidebar - INCHANGÉ */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 h-16">
          <div className={`transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-0'}`}>
            <Link 
              to="/dashboard"
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              SynerJ
            </Link>
          </div>
          
          {/* Toggle buttons - INCHANGÉ */}
          <button
            onClick={onToggle}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5 dark-text" />
          </button>
          
          <button
            onClick={onToggle}
            className="hidden lg:flex p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            aria-label={isOpen ? "Réduire la sidebar" : "Étendre la sidebar"}
          >
            {isOpen ? <ChevronLeft className="h-5 w-5 dark-text" /> : <ChevronRight className="h-5 w-5 dark-text" />}
          </button>
        </div>

        {/* Dark Mode Toggle - INCHANGÉ */}
        <div className={`p-4 border-b border-gray-200 dark:border-gray-700 transition-all duration-200 ${!isOpen ? 'lg:px-2' : ''}`}>
          <DarkModeToggle className={`${isOpen ? 'w-full' : 'lg:w-auto'}`} />
        </div>

        {/* Association Info - INCHANGÉ */}
        {!loading && associationInfo && (
          <div className={`p-4 border-b border-gray-200 dark:border-gray-700 transition-all duration-200 ${!isOpen ? 'lg:p-2' : ''}`}>
            <div className={`flex items-center space-x-3 ${!isOpen ? 'lg:justify-center lg:space-x-0' : ''}`}>
              {associationInfo.logo_url ? (
                <img
                  src={associationInfo.logo_url}
                  alt="Logo association"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-gray-200 dark:border-gray-600"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <Building className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
              )}
              
              <div className={`transition-all duration-200 ${isOpen ? 'opacity-100 flex-1' : 'opacity-0 w-0 lg:opacity-0 lg:w-0'} overflow-hidden`}>
                <div className="text-sm font-medium dark-text truncate">
                  {associationInfo.name}
                </div>
                <div className="text-xs dark-text-muted">Association</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation - MODIFIÉE POUR INTÉGRER LES BADGES */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              // ========== CALCUL DU BADGE (NOUVEAU) ==========
              const badgeCount = getBadgeCountForItem(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => handleNavItemClick(item.path)} // MODIFICATION : ajout du handler
                  className={`
                    group relative flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
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
                  
                  {/* ========== BADGE DE NOTIFICATION (NOUVEAU) ========== */}
                  {badgeCount > 0 && (
                    <div className={`
                      flex-shrink-0 transition-all duration-200
                      ${isOpen ? 'ml-auto' : 'lg:absolute lg:-top-1 lg:-right-1'}
                    `}>
                      <SidebarNotificationBadge
                        count={badgeCount}
                        type="nouveau_club" // Type générique pour la couleur (sera déterminé par le composant)
                        isCollapsed={!isOpen}
                      />
                    </div>
                  )}
                  
                  {/* Tooltip pour mode collapsed - MODIFIÉ POUR INCLURE LE BADGE */}
                  {!isOpen && (
                    <div className="hidden lg:group-hover:block absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-200 text-xs rounded whitespace-nowrap z-50 pointer-events-none">
                      {item.label}
                      {badgeCount > 0 && (
                        <span className="ml-1 text-red-400">({badgeCount})</span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Profil utilisateur et déconnexion - INCHANGÉ */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className={`flex items-center space-x-3 mb-3 ${!isOpen ? 'lg:justify-center lg:px-0' : ''}`}>
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Photo de profil"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-gray-200 dark:border-gray-600"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </div>
            )}
            
            <div className={`transition-all duration-200 ${isOpen ? 'opacity-100 flex-1' : 'opacity-0 w-0 lg:opacity-0 lg:w-0'} overflow-hidden`}>
              <div className="text-sm font-medium dark-text truncate">
                {profile?.first_name} {profile?.last_name}
              </div>
              <div className="text-xs dark-text-muted">{profile?.role}</div>
            </div>
          </div>

          <button
            onClick={onSignOut}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
              !isOpen ? 'lg:justify-center lg:space-x-0' : ''
            }`}
            title={!isOpen ? 'Déconnexion' : undefined}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className={`transition-all duration-200 whitespace-nowrap ${
              isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 lg:opacity-0 lg:-translate-x-2'
            } overflow-hidden`}>
              Déconnexion
            </span>
          </button>
        </div>
      </div>
    </>
  );
};