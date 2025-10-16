// Fichier: src/components/PlanUpgrade.tsx

import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Check, X, Crown, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PlanUpgradeProps {
  currentPlan: string;
  currentClubCount: number;
  associationId: string;
  onUpgrade?: () => void;
}

interface Plan {
  id: string;
  name: string;
  range: string;
  maxClubs: number;
  price: string;
  features: string[];
}

const PLANS: Plan[] = [
  { id: '1-4', name: 'Essentiel', range: '1-4 clubs', maxClubs: 4, price: '29€/mois', features: ['Gestion événements (IA)', 'Communications (IA)', 'Sponsors & mailing', 'Réservation matériel', 'Support 7/7', 'Pages web clubs'] },
  { id: '5-10', name: 'Standard', range: '5-10 clubs', maxClubs: 10, price: '59€/mois', features: ['Gestion événements (IA)', 'Communications (IA)', 'Sponsors & mailing', 'Réservation matériel', 'Support 7/7', 'Pages web clubs'] },
  { id: '11-15', name: 'Avancé', range: '11-15 clubs', maxClubs: 15, price: '89€/mois', features: ['Gestion événements (IA)', 'Communications (IA)', 'Sponsors & mailing', 'Réservation matériel', 'Support 7/7', 'Pages web clubs'] },
  { id: '16-25', name: 'Premium', range: '16-25 clubs', maxClubs: 25, price: '129€/mois', features: ['Gestion événements (IA)', 'Communications (IA)', 'Sponsors & mailing', 'Réservation matériel', 'Support 7/7', 'Pages web clubs'] },
  { id: '25+', name: 'Sur mesure', range: '25+ clubs', maxClubs: 999, price: 'Contact', features: ['Gestion événements (IA)', 'Communications (IA)', 'Sponsors & mailing', 'Réservation matériel', 'Support 7/7', 'Pages web clubs', 'Account manager dédié', 'Solutions personnalisées'] },
];

export default function PlanUpgrade({ currentPlan, currentClubCount, associationId, onUpgrade }: PlanUpgradeProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentPlanData = PLANS.find(p => p.id === currentPlan);
  const isAtLimit = currentClubCount >= (currentPlanData?.maxClubs || 0);
  const isNearLimit = currentClubCount >= (currentPlanData?.maxClubs || 0) * 0.8;

  useEffect(() => {
    if (isAtLimit) {
      setShowUpgradeModal(true);
    }
  }, [isAtLimit]);

  const handleUpgrade = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      // Pour le plan sur mesure, ouvrir le formulaire
      if (selectedPlan === '25+') {
        alert('Veuillez nous contacter à contact-synerj@teachtech.fr pour un plan sur mesure');
        setShowUpgradeModal(false);
        setLoading(false);
        return;
      }

      // TODO: Intégrer avec Stripe ici
      // 1. Créer/modifier l'abonnement Stripe
      // 2. Mettre à jour le plan dans Supabase
      
      console.log('Upgrade vers:', selectedPlan);
      
      // Pour l'instant, on met juste à jour le plan dans Supabase
      const { error } = await supabase
        .from('associations')
        .update({ subscription_plan: selectedPlan })
        .eq('id', associationId);

      if (error) throw error;
      
      if (onUpgrade) {
        onUpgrade();
      }
      
      setShowUpgradeModal(false);
      alert('Plan mis à jour avec succès !');
      window.location.reload();
    } catch (error: any) {
      console.error('Erreur upgrade:', error);
      alert('Erreur lors de la mise à jour du plan');
    } finally {
      setLoading(false);
    }
  };

  if ((isNearLimit || isAtLimit) && !showUpgradeModal) {
    return (
      <div className={`mb-6 p-4 rounded-lg border-2 ${
        isAtLimit 
          ? 'bg-red-50 border-red-500' 
          : 'bg-yellow-50 border-yellow-500'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
              isAtLimit ? 'text-red-600' : 'text-yellow-600'
            }`} />
            <div>
              <h3 className={`font-semibold ${
                isAtLimit ? 'text-red-900' : 'text-yellow-900'
              }`}>
                {isAtLimit 
                  ? '🚨 Limite de clubs atteinte !' 
                  : '⚠️ Vous approchez de votre limite'}
              </h3>
              <p className={`text-sm mt-1 ${
                isAtLimit ? 'text-red-700' : 'text-yellow-700'
              }`}>
                Vous avez actuellement <strong>{currentClubCount} club{currentClubCount > 1 ? 's' : ''}</strong> sur {currentPlanData?.maxClubs} autorisés dans le plan <strong>{currentPlanData?.name}</strong>.
              </p>
              {isAtLimit && (
                <p className="text-sm mt-2 text-red-800 font-medium">
                  Vous ne pouvez plus créer de nouveaux clubs. Passez à un plan supérieur pour continuer.
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              isAtLimit
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-yellow-600 text-white hover:bg-yellow-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Upgrader
          </button>
        </div>
      </div>
    );
  }

  if (showUpgradeModal) {
    const availablePlans = PLANS.filter(p => p.maxClubs > (currentPlanData?.maxClubs || 0));

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Upgrader votre plan
              </h2>
              <p className="text-blue-100 mt-1">
                Choisissez le plan adapté à vos {currentClubCount} clubs
              </p>
            </div>
            {!isAtLimit && (
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          <div className="p-6">
            {isAtLimit && (
              <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold">Action requise</p>
                    <p className="mt-1">
                      Vous avez atteint la limite de votre plan actuel. Sélectionnez un plan supérieur pour continuer à créer des clubs.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availablePlans.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                const Icon = plan.id === '25+' ? Sparkles : Crown;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`cursor-pointer rounded-xl p-6 border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Icon className={`w-8 h-8 ${
                        plan.id === '25+' ? 'text-pink-600' : 'text-purple-600'
                      }`} />
                      {isSelected && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{plan.range}</p>

                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">
                        {plan.price.split('/')[0]}
                      </span>
                      {plan.price.includes('/') && (
                        <span className="text-gray-600">/mois</span>
                      )}
                    </div>

                    <ul className="space-y-2">
                      {plan.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex gap-4">
              {!isAtLimit && (
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
              )}
              <button
                onClick={handleUpgrade}
                disabled={!selectedPlan || loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    {selectedPlan === '25+' ? 'Demander un devis' : 'Upgrader maintenant'}
                  </>
                )}
              </button>
            </div>

            {selectedPlan && selectedPlan !== '25+' && (
              <p className="mt-4 text-sm text-gray-600 text-center">
                💡 Le changement est effectif immédiatement. Votre prochaine facture sera ajustée au prorata.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}