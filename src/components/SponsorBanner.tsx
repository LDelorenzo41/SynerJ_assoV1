import React, { useState, useEffect } from 'react';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { Building2 } from 'lucide-react';

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  club_id: string | null;
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
      // Récupérer les clubs suivis
      const { data: userClubs } = await supabase
        .from('user_clubs')
        .select('club_id')
        .eq('user_id', profile.id);

      const followedClubIds = userClubs?.map(uc => uc.club_id) || [];
      
      if (followedClubIds.length === 0) return;

      // Récupérer les sponsors des clubs suivis
      const clubConditions = followedClubIds.map(clubId => `club_id.eq.${clubId}`).join(',');
      const { data: sponsorData } = await supabase
        .from('sponsors')
        .select('id, name, logo_url, club_id')
        .or(clubConditions)
        .eq('is_confirmed', true);

      setSponsors(sponsorData || []);
    } catch (err) {
      console.error('Error loading sponsors for banner:', err);
    }
  };

  if (sponsors.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-200 py-2 overflow-hidden">
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
              <Building2 className="h-6 w-6 text-gray-400" />
            )}
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {sponsor.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};