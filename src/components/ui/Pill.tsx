/**
 * Pill — badge sémantique du DS "papier chaleureux".
 *
 * 9 variantes alignées sur le DS : default, solid, accent, success, warning,
 * danger, info, highlight, ghost. Optionnellement un icone a gauche.
 */

import React from 'react';

type PillVariant =
  | 'default'
  | 'solid'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'highlight'
  | 'ghost';

interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: PillVariant;
  icon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<PillVariant, string> = {
  default:
    'bg-papier-2 text-encre-2 border border-[var(--ds-border)]',
  solid:
    'bg-encre text-papier border border-encre',
  accent:
    'bg-terracotta-soft text-terracotta-deep border border-[rgba(194,90,60,.15)]',
  success:
    'bg-ds-success-soft text-[#3f6b3d] border border-[rgba(94,138,91,.18)] dark:text-ds-success',
  warning:
    'bg-ds-warning-soft text-[#8a6620] border border-[rgba(212,155,58,.22)] dark:text-ds-warning',
  danger:
    'bg-ds-danger-soft text-[#8a3a26] border border-[rgba(184,85,63,.18)] dark:text-ds-danger',
  info:
    'bg-ds-info-soft text-[#3d5878] border border-[rgba(90,122,163,.18)] dark:text-ds-info',
  highlight:
    'bg-highlight text-[#6b5816] border border-[rgba(212,155,58,.18)]',
  ghost:
    'bg-transparent text-encre-2 border border-transparent',
};

export const Pill: React.FC<PillProps> = ({
  variant = 'default',
  icon,
  className = '',
  children,
  ...rest
}) => {
  return (
    <span
      {...rest}
      className={[
        'inline-flex items-center gap-1.5 font-sans font-medium text-xs',
        'px-2.5 py-1 rounded-full leading-relaxed',
        VARIANT_CLASSES[variant],
        className,
      ].join(' ')}
    >
      {icon && <span className="inline-flex">{icon}</span>}
      {children}
    </span>
  );
};

export default Pill;
