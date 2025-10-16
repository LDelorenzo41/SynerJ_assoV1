// src/config/stripe.ts

/**
 * Configuration Stripe pour SynerJ
 * Plans d'abonnement et mapping avec les Price IDs
 */

export const STRIPE_CONFIG = {
  // Clé publique Stripe (safe pour le frontend)
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  
  // Plans disponibles avec leurs Price IDs
  plans: {
    '1-4': {
      name: 'Essentiel',
      displayName: 'SynerJ - Essentiel',
      description: 'Plan pour 1 à 4 clubs',
      price: 29,
      priceId: 'price_1SInA2JGrTMDgKmmg1aTGZ34',
      clubLimit: 4,
      features: [
        'Gestion des événements (IA disponible)',
        'Gestion des communications (IA disponible)',
        'Accès sponsors et campagne de mailing',
        'Système de réservation de matériel mutualisé',
        'Support 7/7',
        'Création page web de club'
      ]
    },
    '5-10': {
      name: 'Standard',
      displayName: 'SynerJ - Standard',
      description: 'Plan pour 5 à 10 clubs',
      price: 59,
      priceId: 'price_1SInFfJGrTMDgKmmplqWEa2X',
      clubLimit: 10,
      features: [
        'Gestion des événements (IA disponible)',
        'Gestion des communications (IA disponible)',
        'Accès sponsors et campagne de mailing',
        'Système de réservation de matériel mutualisé',
        'Support 7/7',
        'Création page web de club'
      ]
    },
    '11-15': {
      name: 'Avancé',
      displayName: 'SynerJ - Avancé',
      description: 'Plan pour 11 à 15 clubs',
      price: 89,
      priceId: 'price_1SInMJJGrTMDgKmmSBnuMtzP',
      clubLimit: 15,
      features: [
        'Gestion des événements (IA disponible)',
        'Gestion des communications (IA disponible)',
        'Accès sponsors et campagne de mailing',
        'Système de réservation de matériel mutualisé',
        'Support 7/7',
        'Création page web de club'
      ]
    },
    '16-25': {
      name: 'Premium',
      displayName: 'SynerJ - Premium',
      description: 'Plan pour 16 à 25 clubs',
      price: 129,
      priceId: 'price_1SInPIJGrTMDgKmmcrvgkMz5',
      clubLimit: 25,
      features: [
        'Gestion des événements (IA disponible)',
        'Gestion des communications (IA disponible)',
        'Accès sponsors et campagne de mailing',
        'Système de réservation de matériel mutualisé',
        'Support 7/7',
        'Création page web de club'
      ]
    }
  }
} as const;

/**
 * Type pour les IDs de plans
 */
export type PlanId = keyof typeof STRIPE_CONFIG.plans;

/**
 * Récupère les informations d'un plan par son ID
 */
export function getPlanById(planId: PlanId) {
  return STRIPE_CONFIG.plans[planId];
}

/**
 * Récupère le Price ID Stripe pour un plan
 */
export function getPriceIdByPlan(planId: PlanId): string {
  return STRIPE_CONFIG.plans[planId].priceId;
}

/**
 * Récupère la limite de clubs pour un plan
 */
export function getClubLimitByPlan(planId: PlanId): number {
  return STRIPE_CONFIG.plans[planId].clubLimit;
}

/**
 * Liste tous les plans disponibles
 */
export function getAllPlans() {
  return Object.entries(STRIPE_CONFIG.plans).map(([id, plan]) => ({
    id: id as PlanId,
    ...plan
  }));
}

/**
 * Trouve le plan approprié selon le nombre de clubs
 */
export function getRecommendedPlan(clubCount: number): PlanId | '25+' {
  if (clubCount <= 4) return '1-4';
  if (clubCount <= 10) return '5-10';
  if (clubCount <= 15) return '11-15';
  if (clubCount <= 25) return '16-25';
  return '25+'; // Plan sur mesure
}

/**
 * Calcule le prochain plan recommandé pour un upgrade
 */
export function getNextPlan(currentPlanId: PlanId): PlanId | '25+' | null {
  const planOrder: (PlanId | '25+')[] = ['1-4', '5-10', '11-15', '16-25', '25+'];
  const currentIndex = planOrder.indexOf(currentPlanId);
  
  if (currentIndex === -1 || currentIndex === planOrder.length - 1) {
    return null; // Déjà au plan maximum ou plan invalide
  }
  
  return planOrder[currentIndex + 1];
}