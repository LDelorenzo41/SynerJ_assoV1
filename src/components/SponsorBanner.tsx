import React, { useState, useEffect } from 'react';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { Building2 } from 'lucide-react';

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  club_id: string | null;
  association_id: string | null;
}

export const SponsorBanner: React.FC = () => {
  const { profile } = useAuthNew();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    if (profile) {
      loadSponsors();
    }
  }, [profile]);

  const loadSponsors = async () => {
    if (!profile) return;

    try {
      const allSponsors: Sponsor[] = [];

      // 1. Récupérer les sponsors de la structure (si l'utilisateur a une association_id)
      if (profile.association_id) {
        const { data: structureSponsors } = await supabase
          .from('sponsors')
          .select('id, name, logo_url, club_id, association_id')
          .eq('association_id', profile.association_id)
          .is('club_id', null) // Sponsors de la structure uniquement (pas liés à un club)
          .eq('is_confirmed', true);

        if (structureSponsors) {
          allSponsors.push(...structureSponsors);
        }
      }

      // 2. Récupérer les sponsors des clubs suivis
      const { data: userClubs } = await supabase
        .from('user_clubs')
        .select('club_id')
        .eq('user_id', profile.id);

      const followedClubIds = userClubs?.map(uc => uc.club_id) || [];
      
      if (followedClubIds.length > 0) {
        const clubConditions = followedClubIds.map(clubId => `club_id.eq.${clubId}`).join(',');
        const { data: clubSponsors } = await supabase
          .from('sponsors')
          .select('id, name, logo_url, club_id, association_id')
          .or(clubConditions)
          .eq('is_confirmed', true);

        if (clubSponsors) {
          allSponsors.push(...clubSponsors);
        }
      }

      // 3. Dédupliquer les sponsors par ID (au cas où un sponsor serait lié à plusieurs clubs)
      const uniqueSponsors = Array.from(
        new Map(allSponsors.map(sponsor => [sponsor.id, sponsor])).values()
      );

      setSponsors(uniqueSponsors);
    } catch (err) {
      console.error('Error loading sponsors for banner:', err);
    }
  };

  if (sponsors.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border-t border-gray-200 dark:border-gray-700 py-2 overflow-hidden">
      <div className="flex animate-scroll space-x-8">
        {/* Dupliquer pour un défilement continu */}
        {[...sponsors, ...sponsors].map((sponsor, index) => (
          <div key={`${sponsor.id}-${index}`} className="flex items-center space-x-2 flex-shrink-0">
            {sponsor.logo_url ? (
              <img 
                src={sponsor.logo_url} 
                alt={sponsor.name}
                className="h-8 w-8 object-contain rounded"
              />
            ) : (
              <Building2 className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {sponsor.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};