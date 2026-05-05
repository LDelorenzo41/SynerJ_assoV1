/**
 * AppBar — barre de titre haute pour ecrans mobile.
 *
 * Slots `left` et `right` pour boutons d'action. Le titre est affiche en
 * font-display (DM Serif Display), le sous-titre en sans regular discret.
 */

import React from 'react';

interface AppBarProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export const AppBar: React.FC<AppBarProps> = ({
  title,
  subtitle,
  left,
  right,
  className = '',
}) => {
  return (
    <div
      className={[
        'flex items-center gap-2.5 px-4 py-2.5',
        'border-b border-[var(--ds-border)] bg-papier flex-shrink-0',
        className,
      ].join(' ')}
    >
      {left}
      <div className="flex-1 min-w-0">
        <div className="font-display text-lg leading-tight text-encre truncate">{title}</div>
        {subtitle && (
          <div className="font-sans text-[11.5px] text-encre-3 mt-0.5 truncate">{subtitle}</div>
        )}
      </div>
      {right}
    </div>
  );
};

export default AppBar;
