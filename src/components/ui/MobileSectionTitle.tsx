/**
 * MobileSectionTitle — petit en-tete de section, look "label technique".
 *
 * Mono uppercase letterspaced, en encre-3 — sert a separer des blocs sans
 * voler la vedette aux titres de contenu.
 */

import React from 'react';

interface MobileSectionTitleProps {
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const MobileSectionTitle: React.FC<MobileSectionTitleProps> = ({
  children,
  action,
  className = '',
}) => {
  return (
    <div
      className={[
        'flex items-baseline justify-between',
        'px-4 pt-2.5 pb-1.5',
        'font-mono text-[10.5px] uppercase tracking-[.08em] text-encre-3',
        className,
      ].join(' ')}
    >
      <span>{children}</span>
      {action}
    </div>
  );
};

export default MobileSectionTitle;
