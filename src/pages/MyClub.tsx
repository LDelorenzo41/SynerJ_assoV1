import React, { useState, useEffect } from 'react';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  Calendar, 
  Settings, 
  Mail, 
  Copy, 
  Check,
  AlertCircle,
  Building2,
  UserPlus,
  Edit
} from 'lucide-react';

interface ClubData {
  id: string;
  name: string;
  description: string;
  club_email: string;
  club_code: string;
  logo_url?: string;
  created_at: string;
  association: {
    id: string;
    name: string;
  };
}

interface ClubMember {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar_url?: string;
  created_at: string;
}

interface ClubStats {
  totalMembers: number;
  totalEvents: number;
  upcomingEvents: number;
}

export default function MyClub() {
  const { profile, isAuthenticated } = useAuthNew();
  const [clubData, setClubData] = useState<ClubData | null>(null);
  const [clubMembers, setClubMembers] = useState<ClubMember[]>([]);
  const [clubStats, setClubStats] = useState<ClubStats>({ totalMembers: 0, totalEvents: 0, upcomingEvents: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (isAuthenticated && profile?.role === 'Club Admin' && profile?.club_id) {
      fetchClubData();
    } else {
      setError("Accès non autorisé. Vous devez être Admin du club.");
      setLoading(false);
    }
  }, [isAuthenticated, profile]);

  const fetchClubData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les données du club avec l'association
      const { data: club, error: clubError } = await supabase
        .from('clubs')
        .select(`
          *,
          association:associations(id, name)
        `)
        .eq('id', profile?.club_id)
        .single();

      if (clubError) throw clubError;
      setClubData(club);

      // Récupérer les membres du club - Solution sécurisée au niveau applicatif
      const { data: allMembers, error: membersError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role, avatar_url, created_at, club_id')
        .eq('club_id', profile?.club_id);

      if (membersError) throw membersError;
      setClubMembers(allMembers || []);

      // Récupérer les statistiques du club
      const [eventsResult, upcomingEventsResult] = await Promise.all([
        supabase
          .from('events')
          .select('id')
          .eq('club_id', profile?.club_id),
        supabase
          .from('events')
          .select('id')
          .eq('club_id', profile?.club_id)
          .gte('date', new Date().toISOString())
      ]);

      setClubStats({
        totalMembers: allMembers?.length || 0,
        totalEvents: eventsResult.data?.length || 0,
        upcomingEvents: upcomingEventsResult.data?.length || 0
      });

    } catch (err: any) {
      console.error('Erreur lors du chargement des données du club:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyClubCode = async () => {
    if (clubData?.club_code) {
      try {
        await navigator.clipboard.writeText(clubData.club_code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (err) {
        console.error('Erreur lors de la copie:', err);
      }
    }
  };

  if (!isAuthenticated || profile?.role !== 'Club Admin') {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès non autorisé</h2>
        <p className="text-gray-600">Cette page est réservée aux administrateurs de club.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchClubData}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!clubData) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun club trouvé</h2>
        <p className="text-gray-600">Vous n'êtes pas encore assigné à un club.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête du club */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {clubData.logo_url ? (
                <img
                  src={clubData.logo_url}
                  alt={`Logo ${clubData.name}`}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-green-600" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{clubData.name}</h1>
                <p className="text-gray-600">Tableau de bord de votre club</p>
                <p className="text-sm text-gray-500">
                  Membre de l'association : {clubData.association.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Membres</p>
                  <p className="text-2xl font-bold text-gray-900">{clubStats.totalMembers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Événements à venir</p>
                  <p className="text-2xl font-bold text-gray-900">{clubStats.upcomingEvents}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total événements</p>
                  <p className="text-2xl font-bold text-gray-900">{clubStats.totalEvents}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code d'invitation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Code d'invitation
          </h2>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Partagez ce code avec les personnes que vous souhaitez inviter dans votre club :
            </p>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-white border rounded-lg px-4 py-3">
                <code className="text-lg font-mono text-gray-900 select-all">
                  {clubData.club_code}
                </code>
              </div>
              <button
                onClick={copyClubCode}
                className={`px-4 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                  copiedCode 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {copiedCode ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copié!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Informations du club */}
      {clubData.description && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Description</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed">{clubData.description}</p>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Actions Rapides
          </h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a 
              href="/events" 
              className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Calendar className="h-6 w-6 text-purple-600 mb-2" />
              <p className="font-medium text-gray-900">Gérer les Événements</p>
              <p className="text-sm text-gray-600">Créer et organiser</p>
            </a>
            
            <a 
              href="/settings" 
              className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Settings className="h-6 w-6 text-blue-600 mb-2" />
              <p className="font-medium text-gray-900">Paramètres du Club</p>
              <p className="text-sm text-gray-600">Configuration</p>
            </a>
            
            <div className="block p-4 bg-green-50 rounded-lg">
              <Mail className="h-6 w-6 text-green-600 mb-2" />
              <p className="font-medium text-gray-900">Contact Club</p>
              <p className="text-sm text-gray-600 truncate">{clubData.club_email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des membres */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Membres du Club ({clubMembers.length})
            </h2>
          </div>
        </div>
        <div className="p-6">
          {clubMembers.length > 0 ? (
            <div className="space-y-4">
              {clubMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={`${member.first_name} ${member.last_name}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-sm text-gray-600">ID: {member.id.substring(0, 8)}...</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      member.role === 'Club Admin' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {member.role === 'Club Admin' ? 'Admin' : 'Membre'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Depuis {new Date(member.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun membre pour le moment</p>
              <p className="text-sm text-gray-500 mt-2">
                Partagez le code d'invitation pour inviter des membres
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}