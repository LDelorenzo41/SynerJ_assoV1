/**
 * Button — primitive du Design System "papier chaleureux".
 *
 * 3 variantes : 'primary' (terracotta), 'secondary' (papier + bordure), 'ghost'.
 * 3 tailles : 'sm' | 'md' (defaut) | 'lg'.
 *
 * Restituer pixel-perfect l'aspect des boutons du DS (icons.jsx + .btn-*
 * dans SynerJ.html). Tous les handlers / props natifs <button> sont
 * proxyfies via ButtonHTMLAttributes.
 */

import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-5 py-3 gap-2',
};

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-terracotta text-white border border-transparent ' +
    'hover:bg-terracotta-deep ' +
    'shadow-[inset_0_1px_0_rgba(255,255,255,.22),0_1px_2px_rgba(168,74,46,.25)] ' +
    'disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'bg-papier text-encre border border-[var(--ds-border-2)] ' +
    'hover:bg-papier-2 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent text-encre border border-transparent ' +
    'hover:bg-papier-2 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth,
  className = '',
  children,
  ...rest
}) => {
  return (
    <button
      {...rest}
      className={[
        'inline-flex items-center justify-center font-sans font-semibold rounded-xl',
        'transition active:translate-y-px',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {leftIcon && <span className="inline-flex">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="inline-flex">{rightIcon}</span>}
    </button>
  );
};

export default Button;
