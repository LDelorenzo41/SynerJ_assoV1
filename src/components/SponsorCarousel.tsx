import React, { useState, useEffect } from 'react';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { Building2, ExternalLink, Crown, Award, Star, Medal } from 'lucide-react';

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  visual_url: string | null;
  website: string | null;
  description: string | null;
  club_id: string | null;
  sponsor_type: 'Platine' | 'Or' | 'Argent' | 'Bronze' | 'Partenaire';
}

export const SponsorCarousel: React.FC = () => {
  const { profile } = useAuthNew();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile && (profile.role === 'Member' || profile.role === 'Supporter' || profile.role === 'Sponsor' || profile.role === 'Club Admin')) {
      loadSponsors();
    } else {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (sponsors.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % sponsors.length);
      }, 6000); // 6 secondes pour laisser le temps de lire

      return () => clearInterval(interval);
    }
  }, [sponsors.length]);

  const loadSponsors = async () => {
    if (!profile) return;

    try {
      console.log(`🔍 [SponsorCarousel] Chargement pour rôle: ${profile.role}`);
      console.log(`📋 [SponsorCarousel] Profile club_id:`, profile.club_id);
      
      const allSponsors: Sponsor[] = [];

      // 1. Récupérer les sponsors de l'association
      if (profile.association_id) {
        const { data: associationSponsors } = await supabase
          .from('sponsors')
          .select('id, name, logo_url, visual_url, website, description, club_id, sponsor_type')
          .eq('association_id', profile.association_id)
          .is('club_id', null)
          .eq('is_confirmed', true);

        if (associationSponsors) {
          console.log(`✅ [SponsorCarousel] Sponsors d'association: ${associationSponsors.length}`);
          allSponsors.push(...associationSponsors);
        }
      }

      // 2. Construire la liste complète des clubs à récupérer
      const clubIdsToFetch: string[] = [];

      // 2A. Ajouter le club principal du Sponsor ou Club Admin (si existe)
      if (profile.club_id) {
        clubIdsToFetch.push(profile.club_id);
        console.log(`✅ [SponsorCarousel] Club principal ajouté:`, profile.club_id);
      }

      // 2B. Ajouter les clubs suivis (via user_clubs)
      const { data: userClubs } = await supabase
        .from('user_clubs')
        .select('club_id')
        .eq('user_id', profile.id);

      const followedClubIds = userClubs?.map(uc => uc.club_id) || [];
      console.log(`📋 [SponsorCarousel] Clubs suivis (user_clubs): ${followedClubIds.length}`);
      
      clubIdsToFetch.push(...followedClubIds);

      // 2C. Dédupliquer les IDs de clubs
      const uniqueClubIds = [...new Set(clubIdsToFetch)];
      console.log(`✅ [SponsorCarousel] Total clubs uniques à récupérer: ${uniqueClubIds.length}`);

      // 3. Récupérer les sponsors de tous ces clubs
      if (uniqueClubIds.length > 0) {
        const clubConditions = uniqueClubIds.map(clubId => `club_id.eq.${clubId}`).join(',');
        const { data: clubSponsors } = await supabase
          .from('sponsors')
          .select('id, name, logo_url, visual_url, website, description, club_id, sponsor_type')
          .or(clubConditions)
          .eq('is_confirmed', true);

        if (clubSponsors) {
          console.log(`✅ [SponsorCarousel] Sponsors de clubs trouvés: ${clubSponsors.length}`);
          allSponsors.push(...clubSponsors);
        }
      }

      // 4. Dédupliquer les sponsors par ID
      const uniqueSponsors = Array.from(
        new Map(allSponsors.map(sponsor => [sponsor.id, sponsor])).values()
      );

      console.log(`✅ [SponsorCarousel] Total sponsors uniques: ${uniqueSponsors.length}`);
      setSponsors(uniqueSponsors);
    } catch (err) {
      console.error('Error loading sponsors for carousel:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSponsorBadgeConfig = (type: string) => {
    switch (type) {
      case 'Platine':
        return {
          icon: Crown,
          label: 'SPONSOR PLATINE',
          bgColor: 'bg-purple-600 dark:bg-purple-700',
          textColor: 'text-white',
          iconColor: 'text-yellow-300'
        };
      case 'Or':
        return {
          icon: Award,
          label: 'SPONSOR OR',
          bgColor: 'bg-yellow-500 dark:bg-yellow-600',
          textColor: 'text-white',
          iconColor: 'text-yellow-200'
        };
      case 'Argent':
        return {
          icon: Medal,
          label: 'SPONSOR ARGENT',
          bgColor: 'bg-gray-400 dark:bg-gray-500',
          textColor: 'text-white',
          iconColor: 'text-gray-100'
        };
      case 'Bronze':
        return {
          icon: Medal,
          label: 'SPONSOR BRONZE',
          bgColor: 'bg-orange-600 dark:bg-orange-700',
          textColor: 'text-white',
          iconColor: 'text-orange-200'
        };
      default:
        return {
          icon: Star,
          label: 'PARTENAIRE',
          bgColor: 'bg-blue-600 dark:bg-blue-700',
          textColor: 'text-white',
          iconColor: 'text-blue-200'
        };
    }
  };

  if (loading || sponsors.length === 0) return null;

  const currentSponsor = sponsors[currentIndex];
  const badgeConfig = getSponsorBadgeConfig(currentSponsor.sponsor_type);
  const BadgeIcon = badgeConfig.icon;

  const handleSponsorClick = () => {
    if (currentSponsor.website) {
      window.open(currentSponsor.website, '_blank');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg group transition-all duration-500 hover:shadow-xl">
      {/* Visuel en fond avec overlay */}
      <div className="absolute inset-0">
        {currentSponsor.visual_url ? (
          <>
            <img 
              src={currentSponsor.visual_url} 
              alt={`Visuel ${currentSponsor.name}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 dark:from-black/80 dark:via-black/70 dark:to-black/80"></div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 dark:from-orange-600 dark:via-red-600 dark:to-pink-600"></div>
        )}
      </div>

      {/* Contenu */}
      <div className="relative p-5 min-h-[220px] flex flex-col justify-between">
        {/* Header avec compteur */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-medium text-white/90 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full">
            💎 {sponsors.length} sponsor{sponsors.length > 1 ? 's' : ''} nous soutiennent
          </div>
          {sponsors.length > 1 && (
            <div className="flex space-x-1.5">
              {sponsors.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-white w-6' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Badge niveau sponsor */}
        <div className={`inline-flex items-center space-x-1.5 ${badgeConfig.bgColor} ${badgeConfig.textColor} px-3 py-1.5 rounded-full text-xs font-bold mb-3 w-fit shadow-lg`}>
          <BadgeIcon className={`h-4 w-4 ${badgeConfig.iconColor}`} />
          <span>{badgeConfig.label}</span>
        </div>

        {/* Logo + Infos sponsor */}
        <div 
          onClick={handleSponsorClick}
          className={`${currentSponsor.website ? 'cursor-pointer' : ''} flex-1`}
        >
          <div className="flex items-start space-x-4 mb-3">
            {/* Logo */}
            <div className="flex-shrink-0">
              {currentSponsor.logo_url ? (
                <div className="bg-white dark:bg-slate-100 rounded-lg p-2 shadow-md w-16 h-16 flex items-center justify-center">
                  <img 
                    src={currentSponsor.logo_url} 
                    alt={currentSponsor.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-100 rounded-lg p-2 shadow-md w-16 h-16 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                </div>
              )}
            </div>
            
            {/* Nom + Description */}
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-bold text-white mb-1 line-clamp-1">
                {currentSponsor.name}
              </h4>
              {currentSponsor.description && (
                <p className="text-sm text-white/90 line-clamp-2 leading-relaxed">
                  {currentSponsor.description}
                </p>
              )}
            </div>
          </div>

          {/* CTA Button */}
          {currentSponsor.website && (
            <button
              className="w-full mt-3 bg-white dark:bg-slate-100 text-gray-900 dark:text-gray-900 px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-white/90 dark:hover:bg-slate-200 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 group"
            >
              <span>🎁 Découvrir leurs offres</span>
              <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};