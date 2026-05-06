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
            <p class="text-xs text-encre-2">${display_name}</p>
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
        className="bg-white dark:bg-papier-2 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[var(--ds-border)] dark:border-[var(--ds-border-2)] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Map className="h-5 w-5 text-terracotta dark:text-terracotta" />
            <h2 className="text-lg font-semibold dark:text-white">Localisation de l'événement</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-papier-2 dark:hover:bg-papier-3 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-encre-3 dark:text-encre-3" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="font-bold text-lg dark:text-white mb-1">{eventName}</h3>
            <div className="flex items-center text-encre-2 dark:text-encre-3">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{location}</span>
            </div>
          </div>

          <div className="relative">
            <div 
              ref={mapRef} 
              className="w-full h-96 rounded-lg border border-[var(--ds-border)] dark:border-[var(--ds-border-2)]"
              style={{ minHeight: '384px' }}
            />
            
            {loading && (
              <div className="absolute inset-0 bg-white dark:bg-papier-2 bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta dark:border-terracotta mx-auto mb-2"></div>
                  <p className="text-sm text-encre-2 dark:text-encre-3">Chargement de la carte...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 bg-white dark:bg-papier-2 bg-opacity-90 flex items-center justify-center rounded-lg">
                <div className="text-center p-6">
                  <AlertCircle className="h-8 w-8 text-ds-danger mx-auto mb-2" />
                  <p className="text-sm text-ds-danger dark:text-ds-danger mb-2">{error}</p>
                  <p className="text-xs text-encre-3 dark:text-encre-3">
                    Vérifiez que l'adresse est correcte et réessayez
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-encre-3 dark:text-encre-3 text-center">
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
        className="bg-white dark:bg-papier-2 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[var(--ds-border)] dark:border-[var(--ds-border-2)] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Share2 className="h-5 w-5 text-terracotta dark:text-terracotta" />
            <h2 className="text-lg font-semibold dark:text-white">Partager l'événement</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-papier-2 dark:hover:bg-papier-3 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-encre-3 dark:text-encre-3" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-papier-2 dark:bg-papier-3 rounded-lg">
            <h3 className="font-semibold dark:text-white mb-2">{event.name}</h3>
            <div className="text-sm text-encre-2 dark:text-encre-3 space-y-1">
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
                className="w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-papier-3 dark:text-white"
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
                    onChange={() => setFormality('tu')}
                    className="mr-2"
                  />
                  <span className="text-sm dark:text-encre-3">Tutoiement (tu)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="vous"
                    checked={formality === 'vous'}
                    onChange={() => setFormality('vous')}
                    className="mr-2"
                  />
                  <span className="text-sm dark:text-encre-3">Vouvoiement (vous)</span>
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
                className="w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-papier-3 dark:text-white"
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
                    className="text-xs px-3 py-1 bg-terracotta-soft dark:bg-terracotta-soft/30 text-terracotta-deep dark:text-terracotta rounded hover:bg-terracotta-soft dark:hover:bg-terracotta-soft transition-colors"
                  >
                    {editMode ? 'Aperçu' : 'Modifier'}
                  </button>
                </div>
                
                {editMode ? (
                  <textarea
                    value={editableMessage}
                    onChange={(e) => setEditableMessage(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-papier-3 dark:text-white font-mono text-sm"
                  />
                ) : (
                  <div className="p-3 bg-terracotta-soft dark:bg-terracotta-soft border border-terracotta dark:border-terracotta rounded-lg text-sm max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-encre-2 dark:text-encre-3 font-sans">
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
              className="flex-1 px-4 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] text-encre-2 dark:text-encre-3 rounded-lg hover:bg-papier-2 dark:hover:bg-papier-3 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleShare}
              disabled={!recipientName.trim()}
              className="flex-1 px-4 py-2 bg-terracotta dark:bg-terracotta-deep text-white rounded-lg hover:bg-terracotta-deep dark:hover:bg-terracotta-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-terracotta dark:border-terracotta"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-encre flex items-center">
            <Calendar className="h-8 w-8 mr-3 text-terracotta dark:text-terracotta" />
            Mon Calendrier
          </h1>
          <p className="text-encre-3 mt-2">
            {calendarEventsCount} événement{calendarEventsCount !== 1 ? 's' : ''} dans votre calendrier personnel
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={fetchUserCalendarEvents}
            className="bg-papier-2 text-encre border border-[var(--ds-border-2)] hover:bg-papier-3 flex items-center px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </button>
          
          {calendarEventsCount > 0 && (
            <button
              onClick={exportCalendarToICS}
              className="flex items-center px-4 py-2 bg-ds-success dark:bg-ds-success-soft text-white rounded-lg hover:bg-ds-success dark:hover:bg-ds-success transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter (.ics)
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-ds-danger-soft dark:bg-ds-danger-soft border border-ds-danger dark:border-ds-danger rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-ds-danger dark:text-ds-danger mr-2">⚠️</div>
            <div className="text-ds-danger dark:text-ds-danger">{error}</div>
          </div>
        </div>
      )}

      {calendarEventsCount === 0 ? (
        <div className="bg-papier rounded-lg p-8 text-center">
          <Calendar className="h-16 w-16 text-encre-3 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-encre mb-2">Aucun événement dans votre calendrier</h3>
          <p className="text-encre-3 mb-4">
            Commencez par ajouter des événements depuis la page Événements
          </p>
          <a
            href="/events"
            className="bg-terracotta text-white hover:bg-terracotta-deep inline-flex items-center px-4 py-2 rounded-lg transition-colors"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Voir les événements
          </a>
        </div>
      ) : (
        <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
            <h2 className="text-lg font-semibold text-encre">
              Vos événements ({calendarEventsCount})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {calendarEvents.map((event) => (
              <div 
                key={event.id} 
                className={`px-6 py-6 hover:bg-papier-2 ${
                  isEventPast(event.date) ? 'opacity-60' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  
                  {event.image_url && (
                    <div className="lg:w-80 lg:flex-shrink-0">
                      <img 
                        src={event.image_url} 
                        alt={event.name}
                        className="w-full h-48 lg:h-40 object-contain bg-papier-2 dark:bg-slate-800 rounded-lg border border-[var(--ds-border)] dark:border-[var(--ds-border-2)] cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImage(event.image_url)}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-encre">
                            {event.name}
                          </h3>
                          
                          <div className="flex items-center space-x-2">
                            {event.visibility === 'Public' ? (
                              <Eye className="h-4 w-4 text-ds-success dark:text-ds-success" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-ds-warning dark:text-ds-warning" />
                            )}
                            
                            {isEventPast(event.date) && (
                              <span className="px-2 py-1 text-xs bg-papier-2 dark:bg-slate-700 text-encre-2 dark:text-slate-300 rounded-full">
                                Passé
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center text-encre-3">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="capitalize">{formatEventDate(event.date)}</span>
                          </div>

                          {event.location && (
                            <div className="flex items-center text-encre-3">
                              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="flex-1">{event.location}</span>
                              <button 
                                className="ml-2 text-xs text-terracotta dark:text-terracotta hover:text-terracotta-deep dark:hover:text-terracotta underline"
                                onClick={() => openMapModal(event.name, event.location!)}
                              >
                                Voir sur la carte
                              </button>
                            </div>
                          )}

                          {event.club && (
                            <div className="flex items-center text-encre-3">
                              <span className="text-sm bg-terracotta-soft dark:bg-terracotta-soft/30 text-terracotta-deep dark:text-terracotta px-2 py-1 rounded">
                                {event.club.name}
                              </span>
                            </div>
                          )}

                          {event.description && (
                            <p className="text-encre text-sm mt-2">
                              {event.description}
                            </p>
                          )}

                          <p className="text-xs text-encre-3">
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
    className="p-2 text-terracotta dark:text-terracotta hover:bg-terracotta-soft dark:hover:bg-terracotta-soft rounded-lg transition-colors"
    title="Partager cet événement"
  >
    <Share2 className="h-4 w-4" />
  </button>
  
  <button
    onClick={() => removeEventFromCalendar(event.id)}
    className="p-2 text-ds-danger dark:text-ds-danger hover:bg-ds-danger-soft dark:hover:bg-ds-danger-soft rounded-lg transition-colors"
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