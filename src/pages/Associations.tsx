import React, { useEffect, useState } from 'react';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { Building, Edit, Save, X, Users, Mail, Phone, MapPin, Calendar, Copy, Check, ExternalLink, Globe, Trash2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Database } from '../lib/supabase';
import { ClubService } from '../services/clubService';

type Association = Database['public']['Tables']['associations']['Row'];
type Club = Database['public']['Tables']['clubs']['Row'];

export default function Associations() {
  const { profile, isSuperAdmin } = useAuthNew();
  const [association, setAssociation] = useState<Association | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalClubAdmins: 0,
    totalSupporters: 0
  });
  const [editForm, setEditForm] = useState({
    name: '',
    city: '',
    email: '',
    phone: '',
    description: '',
  });

  // États pour la suppression de club
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    club: Club | null;
    info: { clubName: string; memberCount: number; eventCount: number } | null;
    loading: boolean;
  }>({
    show: false,
    club: null,
    info: null,
    loading: false,
  });

  useEffect(() => {
    if (profile?.association_id) {
      fetchAssociationData();
      fetchStats();
    }
  }, [profile]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('association_id', profile!.association_id!);

      if (error) throw error;

      const members = data?.filter(p => p.role === 'Member').length || 0;
      const clubAdmins = data?.filter(p => p.role === 'Club Admin').length || 0;
      const supporters = data?.filter(p => p.role === 'Supporter').length || 0;

      setStats({
        totalMembers: members,
        totalClubAdmins: clubAdmins,
        totalSupporters: supporters
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAssociationData = async () => {
    try {
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

  const copyCodeToClipboard = () => {
    if (association?.association_code) {
      navigator.clipboard.writeText(association.association_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Ouvrir la modal de confirmation de suppression
  const openDeleteModal = async (club: Club) => {
    try {
      setDeleteModal({ show: true, club, info: null, loading: true });
      
      // Récupérer les infos du club pour afficher dans la modal
      const info = await ClubService.getClubDeletionInfo(club.id);
      
      setDeleteModal(prev => ({ ...prev, info, loading: false }));
    } catch (error: any) {
      console.error('Error fetching club info:', error);
      alert('Erreur lors de la récupération des informations du club');
      setDeleteModal({ show: false, club: null, info: null, loading: false });
    }
  };

  // Fermer la modal
  const closeDeleteModal = () => {
    setDeleteModal({ show: false, club: null, info: null, loading: false });
  };

  // Supprimer le club
  const handleDeleteClub = async () => {
    if (!deleteModal.club) return;

    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));

      // Appeler le service de suppression
      await ClubService.deleteClub(deleteModal.club.id);

      // Rafraîchir les données
      await fetchAssociationData();
      await fetchStats();

      // Fermer la modal
      closeDeleteModal();

      // Message de succès
      alert('Club supprimé avec succès. Les membres ont été convertis en Supporters.');
    } catch (error: any) {
      console.error('Error deleting club:', error);
      alert('Erreur lors de la suppression du club: ' + error.message);
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const LogoDisplay = ({ src, alt, size = 'w-16 h-16' }: { src: string | null; alt: string; size?: string }) => {
    const [imageError, setImageError] = useState(false);

    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center overflow-hidden flex-shrink-0 border-4 border-white dark:border-slate-700 shadow-lg`}>
        {src && !imageError ? (
          <img 
            src={src} 
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Building className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        )}
      </div>
    );
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building className="h-16 w-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-xl dark-text-muted">Accès refusé</p>
          <p className="text-sm dark-text-muted mt-2">Rôle Super Admin requis</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 dark:border-purple-400"></div>
      </div>
    );
  }

  if (!association) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building className="h-16 w-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-xl dark-text-muted">Aucune structure trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec logo et infos principales */}
      <div className="dark-card shadow-sm rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 px-6 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <LogoDisplay src={association.logo_url} alt={association.name} size="w-24 h-24" />
              <div>
                {editing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="text-3xl font-bold dark-input px-3 py-2 rounded-lg mb-2"
                  />
                ) : (
                  <h1 className="text-3xl font-bold dark-text mb-2">{association.name}</h1>
                )}
                <div className="flex items-center space-x-4 text-sm dark-text-muted">
                  {editing ? (
                    <>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <input
                          type="text"
                          value={editForm.city}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          placeholder="Ville"
                          className="dark-input px-2 py-1 rounded text-sm"
                        />
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="dark-input px-2 py-1 rounded text-sm"
                        />
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          placeholder="Téléphone"
                          className="dark-input px-2 py-1 rounded text-sm"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {association.city && (
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {association.city}
                        </span>
                      )}
                      <span className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {association.email}
                      </span>
                      {association.phone && (
                        <span className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {association.phone}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="p-2 text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 rounded-lg transition-colors shadow-sm"
                    title="Enregistrer"
                  >
                    <Save className="h-5 w-5" />
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
                    className="p-2 text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded-lg transition-colors shadow-sm"
                    title="Annuler"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="p-2 text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 rounded-lg transition-colors shadow-sm"
                  title="Modifier"
                >
                  <Edit className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            {editing ? (
              <textarea
                rows={2}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Description de la structure"
                className="w-full dark-input px-3 py-2 rounded-lg"
              />
            ) : (
              association.description && (
                <p className="text-sm dark-text-muted max-w-3xl">
                  {association.description}
                </p>
              )
            )}
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border-t border-gray-200 dark:border-gray-600">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm dark-text-muted">Clubs</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{clubs.length}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50" />
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm dark-text-muted">Membres</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-green-600 dark:text-green-400 opacity-50" />
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm dark-text-muted">Admins Club</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalClubAdmins}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-400 opacity-50" />
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm dark-text-muted">Supporters</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.totalSupporters}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600 dark:text-orange-400 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Code de Structure */}
      <div className="dark-card shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-semibold dark-text flex items-center">
            <Building className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
            Code de Structure
          </h2>
        </div>
        <div className="p-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm dark-text-muted mb-2">Code à partager avec les clubs</p>
                <div className="flex items-center space-x-4">
                  <code className="text-3xl font-mono font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                    {association.association_code}
                  </code>
                  <button
                    onClick={copyCodeToClipboard}
                    className="p-2 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 rounded-lg transition-colors border border-purple-200 dark:border-purple-700"
                    title="Copier le code"
                  >
                    {copiedCode ? (
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Copy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    )}
                  </button>
                </div>
                {copiedCode && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">Code copié !</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des Clubs */}
      <div className="dark-card shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
          <h2 className="text-xl font-semibold dark-text flex items-center">
            <Building className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
            Clubs de la Structure ({clubs.length})
          </h2>
          <Link
            to="/clubs"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center"
          >
            Gérer les clubs
            <ExternalLink className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="p-6">
          {clubs.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-16 w-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-lg dark-text-muted mb-2">Aucun club enregistré</p>
              <p className="text-sm dark-text-muted">Les clubs peuvent rejoindre votre structure en utilisant le code ci-dessus</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubs.map((club) => (
                <div key={club.id} className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0 mr-2">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {club.logo_url ? (
                          <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building className="h-6 w-6 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold dark-text truncate">{club.name}</h3>
                        
                        <div className="mt-2 space-y-1">
                          <p className="text-xs dark-text-muted flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {club.club_email}
                          </p>
                          <p className="text-xs font-mono text-green-600 dark:text-green-400 flex items-center">
                            <Building className="h-3 w-3 mr-1" />
                            {club.club_code}
                          </p>
                          <p className="text-xs dark-text-muted flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(club.created_at).toLocaleDateString('fr-FR')}
                          </p>
                          {club.website_url && (
                            <a 
                              href={club.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center hover:underline"
                            >
                              <Globe className="h-3 w-3 mr-1" />
                              Site web
                              <ExternalLink className="h-2.5 w-2.5 ml-1" />
                            </a>
                          )}
                        </div>
                        {club.description && (
                          <p className="text-xs dark-text-muted mt-2 line-clamp-2">{club.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => openDeleteModal(club)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                      title="Supprimer le club"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold dark-text">Confirmer la suppression</h3>
            </div>

            {deleteModal.loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-red-400"></div>
              </div>
            ) : (
              <>
                <div className="mb-6 space-y-3">
                  <p className="dark-text">
                    Êtes-vous sûr de vouloir supprimer le club <span className="font-semibold">{deleteModal.info?.clubName}</span> ?
                  </p>
                  
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                    <p className="text-sm dark-text-muted mb-2">
                      <strong>Cette action va :</strong>
                    </p>
                    <ul className="text-sm dark-text-muted space-y-1 list-disc list-inside">
                      <li>Supprimer définitivement le club</li>
                      <li>Supprimer tous les événements du club ({deleteModal.info?.eventCount || 0})</li>
                      <li>Convertir {deleteModal.info?.memberCount || 0} membre(s) en <strong>Supporters</strong></li>
                      <li>Les membres pourront toujours suivre d'autres clubs</li>
                    </ul>
                  </div>

                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    ⚠️ Cette action est irréversible
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={closeDeleteModal}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark-text rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteClub}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg transition-colors font-medium"
                  >
                    Supprimer le club
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}