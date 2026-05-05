/**
 * Avatar — pastille initiales ou image, palette pastel av-1..6.
 *
 * Si `src` est fourni, l'image remplit la pastille. Sinon on derive les
 * initiales (max 2 lettres) du `name`. La couleur de fond est determinee
 * par `n` (1..6) — utile pour avoir des variantes pastel coherentes
 * autour d'une liste sans que l'on ait a calculer un hash.
 */

import React from 'react';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  size?: number;
  /** 1..6 — palette pastel. */
  n?: number;
  src?: string;
  alt?: string;
}

function computeInitials(name: string): string {
  return name
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  name = '?',
  size = 36,
  n = 1,
  src,
  alt,
  className = '',
  style,
  ...rest
}) => {
  const paletteIndex = ((n - 1) % 6) + 1;
  const initials = computeInitials(name);
  return (
    <div
      {...rest}
      className={[
        `ds-av-${paletteIndex}`,
        'inline-flex items-center justify-center rounded-full overflow-hidden font-sans font-semibold flex-shrink-0',
        className,
      ].join(' ')}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.38),
        ...style,
      }}
      aria-label={alt || name}
    >
      {src ? <img src={src} alt={alt || name} className="w-full h-full object-cover" /> : initials}
    </div>
  );
};

export default Avatar;
