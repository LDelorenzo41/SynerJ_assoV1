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
    console.log(`🔍 [SponsorBanner] Chargement pour rôle: ${profile.role}`);
    console.log(`📋 [SponsorBanner] Profile club_id:`, profile.club_id);
    
    const allSponsors: Sponsor[] = [];

    // 1. Récupérer les sponsors de l'association
    if (profile.association_id) {
      const { data: structureSponsors } = await supabase
        .from('sponsors')
        .select('id, name, logo_url, club_id, association_id')
        .eq('association_id', profile.association_id)
        .is('club_id', null)
        .eq('is_confirmed', true);

      if (structureSponsors) {
        console.log(`✅ [SponsorBanner] Sponsors d'association: ${structureSponsors.length}`);
        allSponsors.push(...structureSponsors);
      }
    }

    // 2. Construire la liste complète des clubs à récupérer
    const clubIdsToFetch: string[] = [];

    // 2A. Ajouter le club principal du Sponsor (si existe)
    if (profile.club_id) {
      clubIdsToFetch.push(profile.club_id);
      console.log(`✅ [SponsorBanner] Club principal ajouté:`, profile.club_id);
    }

    // 2B. Ajouter les clubs suivis (via user_clubs)
    if (profile.role === 'Member' || profile.role === 'Supporter' || profile.role === 'Sponsor') {
      const { data: userClubs } = await supabase
        .from('user_clubs')
        .select('club_id')
        .eq('user_id', profile.id);

      const followedClubIds = userClubs?.map(uc => uc.club_id) || [];
      console.log(`📋 [SponsorBanner] Clubs suivis (user_clubs): ${followedClubIds.length}`);
      
      clubIdsToFetch.push(...followedClubIds);
    }

    // 2C. Dédupliquer les IDs de clubs
    const uniqueClubIds = [...new Set(clubIdsToFetch)];
    console.log(`✅ [SponsorBanner] Total clubs uniques à récupérer: ${uniqueClubIds.length}`);

    // 3. Récupérer les sponsors de tous ces clubs
    if (uniqueClubIds.length > 0) {
      const clubConditions = uniqueClubIds.map(clubId => `club_id.eq.${clubId}`).join(',');
      const { data: clubSponsors } = await supabase
        .from('sponsors')
        .select('id, name, logo_url, club_id, association_id')
        .or(clubConditions)
        .eq('is_confirmed', true);

      if (clubSponsors) {
        console.log(`✅ [SponsorBanner] Sponsors de clubs trouvés: ${clubSponsors.length}`);
        allSponsors.push(...clubSponsors);
      }
    }

    // 4. Dédupliquer les sponsors par ID
    const uniqueSponsors = Array.from(
      new Map(allSponsors.map(sponsor => [sponsor.id, sponsor])).values()
    );

    console.log(`✅ [SponsorBanner] Total sponsors uniques: ${uniqueSponsors.length}`);
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