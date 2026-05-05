/**
 * Chip — filtre rapide actif/inactif.
 *
 * Visuellement plus consequent qu'un Pill : utilise pour les barres de
 * filtres horizontaux (ex: filtre par club dans le fil de communications).
 */

import React from 'react';

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  leftIcon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  active = false,
  leftIcon,
  className = '',
  children,
  ...rest
}) => {
  return (
    <button
      {...rest}
      className={[
        'inline-flex items-center gap-1.5 flex-shrink-0',
        'font-sans font-medium text-[12.5px]',
        'px-3 py-1.5 rounded-full border transition',
        active
          ? 'bg-encre text-papier border-encre'
          : 'bg-papier text-encre-2 border-[var(--ds-border-2)] hover:bg-papier-2',
        className,
      ].join(' ')}
    >
      {leftIcon && <span className="inline-flex">{leftIcon}</span>}
      {children}
    </button>
  );
};

export default Chip;
