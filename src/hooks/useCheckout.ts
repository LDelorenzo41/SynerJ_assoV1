// src/hooks/useCheckout.ts

import { useState } from 'react';

import { supabase } from '@/lib/supabase';
import { STRIPE_CONFIG, type PlanId } from '@/config/stripe';



interface CheckoutParams {
  planId: PlanId;
  associationId: string;
  associationEmail: string;
}

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async ({ planId, associationId, associationEmail }: CheckoutParams) => {
    setLoading(true);
    setError(null);

    try {
      // Get the price ID for the selected plan
      const plan = STRIPE_CONFIG.plans[planId];
      if (!plan) {
        throw new Error('Plan introuvable');
      }

      // Call the Edge Function to create a checkout session
      const { data, error: functionError } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            priceId: plan.priceId,
            associationId,
            associationEmail,
            planId,
          },
        }
      );

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data?.url) {
        throw new Error('Erreur lors de la création de la session de paiement');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setLoading(false);
    }
  };

  return {
    createCheckoutSession,
    loading,
    error,
  };
}