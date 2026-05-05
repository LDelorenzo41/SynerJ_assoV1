// src/components/ClubWebsiteButton.tsx
// Bouton réutilisable pour accéder au site web d'un club

import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';

interface ClubWebsiteButtonProps {
  websiteUrl: string | null | undefined;
  clubName?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

export default function ClubWebsiteButton({
  websiteUrl,
  clubName = 'ce club',
  variant = 'primary',
  size = 'md',
  showIcon = true,
  showLabel = true,
  className = ''
}: ClubWebsiteButtonProps) {
  // Ne rien afficher si pas de site web
  if (!websiteUrl) {
    return null;
  }

  // Styles en fonction de la variante
  const variantStyles = {
    primary: 'bg-ds-success hover:bg-ds-success text-white dark:bg-ds-success dark:hover:bg-ds-success',
    secondary: 'bg-white dark:bg-papier-2 border border-ds-success dark:border-ds-success text-ds-success dark:text-ds-success hover:bg-ds-success-soft dark:hover:bg-papier-3',
    ghost: 'text-ds-success dark:text-ds-success hover:bg-ds-success-soft dark:hover:bg-ds-success-soft/20'
  };

  // Tailles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <a
      href={window.location.origin + websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      title={`Voir le site web de ${clubName}`}
    >
      {showIcon && <Globe className={`${iconSizes[size]} ${showLabel ? 'mr-2' : ''}`} />}
      {showLabel && 'Voir le site web'}
      {!showLabel && showIcon && <ExternalLink className={`${iconSizes[size]} ml-1`} />}
    </a>
  );
}

// Variante pour un lien texte simple
export function ClubWebsiteLink({
  websiteUrl,
  clubName,
  className = ''
}: {
  websiteUrl: string | null | undefined;
  clubName?: string;
  className?: string;
}) {
  if (!websiteUrl) return null;

  return (
    <a
      href={window.location.origin + websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center text-sm text-ds-success dark:text-ds-success hover:text-ds-success dark:hover:text-ds-success hover:underline transition-colors ${className}`}
      title={`Voir le site web${clubName ? ` de ${clubName}` : ''}`}
    >
      <Globe className="h-4 w-4 mr-1.5" />
      Site web
      <ExternalLink className="h-3 w-3 ml-1" />
    </a>
  );
}