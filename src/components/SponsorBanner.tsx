import React, { useState, useEffect } from 'react';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { Building2, Crown, Award, Medal, Star, Sparkles } from 'lucide-react';

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  club_id: string | null;
  association_id: string | null;
  sponsor_type: 'Platine' | 'Or' | 'Argent' | 'Bronze' | 'Partenaire';
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
          .select('id, name, logo_url, club_id, association_id, sponsor_type')
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

      // 2A. Ajouter le club principal du Sponsor ou Club Admin (si existe)
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
          .select('id, name, logo_url, club_id, association_id, sponsor_type')
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

  const getSponsorBadgeConfig = (type: string) => {
    switch (type) {
      case 'Platine':
        return {
          icon: Crown,
          borderColor: 'ring-purple-500 dark:ring-purple-400',
          bgColor: 'bg-ds-info dark:bg-ds-info',
          iconColor: 'text-ds-warning'
        };
      case 'Or':
        return {
          icon: Award,
          borderColor: 'ring-yellow-500 dark:ring-yellow-400',
          bgColor: 'bg-ds-warning dark:bg-ds-warning',
          iconColor: 'text-white'
        };
      case 'Argent':
        return {
          icon: Medal,
          borderColor: 'ring-gray-400 dark:ring-gray-300',
          bgColor: 'bg-papier-3 dark:bg-papier-3',
          iconColor: 'text-white'
        };
      case 'Bronze':
        return {
          icon: Medal,
          borderColor: 'ring-orange-500 dark:ring-orange-400',
          bgColor: 'bg-ds-warning dark:bg-ds-warning',
          iconColor: 'text-white'
        };
      default:
        return {
          icon: Star,
          borderColor: 'ring-blue-500 dark:ring-blue-400',
          bgColor: 'bg-terracotta dark:bg-terracotta',
          iconColor: 'text-white'
        };
    }
  };

  if (sponsors.length === 0) return null;

  return (
    <div className="relative bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 border-t border-b border-ds-info-soft dark:border-ds-info/50 py-3 overflow-hidden">
      {/* Effet de brillance animé */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10 animate-shine"></div>
      
      <div className="flex animate-scroll-slow space-x-8 items-center">
        {/* Message de remerciement au début */}
        <div className="flex items-center space-x-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 rounded-full shadow-md flex-shrink-0">
          <Sparkles className="h-4 w-4 text-ds-warning animate-pulse" />
          <span className="text-sm font-semibold text-white whitespace-nowrap">
            Merci à nos {sponsors.length} sponsor{sponsors.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Dupliquer 3 fois pour un défilement continu fluide */}
        {[...sponsors, ...sponsors, ...sponsors].map((sponsor, index) => {
          const badgeConfig = getSponsorBadgeConfig(sponsor.sponsor_type);
          const BadgeIcon = badgeConfig.icon;
          
          return (
            <div 
              key={`${sponsor.id}-${index}`} 
              className="flex items-center space-x-3 flex-shrink-0 group"
            >
              {/* Logo avec bordure colorée selon niveau */}
              <div className="relative">
                <div className={`w-12 h-12 rounded-full bg-white dark:bg-slate-100 flex items-center justify-center ring-4 ${badgeConfig.borderColor} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {sponsor.logo_url ? (
                    <img 
                      src={sponsor.logo_url} 
                      alt={sponsor.name}
                      className="w-10 h-10 object-contain rounded-full p-1"
                    />
                  ) : (
                    <Building2 className="h-6 w-6 text-encre-3 dark:text-encre-2" />
                  )}
                </div>
                
                {/* Badge mini niveau sponsor en overlay */}
                <div className={`absolute -top-1 -right-1 w-5 h-5 ${badgeConfig.bgColor} rounded-full flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-800`}>
                  <BadgeIcon className={`h-3 w-3 ${badgeConfig.iconColor}`} />
                </div>
              </div>
              
              {/* Nom du sponsor */}
              <span className="text-sm font-semibold text-encre dark:text-encre whitespace-nowrap group-hover:text-ds-info dark:group-hover:text-ds-info transition-colors">
                {sponsor.name}
              </span>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes scroll-slow {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        
        .animate-scroll-slow {
          animation: scroll-slow 60s linear infinite;
        }
        
        .animate-shine {
          animation: shine 8s ease-in-out infinite;
        }
        
        /* Pause l'animation au survol */
        .animate-scroll-slow:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};