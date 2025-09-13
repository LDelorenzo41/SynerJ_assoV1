import React, { useState, useEffect } from 'react';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { Calendar, Users, Building, Search, Eye, AlertCircle } from 'lucide-react';

interface AssociationInfo {
  id: string;
  name: string;
}

interface ClubInfo {
  id: string;
  name: string;
}

export default function Dashboard() {
  const { profile, isSuperAdmin, isClubAdmin } = useAuthNew();
  const [associationInfo, setAssociationInfo] = useState<AssociationInfo | null>(null);
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [availableAssociations, setAvailableAssociations] = useState<AssociationInfo[]>([]);
  const [showAssociationSearch, setShowAssociationSearch] = useState(false);
  const [showChangeConfirmation, setShowChangeConfirmation] = useState(false);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserInfo();
  }, [profile]);

  const fetchUserInfo = async () => {
    if (!profile) return;

    try {
      if (profile.association_id) {
        const { data: association, error: assocError } = await supabase
          .from('associations')
          .select('id, name')
          .eq('id', profile.association_id)
          .single();
        if (!assocError && association) setAssociationInfo(association);
      }

      if (profile.club_id) {
        const { data: club, error: clubError } = await supabase
          .from('clubs')
          .select('id, name')
          .eq('id', profile.club_id)
          .single();
        if (!clubError && club) setClubInfo(club);
      }
      
      if (profile.role === 'Supporter') {
        const { data: associations, error: assocError } = await supabase
          .from('associations')
          .select('id, name')
          .order('name');
        if (!assocError && associations) {
          setAvailableAssociations(associations);
        }
      }

    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinAssociation = async (associationId: string) => {
    if (!profile?.id) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ association_id: associationId })
        .eq('id', profile.id);
      if (error) throw error;
      await fetchUserInfo();
      setShowAssociationSearch(false);
      window.location.reload();
    } catch (error) {
      console.error('Error joining association:', error);
    }
  };
  
  const handleAssociationSelection = (associationId: string) => {
    setSelectedAssociationId(associationId);
    setShowChangeConfirmation(true);
  };

  const confirmAssociationChange = () => {
    if (selectedAssociationId) {
      handleJoinAssociation(selectedAssociationId);
    }
    setShowChangeConfirmation(false);
    setSelectedAssociationId(null);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'Super Admin': return 'Super Admin';
      case 'Club Admin': return 'Admin Club';
      case 'Member': return 'Membre';
      case 'Supporter': return 'Supporter';
      default: return role;
    }
  };

  const renderClubSection = () => {
    if (profile?.role === 'Supporter') {
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Club</p>
              <p className="text-lg font-semibold text-gray-500">Aucun club</p>
              <p className="text-xs text-gray-400">Accès aux événements publics</p>
            </div>
          </div>
        </div>
      );
    }
    if (clubInfo) {
      return (
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Club</p>
              <p className="text-lg font-semibold text-gray-900">{clubInfo.name}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  const renderAssociationSection = () => {
    if (profile?.role === 'Supporter') {
      const hasAssociation = !!associationInfo;
      const bgColor = hasAssociation ? 'bg-purple-50' : 'bg-yellow-50';
      const iconColor = hasAssociation ? 'text-purple-600' : 'text-yellow-600';
      const buttonHoverBg = hasAssociation ? 'hover:bg-purple-100' : 'hover:bg-yellow-100';

      // **CORRECTION : On pré-calcule la liste des autres associations**
      const otherAssociations = availableAssociations.filter(assoc => assoc.id !== profile?.association_id);

      return (
        <div className={`${bgColor} p-4 rounded-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building className={`h-8 w-8 ${iconColor} mr-3`} />
              <div>
                <p className="text-sm text-gray-600">Association</p>
                <p className="text-lg font-semibold text-gray-900">
                  {hasAssociation ? associationInfo.name : 'Non affilié'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAssociationSearch(!showAssociationSearch)}
              className={`${iconColor} p-2 rounded-lg ${buttonHoverBg}`}
              title={hasAssociation ? "Changer d'association" : "Rechercher une association"}
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
          
          {showAssociationSearch && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 mb-2">
                {hasAssociation ? 'Changer pour :' : 'Associations disponibles :'}
              </p>
              
              {/* **CORRECTION : On vérifie si la liste pré-calculée n'est pas vide** */}
              {otherAssociations.length > 0 ? (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {otherAssociations.map((association) => (
                    <button
                      key={association.id}
                      onClick={() => handleAssociationSelection(association.id)}
                      className="w-full text-left px-3 py-2 text-sm bg-white rounded border hover:bg-gray-50 transition-colors"
                    >
                      {association.name}
                    </button>
                  ))}
                </div>
              ) : (
                // **Message affiché si aucune autre association n'est disponible**
                <p className="text-sm text-gray-500 italic px-3 py-2 bg-white rounded border">
                  Aucune autre association n'est disponible pour le moment.
                </p>
              )}
            </div>
          )}
        </div>
      );
    }

    if (associationInfo) {
      return (
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Association</p>
              <p className="text-lg font-semibold text-gray-900">{associationInfo.name}</p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenue, {profile?.first_name} {profile?.last_name}
          </h1>
          <p className="text-gray-600 mt-2">
            Tableau de bord {getRoleDisplayName(profile?.role || '')}
          </p>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Rôle</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {getRoleDisplayName(profile?.role || '')}
                  </p>
                </div>
              </div>
            </div>
            
            {renderClubSection()}
            
            {renderAssociationSection()}
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Actions Rapides
          </h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isSuperAdmin && (
              <>
                <a href="/associations" className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <Building className="h-6 w-6 text-blue-600 mb-2" />
                  <p className="font-medium text-gray-900">Gérer Association</p>
                  <p className="text-sm text-gray-600">Modifier les détails</p>
                </a>
                <a href="/clubs" className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <Users className="h-6 w-6 text-green-600 mb-2" />
                  <p className="font-medium text-gray-900">Gérer Clubs</p>
                  <p className="text-sm text-gray-600">Voir tous les clubs</p>
                </a>
              </>
            )}
            
            {isClubAdmin && (
              <>
                <a href="/my-club" className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <Users className="h-6 w-6 text-green-600 mb-2" />
                  <p className="font-medium text-gray-900">Mon Club</p>
                  <p className="text-sm text-gray-600">Gérer mon club</p>
                </a>
                <a href="/events" className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <Calendar className="h-6 w-6 text-purple-600 mb-2" />
                  <p className="font-medium text-gray-900">Événements</p>
                  <p className="text-sm text-gray-600">Créer et gérer</p>
                </a>
              </>
            )}
            
            <a href="/events" className="block p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
              <Calendar className="h-6 w-6 text-yellow-600 mb-2" />
              <p className="font-medium text-gray-900">Voir Événements</p>
              <p className="text-sm text-gray-600">Parcourir les événements</p>
            </a>

            {(profile?.role === 'Member' || profile?.role === 'Supporter') && (
              <a href="/clubs" className="block p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                <Users className="h-6 w-6 text-indigo-600 mb-2" />
                <p className="font-medium text-gray-900">Découvrir Clubs</p>
                <p className="text-sm text-gray-600">Explorer et suivre</p>
              </a>
            )}

            <a href="/sponsors" className="block p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <Building className="h-6 w-6 text-orange-600 mb-2" />
              <p className="font-medium text-gray-900">Nos Sponsors</p>
              <p className="text-sm text-gray-600">Découvrir qui nous soutient</p>
            </a>
          </div>
        </div>
      </div>

      {showChangeConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Changer d'association</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Vous êtes sur le point de changer d'association. Cette action va :
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
                <li>Supprimer tous vos clubs suivis actuels</li>
                <li>Réinitialiser vos préférences de clubs</li>
                <li>Vous donner accès aux clubs de la nouvelle association</li>
              </ul>
              <p className="text-yellow-800 bg-yellow-50 p-3 rounded text-sm">
                <strong>Attention :</strong> Cette action est irréversible. Vous devrez à nouveau choisir les clubs à suivre dans votre nouvelle association.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowChangeConfirmation(false);
                  setSelectedAssociationId(null);
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmAssociationChange}
                className="flex-1 py-2 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Confirmer le changement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}