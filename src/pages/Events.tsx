import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { 
  Calendar, 
  Plus, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  AlertCircle, 
  Users, 
  MapPin,
  Upload,
  Sparkles,
  Image as ImageIcon,
  X,
  ChevronDown,
  ChevronUp,
  Building,
  CalendarPlus,
  CalendarX
} from 'lucide-react';

interface Event {
  id: string;
  name: string;
  description: string | null;
  date: string;
  location: string | null;
  image_url: string | null;
  visibility: 'Public' | 'Members Only';
  club_id: string;
  clubs: {
    name: string;
    logo_url?: string | null;
  };
}

interface EventForm {
  name: string;
  description: string;
  date: string;
  location: string;
  image_url: string;
  visibility: 'Public' | 'Members Only';
}

interface LogoDisplayProps {
  src: string | null | undefined;
  alt: string;
  size?: string;
  fallbackIcon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}

const LogoDisplay: React.FC<LogoDisplayProps> = ({ src, alt, size = 'w-8 h-8', fallbackIcon: FallbackIcon, iconColor = 'text-gray-400' }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`${size} rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0`}>
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

export default function Events() {
  const { profile, isClubAdmin } = useAuthNew();
  const [searchParams] = useSearchParams();
  const clubId = searchParams.get('club');
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [clubInfo, setClubInfo] = useState<{id: string, name: string, slug?: string} | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  
  // États pour le calendrier personnel
  const [userCalendarEvents, setUserCalendarEvents] = useState<string[]>([]);
  const [addingToCalendarId, setAddingToCalendarId] = useState<string | null>(null);
  
  const [eventForm, setEventForm] = useState<EventForm>({
    name: '',
    description: '',
    date: '',
    location: '',
    image_url: '',
    visibility: 'Public',
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
      fetchEvents();
      fetchUserCalendarEvents(); // Ajouter cette ligne
    }
  }, [profile, showHistory, clubId]);

  // Nouvelle fonction pour récupérer les événements du calendrier utilisateur
  const fetchUserCalendarEvents = async () => {
    if (!profile?.id || (profile.role !== 'Member' && profile.role !== 'Supporter')) return;

    try {
      const { data, error } = await supabase
        .from('user_calendar_events')
        .select('event_id')
        .eq('user_id', profile.id);

      if (error) throw error;

      const eventIds = data?.map(item => item.event_id) || [];
      setUserCalendarEvents(eventIds);
    } catch (error: any) {
      console.error('Error fetching user calendar events:', error);
    }
  };

  // Nouvelle fonction pour ajouter/retirer un événement du calendrier
  const toggleEventInCalendar = async (eventId: string) => {
    if (!profile?.id || (profile.role !== 'Member' && profile.role !== 'Supporter')) return;

    setAddingToCalendarId(eventId);
    const isInCalendar = userCalendarEvents.includes(eventId);

    try {
      if (isInCalendar) {
        // Retirer du calendrier
        const { error } = await supabase
          .from('user_calendar_events')
          .delete()
          .eq('user_id', profile.id)
          .eq('event_id', eventId);

        if (error) throw error;

        setUserCalendarEvents(prev => prev.filter(id => id !== eventId));
      } else {
        // Ajouter au calendrier
        const { error } = await supabase
          .from('user_calendar_events')
          .insert({
            user_id: profile.id,
            event_id: eventId
          });

        if (error) throw error;

        setUserCalendarEvents(prev => [...prev, eventId]);
      }
    } catch (error: any) {
      console.error('Error toggling event in calendar:', error);
      alert('Erreur lors de la modification du calendrier: ' + error.message);
    } finally {
      setAddingToCalendarId(null);
    }
  };

  const fetchEvents = async () => {
  try {
    if (!profile) {
      setLoading(false);
      return;
    }

    if (profile.role === 'Supporter' && !profile.association_id) {
      setEvents([]);
      setLoading(false);
      return;
    }

    // Calculer la date limite (hier à minuit)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    let query = supabase
      .from('events')
      .select(`
        *,
        clubs (id, name, slug, association_id, logo_url)
      `);

    // Filtrage par club si paramètre présent
if (clubId) {
  // Si clubId ressemble à un UUID (ancien format), utiliser directement
  if (clubId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    query = query.eq('club_id', clubId);
  } else {
    // Si c'est un slug, chercher l'ID correspondant
    const { data: clubData } = await supabase
      .from('clubs')
      .select('id')
      .eq('slug', clubId)
      .single();
    
    if (clubData) {
      query = query.eq('club_id', clubData.id);
    }
  }
}

    // Filtrer selon l'affichage (actuel vs historique)
    if (showHistory) {
      query = query.lte('date', yesterday.toISOString());
    } else {
      query = query.gte('date', yesterday.toISOString());
    }

    const { data, error } = await query.order('date', { ascending: showHistory ? false : true });

    if (error) throw error;
    setEvents(data || []);
  } catch (error) {
    console.error('Error fetching events:', error);
  } finally {
    setLoading(false);
  }
};

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `events/${fileName}`;

      const { data: uploadData, error } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      setEventForm({ ...eventForm, image_url: publicUrl });
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
      
      const prompt = `${eventForm.name} ${eventForm.description}`.trim();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const placeholderUrl = `https://via.placeholder.com/600x400/4F46E5/FFFFFF?text=${encodeURIComponent(eventForm.name || 'Événement')}`;
      
      setEventForm({ ...eventForm, image_url: placeholderUrl });
      
    } catch (error: any) {
      console.error('Error generating image:', error);
      alert('Erreur lors de la génération de l\'image: ' + error.message);
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.club_id && isClubAdmin) {
      alert('You must be associated with a club to create events');
      return;
    }

    try {
      const eventData = {
        ...eventForm,
        club_id: profile!.club_id,
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('events')
          .insert([eventData]);

        if (error) throw error;
      }

      setEventForm({
        name: '',
        description: '',
        date: '',
        location: '',
        image_url: '',
        visibility: 'Public',
      });
      setShowForm(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (error: any) {
      console.error('Error saving event:', error);
      alert('Error saving event: ' + error.message);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      name: event.name,
      description: event.description || '',
      date: event.date.slice(0, 16),
      location: event.location || '',
      image_url: event.image_url || '',
      visibility: event.visibility,
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      fetchEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      alert('Error deleting event: ' + error.message);
    }
  };

  const canManageEvent = (event: Event) => {
    return isClubAdmin && event.club_id === profile?.club_id;
  };

  const getPageTitle = () => {
    if (clubId && clubInfo) {
      return `Événements - ${clubInfo.name}`;
    }
    return 'Événements';
  };

  const getPageDescription = () => {
    if (clubId && clubInfo) {
      return `Événements du club ${clubInfo.name}`;
    }
    
    if (profile?.role === 'Super Admin') return 'Tous les événements de votre association';
    if (profile?.role === 'Club Admin') return 'Événements de votre club et événements publics';
    if (profile?.role === 'Member') return 'Événements de votre club et événements publics';
    if (profile?.role === 'Supporter') return 'Événements publics de votre association';
    return '';
  };

  const getPageSubDescription = () => {
    if (clubId && clubInfo) {
      return `Tous les événements organisés par ${clubInfo.name}`;
    }
    
    if (profile?.role === 'Super Admin') return 'Vous voyez tous les événements publics et privés de votre association.';
    if (profile?.role === 'Club Admin') return 'Vous pouvez créer des événements pour votre club et voir les événements publics.';
    if (profile?.role === 'Member') return 'Vous voyez les événements de votre club et les événements publics de l\'association.';
    if (profile?.role === 'Supporter') return 'Vous ne voyez que les événements publics de votre association.';
    return '';
  };

  const getListTitle = () => {
    if (clubId && clubInfo) {
      if (showHistory) {
        return `Historique des événements de ${clubInfo.name}`;
      }
      return `Événements à venir de ${clubInfo.name}`;
    }
    
    return showHistory ? 'Historique des événements' : 'Événements à venir';
  };

  if (profile?.role === 'Supporter' && !profile?.association_id) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Événements</h1>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-yellow-900 mb-2">Association requise</h2>
              <p className="text-yellow-800 mb-4">
                Pour voir les événements, vous devez d'abord rejoindre une association. 
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
            {clubId && clubInfo && (
              <div className="mt-2 flex items-center space-x-2">
                <a 
                  href="/events" 
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  ← Retour à tous les événements
                </a>
              </div>
            )}
          </div>
          
          {!clubId && (
            <div className="flex rounded-lg border border-gray-300 bg-white">
              <button
                onClick={() => setShowHistory(false)}
                className={`px-3 py-1 text-sm rounded-l-lg transition-colors ${
                  !showHistory 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                À venir
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className={`px-3 py-1 text-sm rounded-r-lg transition-colors ${
                  showHistory 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Historique
              </button>
            </div>
          )}
        </div>

        {isClubAdmin && !showHistory && (!clubId || (clubInfo && clubInfo.id === profile?.club_id)) && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingEvent(null);
              setEventForm({
                name: '',
                description: '',
                date: '',
                location: '',
                image_url: '',
                visibility: 'Public',
              });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Créer un Événement</span>
          </button>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              {getPageDescription()}
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              {getPageSubDescription()}
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingEvent ? 'Modifier l\'Événement' : 'Créer un Nouvel Événement'}
              </h2>
              <button 
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'Événement *
                </label>
                <input
                  type="text"
                  required
                  value={eventForm.name}
                  onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Tournoi de tennis annuel"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date et Heure *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu de l'Événement
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 123 Rue de la Paix, 75001 Paris"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  L'adresse sera utilisée pour afficher une carte interactive (bientôt disponible)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibilité *
                </label>
                <select
                  value={eventForm.visibility}
                  onChange={(e) => setEventForm({ ...eventForm, visibility: e.target.value as 'Public' | 'Members Only' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Public">Public</option>
                  <option value="Members Only">Membres Seulement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visuel de l'Événement
                </label>
                
                {eventForm.image_url && (
                  <div className="mb-4 relative">
                    <img 
                      src={eventForm.image_url} 
                      alt="Aperçu" 
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => setEventForm({ ...eventForm, image_url: '' })}
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
                    <div className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      <Upload className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {uploadingImage ? 'Upload...' : 'Télécharger'}
                      </span>
                    </div>
                  </label>

                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={generatingImage || !eventForm.name}
                    className="flex-1 p-3 border-2 border-dashed border-purple-300 rounded-lg text-center hover:border-purple-400 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                    <span className="text-sm text-purple-600">
                      {generatingImage ? 'Génération...' : 'Générer IA'}
                    </span>
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Téléchargez une image ou laissez l'IA en créer une basée sur le nom et la description
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Décrivez votre événement, les détails importants, les instructions pour les participants..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage || generatingImage}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingEvent ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            {getListTitle()} ({events.length})
          </h2>
          {showHistory && (
            <p className="text-sm text-gray-500 mt-1">
              Événements passés triés du plus récent au plus ancien
            </p>
          )}
        </div>
        <div className="divide-y divide-gray-200">
          {events.map((event) => {
            const isExpanded = expandedEvents.has(event.id);
            return (
              <div key={event.id} className="px-6 py-6 hover:bg-gray-50">
                {/* En-tête avec logo et nom du club (même en mode filtrage) */}
                <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-100">
                  <LogoDisplay 
                    src={event.clubs.logo_url} 
                    alt={`Logo ${event.clubs.name}`} 
                    size="w-10 h-10"
                    fallbackIcon={Building}
                    iconColor="text-blue-600"
                  />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{event.clubs.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      {event.visibility === 'Public' ? (
                        <Eye className="h-3 w-3 text-green-600" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-orange-600" />
                      )}
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        event.visibility === 'Public'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {event.visibility}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contenu principal de l'événement */}
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {event.image_url && (
                    <div className="lg:w-80 lg:flex-shrink-0">
                      <img 
                        src={event.image_url} 
                        alt={event.name}
                        className="w-full h-48 lg:h-32 object-contain bg-gray-50 rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImage(event.image_url)}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Titre de l'événement */}
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{event.name}</h3>
                        
                        {/* Informations date et lieu */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">
                              {new Date(event.date).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="text-sm flex-1">{event.location}</span>
                              <button 
                                className="ml-2 text-xs text-blue-600 hover:text-blue-700 underline"
                                onClick={() => {
                                  // TODO: Ouvrir modal Google Maps
                                  alert('Fonctionnalité "Voir sur la carte" à venir !');
                                }}
                              >
                                Voir sur la carte
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Description avec expansion */}
                        {event.description && (
                          <div className="mb-4">
                            <p className={`text-gray-700 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                              {event.description}
                            </p>
                            {event.description.length > 150 && (
                              <button
                                onClick={() => toggleEventExpansion(event.id)}
                                className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center"
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
                        )}

                        {/* Boutons d'action */}
                        <div className="flex items-center space-x-2 mt-4">
                          {canManageEvent(event) && (
                            <>
                              <button
                                onClick={() => handleEdit(event)}
                                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                                <span>Modifier</span>
                              </button>
                              <button
                                onClick={() => handleDelete(event.id)}
                                className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Supprimer</span>
                              </button>
                            </>
                          )}
                          
                          {(profile?.role === 'Member' || profile?.role === 'Supporter') && (
                            <button
                              onClick={() => toggleEventInCalendar(event.id)}
                              disabled={addingToCalendarId === event.id}
                              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                                userCalendarEvents.includes(event.id)
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                              } disabled:opacity-50`}
                              title={
                                userCalendarEvents.includes(event.id) 
                                  ? 'Retirer de mon calendrier' 
                                  : 'Ajouter à mon calendrier'
                              }
                            >
                              {addingToCalendarId === event.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              ) : userCalendarEvents.includes(event.id) ? (
                                <>
                                  <CalendarX className="h-4 w-4" />
                                  <span>Dans mon calendrier</span>
                                </>
                              ) : (
                                <>
                                  <CalendarPlus className="h-4 w-4" />
                                  <span>Ajouter au calendrier</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {events.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">
                {clubId && clubInfo ? 
                  (showHistory ? `Aucun événement passé pour ${clubInfo.name}` : `Aucun événement à venir pour ${clubInfo.name}`) :
                  (showHistory ? 'Aucun événement dans l\'historique' : 'Aucun événement à venir')
                }
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {clubId && clubInfo ? (
                  `Ce club n'a ${showHistory ? 'organisé aucun événement par le passé' : 'aucun événement programmé'}.`
                ) : showHistory ? (
                  'Aucun événement passé trouvé pour votre profil.'
                ) : (
                  <>
                    {profile?.role === 'Supporter' && 'Aucun événement public programmé dans votre association.'}
                    {profile?.role === 'Member' && 'Aucun événement programmé dans votre club ou votre association.'}
                    {(profile?.role === 'Club Admin' || profile?.role === 'Super Admin') && 'Commencez par créer un événement.'}
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <img 
              src={selectedImage} 
              alt="Événement en plein écran"
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