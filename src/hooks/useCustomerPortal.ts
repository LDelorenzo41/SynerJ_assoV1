// src/hooks/useCustomerPortal.ts

import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface UseCustomerPortalReturn {
  redirectToPortal: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook pour gérer l'accès au Customer Portal Stripe
 * Permet aux Super Admins de gérer leur abonnement (facturation, carte, upgrade, etc.)
 */
export function useCustomerPortal(): UseCustomerPortalReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectToPortal = async () => {
    setLoading(true);
    setError(null);

    try {
      // Récupération du token d'authentification
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Vous devez être connecté pour accéder au portail');
      }

      // Appel à l'Edge Function
      const { data, error: functionError } = await supabase.functions.invoke(
        'create-customer-portal-session',
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (functionError) {
        throw functionError;
      }

      if (!data?.url) {
        throw new Error('URL du portail non reçue');
      }

      // Redirection vers le Customer Portal Stripe
      window.location.href = data.url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'accès au portail';
      setError(errorMessage);
      console.error('Erreur Customer Portal:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    redirectToPortal,
    loading,
    error,
  };
}