// src/pages/MonCalendrier.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Calendar, Clock, MapPin, Trash2, Eye, EyeOff, Download, RefreshCw, X, Map, AlertCircle, Share2, Send } from 'lucide-react';
import { useCalendar } from '../hooks/useCalendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import LikeButton from '../components/LikeButton';
import { useAuthNew } from '../hooks/useAuthNew';

// Composant modale pour la carte
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

// Composant modale pour le partage d'événements - VERSION SIMPLE QUI MARCHAIT
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, event }) => {
  const [recipientName, setRecipientName] = useState('');
  const [formality, setFormality] = useState<'tu' | 'vous'>('tu');
  const [customMessage, setCustomMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editableMessage, setEditableMessage] = useState('');

  const generateEmailContent = () => {
    const isTu = formality === 'tu';
    const eventDate = new Date(event.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const greeting = isTu ? `Salut ${recipientName} !` : `Bonjour ${recipientName},`;
    const pronoun = isTu ? 'tu' : 'vous';
    const verbForm = isTu ? 'vas' : 'allez';
    const closing = isTu ? 
      `J'espère qu'on se verra là-bas !\n\nÀ bientôt,` :
      `J'espère que nous nous verrons là-bas !\n\nCordialement,`;

    let emailBody = `${greeting}

J'espère que ${pronoun} ${verbForm} bien ! 

Je voulais te partager un événement qui arrive bientôt : "${event.name}".

📅 Quand : ${eventDate}`;

    if (event.location) {
      emailBody += `\n📍 Où : ${event.location}`;
    }

    if (event.description) {
      emailBody += `\n\n📝 Détails : ${event.description}`;
    }

    if (customMessage.trim()) {
      emailBody += `\n\n${customMessage}`;
    }

    emailBody += `\n\n${closing}`;

    return emailBody;
  };

  const handleShare = () => {
    if (!recipientName.trim()) {
      alert('Veuillez saisir le nom du destinataire');
      return;
    }

    const subject = `Invitation : ${event.name}`;
    // Utiliser le message éditable si on est en mode édition, sinon générer automatiquement
    const body = editMode ? editableMessage : generateEmailContent();
    
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold dark:text-white">Partager l'événement</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold dark:text-white mb-2">{event.name}</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {new Date(event.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              {event.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.location}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium dark:text-white mb-2">
                Nom ou prénom du destinataire *
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Ex: Marie, Paul, Dr. Dubois..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-2">
                Niveau de formalité
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="tu"
                    checked={formality === 'tu'}
                    onChange={(e) => setFormality('tu')}
                    className="mr-2"
                  />
                  <span className="text-sm dark:text-gray-300">Tutoiement (tu)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="vous"
                    checked={formality === 'vous'}
                    onChange={(e) => setFormality('vous')}
                    className="mr-2"
                  />
                  <span className="text-sm dark:text-gray-300">Vouvoiement (vous)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white mb-2">
                Message personnel (optionnel)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Ajouter un message personnel..."
              />
            </div>

            {recipientName && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium dark:text-white">
                    {editMode ? 'Modifier le message' : 'Aperçu du message'}
                  </label>
                  <button
                    onClick={() => {
                      if (!editMode) {
                        // Charger le message actuel dans l'éditeur
                        setEditableMessage(generateEmailContent());
                      }
                      setEditMode(!editMode);
                    }}
                    className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    {editMode ? 'Aperçu' : 'Modifier'}
                  </button>
                </div>
                
                {editMode ? (
                  <textarea
                    value={editableMessage}
                    onChange={(e) => setEditableMessage(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                  />
                ) : (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg text-sm max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 font-sans">
                      {editableMessage || generateEmailContent()}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleShare}
              disabled={!recipientName.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="h-4 w-4 mr-2" />
              Partager
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MonCalendrier() {
  const {
    calendarEvents,
    loading,
    error,
    fetchUserCalendarEvents,
    removeEventFromCalendar,
    exportCalendarToICS,
    calendarEventsCount
  } = useCalendar();

  const { user } = useAuthNew();  // ← AJOUTEZ CETTE LIGNE ICI
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedEventForMap, setSelectedEventForMap] = useState<{name: string, location: string} | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedEventForShare, setSelectedEventForShare] = useState<any>(null);

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
  };

  const isEventPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const openMapModal = (eventName: string, location: string) => {
    setSelectedEventForMap({ name: eventName, location });
    setShowMapModal(true);
  };

  const closeMapModal = () => {
    setShowMapModal(false);
    setSelectedEventForMap(null);
  };

  const openShareModal = (event: any) => {
    setSelectedEventForShare(event);
    setShowShareModal(true);
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setSelectedEventForShare(null);
  };

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
          <h1 className="text-3xl font-bold dark-text flex items-center">
            <Calendar className="h-8 w-8 mr-3 text-blue-600 dark:text-blue-400" />
            Mon Calendrier
          </h1>
          <p className="dark-text-muted mt-2">
            {calendarEventsCount} événement{calendarEventsCount !== 1 ? 's' : ''} dans votre calendrier personnel
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={fetchUserCalendarEvents}
            className="dark-btn-secondary flex items-center px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </button>
          
          {calendarEventsCount > 0 && (
            <button
              onClick={exportCalendarToICS}
              className="flex items-center px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter (.ics)
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 dark:text-red-400 mr-2">⚠️</div>
            <div className="text-red-800 dark:text-red-200">{error}</div>
          </div>
        </div>
      )}

      {calendarEventsCount === 0 ? (
        <div className="dark-bg rounded-lg p-8 text-center">
          <Calendar className="h-16 w-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium dark-text mb-2">Aucun événement dans votre calendrier</h3>
          <p className="dark-text-muted mb-4">
            Commencez par ajouter des événements depuis la page Événements
          </p>
          <a
            href="/events"
            className="dark-btn-primary inline-flex items-center px-4 py-2 rounded-lg transition-colors"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Voir les événements
          </a>
        </div>
      ) : (
        <div className="dark-card shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-lg font-semibold dark-text">
              Vos événements ({calendarEventsCount})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {calendarEvents.map((event) => (
              <div 
                key={event.id} 
                className={`px-6 py-6 dark-hover ${
                  isEventPast(event.date) ? 'opacity-60' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  
                  {event.image_url && (
                    <div className="lg:w-80 lg:flex-shrink-0">
                      <img 
                        src={event.image_url} 
                        alt={event.name}
                        className="w-full h-48 lg:h-40 object-contain bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImage(event.image_url)}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold dark-text">
                            {event.name}
                          </h3>
                          
                          <div className="flex items-center space-x-2">
                            {event.visibility === 'Public' ? (
                              <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            )}
                            
                            {isEventPast(event.date) && (
                              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-full">
                                Passé
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center dark-text-muted">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="capitalize">{formatEventDate(event.date)}</span>
                          </div>

                          {event.location && (
                            <div className="flex items-center dark-text-muted">
                              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="flex-1">{event.location}</span>
                              <button 
                                className="ml-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                                onClick={() => openMapModal(event.name, event.location!)}
                              >
                                Voir sur la carte
                              </button>
                            </div>
                          )}

                          {event.club && (
                            <div className="flex items-center dark-text-muted">
                              <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                {event.club.name}
                              </span>
                            </div>
                          )}

                          {event.description && (
                            <p className="dark-text text-sm mt-2">
                              {event.description}
                            </p>
                          )}

                          <p className="text-xs dark-text-muted">
                            Ajouté le {format(new Date(event.added_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
  <LikeButton 
    eventId={event.id} 
    userId={user?.id}
    size="sm"
    showCount={true}
  />
  
  <button
    onClick={() => openShareModal(event)}
    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
    title="Partager cet événement"
  >
    <Share2 className="h-4 w-4" />
  </button>
  
  <button
    onClick={() => removeEventFromCalendar(event.id)}
    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
    title="Retirer de mon calendrier"
  >
    <Trash2 className="h-4 w-4" />
  </button>
</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          location={selectedEventForMap.location}
          eventName={selectedEventForMap.name}
        />
      )}

      {selectedEventForShare && (
        <ShareModal
          isOpen={showShareModal}
          onClose={closeShareModal}
          event={selectedEventForShare}
        />
      )}
    </div>
  );
}