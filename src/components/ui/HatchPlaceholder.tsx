/**
 * HatchPlaceholder — zone hachuree pour signaler "image / contenu a venir".
 *
 * Utile pendant la migration ou pour les vues vides. Optionnellement un
 * petit `badge` est affiche en haut a gauche (libelle court, mono).
 */

import React from 'react';

interface HatchPlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  caption?: React.ReactNode;
  height?: number | string;
  badge?: React.ReactNode;
}

export const HatchPlaceholder: React.FC<HatchPlaceholderProps> = ({
  caption,
  height = 120,
  badge,
  className = '',
  style,
  children,
  ...rest
}) => {
  return (
    <div
      {...rest}
      className={['ds-placeholder relative', className].join(' ')}
      style={{ height, ...style }}
    >
      {badge && (
        <div
          className="absolute top-2 left-2 px-1.5 py-0.5 rounded font-mono text-[9.5px] tracking-wider"
          style={{ background: 'rgba(31,27,22,.78)', color: '#fce896' }}
        >
          {badge}
        </div>
      )}
      <span className="opacity-85">{caption || children}</span>
    </div>
  );
};

export default HatchPlaceholder;
