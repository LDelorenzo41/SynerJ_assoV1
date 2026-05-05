import React, { useState, useEffect, useMemo } from 'react';
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
  Globe,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Helper pour gérer les URLs de sites web (externes ou internes)
const getWebsiteUrl = (websiteUrl: string | null | undefined): string | null => {
  if (!websiteUrl) return null;
  
  // Si l'URL commence par http:// ou https://, c'est une URL externe
  if (websiteUrl.startsWith('http://') || websiteUrl.startsWith('https://')) {
    return websiteUrl;
  }
  
  // Si l'URL commence par /, c'est une URL relative (site généré)
  if (websiteUrl.startsWith('/')) {
    return window.location.origin + websiteUrl;
  }
  
  // Sinon, on considère que c'est un domaine sans protocole (ancien système)
  return `https://${websiteUrl}`;
};

interface ClubData {
  id: string;
  name: string;
  description: string;
  club_email: string;
  contact_email: string | null;
  website_url: string | null;
  club_code: string;
  sponsors_code: string;
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
  email: string | null;
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

// Composant de pagination des membres
function MembersList({ members }: { members: ClubMember[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage, setMembersPerPage] = useState(10);

  // Filtrage des membres selon la recherche
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return members;
    
    const search = searchTerm.toLowerCase();
    return members.filter(member => 
      member.first_name.toLowerCase().includes(search) ||
      member.last_name.toLowerCase().includes(search) ||
      (member.email && member.email.toLowerCase().includes(search))
    );
  }, [members, searchTerm]);

  // Calcul de la pagination
  const totalPages = membersPerPage === -1 ? 1 : Math.ceil(filteredMembers.length / membersPerPage);
  const startIndex = (currentPage - 1) * (membersPerPage === -1 ? filteredMembers.length : membersPerPage);
  const endIndex = membersPerPage === -1 ? filteredMembers.length : startIndex + membersPerPage;
  const currentMembers = filteredMembers.slice(startIndex, endIndex);

