import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { NotificationService } from '../services/notificationService';
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
  CalendarX,
  Wand2,
  RefreshCw,
  Map,
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

const LogoDisplay: React.FC<LogoDisplayProps> = ({ src, alt, size = 'w-8 h-8', fallbackIcon: FallbackIcon, iconColor = 'text-gray-400 dark:text-slate-500' }) => {
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

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: string;
  eventName: string;
}

const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, location, eventName }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    const loadLeaflet = async () => {
      setLoading(true);
      setError(null);

      try {
        if (typeof window !== 'undefined' && !(window as any).L) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);

          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => initMap();
          script.onerror = () => setError('Erreur lors du chargement de la carte');
          document.head.appendChild(script);
        } else {
          initMap();
        }
      } catch (err) {
        setError('Erreur lors de l\'initialisation de la carte');
        setLoading(false);
      }
    };

    const initMap = async () => {
      try {
        const L = (window as any).L;
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
        );
        const data = await response.json();

        if (data.length === 0) {
          setError('Adresse introuvable');
          setLoading(false);
          return;
        }

        const { lat, lon, display_name } = data[0];

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        const map = L.map(mapRef.current).setView([parseFloat(lat), parseFloat(lon)], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        const marker = L.marker([parseFloat(lat), parseFloat(lon)]).addTo(map);
        marker.bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-sm mb-1">${eventName}</h3>
            <p class="text-xs text-gray-600">${display_name}</p>
          </div>
        `).openPopup();

        mapInstanceRef.current = map;
        setLoading(false);

        setTimeout(() => {
          map.invalidateSize();
        }, 100);

      } catch (err) {
        console.error('Erreur géocodage:', err);
        setError('Erreur lors de la localisation de l\'adresse');
        setLoading(false);
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, location, eventName]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Map className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold dark:text-white">Localisation de l'événement</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="font-bold text-lg dark:text-white mb-1">{eventName}</h3>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{location}</span>
            </div>
          </div>

          <div className="relative">
            <div 
              ref={mapRef} 
              className="w-full h-96 rounded-lg border border-gray-200 dark:border-gray-600"
              style={{ minHeight: '384px' }}
            />
            
            {loading && (
              <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Chargement de la carte...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-90 flex items-center justify-center rounded-lg">
                <div className="text-center p-6">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Vérifiez que l'adresse est correcte et réessayez
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            Carte fournie par OpenStreetMap • Géolocalisation par Nominatim
          </div>
        </div>
      </div>
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
  const [clubInfo, setClubInfo] = useState<{id: string, name: string, slug?: string} | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [submittingEvent, setSubmittingEvent] = useState(false);
  
  const [userCalendarEvents, setUserCalendarEvents] = useState<string[]>([]);
  const [addingToCalendarId, setAddingToCalendarId] = useState<string | null>(null);

  const [rewritingDescription, setRewritingDescription] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);

  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedEventForMap, setSelectedEventForMap] = useState<Event | null>(null);
  
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
  if (profile?.id) {
    fetchEvents();
    fetchUserCalendarEvents();
  }
}, [profile?.id, clubId]);

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

  const toggleEventInCalendar = async (eventId: string) => {
    if (!profile?.id || (profile.role !== 'Member' && profile.role !== 'Supporter')) return;

    setAddingToCalendarId(eventId);
    const isInCalendar = userCalendarEvents.includes(eventId);

    try {
      if (isInCalendar) {
        const { error } = await supabase
          .from('user_calendar_events')
          .delete()
          .eq('user_id', profile.id)
          .eq('event_id', eventId);

        if (error) throw error;

        setUserCalendarEvents(prev => prev.filter(id => id !== eventId));
      } else {
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

    const now = new Date();

    let query = supabase
      .from('events')
      .select(`
        *,
        clubs (id, name, slug, association_id, logo_url)
      `);

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
    }

    query = query.gte('date', now.toISOString());

    const { data, error } = await query.order('date', { ascending: true });

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

  const openMapModal = (event: Event) => {
    setSelectedEventForMap(event);
    setShowMapModal(true);
  };

  const closeMapModal = () => {
    setShowMapModal(false);
    setSelectedEventForMap(null);
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

      // Étape 1 : Analyse et extraction de l'activité principale via OpenAI GPT-5-nano
      const analysisResponse = await fetch('/.netlify/functions/analyze-event-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: eventForm.name,
          description: eventForm.description || '',
        }),
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        throw new Error(errorData.error || `Erreur lors de l'analyse: ${analysisResponse.status}`);
      }

      const analysisData = await analysisResponse.json();
      
      if (!analysisData.success || !analysisData.activityDescription) {
        throw new Error('Impossible d\'extraire la description de l\'activité');
      }

      const activityDescription = analysisData.activityDescription;
      console.log('✅ Description extraite par GPT-5-nano:', activityDescription);

      // Étape 2 : Construction du prompt enrichi pour la génération d'image
      const enhancedDescription = `${activityDescription}

Style visuel : illustration vectorielle moderne, design plat (flat design), couleurs vives et harmonieuses, composition minimaliste et épurée, formes géométriques claires, sensation de dynamisme et d'énergie.`;

      console.log('🎨 Prompt enrichi pour l\'image:', enhancedDescription);

      // Étape 3 : Génération de l'image via Vertex AI
      const res = await fetch('/.netlify/functions/generate-event-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: eventForm.name,
          description: enhancedDescription,
          isForCommunication: false,
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

      console.log('✅ Image générée avec succès');

      setEventForm(prev => ({ ...prev, image_url: imageToUse }));
      setSelectedImage(imageToUse);
    } catch (error: any) {
      console.error('❌ Erreur lors de la génération de l\'image:', error);
      alert(`Erreur lors de la génération de l'image: ${error?.message || String(error)}`);
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleRewriteDescription = async () => {
    if (!eventForm.name || !eventForm.description) {
      alert("Veuillez d'abord entrer un nom et une description pour l'événement");
      return;
    }

    try {
      setRewritingDescription(true);
      
      const response = await fetch('/.netlify/functions/rewrite-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventName: eventForm.name,
          description: eventForm.description,
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
      console.error('Error rewriting description:', error);
      alert('Erreur lors de la réécriture: ' + error.message);
    } finally {
      setRewritingDescription(false);
    }
  };

  const acceptAiSuggestion = () => {
    if (aiSuggestion) {
      setEventForm({ ...eventForm, description: aiSuggestion });
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
    
    if (!profile?.club_id && isClubAdmin) {
      alert('You must be associated with a club to create events');
      return;
    }

    // Empêcher les soumissions multiples
    if (submittingEvent) {
      return;
    }
  
    try {
      setSubmittingEvent(true);

      // FIX : Convertir la date locale en ISO UTC
      const localDate = new Date(eventForm.date);
      
      const eventData = {
        name: eventForm.name,
        description: eventForm.description,
        date: localDate.toISOString(),
        location: eventForm.location,
        image_url: eventForm.image_url,
        visibility: eventForm.visibility,
        club_id: profile!.club_id,
      };
  
      let createdEventId: string | null = null;
  
      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);
  
        if (error) throw error;
        createdEventId = editingEvent.id;
      } else {
        const { data: newEvent, error } = await supabase
          .from('events')
          .insert([eventData])
          .select()
          .single();
  
        if (error) throw error;
        createdEventId = newEvent.id;
  
        if (createdEventId && profile?.club_id) {
          try {
            let recipientIds: string[] = [];
  
            if (eventData.visibility === 'Public') {
              const { data: followers, error: followersError } = await supabase
                .from('user_clubs')
                .select('user_id')
                .eq('club_id', profile.club_id);
  
              if (followersError) {
                console.error('Error fetching followers:', followersError);
              } else if (followers && followers.length > 0) {
                recipientIds = followers.map(f => f.user_id);
                console.log(`📢 Événement PUBLIC : ${recipientIds.length} follower(s) seront notifiés`);
              }
            } else {
              const { data: members, error: membersError } = await supabase
                .from('profiles')
                .select('id')
                .eq('club_id', profile.club_id)
                .in('role', ['Member', 'Club Admin']);
  
              if (membersError) {
                console.error('Error fetching club members:', membersError);
              } else if (members && members.length > 0) {
                recipientIds = members.map(m => m.id);
                console.log(`🔒 Événement PRIVÉ : ${recipientIds.length} membre(s) seront notifiés`);
              }
            }
  
            if (recipientIds.length > 0) {
              const { data: clubInfo, error: clubError } = await supabase
                .from('clubs')
                .select('name')
                .eq('id', profile.club_id)
                .single();
  
              if (!clubError && clubInfo) {
                await NotificationService.notifyNewEvent(
                  recipientIds,
                  eventData.name,
                  createdEventId,
                  eventData.date,
                  clubInfo.name
                );
  
                console.log(`✅ Notifications envoyées pour l'événement "${eventData.name}" (${eventData.visibility})`);
              }
            } else {
              console.log(`ℹ️ Aucun destinataire trouvé pour l'événement "${eventData.name}"`);
            }
          } catch (notificationError) {
            console.error('Error sending notifications:', notificationError);
          }
        }
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
      
      if (!editingEvent && createdEventId) {
        console.log('✅ Événement créé et notifications envoyées !');
      }
      
    } catch (error: any) {
      console.error('Error saving event:', error);
      alert('Error saving event: ' + error.message);
    } finally {
      setSubmittingEvent(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    
    // FIX : Convertir la date ISO en format datetime-local
    const date = new Date(event.date);
    const localDateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);
    
    setEventForm({
      name: event.name,
      description: event.description || '',
      date: localDateTime,
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
      return `Événements à venir de ${clubInfo.name}`;
    }
    return 'Événements à venir';
  };

  if (profile?.role === 'Supporter' && !profile?.association_id) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold dark-text">Événements</h1>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Association requise</h2>
              <p className="text-yellow-800 dark:text-yellow-300 mb-4">
                Pour voir les événements, vous devez d'abord rejoindre une association. 
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
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold dark-text">{getPageTitle()}</h1>
            {clubId && clubInfo && (
              <div className="mt-2 flex items-center space-x-2">
                <a 
                  href="/events" 
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  ← Retour à tous les événements
                </a>
              </div>
            )}
          </div>
        </div>

        {isClubAdmin && (!clubId || (clubInfo && clubInfo.id === profile?.club_id)) && (
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
            className="dark-btn-primary px-3 sm:px-4 lg:px-4 py-2 rounded-lg transition-colors flex items-center justify-center sm:justify-start space-x-0 sm:space-x-2"
            title="Créer un Événement"
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline lg:hidden ml-2">Nouveau</span>
            <span className="hidden lg:inline ml-2">Créer un Événement</span>
          </button>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-4 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {getPageDescription()}
            </h3>
            <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              {getPageSubDescription()}
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="dark-card p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark-text">
                {editingEvent ? 'Modifier l\'Événement' : 'Créer un Nouvel Événement'}
              </h2>
              <button 
                onClick={() => setShowForm(false)}
                disabled={submittingEvent}
                className="p-2 dark-hover rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5 dark-text" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium dark-text mb-2">
                  Nom de l'Événement *
                </label>
                <input
                  type="text"
                  required
                  value={eventForm.name}
                  onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark-input"
                  placeholder="Ex: Tournoi de tennis annuel"
                  disabled={submittingEvent}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium dark-text mb-2">
                  Date et Heure *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark-input"
                  disabled={submittingEvent}
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark-text mb-2">
                  Lieu de l'Événement
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark-input"
                    placeholder="Ex: 123 Rue de la Paix, 75001 Paris"
                    disabled={submittingEvent}
                  />
                </div>
                <p className="text-xs dark-text-muted mt-1">
                  L'adresse sera utilisée pour afficher une carte interactive
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium dark-text mb-2">
                  Visibilité *
                </label>
                <select
                  value={eventForm.visibility}
                  onChange={(e) => setEventForm({ ...eventForm, visibility: e.target.value as 'Public' | 'Members Only' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark-input"
                  disabled={submittingEvent}
                >
                  <option value="Public">Public</option>
                  <option value="Members Only">Membres Seulement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium dark-text mb-2">
                  Visuel de l'Événement
                </label>
                
                {eventForm.image_url && (
                  <div className="mb-4 relative">
                    <img 
                      src={eventForm.image_url} 
                      alt="Aperçu" 
                      className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => setEventForm({ ...eventForm, image_url: '' })}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      disabled={submittingEvent}
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
                      disabled={uploadingImage || submittingEvent}
                    />
                    <div className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <Upload className="h-5 w-5 mx-auto mb-1 text-gray-400 dark:text-slate-500" />
                      <span className="text-sm dark-text-muted">
                        {uploadingImage ? 'Upload...' : 'Télécharger'}
                      </span>
                    </div>
                  </label>

                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={generatingImage || !eventForm.name || submittingEvent}
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
                
                <p className="text-xs dark-text-muted mt-2">
                  Téléchargez une image ou laissez l'IA en créer une basée sur le nom et la description
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium dark-text">
                    Description
                  </label>
                  <button
                    type="button"
                    onClick={handleRewriteDescription}
                    disabled={rewritingDescription || !eventForm.name || !eventForm.description || submittingEvent}
                    className="flex items-center space-x-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Utiliser l'IA pour améliorer la description"
                  >
                    {rewritingDescription ? (
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
                        disabled={submittingEvent}
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
                        disabled={submittingEvent}
                      >
                        Utiliser cette description
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          acceptAiSuggestion();
                        }}
                        className="flex-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                        disabled={submittingEvent}
                      >
                        Utiliser et modifier
                      </button>
                    </div>
                  </div>
                )}

                <textarea
                  rows={4}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark-input"
                  placeholder="Décrivez votre événement, les détails importants, les instructions pour les participants..."
                  disabled={submittingEvent}
                />
                
                <p className="text-xs dark-text-muted mt-1">
                  Astuce : Écrivez d'abord votre description, puis utilisez l'IA pour l'améliorer
                </p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={submittingEvent}
                  className="dark-btn-secondary flex-1 py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage || generatingImage || submittingEvent}
                  className="flex-1 py-3 px-4 dark-btn-primary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {submittingEvent ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{editingEvent ? 'Mise à jour...' : 'Création...'}</span>
                    </>
                  ) : (
                    <span>{editingEvent ? 'Mettre à jour' : 'Créer'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="dark-card shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-lg font-semibold dark-text flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            {getListTitle()} ({events.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-600">
          {events.map((event) => {
            const isExpanded = expandedEvents.has(event.id);
            return (
              <div key={event.id} className="px-6 py-6 dark-hover">
                <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-600">
                  <LogoDisplay 
                    src={event.clubs.logo_url} 
                    alt={`Logo ${event.clubs.name}`} 
                    size="w-10 h-10"
                    fallbackIcon={Building}
                    iconColor="text-blue-600 dark:text-blue-400"
                  />
                  <div>
                    <h4 className="text-sm font-medium dark-text">{event.clubs.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      {event.visibility === 'Public' ? (
                        <Eye className="h-3 w-3 text-green-600 dark:text-green-400" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                      )}
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        event.visibility === 'Public'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                      }`}>
                        {event.visibility}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {event.image_url && (
                    <div className="lg:w-80 lg:flex-shrink-0">
                      <img 
                        src={event.image_url} 
                        alt={event.name}
                        className="w-full h-48 lg:h-32 object-contain bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImage(event.image_url)}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold dark-text mb-3">{event.name}</h3>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center dark-text-muted">
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
                            <div className="flex items-center dark-text-muted">
                              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="text-sm flex-1">{event.location}</span>
                              <button 
                                className="ml-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                                onClick={() => openMapModal(event)}
                              >
                                Voir sur la carte
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {event.description && (
                          <div className="mb-4">
                            <p className={`dark-text ${!isExpanded ? 'line-clamp-2' : ''}`}>
                              {event.description}
                            </p>
                            {event.description.length > 150 && (
                              <button
                                onClick={() => toggleEventExpansion(event.id)}
                                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center"
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

                        <div className="flex items-center space-x-2 mt-4">
                          {canManageEvent(event) && (
                            <>
                              <button
                                onClick={() => handleEdit(event)}
                                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 text-sm transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                                <span>Modifier</span>
                              </button>
                              <button
                                onClick={() => handleDelete(event.id)}
                                className="flex items-center space-x-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 text-sm transition-colors"
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
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                                  : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50'
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
              <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500 mb-4" />
              <p className="dark-text-muted">
                {clubId && clubInfo 
                  ? `Aucun événement à venir pour ${clubInfo.name}`
                  : 'Aucun événement à venir'
                }
              </p>
              <p className="text-sm dark-text-muted mt-2">
                {clubId && clubInfo ? (
                  `Ce club n'a aucun événement programmé.`
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

      {selectedEventForMap && (
        <MapModal
          isOpen={showMapModal}
          onClose={closeMapModal}
          location={selectedEventForMap.location || ''}
          eventName={selectedEventForMap.name}
        />
      )}
    </div>
  );
}