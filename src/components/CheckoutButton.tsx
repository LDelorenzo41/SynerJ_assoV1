// src/components/CheckoutButton.tsx

import { CreditCard, Loader2 } from 'lucide-react';
import { useCheckout } from '@/hooks/useCheckout';
import { type PlanId } from '@/config/stripe';

interface CheckoutButtonProps {
  planId: PlanId;
  associationId: string;
  associationEmail: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
}

export function CheckoutButton({
  planId,
  associationId,
  associationEmail,
  children,
  variant = 'primary',
  className = '',
  disabled = false,
}: CheckoutButtonProps) {
  const { createCheckoutSession, loading, error } = useCheckout();

  const handleClick = async () => {
    await createCheckoutSession({
      planId,
      associationId,
      associationEmail,
    });
  };

  const baseClasses = 'flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = variant === 'primary'
    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800'
    : 'bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50';

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={loading || disabled}
        className={`${baseClasses} ${variantClasses} ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Redirection...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>{children || 'Procéder au paiement'}</span>
          </>
        )}
      </button>

      {error && (
        <p className="text-sm text-red-600 text-center">
          {error}
        </p>
      )}
    </div>
  );
}