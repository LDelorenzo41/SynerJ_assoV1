import React, { useEffect, useState } from 'react';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { Building, Edit, Save, X } from 'lucide-react';
import type { Database } from '../lib/supabase';

type Association = Database['public']['Tables']['associations']['Row'];
type Club = Database['public']['Tables']['clubs']['Row'];

export default function Associations() {
  const { profile, isSuperAdmin } = useAuthNew();
  const [association, setAssociation] = useState<Association | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    city: '',
    email: '',
    phone: '',
    description: '',
  });

  useEffect(() => {
    if (profile?.association_id) {
      fetchAssociationData();
    }
  }, [profile]);

  const fetchAssociationData = async () => {
    try {
      // Fetch association details
      const { data: associationData, error: assocError } = await supabase
        .from('associations')
        .select('*')
        .eq('id', profile!.association_id!)
        .single();

      if (assocError) throw assocError;
      setAssociation(associationData);
      setEditForm({
        name: associationData.name,
        city: associationData.city || '',
        email: associationData.email,
        phone: associationData.phone || '',
        description: associationData.description || '',
      });

      // Fetch clubs
      const { data: clubsData, error: clubsError } = await supabase
        .from('clubs')
        .select('*')
        .eq('association_id', profile!.association_id!)
        .order('created_at', { ascending: false });

      if (clubsError) throw clubsError;
      setClubs(clubsData || []);
    } catch (error) {
      console.error('Error fetching association data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('associations')
        .update(editForm)
        .eq('id', association!.id);

      if (error) throw error;

      setAssociation({ ...association!, ...editForm });
      setEditing(false);
    } catch (error: any) {
      console.error('Error updating association:', error);
      alert('Error updating association: ' + error.message);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Access denied. Super Admin role required.</p>
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

  if (!association) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No association found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestion de l'Association</h1>
      </div>

      {/* Association Details */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Détails de l'Association
          </h2>
          <div className="flex space-x-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                  title="Save Changes"
                >
                  <Save className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditForm({
                      name: association.name,
                      city: association.city || '',
                      email: association.email,
                      phone: association.phone || '',
                      description: association.description || '',
                    });
                  }}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Annuler"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="Modifier l'Association"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'Association
              </label>
              {editing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-lg text-gray-900">{association.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Courriel
              </label>
              {editing ? (
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-lg text-gray-900">{association.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville
              </label>
              {editing ? (
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-lg text-gray-900">{association.city || 'Non spécifié'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-lg text-gray-900">{association.phone || 'Non spécifié'}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code d'Association
              </label>
              <p className="text-lg font-mono bg-gray-100 px-3 py-2 rounded">
                {association.association_code}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Partagez ce code avec les clubs pour rejoindre votre association
              </p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              {editing ? (
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-lg text-gray-900">{association.description || 'Aucune description'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Clubs List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Clubs ({clubs.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {clubs.map((club) => (
            <div key={club.id} className="px-6 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{club.name}</h3>
                  <p className="text-sm text-gray-600">{club.club_email}</p>
                  <p className="text-sm text-gray-500 font-mono mt-1">{club.club_code}</p>
                  {club.description && (
                    <p className="text-sm text-gray-600 mt-2">{club.description}</p>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Créé le : {new Date(club.created_at).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          ))}
          {clubs.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">Aucun club enregistré pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}