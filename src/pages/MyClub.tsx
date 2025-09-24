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
  Edit,
  Save,
  X,
  Globe // Ajout de l'icône Globe pour le site web
} from 'lucide-react';

interface ClubData {
  id: string;
  name: string;
  description: string;
  club_email: string;
  contact_email: string | null;
  website_url: string | null; // AJOUTÉ : Champ website_url
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
  totalSponsors: number;
}

export default function MyClub() {
  const { profile, isAuthenticated } = useAuthNew();
  const [clubData, setClubData] = useState<ClubData | null>(null);
  const [clubMembers, setClubMembers] = useState<ClubMember[]>([]);
  const [clubStats, setClubStats] = useState<ClubStats>({ 
    totalMembers: 0, 
    totalEvents: 0, 
    upcomingEvents: 0,
    totalSponsors: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // États pour l'édition des informations du club
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    contact_email: '',
    website_url: '' // AJOUTÉ : Champ website_url dans l'état du formulaire d'édition
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      
      // Initialiser le formulaire d'édition avec les données actuelles
      setEditForm({
        name: club.name || '',
        description: club.description || '',
        contact_email: club.contact_email || '',
        website_url: club.website_url || '' // AJOUTÉ : Initialisation de website_url
      });

      // Récupérer les membres du club - Solution sécurisée au niveau applicatif
      const { data: allMembers, error: membersError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role, avatar_url, created_at, club_id')
        .eq('club_id', profile?.club_id);

      if (membersError) throw membersError;
      setClubMembers(allMembers || []);

      // Récupérer les statistiques du club
      const [eventsResult, upcomingEventsResult, sponsorsResult] = await Promise.all([
        supabase
          .from('events')
          .select('id')
          .eq('club_id', profile?.club_id),
        supabase
          .from('events')
          .select('id')
          .eq('club_id', profile?.club_id)
          .gte('date', new Date().toISOString()),
        supabase
          .from('sponsors')
          .select('id')
          .eq('club_id', profile?.club_id)
      ]);

      setClubStats({
        totalMembers: allMembers?.length || 0,
        totalEvents: eventsResult.data?.length || 0,
        upcomingEvents: upcomingEventsResult.data?.length || 0,
        totalSponsors: sponsorsResult.data?.length || 0 
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubData) return;

    setEditLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('clubs')
        .update({
          name: editForm.name.trim(),
          description: editForm.description.trim() || null,
          contact_email: editForm.contact_email.trim() || null,
          website_url: editForm.website_url.trim() || null // AJOUTÉ : Mise à jour de website_url
        })
        .eq('id', clubData.id);

      if (error) throw error;

      // Mettre à jour les données locales
      setClubData({
        ...clubData,
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        contact_email: editForm.contact_email.trim() || null,
        website_url: editForm.website_url.trim() || null // AJOUTÉ : Mise à jour locale de website_url
      });

      setIsEditing(false);
      setMessage({
        type: 'success',
        text: 'Informations du club mises à jour avec succès !'
      });

      // Effacer le message après 3 secondes
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setMessage(null);
    // Restaurer les valeurs originales
    setEditForm({
      name: clubData?.name || '',
      description: clubData?.description || '',
      contact_email: clubData?.contact_email || '',
      website_url: clubData?.website_url || '' // AJOUTÉ : Restauration de website_url
    });
  };

  if (!isAuthenticated || profile?.role !== 'Club Admin') {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold dark-text mb-2">Accès non autorisé</h2>
        <p className="dark-text-muted">Cette page est réservée aux administrateurs de club.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 dark:border-green-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button 
          onClick={fetchClubData}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!clubData) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold dark-text mb-2">Aucun club trouvé</h2>
        <p className="dark-text-muted">Vous n'êtes pas encore assigné à un club.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message de succès/erreur */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
        }`}>
          <div className="flex items-start">
            {message.type === 'success' ? (
              <Check className="h-5 w-5 mr-3 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            )}
            <p className="flex-1">{message.text}</p>
          </div>
        </div>
      )}

      {/* En-tête du club */}
      <div className="dark-card rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {clubData.logo_url ? (
                <img
                  src={clubData.logo_url}
                  alt={`Logo ${clubData.name}`}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold dark-text">{clubData.name}</h1>
                <p className="dark-text-muted">Tableau de bord de votre club</p>
                <p className="text-sm dark-text-muted">
                  Membre de l'association : {clubData.association.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-gray-100 dark:bg-slate-700 dark-text-muted rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <p className="text-sm dark-text-muted">Membres</p>
                  <p className="text-2xl font-bold dark-text">{clubStats.totalMembers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
                <div>
                  <p className="text-sm dark-text-muted">Événements à venir</p>
                  <p className="text-2xl font-bold dark-text">{clubStats.upcomingEvents}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
                <div>
                  <p className="text-sm dark-text-muted">Total événements</p>
                  <p className="text-2xl font-bold dark-text">{clubStats.totalEvents}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-orange-600 dark:text-orange-400 mr-3" />
                <div>
                  <p className="text-sm dark-text-muted">Sponsors</p>
                  <p className="text-2xl font-bold dark-text">{clubStats.totalSponsors}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire d'édition */}
      {isEditing && (
        <div className="dark-card rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-xl font-semibold dark-text flex items-center">
              <Edit className="h-5 w-5 mr-2" />
              Modifier les informations du club
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium dark-text-muted mb-2">
                  Nom du club *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="dark-input w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all"
                  placeholder="Nom de votre club"
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark-text-muted mb-2">
                  Email de contact
                </label>
                <input
                  type="email"
                  value={editForm.contact_email}
                  onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                  className="dark-input w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all"
                  placeholder="contact@club.com"
                />
                <p className="mt-1 text-sm dark-text-muted">
                  Email affiché aux membres et followers (optionnel). Différent de l'email de connexion.
                </p>
              </div>

              {/* AJOUTÉ : Champ Site web du club */}
              <div>
                <label className="block text-sm font-medium dark-text-muted mb-2">
                  Site web du club
                </label>
                <input
                  type="url"
                  value={editForm.website_url || ''}
                  onChange={(e) => setEditForm({ ...editForm, website_url: e.target.value })}
                  className="dark-input w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all"
                  placeholder="https://www.monclub.com"
                />
                <p className="mt-1 text-xs dark-text-muted">
                  URL complète du site web (optionnel)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium dark-text-muted mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="dark-input w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all"
                  placeholder="Décrivez brièvement votre club..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-3 px-6 border border-gray-300 dark:border-gray-600 rounded-lg dark-text-muted hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Code d'invitation */}
      <div className="dark-card rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-semibold dark-text flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Code d'invitation
          </h2>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
            <p className="text-sm dark-text-muted mb-3">
              Partagez ce code avec les personnes que vous souhaitez inviter dans votre club :
            </p>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3">
                <code className="text-lg font-mono dark-text select-all">
                  {clubData.club_code}
                </code>
              </div>
              <button
                onClick={copyClubCode}
                className={`px-4 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                  copiedCode 
                    ? 'bg-green-600 text-white dark:bg-green-500' 
                    : 'bg-gray-100 dark:bg-slate-700 dark-text-muted hover:bg-gray-200 dark:hover:bg-slate-600'
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
      {!isEditing && clubData.description && (
        <div className="dark-card rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-xl font-semibold dark-text">Description</h2>
          </div>
          <div className="p-6">
            <p className="dark-text-muted leading-relaxed">{clubData.description}</p>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="dark-card rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-semibold dark-text flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Actions Rapides
          </h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a 
              href="/events" 
              className="block p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2" />
              <p className="font-medium dark-text">Gérer les Événements</p>
              <p className="text-sm dark-text-muted">Créer et organiser</p>
            </a>
            
            <a 
              href="/sponsors" 
              className="block p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <Building2 className="h-6 w-6 text-orange-600 dark:text-orange-400 mb-2" />
              <p className="font-medium dark-text">Gérer les Sponsors</p>
              <p className="text-sm dark-text-muted">Partenaires du club</p>
            </a>
            
            <a 
              href="/settings" 
              className="block p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
              <p className="font-medium dark-text">Paramètres du Compte</p>
              <p className="text-sm dark-text-muted">Configuration personnelle</p>
            </a>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg space-y-2">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
              <div>
                <p className="font-medium dark-text">Contact du Club</p> {/* Titre ajusté */}
                <p className="text-xs dark-text-muted truncate">
                  <strong>Connexion :</strong> {clubData.club_email}
                </p>
                {clubData.contact_email && (
                  <p className="text-xs dark-text-muted truncate">
                    <strong>Contact :</strong> {clubData.contact_email}
                  </p>
                )}
                {!clubData.contact_email && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    Aucun email de contact défini
                  </p>
                )}
                {/* AJOUTÉ : Affichage du site web */}
                {clubData.website_url && (
                  <p className="text-xs dark-text-muted truncate flex items-center mt-1">
                    <Globe className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" /> {/* Icône Globe */}
                    <strong>Site web :</strong> 
                    <a 
                      href={clubData.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-green-700 dark:text-green-400 hover:underline ml-1"
                    >
                      {clubData.website_url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]} {/* Affiche une version simplifiée de l'URL */}
                    </a>
                  </p>
                )}
                {!clubData.website_url && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                    Aucun site web défini
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des membres */}
      <div className="dark-card rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold dark-text flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Membres du Club ({clubMembers.length})
            </h2>
          </div>
        </div>
        <div className="p-6">
          {clubMembers.length > 0 ? (
            <div className="space-y-4">
              {clubMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={`${member.first_name} ${member.last_name}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium dark-text">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-sm dark-text-muted">ID: {member.id.substring(0, 8)}...</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      member.role === 'Club Admin' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {member.role === 'Club Admin' ? 'Admin' : 'Membre'}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Depuis {new Date(member.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="dark-text-muted">Aucun membre pour le moment</p>
              <p className="text-sm dark-text-muted mt-2">
                Partagez le code d'invitation pour inviter des membres
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}