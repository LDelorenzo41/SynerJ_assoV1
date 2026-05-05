/**
 * FAB — Floating Action Button (mobile).
 *
 * Bouton circulaire flottant terracotta, avec ombre dense. Par defaut
 * positionne en bas a droite, mais surchargeable via className/style.
 */

import React from 'react';
import { Plus } from 'lucide-react';

interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  /** Si true, applique le positionnement absolu par defaut (bas-droite). */
  floating?: boolean;
}

export const FAB: React.FC<FABProps> = ({
  icon,
  floating = true,
  className = '',
  ...rest
}) => {
  return (
    <button
      {...rest}
      className={[
        'inline-flex items-center justify-center',
        'w-[52px] h-[52px] rounded-full',
        'bg-terracotta text-white border-0 cursor-pointer',
        'shadow-[0_4px_12px_rgba(168,74,46,.32),inset_0_1px_0_rgba(255,255,255,.22)]',
        'hover:bg-terracotta-deep transition active:translate-y-px',
        floating ? 'absolute right-3.5 bottom-[78px] z-10' : '',
        className,
      ].join(' ')}
    >
      {icon || <Plus size={22} strokeWidth={2} />}
    </button>
  );
};

export default FAB;
