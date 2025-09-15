import React, { useEffect, useState } from 'react';
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
  X
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

export default function Events() {
  const { profile, isClubAdmin } = useAuthNew();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [eventForm, setEventForm] = useState<EventForm>({
    name: '',
    description: '',
    date: '',
    location: '',
    image_url: '',
    visibility: 'Public',
  });

  useEffect(() => {
    fetchEvents();
  }, [profile, showHistory]);

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
          clubs (name, association_id)
        `);

      // Filtrer selon l'affichage (actuel vs historique)
      if (showHistory) {
        // Historique : événements d'hier et plus anciens
        query = query.lte('date', yesterday.toISOString());
      } else {
        // Actuel : événements d'aujourd'hui et futurs
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
          <h1 className="text-3xl font-bold text-gray-900">Événements</h1>
          
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
        </div>

        {isClubAdmin && !showHistory && (
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
              {profile?.role === 'Super Admin' && 'Tous les événements de votre association'}
              {profile?.role === 'Club Admin' && 'Événements de votre club et événements publics'}
              {profile?.role === 'Member' && 'Événements de votre club et événements publics'}
              {profile?.role === 'Supporter' && 'Événements publics de votre association'}
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              {profile?.role === 'Super Admin' && 'Vous voyez tous les événements publics et privés de votre association.'}
              {profile?.role === 'Club Admin' && 'Vous pouvez créer des événements pour votre club et voir les événements publics.'}
              {profile?.role === 'Member' && 'Vous voyez les événements de votre club et les événements publics de l\'association.'}
              {profile?.role === 'Supporter' && 'Vous ne voyez que les événements publics de votre association.'}
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
            {showHistory ? 'Historique des événements' : 'Événements à venir'} ({events.length})
          </h2>
          {showHistory && (
            <p className="text-sm text-gray-500 mt-1">
              Événements passés triés du plus récent au plus ancien
            </p>
          )}
        </div>
        <div className="divide-y divide-gray-200">
          {events.map((event) => (
            <div key={event.id} className="px-6 py-6 hover:bg-gray-50">
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
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{event.name}</h3>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {event.visibility === 'Public' ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-orange-600" />
                          )}
                          <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                            event.visibility === 'Public'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {event.visibility}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{event.clubs.name}</p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">
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
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                      )}
                    </div>
                    
                    {canManageEvent(event) && (
                      <div className="flex space-x-2 ml-4 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(event)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Modifier l'Événement"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Supprimer l'Événement"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">
                {showHistory ? 'Aucun événement dans l\'historique' : 'Aucun événement à venir'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {showHistory ? (
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