  // Réinitialiser à la page 1 quand on fait une recherche ou change le nombre par page
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, membersPerPage]);

  return (
    <div className="space-y-4">
      {/* Barre de recherche et sélecteur */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-encre-3" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full pl-10 pr-4 py-3 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm text-encre-3 whitespace-nowrap">
            Afficher :
          </label>
          <select
            value={membersPerPage}
            onChange={(e) => setMembersPerPage(Number(e.target.value))}
            className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 px-3 py-3 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={-1}>Tous</option>
          </select>
        </div>
      </div>

      {/* Info de pagination */}
      <div className="flex items-center justify-between text-sm text-encre-3">
        <p>
          {filteredMembers.length > 0 ? (
            <>
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredMembers.length)} sur {filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''}
              {searchTerm && ' (filtré)'}
            </>
          ) : (
            'Aucun membre trouvé'
          )}
        </p>
      </div>

      {/* Liste des membres */}
      {currentMembers.length > 0 ? (
        <div className="space-y-3">
          {currentMembers.map((member) => (
            <div key={member.id} className="flex items-center space-x-3 p-4 bg-papier-2 dark:bg-slate-800 rounded-lg hover:bg-papier-2 dark:hover:bg-slate-700 transition-colors">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={`${member.first_name} ${member.last_name}`}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 bg-papier-3 dark:bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-encre-3 dark:text-encre-3" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-encre">
                  {member.first_name} {member.last_name}
                </p>
                <p className="text-sm text-encre-3 truncate">
                  {member.email || 'Email non disponible'}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                  member.role === 'Club Admin' 
                    ? 'bg-ds-success-soft text-ds-success dark:bg-ds-success-soft/30 dark:text-ds-success' 
                    : 'bg-terracotta-soft text-terracotta-deep dark:bg-terracotta-soft/30 dark:text-terracotta'
                }`}>
                  {member.role === 'Club Admin' ? 'Admin' : 'Membre'}
                </span>
                <p className="text-xs text-encre-3 dark:text-encre-3 mt-1">
                  Depuis {new Date(member.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-papier-2 dark:bg-slate-800 rounded-lg">
          <Users className="h-12 w-12 text-encre-3 dark:text-encre-3 mx-auto mb-4" />
          <p className="text-encre-3">
            {searchTerm ? 'Aucun membre ne correspond à votre recherche' : 'Aucun membre pour le moment'}
          </p>
          {!searchTerm && (
            <p className="text-sm text-encre-3 mt-2">
              Utilisez la fonction d'invitation pour inviter des membres
            </p>
          )}
        </div>
      )}

      {/* Contrôles de pagination */}
      {totalPages > 1 && membersPerPage !== -1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center px-4 py-2 text-sm font-medium text-encre-3 bg-white dark:bg-slate-700 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg hover:bg-papier-2 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </button>
          
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {totalPages <= 7 ? (
              Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-ds-success text-white dark:bg-ds-success-soft'
                      : 'bg-white dark:bg-slate-700 text-encre-3 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] hover:bg-papier-2 dark:hover:bg-slate-600'
                  }`}
                >
                  {page}
                </button>
              ))
            ) : (
              <>
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? 'bg-ds-success text-white dark:bg-ds-success-soft'
                      : 'bg-white dark:bg-slate-700 text-encre-3 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] hover:bg-papier-2 dark:hover:bg-slate-600'
                  }`}
                >
                  1
                </button>
                
                {currentPage > 3 && <span className="text-encre-3">...</span>}
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => page > 1 && page < totalPages && Math.abs(page - currentPage) <= 1)
                  .map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-ds-success text-white dark:bg-ds-success-soft'
                          : 'bg-white dark:bg-slate-700 text-encre-3 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] hover:bg-papier-2 dark:hover:bg-slate-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                
                {currentPage < totalPages - 2 && <span className="text-encre-3">...</span>}
                
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'bg-ds-success text-white dark:bg-ds-success-soft'
                      : 'bg-white dark:bg-slate-700 text-encre-3 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] hover:bg-papier-2 dark:hover:bg-slate-600'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center px-4 py-2 text-sm font-medium text-encre-3 bg-white dark:bg-slate-700 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg hover:bg-papier-2 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Suivant
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
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
  const [copiedSponsorCode, setCopiedSponsorCode] = useState(false);
  
  // États pour l'édition des informations du club
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    contact_email: '',
    website_url: ''
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
        website_url: club.website_url || ''
      });

      // Récupérer les membres du club avec l'email
      const { data: allMembers, error: membersError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, avatar_url, created_at, club_id')
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

  const copySponsorCode = async () => {
    if (clubData?.sponsors_code) {
      try {
        await navigator.clipboard.writeText(clubData.sponsors_code);
        setCopiedSponsorCode(true);
        setTimeout(() => setCopiedSponsorCode(false), 2000);
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
          website_url: editForm.website_url.trim() || null
        })
        .eq('id', clubData.id);

      if (error) throw error;

      // Mettre à jour les données locales
      setClubData({
        ...clubData,
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        contact_email: editForm.contact_email.trim() || null,
        website_url: editForm.website_url.trim() || null
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
      website_url: clubData?.website_url || ''
    });
  };

  if (!isAuthenticated || profile?.role !== 'Club Admin') {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-ds-danger mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-encre mb-2">Accès non autorisé</h2>
        <p className="text-encre-3">Cette page est réservée aux administrateurs de club.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ds-success dark:border-ds-success"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-ds-danger mx-auto mb-4" />
        <p className="text-ds-danger dark:text-ds-danger mb-4">{error}</p>
        <button 
          onClick={fetchClubData}
          className="px-4 py-2 bg-ds-success text-white rounded-lg hover:bg-ds-success dark:bg-ds-success-soft dark:hover:bg-ds-success"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!clubData) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-encre-3 dark:text-encre-3 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-encre mb-2">Aucun club trouvé</h2>
        <p className="text-encre-3">Vous n'êtes pas encore assigné à un club.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message de succès/erreur */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-ds-success-soft text-ds-success border-ds-success dark:bg-ds-success-soft/20 dark:text-ds-success dark:border-ds-success' 
            : 'bg-ds-danger-soft text-ds-danger border-ds-danger dark:bg-ds-danger-soft dark:text-ds-danger dark:border-ds-danger'
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
      <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
        <div className="px-6 py-4 border-b border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {clubData.logo_url ? (
                <img
                  src={clubData.logo_url}
                  alt={`Logo ${clubData.name}`}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-ds-success-soft dark:bg-ds-success-soft/30 rounded-lg flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-ds-success dark:text-ds-success" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-encre">{clubData.name}</h1>
                <p className="text-encre-3">Tableau de bord de votre club</p>
                <p className="text-sm text-encre-3">
                  Membre de l'association : {clubData.association.name}
                </p>
                {clubData.website_url && (
                  <a 
                    href={getWebsiteUrl(clubData.website_url) || '#'}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-ds-success dark:text-ds-success hover:text-ds-success dark:hover:text-ds-success transition-colors mt-1"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    <span className="truncate">Site web du club</span>
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-papier-2 dark:bg-slate-700 text-encre-3 rounded-lg hover:bg-papier-3 dark:hover:bg-slate-600 transition-colors"
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
            <div className="bg-terracotta-soft dark:bg-terracotta-soft p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-terracotta dark:text-terracotta mr-3" />
                <div>
                  <p className="text-sm text-encre-3">Membres</p>
                  <p className="text-2xl font-bold text-encre">{clubStats.totalMembers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-ds-info-soft dark:bg-ds-info-soft/20 p-4 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-ds-info dark:text-ds-info mr-3" />
                <div>
                  <p className="text-sm text-encre-3">Événements à venir</p>
                  <p className="text-2xl font-bold text-encre">{clubStats.upcomingEvents}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-ds-success-soft dark:bg-ds-success-soft/20 p-4 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-ds-success dark:text-ds-success mr-3" />
                <div>
                  <p className="text-sm text-encre-3">Total événements</p>
                  <p className="text-2xl font-bold text-encre">{clubStats.totalEvents}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-ds-warning-soft dark:bg-ds-warning-soft/20 p-4 rounded-lg">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-ds-warning dark:text-ds-warning mr-3" />
                <div>
                  <p className="text-sm text-encre-3">Sponsors</p>
                  <p className="text-2xl font-bold text-encre">{clubStats.totalSponsors}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire d'édition */}
      {isEditing && (
        <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
          <div className="px-6 py-4 border-b border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
            <h2 className="text-xl font-semibold text-encre flex items-center">
              <Edit className="h-5 w-5 mr-2" />
              Modifier les informations du club
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-encre-3 mb-2">
                  Nom du club *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-4 py-3 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all"
                  placeholder="Nom de votre club"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-encre-3 mb-2">
                  Email de contact
                </label>
                <input
                  type="email"
                  value={editForm.contact_email}
                  onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                  className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-4 py-3 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all"
                  placeholder="contact@club.com"
                />
                <p className="mt-1 text-sm text-encre-3">
                  Email affiché aux membres et followers (optionnel). Différent de l'email de connexion.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-encre-3 mb-2">
                  Site web du club
                </label>
                <input
                  type="url"
                  value={editForm.website_url || ''}
                  onChange={(e) => setEditForm({ ...editForm, website_url: e.target.value })}
                  className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-4 py-3 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all"
                  placeholder="https://www.monclub.com"
                />
                <p className="mt-1 text-xs text-encre-3">
                  URL complète du site web (optionnel)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-encre-3 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-4 py-3 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all"
                  placeholder="Décrivez brièvement votre club..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-3 px-6 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg text-encre-3 hover:bg-papier-2 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-3 px-6 bg-ds-success text-white rounded-lg hover:bg-ds-success dark:bg-ds-success-soft dark:hover:bg-ds-success disabled:opacity-50 transition-colors flex items-center justify-center"
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
      <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
        <div className="px-6 py-4 border-b border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
          <h2 className="text-xl font-semibold text-encre flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Code d'invitation
          </h2>
        </div>
        <div className="p-6">
          <div className="bg-papier-2 dark:bg-slate-800 p-4 rounded-lg">
            <p className="text-sm text-encre-3 mb-3">
              Partagez ce code avec les personnes que vous souhaitez inviter dans votre club :
            </p>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-white dark:bg-slate-700 border border-[var(--ds-border)] dark:border-[var(--ds-border-2)] rounded-lg px-4 py-3">
                <code className="text-lg font-mono text-encre select-all">
                  {clubData.club_code}
                </code>
              </div>
              <button
                onClick={copyClubCode}
                className={`px-4 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                  copiedCode 
                    ? 'bg-ds-success text-white dark:bg-ds-success-soft' 
                    : 'bg-papier-2 dark:bg-slate-700 text-encre-3 hover:bg-papier-3 dark:hover:bg-slate-600'
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

      {/* Section Code Sponsor */}
      <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
        <div className="px-6 py-4 border-b border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
          <h2 className="text-xl font-semibold text-encre flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Code Sponsor
          </h2>
        </div>
        <div className="p-6">
          <div className="bg-ds-warning-soft dark:bg-ds-warning-soft/20 p-4 rounded-lg">
            <p className="text-sm text-encre-3 mb-3">
              Partagez ce code avec les entreprises que vous souhaitez avoir comme sponsors de votre club :
            </p>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-white dark:bg-slate-700 border border-[var(--ds-border)] dark:border-[var(--ds-border-2)] rounded-lg px-4 py-3">
                <code className="text-lg font-mono text-encre select-all">
                  {clubData.sponsors_code}
                </code>
              </div>
              <button
                onClick={copySponsorCode}
                className={`px-4 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                  copiedSponsorCode 
                    ? 'bg-ds-success text-white dark:bg-ds-success-soft' 
                    : 'bg-ds-warning-soft dark:bg-ds-warning-soft/30 text-encre-3 hover:bg-ds-warning-soft dark:hover:bg-ds-warning-soft/50'
                }`}
              >
                {copiedSponsorCode ? (
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
            <p className="text-xs text-encre-3 mt-2">
              Les sponsors utiliseront ce code pour s'inscrire et accéder aux outils de mailing de votre club.
            </p>
          </div>
        </div>
      </div>

      {/* Informations du club */}
      {!isEditing && clubData.description && (
        <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
          <div className="px-6 py-4 border-b border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
            <h2 className="text-xl font-semibold text-encre">Description</h2>
          </div>
          <div className="p-6">
            <p className="text-encre-3 leading-relaxed">{clubData.description}</p>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
        <div className="px-6 py-4 border-b border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
          <h2 className="text-xl font-semibold text-encre flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Actions Rapides
          </h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Nouvelle carte: Inviter des membres */}
            <a 
              href="/club/invitations" 
              className="block p-4 bg-terracotta-soft dark:bg-terracotta-soft rounded-lg hover:bg-terracotta-soft dark:hover:bg-terracotta-soft/30 transition-colors border-2 border-terracotta dark:border-terracotta"
            >
              <UserPlus className="h-6 w-6 text-terracotta dark:text-terracotta mb-2" />
              <p className="font-medium text-encre">Inviter des Membres</p>
              <p className="text-sm text-encre-3">Par email ou lien</p>
            </a>

            <a 
              href="/events" 
              className="block p-4 bg-ds-info-soft dark:bg-ds-info-soft/20 rounded-lg hover:bg-ds-info-soft dark:hover:bg-ds-info-soft/30 transition-colors"
            >
              <Calendar className="h-6 w-6 text-ds-info dark:text-ds-info mb-2" />
              <p className="font-medium text-encre">Gérer les Événements</p>
              <p className="text-sm text-encre-3">Créer et organiser</p>
            </a>
            
            <a 
              href="/sponsors" 
              className="block p-4 bg-ds-warning-soft dark:bg-ds-warning-soft/20 rounded-lg hover:bg-ds-warning-soft dark:hover:bg-ds-warning-soft/30 transition-colors"
            >
              <Building2 className="h-6 w-6 text-ds-warning dark:text-ds-warning mb-2" />
              <p className="font-medium text-encre">Gérer les Sponsors</p>
              <p className="text-sm text-encre-3">Partenaires du club</p>
            </a>
            
            <a 
              href="/settings" 
              className="block p-4 bg-papier-2 dark:bg-papier/20 rounded-lg hover:bg-papier-2 dark:hover:bg-papier-3/30 transition-colors"
            >
              <Settings className="h-6 w-6 text-encre-2 dark:text-encre-3 mb-2" />
              <p className="font-medium text-encre">Paramètres du Compte</p>
              <p className="text-sm text-encre-3">Configuration personnelle</p>
            </a>
            
            <div className="p-4 bg-ds-success-soft dark:bg-ds-success-soft/20 rounded-lg space-y-2 md:col-span-2 lg:col-span-4">
              <Mail className="h-6 w-6 text-ds-success dark:text-ds-success mb-2" />
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-encre mb-2">Contact du Club</p>
                  <p className="text-xs text-encre-3 truncate">
                    <strong>Connexion :</strong> {clubData.club_email}
                  </p>
                  {clubData.contact_email && (
                    <p className="text-xs text-encre-3 truncate">
                      <strong>Contact :</strong> {clubData.contact_email}
                    </p>
                  )}
                  {!clubData.contact_email && (
                    <p className="text-xs text-encre-3 dark:text-encre-3 italic">
                      Aucun email de contact défini
                    </p>
                  )}
                </div>
                <div>
                  {clubData.website_url && (
                    <p className="text-xs text-encre-3 flex items-center">
                      <Globe className="h-3 w-3 mr-1 text-encre-3 dark:text-encre-3" />
                      <strong>Site web :</strong> 
                      <a 
                        href={getWebsiteUrl(clubData.website_url) || '#'}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-ds-success dark:text-ds-success hover:underline ml-1"
                      >
                        {clubData.website_url.startsWith('/') 
                          ? 'Site généré' 
                          : clubData.website_url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]
                        }
                      </a>
                    </p>
                  )}
                  {!clubData.website_url && (
                    <p className="text-xs text-encre-3 dark:text-encre-3 italic">
                      Aucun site web défini
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des membres avec pagination */}
      <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
        <div className="px-6 py-4 border-b border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-encre flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Membres du Club ({clubMembers.length})
            </h2>
          </div>
        </div>
        <div className="p-6">
          <MembersList members={clubMembers} />
        </div>
      </div>
    </div>
  );
}