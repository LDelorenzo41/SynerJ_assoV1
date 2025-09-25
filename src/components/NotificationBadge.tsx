// ============================================
// COMPOSANT BADGE DE NOTIFICATION
// Fichier : src/components/NotificationBadge.tsx
// ============================================

import React from 'react';
// On importe le type 'Variants' pour être plus explicite, c'est une bonne pratique.
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface NotificationBadgeProps {
  count: number;
  variant?: 'default' | 'small' | 'large';
  color?: 'red' | 'blue' | 'green' | 'orange';
  showZero?: boolean;
  animate?: boolean;
  className?: string;
  'aria-label'?: string;
}

/**
 * Badge de notification réutilisable
 * Compatible avec le design system existant de SynerJ
 */
export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  variant = 'default',
  color = 'red',
  showZero = false,
  animate = true,
  className = '',
  'aria-label': ariaLabel
}) => {
  // ======================= CORRECTION APPLIQUÉE ICI (Logique d'animation) =======================
  // La logique `if (count === 0 && !showZero) return null;` est déplacée dans un conteneur
  // AnimatePresence pour permettre une animation de sortie propre.

  // ======================= CORRECTION APPLIQUÉE ICI (Variants) =======================
  // On simplifie les variants. L'état "visible" inclut maintenant l'animation de pulsation.
  // Cela résout à la fois le conflit de type TypeScript et le problème de logique.
  const badgeVariants: Variants = {
    hidden: { 
      scale: 0, 
      opacity: 0,
      transition: { duration: 0.2 }
    },
    visible: {
      opacity: 1,
      scale: [1, 1.15, 1], // Animation de pulsation directement via les keyframes
      transition: {
        // La pulsation se répète à l'infini
        scale: {
          duration: 1,
          repeat: Infinity,
          repeatDelay: 1.5,
          ease: "easeInOut"
        }
      }
    }
  };

  // Classes CSS selon la variante et la couleur
  const getVariantClasses = () => {
    const baseClasses = 'font-medium rounded-full flex items-center justify-center';
    
    switch (variant) {
      case 'small':
        return `${baseClasses} text-xs px-1.5 py-0.5 min-w-[18px] h-[18px]`;
      case 'large':
        return `${baseClasses} text-sm px-3 py-1 min-w-[24px] h-[24px]`;
      case 'default':
      default:
        return `${baseClasses} text-xs px-2 py-0.5 min-w-[20px] h-[20px]`;
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'green':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'orange':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      case 'red':
      default:
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
    }
  };

  // Formatage du nombre (ex: 99+ si > 99)
  const formatCount = (num: number): string => {
    if (num > 99) return '99+';
    return num.toString();
  };

  // ======================= CORRECTION APPLIQUÉE ICI (Structure du composant) =======================
  // On supprime la variable `badgeContent` et la double structure de retour.
  // On utilise AnimatePresence pour gérer l'apparition/disparition du badge.
  // Le composant retourne maintenant une seule structure JSX, beaucoup plus propre.
  return (
    <AnimatePresence>
      { animate && (count > 0 || showZero) && (
        <motion.span
          className={`
            ${getVariantClasses()}
            ${getColorClasses()}
            ${className}
          `}
          variants={badgeVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          whileHover={{ scale: 1.05 }}
          aria-label={ariaLabel || `${count} notification${count > 1 ? 's' : ''} non lue${count > 1 ? 's' : ''}`}
        >
          {formatCount(count)}
        </motion.span>
      )}
    </AnimatePresence>
  );
};

// ============================================
// BADGE SPÉCIALISÉ POUR LA SIDEBAR
// (Aucune modification nécessaire ici)
// ============================================

interface SidebarNotificationBadgeProps {
  count: number;
  type: 'nouveau_club' | 'nouvel_event' | 'demande_materiel' | 'reponse_materiel';
  isCollapsed?: boolean;
}

export const SidebarNotificationBadge: React.FC<SidebarNotificationBadgeProps> = ({
  count,
  type,
  isCollapsed = false
}) => {
  if (count === 0) return null;

  const getTypeColor = (): NotificationBadgeProps['color'] => {
    switch (type) {
      case 'nouveau_club':
        return 'blue';
      case 'nouvel_event':
        return 'green';
      case 'demande_materiel':
        return 'orange';
      case 'reponse_materiel':
        return 'red';
      default:
        return 'red';
    }
  };

  const getAriaLabel = (): string => {
    const typeLabels = {
      nouveau_club: 'nouveaux clubs',
      nouvel_event: 'nouveaux événements',
      demande_materiel: 'demandes de matériel',
      reponse_materiel: 'réponses aux demandes'
    };
    
    return `${count} ${typeLabels[type]} non lu${count > 1 ? 's' : ''}`;
  };

  return (
    <NotificationBadge
      count={count}
      variant={isCollapsed ? 'small' : 'default'}
      color={getTypeColor()}
      animate={true}
      className={`
        ml-auto flex-shrink-0 
        ${isCollapsed ? 'absolute -top-1 -right-1' : 'ml-2'}
      `}
      aria-label={getAriaLabel()}
    />
  );
};

// ============================================
// BADGE POUR HEADER/MOBILE
// (Aucune modification nécessaire ici)
// ============================================

interface HeaderNotificationBadgeProps {
  totalCount: number;
  onClick?: () => void;
}

export const HeaderNotificationBadge: React.FC<HeaderNotificationBadgeProps> = ({
  totalCount,
  onClick
}) => {
  if (totalCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      aria-label={`${totalCount} notification${totalCount > 1 ? 's' : ''} non lue${totalCount > 1 ? 's' : ''}`}
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
      
      <div className="absolute -top-1 -right-1">
        <NotificationBadge
          count={totalCount}
          variant="small"
          color="red"
          animate={true}
        />
      </div>
    </button>
  );
};

export default NotificationBadge;