/**
 * Card — conteneur de base du DS.
 *
 * Fond papier, bordure douce, ombre subtile. Padding ajustable, et
 * possibilite de retirer la bordure ou l'ombre via props.
 */

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
  elevated?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

const PADDING_CLASSES: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  padding = 'md',
  bordered = true,
  elevated = true,
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}) => {
  const Component = Tag as any;
  return (
    <Component
      {...rest}
      className={[
        'bg-papier rounded-ds-md',
        bordered ? 'border border-[var(--ds-border)]' : '',
        elevated ? 'shadow-ds-sm' : '',
        PADDING_CLASSES[padding],
        className,
      ].join(' ')}
    >
      {children}
    </Component>
  );
};

export default Card;
