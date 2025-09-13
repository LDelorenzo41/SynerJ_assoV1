import React, { useState, useEffect } from 'react';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { Users, Calendar, MapPin, Mail, Plus, Eye, UserPlus, Shield, AlertCircle } from 'lucide-react';

interface Club {
  id: string;
  name: string;
  description: string | null;
  club_email: string;
  club_code: string;
  created_at: string;
  association_id: string;
}

export default function Clubs() {
  const { profile, isAuthenticated } = useAuthNew();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followedClubs, setFollowedClubs] = useState<Set<string>>(new Set());

  // Déterminer les permissions selon le rôle
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
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
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
    // Si c'est le propre club de l'utilisateur (Member)
    if (club.id === profile?.club_id) {
      return (
        <div className="flex items-center text-green-600 text-sm font-medium">
          <Shield className="h-4 w-4 mr-1" />
          Mon Club
        </div>
      );
    }

    // Si l'utilisateur peut suivre des clubs
    if (canFollowClubs) {
      const isFollowing = followedClubs.has(club.id);
      return (
        <button
          onClick={() => handleFollowClub(club.id)}
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isFollowing 
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
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

  // Supporter sans association = page d'avertissement
  if (profile?.role === 'Supporter' && !profile?.association_id) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Clubs</h1>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-yellow-900 mb-2">Association requise</h2>
              <p className="text-yellow-800 mb-4">
                Pour découvrir les clubs, vous devez d'abord rejoindre une association. 
                Rendez-vous sur votre tableau de bord pour choisir une association à suivre.
              </p>
              <a
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchClubs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Clubs</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Users className="h-4 w-4 mr-1" />
          {profile?.role === 'Super Admin' ? 'Gestion des clubs' :
           profile?.role === 'Club Admin' ? 'Vue admin' :
           profile?.role === 'Member' ? 'Mes clubs et communauté' :
           'Clubs disponibles'}
        </div>
      </div>

      {/* Informations contextuelles selon le rôle */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              {profile?.role === 'Super Admin' && 'Gestion complète des clubs'}
              {profile?.role === 'Club Admin' && 'Vue administrative de votre club'}
              {profile?.role === 'Member' && 'Votre club et clubs à suivre'}
              {profile?.role === 'Supporter' && 'Clubs à suivre dans votre association'}
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              {profile?.role === 'Super Admin' && 'Vous pouvez voir tous les codes d\'invitation et gérer tous les clubs.'}
              {profile?.role === 'Club Admin' && 'Vous pouvez voir le code d\'invitation de votre club uniquement.'}
              {profile?.role === 'Member' && 'Vous pouvez suivre d\'autres clubs pour recevoir leurs actualités publiques.'}
              {profile?.role === 'Supporter' && 'Vous pouvez suivre des clubs pour recevoir leurs actualités publiques.'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clubs.map((club) => (
          <div
            key={club.id}
            className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
              club.id === profile?.club_id 
                ? 'border-green-200 bg-green-50' 
                : followedClubs.has(club.id)
                ? 'border-blue-200 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {club.name}
                  </h3>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <Mail className="h-4 w-4 mr-1" />
                    {club.club_email}
                  </div>
                </div>
                {getClubActionButton(club)}
              </div>

              {club.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {club.description}
                </p>
              )}

              {/* Code d'invitation selon les permissions */}
              {shouldShowClubCode(club) && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                      Code d'invitation
                    </span>
                    {profile?.role === 'Super Admin' && (
                      <span className="text-xs text-blue-600">Admin</span>
                    )}
                    {canSeeOwnClubCode && club.id === profile?.club_id && (
                      <span className="text-xs text-green-600">Mon club</span>
                    )}
                  </div>
                  <p className="text-lg font-mono font-bold text-gray-900 mt-1">
                    {club.club_code}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Créé le {new Date(club.created_at).toLocaleDateString('fr-FR')}</span>
                {followedClubs.has(club.id) && club.id !== profile?.club_id && (
                  <span className="text-blue-600 font-medium">Suivi</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {clubs.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Aucun club trouvé dans votre association.</p>
          {profile?.role === 'Super Admin' && (
            <p className="text-sm text-gray-400">Les nouveaux clubs apparaîtront ici automatiquement.</p>
          )}
        </div>
      )}
    </div>
  );
}