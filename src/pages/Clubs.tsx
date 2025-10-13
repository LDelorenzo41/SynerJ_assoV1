// Clubs.tsx - Version adaptée au Dark Mode avec website_url

import React, { useState, useEffect } from 'react';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
// ✅ MODIFICATION 1: Ajout de ExternalLink dans les imports
import { Users, Calendar, MapPin, Mail, Plus, Eye, UserPlus, Shield, AlertCircle, Building2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

// ✅ MODIFICATION 2: Ajout de website_url dans l'interface Club
interface Club {
  id: string;
  name: string;
  description: string | null;
  club_email: string;
  contact_email?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  club_code: string;
  created_at: string;
  association_id: string;
}

// MODIFIÉ: Composant description avec dark mode
const ExpandableDescription = ({ description }: { description: string | null }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!description) return null;

  const estimatedLines = Math.ceil(description.length / 80);
  const shouldShowToggle = estimatedLines > 2;

  if (!shouldShowToggle) {
    return (
      <p className="dark-text-muted text-sm mb-4">
        {description}
      </p>
    );
  }

  return (
    <div className="mb-4">
      <p className={`dark-text-muted text-sm transition-all duration-200 ${
        isExpanded ? '' : 'line-clamp-2'
      }`}>
        {description}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-blue-600 dark:text-blue-400 text-xs hover:text-blue-700 dark:hover:text-blue-300 mt-1 flex items-center transition-colors"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-3 w-3 mr-1" />
            Voir moins
          </>
        ) : (
          <>
            <ChevronDown className="h-3 w-3 mr-1" />
            Voir plus
          </>
        )}
      </button>
    </div>
  );
};

