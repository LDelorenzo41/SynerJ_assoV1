// Fichier: src/hooks/usePlanLimit.ts

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PlanLimitData {
  currentPlan: string;
  currentClubCount: number;
  maxClubs: number;
  isAtLimit: boolean;
  isNearLimit: boolean;
  percentUsed: number;
}

const PLAN_LIMITS: Record<string, number> = {
  '1-4': 4,
  '5-10': 10,
  '11-15': 15,
  '16-25': 25,
  '25+': 999
};

export function usePlanLimit(associationId: string | null) {
  const [planLimitData, setPlanLimitData] = useState<PlanLimitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!associationId) {
      setLoading(false);
      return;
    }

    const fetchPlanData = async () => {
      try {
        setLoading(true);
        
        const { data: association, error: assocError } = await supabase
          .from('associations')
          .select('subscription_plan')
          .eq('id', associationId)
          .single();

        if (assocError) throw assocError;

        const { count, error: countError } = await supabase
          .from('clubs')
          .select('*', { count: 'exact', head: true })
          .eq('association_id', associationId);

        if (countError) throw countError;

        const currentClubCount = count || 0;
        const currentPlan = association.subscription_plan;
        const maxClubs = PLAN_LIMITS[currentPlan] || 0;
        const percentUsed = (currentClubCount / maxClubs) * 100;

        setPlanLimitData({
          currentPlan,
          currentClubCount,
          maxClubs,
          isAtLimit: currentClubCount >= maxClubs,
          isNearLimit: percentUsed >= 80,
          percentUsed
        });

        setError(null);
      } catch (err: any) {
        console.error('Erreur limite plan:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanData();

    const subscription = supabase
      .channel('club_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clubs',
          filter: `association_id=eq.${associationId}`
        },
        () => {
          console.log('Changement clubs détecté');
          fetchPlanData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [associationId]);

  return { planLimitData, loading, error };
}

export default usePlanLimit;