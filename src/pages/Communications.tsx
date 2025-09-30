import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { NotificationService } from '../services/notificationService';
import { 
  MessageSquare, 
  Plus, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  AlertCircle, 
  Users, 
  Upload,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  Building,
  Calendar,
  Clock,
  Pin,
  PinOff,
  AlertTriangle,
  RefreshCw,
  Wand2,
  Target,
  Globe,
  Lock,
} from 'lucide-react';

interface Communication {
  id: string;
  title: string;
  content: string;
  visibility: 'Public' | 'Private';
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  club_id: string | null;
  association_id: string;
  author_id: string;
  target_clubs: string[] | null;
  image_url: string | null;
  expires_at: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  clubs?: {
    id: string; // Ajouté pour la recherche de sourceName
    name: string;
    logo_url?: string | null;
  };
  associations?: {
    name: string;
    logo_url?: string | null;
  };
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  };
  target_clubs_data?: Array<{
    id: string;
    name: string;
    logo_url?: string | null;
  }>;
}

interface CommunicationForm {
  title: string;
  content: string;
  visibility: 'Public' | 'Private';
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  target_clubs: string[];
  image_url: string;
  expires_at: string;
  is_pinned: boolean;
}

interface LogoDisplayProps {
  src: string | null | undefined;
  alt: string;
  size?: string;
  fallbackIcon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}

const LogoDisplay: React.FC<LogoDisplayProps> = ({ 
  src, 
  alt, 
  size = 'w-8 h-8', 
  fallbackIcon: FallbackIcon, 
  iconColor = 'text-gray-400 dark:text-slate-500' 
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`${size} rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0`}>
      {src && !imageError ? (
        <img 
          src={src} 
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <FallbackIcon className={`${size === 'w-8 h-8' ? 'h-5 w-5' : 'h-6 w-6'} ${iconColor}`} />
      )}
    </div>
  );
};

