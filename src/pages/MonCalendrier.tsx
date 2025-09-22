// src/pages/MonCalendrier.tsx
import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Trash2, Eye, EyeOff, Download, RefreshCw, X } from 'lucide-react';
import { useCalendar } from '../hooks/useCalendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

  // État pour la modale d'image
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
  };

  const isEventPast = (dateString: string) => {
    return new Date(dateString) < new Date();
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-8 w-8 mr-3 text-blue-600" />
            Mon Calendrier
          </h1>
          <p className="text-gray-600 mt-2">
            {calendarEventsCount} événement{calendarEventsCount !== 1 ? 's' : ''} dans votre calendrier personnel
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={fetchUserCalendarEvents}
            className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </button>
          
          {calendarEventsCount > 0 && (
            <button
              onClick={exportCalendarToICS}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter (.ics)
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 mr-2">⚠️</div>
            <div className="text-red-800">{error}</div>
          </div>
        </div>
      )}

      {calendarEventsCount === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun événement dans votre calendrier</h3>
          <p className="text-gray-600 mb-4">
            Commencez par ajouter des événements depuis la page Événements
          </p>
          <a
            href="/events"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Voir les événements
          </a>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Vos événements ({calendarEventsCount})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {calendarEvents.map((event) => (
              <div 
                key={event.id} 
                className={`px-6 py-6 hover:bg-gray-50 ${
                  isEventPast(event.date) ? 'opacity-60' : ''
                }`}
              >
                {/* Nouveau layout avec image */}
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  
                  {/* Image de l'événement (si disponible) */}
                  {event.image_url && (
                    <div className="lg:w-80 lg:flex-shrink-0">
                      <img 
                        src={event.image_url} 
                        alt={event.name}
                        className="w-full h-48 lg:h-40 object-contain bg-gray-50 rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImage(event.image_url)}
                      />
                    </div>
                  )}
                  
                  {/* Contenu de l'événement */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Titre et badges */}
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {event.name}
                          </h3>
                          
                          <div className="flex items-center space-x-2">
                            {event.visibility === 'Public' ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-orange-600" />
                            )}
                            
                            {isEventPast(event.date) && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                Passé
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Informations de l'événement */}
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="capitalize">{formatEventDate(event.date)}</span>
                          </div>

                          {event.location && (
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{event.location}</span>
                            </div>
                          )}

                          {event.club && (
                            <div className="flex items-center text-gray-600">
                              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {event.club.name}
                              </span>
                            </div>
                          )}

                          {event.description && (
                            <p className="text-gray-700 text-sm mt-2">
                              {event.description}
                            </p>
                          )}

                          <p className="text-xs text-gray-500">
                            Ajouté le {format(new Date(event.added_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                          </p>
                        </div>
                      </div>

                      {/* Bouton de suppression */}
                      <button
                        onClick={() => removeEventFromCalendar(event.id)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Retirer de mon calendrier"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modale pour afficher l'image en plein écran */}
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