// MODIFIÉ: Logo avec dark mode
const ClubLogo = ({ logoUrl, clubName }: { logoUrl: string | null; clubName: string }) => {
  if (logoUrl) {
    return (
      <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 flex-shrink-0">
        <img
          src={logoUrl}
          alt={`Logo ${clubName}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="w-full h-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                  <div class="w-8 h-8 text-gray-400 dark:text-slate-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0v-3.5a2.5 2.5 0 015 0V21m0 0h4.5a2.5 2.5 0 005-2.5v-8.5a2.5 2.5 0 00-2.5-2.5H15"></path>
                    </svg>
                  </div>
                </div>
              `;
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-slate-700 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600 flex-shrink-0">
      <Building2 className="h-8 w-8 text-gray-400 dark:text-slate-400" />
    </div>
  );
};

export default function Clubs() {
  const { profile, isAuthenticated } = useAuthNew();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followedClubs, setFollowedClubs] = useState<Set<string>>(new Set());

  const canSeeAllClubCodes = profile?.role === 'Super Admin';
  const canSeeOwnClubCode = profile?.role === 'Club Admin' && profile.club_id;
  const canFollowClubs = profile?.role === 'Member' || profile?.role === 'Supporter';
  const isMember = profile?.role === 'Member';

  useEffect(() => {
    if (isAuthenticated && profile?.association_id) {
      fetchClubs();
      if (canFollowClubs) {
        fetchFollowedClubs();
      }
    }
  }, [isAuthenticated, profile]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      // ✅ MODIFICATION 3: Ajout de website_url dans la requête
      const { data, error } = await supabase
        .from('clubs')
        .select('*, contact_email, logo_url, website_url')
        .eq('association_id', profile?.association_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClubs(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowedClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('user_clubs')
        .select('club_id')
        .eq('user_id', profile?.id);

      if (error) throw error;
      const followedSet = new Set(data?.map(item => item.club_id) || []);
      setFollowedClubs(followedSet);
    } catch (err: any) {
      console.error('Error fetching followed clubs:', err);
    }
  };

  const handleFollowClub = async (clubId: string) => {
    if (!profile?.id) return;

    try {
      const isFollowing = followedClubs.has(clubId);
      
      if (isFollowing) {
        const { error } = await supabase
          .from('user_clubs')
          .delete()
          .eq('user_id', profile.id)
          .eq('club_id', clubId);

        if (error) throw error;
        setFollowedClubs(prev => {
          const newSet = new Set(prev);
          newSet.delete(clubId);
          return newSet;
        });
      } else {
        const { error } = await supabase
          .from('user_clubs')
          .insert([{ user_id: profile.id, club_id: clubId }]);

        if (error) throw error;
        setFollowedClubs(prev => new Set(prev).add(clubId));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const shouldShowClubCode = (club: Club) => {
    if (canSeeAllClubCodes) return true;
    if (canSeeOwnClubCode && club.id === profile?.club_id) return true;
    return false;
  };

  const getClubActionButton = (club: Club) => {
    if (club.id === profile?.club_id) {
      return (
        <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
          <Shield className="h-4 w-4 mr-1" />
          Mon Club
        </div>
      );
    }

    if (canFollowClubs) {
      const isFollowing = followedClubs.has(club.id);
      return (
        <button
          onClick={() => handleFollowClub(club.id)}
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isFollowing 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
          }`}
        >
          {isFollowing ? (
            <>
              <Eye className="h-4 w-4 mr-1" />
              Suivi
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Suivre
            </>
          )}
        </button>
      );
    }

    return null;
  };

  // MODIFIÉ: Page d'avertissement avec dark mode
  if (profile?.role === 'Supporter' && !profile?.association_id) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold dark-text">Clubs</h1>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Association requise</h2>
              <p className="text-yellow-800 dark:text-yellow-300 mb-4">
                Pour découvrir les clubs, vous devez d'abord rejoindre une association. 
                Rendez-vous sur votre tableau de bord pour choisir une association à suivre.
              </p>
              <a
                href="/dashboard"
                className="dark-btn-primary inline-flex items-center px-4 py-2 rounded-lg transition-colors"
              >
                <Users className="h-4 w-4 mr-2" />
                Aller au tableau de bord
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button 
          onClick={fetchClubs}
          className="dark-btn-primary px-4 py-2 rounded-lg transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* MODIFIÉ: Header avec dark mode */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark-text">Clubs</h1>
        <div className="flex items-center text-sm dark-text-muted">
          <Users className="h-4 w-4 mr-1" />
          {profile?.role === 'Super Admin' ? 'Gestion des clubs' :
           profile?.role === 'Club Admin' ? 'Vue admin' :
           profile?.role === 'Member' ? 'Mes clubs et communauté' :
           'Clubs disponibles'}
        </div>
      </div>

      {/* MODIFIÉ: Informations contextuelles avec dark mode */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {profile?.role === 'Super Admin' && 'Gestion complète des clubs'}
              {profile?.role === 'Club Admin' && 'Vue administrative de votre club'}
              {profile?.role === 'Member' && 'Votre club et clubs à suivre'}
              {profile?.role === 'Supporter' && 'Clubs à suivre dans votre association'}
            </h3>
            <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              {profile?.role === 'Super Admin' && 'Vous pouvez voir tous les codes d\'invitation et gérer tous les clubs.'}
              {profile?.role === 'Club Admin' && 'Vous pouvez voir le code d\'invitation de votre club uniquement.'}
              {profile?.role === 'Member' && 'Vous pouvez suivre d\'autres clubs pour recevoir leurs actualités publiques.'}
              {profile?.role === 'Supporter' && 'Vous pouvez suivre des clubs pour recevoir leurs actualités publiques.'}
            </div>
          </div>
        </div>
      </div>

      {/* MODIFIÉ: Grid des clubs avec dark mode */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clubs.map((club) => (
          <div
            key={club.id}
            className={`dark-card rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
              club.id === profile?.club_id 
                ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
                : followedClubs.has(club.id)
                ? 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600'
            }`}
          >
            <div className="p-6">
              {/* En-tête avec logo et actions */}
              <div className="flex items-start gap-4 mb-4">
                <ClubLogo logoUrl={club.logo_url || null} clubName={club.name} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold dark-text mb-2 truncate">
                        {club.name}
                      </h3>
                      <div className="space-y-1">
                        <div className="flex items-center dark-text-muted text-sm">
                          <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {club.contact_email || "Contact via l'association"}
                          </span>
                        </div>
                        {/* ✅ MODIFICATION 4: Affichage du lien vers le site web */}
                        {club.website_url && (
                          <a
                            href={club.website_url.startsWith('http') ? club.website_url : `https://${club.website_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">Site web</span>
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      {getClubActionButton(club)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description extensible */}
              <ExpandableDescription description={club.description} />

              {/* MODIFIÉ: Code d'invitation avec dark mode */}
              {shouldShowClubCode(club) && (
                <div className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-600 p-3 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium dark-text uppercase tracking-wide">
                      Code d'invitation
                    </span>
                    {profile?.role === 'Super Admin' && (
                      <span className="text-xs text-blue-600 dark:text-blue-400">Admin</span>
                    )}
                    {canSeeOwnClubCode && club.id === profile?.club_id && (
                      <span className="text-xs text-green-600 dark:text-green-400">Mon club</span>
                    )}
                  </div>
                  <p className="text-lg font-mono font-bold dark-text mt-1">
                    {club.club_code}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs dark-text-muted">
                <span>Créé le {new Date(club.created_at).toLocaleDateString('fr-FR')}</span>
                {followedClubs.has(club.id) && club.id !== profile?.club_id && (
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Suivi</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODIFIÉ: Message vide avec dark mode */}
      {clubs.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
          <p className="dark-text-muted mb-2">Aucun club trouvé dans votre association.</p>
          {profile?.role === 'Super Admin' && (
            <p className="text-sm dark-text-muted">Les nouveaux clubs apparaîtront ici automatiquement.</p>
          )}
        </div>
      )}
    </div>
  );
}