// Composant pour afficher la priorité
const PriorityBadge: React.FC<{ priority: 'Low' | 'Normal' | 'High' | 'Urgent' }> = ({ priority }) => {
  const getPriorityStyles = () => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700';
      case 'High':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700';
      case 'Normal':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'Low':
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case 'Urgent':
        return <AlertTriangle className="h-3 w-3" />;
      case 'High':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full border ${getPriorityStyles()}`}>
      {getPriorityIcon()}
      <span>{priority}</span>
    </span>
  );
};

export default function Communications() {
  const { profile, isClubAdmin, isSuperAdmin } = useAuthNew();
  const [searchParams] = useSearchParams();
  const clubId = searchParams.get('club');
  
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCommunication, setEditingCommunication] = useState<Communication | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [clubInfo, setClubInfo] = useState<{id: string, name: string, slug?: string} | null>(null);
  const [expandedCommunications, setExpandedCommunications] = useState<Set<string>>(new Set());
  const [availableClubs, setAvailableClubs] = useState<Array<{id: string, name: string}>>([]);
  
  // États pour la réécriture IA
  const [rewritingContent, setRewritingContent] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  
  const [communicationForm, setCommunicationForm] = useState<CommunicationForm>({
    title: '',
    content: '',
    visibility: 'Public',
    priority: 'Normal',
    target_clubs: [],
    image_url: '',
    expires_at: '',
    is_pinned: false,
  });

  useEffect(() => {
    const fetchClubInfo = async () => {
      if (clubId) {
        try {
          const { data, error } = await supabase
            .from('clubs')
            .select('id, name, slug')
            .or(`slug.eq.${clubId},id.eq.${clubId}`)
            .single();
          
          if (!error && data) {
            setClubInfo(data);
          }
        } catch (error) {
          console.error('Error fetching club info:', error);
        }
      } else {
        setClubInfo(null);
      }
    };

    fetchClubInfo();
  }, [clubId]);

  useEffect(() => {
    if (profile) {
      fetchCommunications();
      if (canCreateCommunication()) {
        fetchAvailableClubs();
      }
    }
  }, [profile, clubId]);

  const fetchAvailableClubs = async () => {
    if (!profile?.association_id) return;

    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name')
        .eq('association_id', profile.association_id)
        .order('name');

      if (error) throw error;
      setAvailableClubs(data || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const fetchCommunications = async () => {
    try {
      if (!profile) {
        setLoading(false);
        return;
      }
  
      if (profile.role === 'Supporter' && !profile.association_id) {
        setCommunications([]);
        setLoading(false);
        return;
      }
  
      let query = supabase
        .from('communications')
        .select(`
          *,
          clubs (id, name, logo_url),
          associations (id, name, logo_url),
          profiles (first_name, last_name)
        `);
  
      // Filtrage par club si paramètre présent
      if (clubId) {
        if (clubId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          query = query.eq('club_id', clubId);
        } else {
          const { data: clubData } = await supabase
            .from('clubs')
            .select('id')
            .eq('slug', clubId)
            .single();
          
          if (clubData) {
            query = query.eq('club_id', clubData.id);
          }
        }
      } else {
        // Filtrage par association et rôle - RÉCUPÉRER TOUTES LES COMMUNICATIONS
        query = query.eq('association_id', profile.association_id);
        
        if (profile.role === 'Supporter') {
          query = query.eq('visibility', 'Public');
        }
      }
  
      // Filtrer les communications expirées
      const now = new Date().toISOString();
      query = query.or(`expires_at.is.null,expires_at.gte.${now}`);
  
      const { data, error } = await query.order('is_pinned', { ascending: false })
                                      .order('created_at', { ascending: false });
  
      if (error) throw error;
  
      // FILTRAGE CÔTÉ CLIENT selon les rôles
      let filteredCommunications = data || [];

      if (!clubId) {
        // Filtrage selon le rôle utilisateur
        if (profile.role === 'Super Admin') {
          filteredCommunications = filteredCommunications.filter(comm => {
            // Ses propres communications (club ou association)
            if (comm.author_id === profile.id) return true;
            
            // Communications publiques des clubs de son association
            if (comm.club_id !== null && comm.visibility === 'Public') return true;
            
            // Communications publiques d'association
            if (comm.club_id === null && comm.visibility === 'Public') return true;
            
            return false;
          });
        }
        
        else if (profile.role === 'Club Admin' || profile.role === 'Member') {
          filteredCommunications = filteredCommunications.filter(comm => {
            // Communications du propre club
            if (comm.club_id === profile.club_id) return true;
            
            // Communications publiques (club ou association)
            if (comm.visibility === 'Public') return true;
            
            // Communications privées d'association ciblant le club
            if (comm.club_id === null && 
                comm.visibility === 'Private' && 
                comm.target_clubs && 
                profile.club_id &&
                comm.target_clubs.includes(profile.club_id)) {
              return true;
            }
            
            return false;
          });
        }
  
  // Pour les Supporters, pas de filtrage supplémentaire car déjà géré par la requête SQL
}
  
      setCommunications(filteredCommunications);
    } catch (error) {
      console.error('Error fetching communications:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCommunicationExpansion = (communicationId: string) => {
    setExpandedCommunications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(communicationId)) {
        newSet.delete(communicationId);
      } else {
        newSet.add(communicationId);
      }
      return newSet;
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `communications/${fileName}`;

      const { data: uploadData, error } = await supabase.storage
        .from('communication-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('communication-images')
        .getPublicUrl(filePath);

      setCommunicationForm({ ...communicationForm, image_url: publicUrl });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Erreur lors de l\'upload de l\'image: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGenerateImage = async () => {
    try {
      setGeneratingImage(true);
  
      const res = await fetch('/.netlify/functions/generate-event-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: communicationForm.title,
          description: communicationForm.content,
          isForCommunication: true,
        }),
      });
  
      const raw = await res.text();
  
      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        throw new Error(raw || `HTTP ${res.status}`);
      }
  
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || data?.details || `HTTP ${res.status}`);
      }
  
      const imageToUse: string | null = data.imageUrl || data.imageBase64 || null;
      if (!imageToUse) throw new Error('Aucune image n\'a été retournée par l\'API.');
  
      setCommunicationForm(prev => ({ ...prev, image_url: imageToUse }));
      setSelectedImage(imageToUse);
    } catch (error: any) {
      console.error('Error generating image:', error);
      alert(`Erreur lors de la génération de l'image: ${error?.message || String(error)}`);
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleRewriteContent = async () => {
  if (!communicationForm.title || !communicationForm.content) {
    alert("Veuillez d'abord entrer un titre et un contenu pour la communication");
    return;
  }

  try {
    setRewritingContent(true);
    
    const response = await fetch('/.netlify/functions/rewrite-communication', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: communicationForm.title,
        content: communicationForm.content,
      }),
    });

    const data = await response.json();
    
    if (data.success && data.rewrittenDescription) {
      setAiSuggestion(data.rewrittenDescription);
      setShowAiSuggestion(true);
    } else {
      throw new Error(data.error || 'Erreur lors de la réécriture');
    }
  } catch (error: any) {
    console.error('Error rewriting content:', error);
    alert('Erreur lors de la réécriture: ' + error.message);
  } finally {
    setRewritingContent(false);
  }
};

  const acceptAiSuggestion = () => {
    if (aiSuggestion) {
      setCommunicationForm({ ...communicationForm, content: aiSuggestion });
      setShowAiSuggestion(false);
      setAiSuggestion(null);
    }
  };

  const rejectAiSuggestion = () => {
    setShowAiSuggestion(false);
    setAiSuggestion(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreateCommunication()) {
      alert('Vous n\'avez pas les permissions pour créer des communications');
      return;
    }
  
    try {
      const communicationData = {
        ...communicationForm,
        association_id: profile!.association_id,
        author_id: profile!.id,
        club_id: profile?.role === 'Club Admin' ? profile.club_id : null,
        expires_at: communicationForm.expires_at || null,
        target_clubs: communicationForm.target_clubs.length > 0 ? communicationForm.target_clubs : null,
      };
  
      let createdCommunicationId: string | null = null;
  
      if (editingCommunication) {
        const { error } = await supabase
          .from('communications')
          .update({
            ...communicationData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingCommunication.id);
  
        if (error) throw error;
        createdCommunicationId = editingCommunication.id;
      } else {
        const { data: newCommunication, error } = await supabase
          .from('communications')
          .insert([communicationData])
          .select()
          .single();
  
        if (error) throw error;
        createdCommunicationId = newCommunication.id;
  
        // Envoyer les notifications
        if (createdCommunicationId && profile?.association_id) {
          try {
            let recipientIds: string[] = [];
        
            if (communicationData.club_id) {
              // ========== COMMUNICATION DE CLUB ==========
              if (communicationData.visibility === 'Public') {
                // Communication publique de club : membres du club + followers
                const [{ data: clubMembers }, { data: followers }] = await Promise.all([
                  supabase
                    .from('profiles')
                    .select('id')
                    .eq('club_id', communicationData.club_id)
                    .in('role', ['Member', 'Club Admin']),
                  supabase
                    .from('user_clubs')
                    .select('user_id')
                    .eq('club_id', communicationData.club_id)
                ]);
        
                if (clubMembers) recipientIds.push(...clubMembers.map(m => m.id));
                if (followers) recipientIds.push(...followers.map(f => f.user_id));
              } else {
                // Communication privée de club : seulement les membres du club
                const { data: clubMembers } = await supabase
                  .from('profiles')
                  .select('id')
                  .eq('club_id', communicationData.club_id)
                  .in('role', ['Member', 'Club Admin']);
        
                if (clubMembers) recipientIds = clubMembers.map(m => m.id);
              }
            } else {
              // ========== COMMUNICATION D'ASSOCIATION ==========
              if (communicationData.visibility === 'Public') {
                // Communication publique d'association : tous les utilisateurs de l'association
                const { data: associationUsers } = await supabase
                  .from('profiles')
                  .select('id')
                  .eq('association_id', profile.association_id);
        
                if (associationUsers) recipientIds = associationUsers.map(u => u.id);
              } else {
                // Communication privée d'association : clubs ciblés
                if (communicationData.target_clubs && communicationData.target_clubs.length > 0) {
                  const { data: targetUsers } = await supabase
                    .from('profiles')
                    .select('id')
                    .in('club_id', communicationData.target_clubs)
                    .in('role', ['Member', 'Club Admin']);
        
                  if (targetUsers) recipientIds = targetUsers.map(u => u.id);
                }
              }
            }
        
            // Retirer l'auteur des destinataires et supprimer les doublons
            recipientIds = [...new Set(recipientIds)].filter(id => id !== profile.id);
        
            if (recipientIds.length > 0) {
              const sourceName = communicationData.club_id 
                ? (await supabase.from('clubs').select('name').eq('id', communicationData.club_id).single()).data?.name || 'Club'
                : (await supabase.from('associations').select('name').eq('id', profile.association_id).single()).data?.name || 'Association';
        
              await NotificationService.notifyNewCommunication(
                recipientIds,
                communicationData.title,
                createdCommunicationId,
                communicationData.priority,
                communicationData.visibility,
                `${profile.first_name} ${profile.last_name}`,
                communicationData.club_id === null, // isAssociationCommunication
                sourceName
              );
        
              console.log(`✅ Notifications envoyées pour la communication "${communicationData.title}" (${communicationData.visibility}) à ${recipientIds.length} destinataires`);
            }
          } catch (notificationError) {
            console.error('Error sending notifications:', notificationError);
          }
        }
      }
  
      setCommunicationForm({
        title: '',
        content: '',
        visibility: 'Public',
        priority: 'Normal',
        target_clubs: [],
        image_url: '',
        expires_at: '',
        is_pinned: false,
      });
      setShowForm(false);
      setEditingCommunication(null);
      fetchCommunications();
      
    } catch (error: any) {
      console.error('Error saving communication:', error);
      alert('Error saving communication: ' + error.message);
    }
  };

  const handleEdit = (communication: Communication) => {
    setEditingCommunication(communication);
    setCommunicationForm({
      title: communication.title,
      content: communication.content,
      visibility: communication.visibility,
      priority: communication.priority,
      target_clubs: communication.target_clubs || [],
      image_url: communication.image_url || '',
      expires_at: communication.expires_at ? communication.expires_at.slice(0, 16) : '',
      is_pinned: communication.is_pinned,
    });
    setShowForm(true);
  };

  const handleDelete = async (communicationId: string) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette communication ?')) return;

  try {
    // Supprimer d'abord les notifications associées
    await NotificationService.deleteCommunicationNotifications(communicationId);
    
    // Puis supprimer la communication
    const { error } = await supabase
      .from('communications')
      .delete()
      .eq('id', communicationId);

    if (error) throw error;
    
    fetchCommunications();
    
  } catch (error: any) {
    console.error('Error deleting communication:', error);
    alert('Error deleting communication: ' + error.message);
  }
};

  const togglePin = async (communicationId: string, currentPinStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('communications')
        .update({ 
          is_pinned: !currentPinStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', communicationId);

      if (error) throw error;
      
      fetchCommunications();
      
    } catch (error: any) {
      console.error('Error toggling pin:', error);
      alert('Error updating communication: ' + error.message);
    }
  };

  const canManageCommunication = (communication: Communication) => {
    // Seul l'auteur peut modifier/supprimer sa communication
    return communication.author_id === profile?.id;
  };

  const canCreateCommunication = () => {
    return isClubAdmin || isSuperAdmin;
  };

  const getPageTitle = () => {
    if (clubId && clubInfo) {
      return `Communications - ${clubInfo.name}`;
    }
    return 'Communications';
  };

  const getPageDescription = () => {
    if (clubId && clubInfo) {
      return `Communications du club ${clubInfo.name}`;
    }
    
    if (profile?.role === 'Super Admin') return 'Toutes les communications de votre association';
    if (profile?.role === 'Club Admin') return 'Communications de votre club et communications publiques';
    if (profile?.role === 'Member') return 'Communications de votre club et communications publiques';
    if (profile?.role === 'Supporter') return 'Communications publiques de votre association';
    return '';
  };

  const getPageSubDescription = () => {
    if (clubId && clubInfo) {
      return `Toutes les communications publiées par ${clubInfo.name}`;
    }
    
    if (profile?.role === 'Super Admin') return 'Vous pouvez créer des communications pour toute l\'association et gérer toutes les communications.';
    if (profile?.role === 'Club Admin') return 'Vous pouvez créer des communications pour votre club et voir les communications publiques.';
    if (profile?.role === 'Member') return 'Vous voyez les communications de votre club et les communications publiques de l\'association.';
    if (profile?.role === 'Supporter') return 'Vous ne voyez que les communications publiques de votre association.';
    return '';
  };

  if (profile?.role === 'Supporter' && !profile?.association_id) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold dark-text">Communications</h1>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Association requise</h2>
              <p className="text-yellow-800 dark:text-yellow-300 mb-4">
                Pour voir les communications, vous devez d'abord rejoindre une association. 
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold dark-text">{getPageTitle()}</h1>
          {clubId && clubInfo && (
            <div className="mt-2 flex items-center space-x-2">
              <a 
                href="/communications" 
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                ← Retour à toutes les communications
              </a>
            </div>
          )}
        </div>

        {canCreateCommunication() && (!clubId || (clubInfo && (clubInfo.id === profile?.club_id || isSuperAdmin))) && (
  <button
    onClick={() => {
      setShowForm(true);
      setEditingCommunication(null);
      setCommunicationForm({
        title: '',
        content: '',
        visibility: 'Public',
        priority: 'Normal',
        target_clubs: [],
        image_url: '',
        expires_at: '',
        is_pinned: false,
      });
    }}
    className="dark-btn-primary px-3 sm:px-4 lg:px-4 py-2 rounded-lg transition-colors flex items-center justify-center sm:justify-start space-x-0 sm:space-x-2"
    title="Nouvelle Communication"
  >
    <Plus className="h-4 w-4 flex-shrink-0" />
    <span className="hidden sm:inline lg:hidden ml-2">Nouvelle</span>
    <span className="hidden lg:inline ml-2">Nouvelle Communication</span>
  </button>
)}
      </div>

      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 p-4 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">
              {getPageDescription()}
            </h3>
            <div className="mt-1 text-sm text-purple-700 dark:text-purple-300">
              {getPageSubDescription()}
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="dark-card p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark-text">
                {editingCommunication ? 'Modifier la Communication' : 'Nouvelle Communication'}
              </h2>
              <button 
                onClick={() => setShowForm(false)}
                className="p-2 dark-hover rounded-lg"
              >
                <X className="h-5 w-5 dark-text" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium dark-text mb-2">
                    Titre de la Communication *
                  </label>
                  <input
                    type="text"
                    required
                    value={communicationForm.title}
                    onChange={(e) => setCommunicationForm({ ...communicationForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent dark-input"
                    placeholder="Ex: Nouveau règlement concernant les terrains"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark-text mb-2">
                    Priorité *
                  </label>
                  <select
                    value={communicationForm.priority}
                    onChange={(e) => setCommunicationForm({ ...communicationForm, priority: e.target.value as 'Low' | 'Normal' | 'High' | 'Urgent' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent dark-input"
                  >
                    <option value="Low">Faible</option>
                    <option value="Normal">Normale</option>
                    <option value="High">Élevée</option>
                    <option value="Urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium dark-text mb-2">
                    Visibilité *
                  </label>
                  <select
                    value={communicationForm.visibility}
                    onChange={(e) => setCommunicationForm({ ...communicationForm, visibility: e.target.value as 'Public' | 'Private' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent dark-input"
                  >
                    <option value="Public">Publique</option>
                    <option value="Private">Privée</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium dark-text mb-2">
                    Date d'expiration
                  </label>
                  <input
                    type="datetime-local"
                    value={communicationForm.expires_at}
                    onChange={(e) => setCommunicationForm({ ...communicationForm, expires_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent dark-input"
                  />
                  <p className="text-xs dark-text-muted mt-1">
                    Laissez vide pour une communication permanente
                  </p>
                </div>
              </div>

              {isSuperAdmin && communicationForm.visibility === 'Private' && (
                <div>
                  <label className="block text-sm font-medium dark-text mb-2">
                    Clubs ciblés
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                    {availableClubs.map((club) => (
                      <label key={club.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={communicationForm.target_clubs.includes(club.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCommunicationForm({
                                ...communicationForm,
                                target_clubs: [...communicationForm.target_clubs, club.id]
                              });
                            } else {
                              setCommunicationForm({
                                ...communicationForm,
                                target_clubs: communicationForm.target_clubs.filter(id => id !== club.id)
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm dark-text">{club.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs dark-text-muted mt-1">
                    Sélectionnez les clubs qui recevront cette communication privée
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_pinned"
                  checked={communicationForm.is_pinned}
                  onChange={(e) => setCommunicationForm({ ...communicationForm, is_pinned: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_pinned" className="text-sm dark-text flex items-center space-x-1">
                  <Pin className="h-4 w-4" />
                  <span>Épingler cette communication</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium dark-text mb-2">
                  Image de la Communication
                </label>
                
                {communicationForm.image_url && (
                  <div className="mb-4 relative">
                    <img 
                      src={communicationForm.image_url} 
                      alt="Aperçu" 
                      className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => setCommunicationForm({ ...communicationForm, image_url: '' })}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="flex space-x-3">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <div className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                      <Upload className="h-5 w-5 mx-auto mb-1 text-gray-400 dark:text-slate-500" />
                      <span className="text-sm dark-text-muted">
                        {uploadingImage ? 'Upload...' : 'Télécharger'}
                      </span>
                    </div>
                  </label>

                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={generatingImage || !communicationForm.title}
                    className="flex-1 p-3 border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-lg text-center hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingImage ? (
                      <RefreshCw className="h-5 w-5 mx-auto mb-1 text-purple-500 dark:text-purple-400 animate-spin" />
                    ) : (
                      <Sparkles className="h-5 w-5 mx-auto mb-1 text-purple-500 dark:text-purple-400" />
                    )}
                    <span className="text-sm text-purple-600 dark:text-purple-400">
                      {generatingImage ? 'Génération...' : 'Générer IA'}
                    </span>
                  </button>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium dark-text">
                    Contenu de la Communication *
                  </label>
                  <button
                    type="button"
                    onClick={handleRewriteContent}
                    disabled={rewritingContent || !communicationForm.title || !communicationForm.content}
                    className="flex items-center space-x-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Utiliser l'IA pour améliorer le contenu"
                  >
                    {rewritingContent ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>Réécriture...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3 w-3" />
                        <span>Améliorer avec l'IA</span>
                      </>
                    )}
                  </button>
                </div>

                {showAiSuggestion && aiSuggestion && (
                  <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-2" />
                        <span className="text-sm font-medium text-purple-900 dark:text-purple-200">
                          Suggestion de l'IA
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={rejectAiSuggestion}
                        className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="dark-card p-2 rounded border border-purple-100 dark:border-purple-600 mb-3">
                      <p className="text-sm dark-text whitespace-pre-wrap">{aiSuggestion}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={acceptAiSuggestion}
                        className="flex-1 px-3 py-1 bg-purple-600 dark:bg-purple-700 text-white text-sm rounded hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors"
                      >
                        Utiliser ce contenu
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          acceptAiSuggestion();
                        }}
                        className="flex-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                      >
                        Utiliser et modifier
                      </button>
                    </div>
                  </div>
                )}

                <textarea
                  rows={6}
                  required
                  value={communicationForm.content}
                  onChange={(e) => setCommunicationForm({ ...communicationForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent dark-input"
                  placeholder="Rédigez le contenu de votre communication..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="dark-btn-secondary flex-1 py-3 px-4 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage || generatingImage}
                  className="flex-1 py-3 px-4 dark-btn-primary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingCommunication ? 'Mettre à jour' : 'Publier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="dark-card shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-lg font-semibold dark-text flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Communications ({communications.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-600">
          {communications.map((communication) => {
            const isExpanded = expandedCommunications.has(communication.id);
            const authorName = communication.profiles 
              ? `${communication.profiles.first_name} ${communication.profiles.last_name}`
              : 'Auteur inconnu';
            
            return (
              <div key={communication.id} className="px-6 py-6 dark-hover">
                {/* En-tête avec source */}
                <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-600">
                  <LogoDisplay 
                    src={communication.club_id ? communication.clubs?.logo_url : communication.associations?.logo_url} 
                    alt={`Logo ${communication.club_id ? communication.clubs?.name : communication.associations?.name}`}
                    size="w-10 h-10"
                    fallbackIcon={communication.club_id ? Building : Globe}
                    iconColor="text-purple-600 dark:text-purple-400"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium dark-text">
                        {communication.club_id ? communication.clubs?.name : communication.associations?.name}
                      </h4>
                      {communication.is_pinned && (
                        <Pin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {communication.visibility === 'Public' ? (
                        <Eye className="h-3 w-3 text-green-600 dark:text-green-400" />
                      ) : (
                        <Lock className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                      )}
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        communication.visibility === 'Public'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                      }`}>
                        {communication.visibility === 'Public' ? 'Publique' : 'Privée'}
                      </span>
                      <PriorityBadge priority={communication.priority} />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs dark-text-muted">
                      {new Date(communication.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="text-xs dark-text-muted mt-1">
                      Par {authorName}
                    </div>
                  </div>
                </div>

                {/* Contenu principal */}
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {communication.image_url && (
                    <div className="lg:w-80 lg:flex-shrink-0">
                      <img 
                        src={communication.image_url} 
                        alt={communication.title}
                        className="w-full h-48 lg:h-32 object-contain bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImage(communication.image_url)}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold dark-text mb-3 flex items-center space-x-2">
                          <span>{communication.title}</span>
                          {communication.expires_at && (
                            <span className="flex items-center text-xs text-orange-600 dark:text-orange-400">
                              <Clock className="h-3 w-3 mr-1" />
                              Expire le {new Date(communication.expires_at).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </h3>
                        
                        <div className="mb-4">
                          <p className={`dark-text ${!isExpanded ? 'line-clamp-3' : ''}`}>
                            {communication.content}
                          </p>
                          {communication.content.length > 200 && (
                            <button
                              onClick={() => toggleCommunicationExpansion(communication.id)}
                              className="mt-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                  Voir moins
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                  Voir plus
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Clubs ciblés pour communications privées */}
                        {communication.visibility === 'Private' && communication.target_clubs_data && communication.target_clubs_data.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center text-sm dark-text-muted mb-2">
                              <Target className="h-4 w-4 mr-1" />
                              Clubs ciblés :
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {communication.target_clubs_data.map((club) => (
                                <span key={club.id} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                                  {club.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Boutons d'action */}
                        <div className="flex items-center space-x-2 mt-4">
                          {canManageCommunication(communication) && (
                            <>
                              <button
                                onClick={() => togglePin(communication.id, communication.is_pinned)}
                                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                                  communication.is_pinned
                                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50'
                                    : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900/50'
                                }`}
                              >
                                {communication.is_pinned ? (
                                  <>
                                    <PinOff className="h-4 w-4" />
                                    <span>Désépingler</span>
                                  </>
                                ) : (
                                  <>
                                    <Pin className="h-4 w-4" />
                                    <span>Épingler</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleEdit(communication)}
                                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 text-sm transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                                <span>Modifier</span>
                              </button>
                              <button
                                onClick={() => handleDelete(communication.id)}
                                className="flex items-center space-x-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 text-sm transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Supprimer</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {communications.length === 0 && (
            <div className="px-6 py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500 mb-4" />
              <p className="dark-text-muted">
                {clubId && clubInfo ? 
                  `Aucune communication pour ${clubInfo.name}` :
                  'Aucune communication disponible'
                }
              </p>
              <p className="text-sm dark-text-muted mt-2">
                {clubId && clubInfo ? (
                  `Ce club n'a publié aucune communication.`
                ) : (
                  <>
                    {profile?.role === 'Supporter' && 'Aucune communication publique dans votre association.'}
                    {profile?.role === 'Member' && 'Aucune communication dans votre club ou votre association.'}
                    {(profile?.role === 'Club Admin' || profile?.role === 'Super Admin') && 'Commencez par créer une communication.'}
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modale pour l'aperçu d'image */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <img 
              src={selectedImage} 
              alt="Communication en plein écran"
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}