import React, { useEffect, useState } from 'react';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { Users, Plus, Edit, Save, X } from 'lucide-react';
import type { Database } from '../lib/supabase';

type Club = Database['public']['Tables']['clubs']['Row'];

export default function Clubs() {
  const { profile, isSuperAdmin, isClubAdmin } = useAuthNew();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClub, setEditingClub] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    club_email: '',
  });

  useEffect(() => {
    // Si on a des données factices, on utilise des données factices
    if (profile?.club_id === 'fake-club-id') {
      console.log('Using fake club data');
      const fakeClubs: Club[] = [
        {
          id: 'fake-club-id',
          name: 'Club de Test',
          description: 'Un club de démonstration pour tester l\'application',
          club_email: 'club@test.com',
          association_id: 'fake-assoc-id',
          club_code: 'CLUB-12345678',
          created_at: new Date().toISOString(),
        }
      ];
      setClubs(fakeClubs);
      setLoading(false);
      return;
    }

    // Sinon, on fait la vraie requête
    fetchClubs();
  }, [profile]);

  const fetchClubs = async () => {
    try {
      let query = supabase.from('clubs').select('*');

      if (isSuperAdmin && profile?.association_id) {
        query = query.eq('association_id', profile.association_id);
      } else if (isClubAdmin && profile?.club_id) {
        query = query.eq('id', profile.club_id);
      } else {
        // For members and supporters, show all clubs
        query = query;
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setClubs(data || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (club: Club) => {
    setEditingClub(club.id);
    setEditForm({
      name: club.name,
      description: club.description || '',
      club_email: club.club_email,
    });
  };

  const handleSave = async (clubId: string) => {
    // Si c'est des données factices, on simule la sauvegarde
    if (clubId === 'fake-club-id') {
      console.log('Simulating club update for fake data');
      setClubs(clubs.map(club => 
        club.id === clubId 
          ? { ...club, ...editForm }
          : club
      ));
      setEditingClub(null);
      return;
    }

    // Sinon, vraie sauvegarde
    try {
      const { error } = await supabase
        .from('clubs')
        .update(editForm)
        .eq('id', clubId);

      if (error) throw error;

      setClubs(clubs.map(club => 
        club.id === clubId 
          ? { ...club, ...editForm }
          : club
      ));
      setEditingClub(null);
    } catch (error: any) {
      console.error('Error updating club:', error);
      alert('Error updating club: ' + error.message);
    }
  };

  const handleCancel = () => {
    setEditingClub(null);
    setEditForm({ name: '', description: '', club_email: '' });
  };

  const canEditClub = (club: Club) => {
    return (isSuperAdmin && profile?.association_id === club.association_id) ||
           (isClubAdmin && profile?.club_id === club.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {isClubAdmin ? 'Mon Club' : 'Clubs'}
        </h1>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            {isClubAdmin ? 'Détails du Club' : `Tous les Clubs (${clubs.length})`}
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {clubs.map((club) => (
            <div key={club.id} className="px-6 py-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {editingClub === club.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom du Club
                        </label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Courriel
                        </label>
                        <input
                          type="email"
                          value={editForm.club_email}
                          onChange={(e) => setEditForm({ ...editForm, club_email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{club.name}</h3>
                      <p className="text-sm text-gray-600">{club.club_email}</p>
                      <p className="text-sm text-gray-500 font-mono mt-1 bg-gray-100 px-2 py-1 rounded inline-block">
                        {club.club_code}
                      </p>
                      {club.description && (
                        <p className="text-sm text-gray-600 mt-2">{club.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Créé le : {new Date(club.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                </div>
                
                {canEditClub(club) && (
                  <div className="flex space-x-2 ml-4">
                    {editingClub === club.id ? (
                      <>
                        <button
                          onClick={() => handleSave(club.id)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Sauvegarder les Modifications"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Annuler"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEdit(club)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Modifier le Club"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {clubs.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Aucun club trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}