import React, { useState, useEffect } from 'react';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { Building2, ExternalLink } from 'lucide-react';

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  visual_url: string | null;
  website: string | null;
  description: string | null;
  club_id: string | null;
}

export const SponsorCarousel: React.FC = () => {
  const { profile } = useAuthNew();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile && (profile.role === 'Member' || profile.role === 'Supporter')) {
      loadSponsors();
    } else {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (sponsors.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % sponsors.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [sponsors.length]);

  const loadSponsors = async () => {
    if (!profile) return;

    try {
      // Récupérer les clubs suivis
      const { data: userClubs } = await supabase
        .from('user_clubs')
        .select('club_id')
        .eq('user_id', profile.id);

      const followedClubIds = userClubs?.map(uc => uc.club_id) || [];
      
      if (followedClubIds.length === 0) {
        setLoading(false);
        return;
      }

      // Récupérer les sponsors des clubs suivis
      const clubConditions = followedClubIds.map(clubId => `club_id.eq.${clubId}`).join(',');
      const { data: sponsorData } = await supabase
        .from('sponsors')
        .select('id, name, logo_url, visual_url, website, description, club_id')
        .or(clubConditions)
        .eq('is_confirmed', true);

      setSponsors(sponsorData || []);
    } catch (err) {
      console.error('Error loading sponsors for carousel:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || sponsors.length === 0) return null;

  const currentSponsor = sponsors[currentIndex];

  const handleSponsorClick = () => {
    if (currentSponsor.website) {
      window.open(currentSponsor.website, '_blank');
    }
  };

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200 transition-all duration-500">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Nos Sponsors</h3>
        {sponsors.length > 1 && (
          <div className="flex space-x-1">
            {sponsors.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-orange-500' : 'bg-orange-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      <div 
        onClick={handleSponsorClick}
        className={`${currentSponsor.website ? 'cursor-pointer hover:bg-orange-100' : ''} p-3 rounded-lg transition-colors`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {currentSponsor.logo_url ? (
              <img 
                src={currentSponsor.logo_url} 
                alt={currentSponsor.name}
                className="h-12 w-12 object-contain rounded bg-white p-1"
              />
            ) : (
              <div className="h-12 w-12 bg-white rounded flex items-center justify-center">
                <Building2 className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {currentSponsor.name}
            </h4>
            {currentSponsor.description && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {currentSponsor.description}
              </p>
            )}
            {currentSponsor.website && (
              <div className="flex items-center mt-2 text-xs text-orange-600">
                <ExternalLink className="h-3 w-3 mr-1" />
                Visiter le site
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};