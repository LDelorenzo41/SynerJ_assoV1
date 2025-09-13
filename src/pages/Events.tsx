import React, { useEffect, useState } from 'react';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { Calendar, Plus, Eye, EyeOff, Edit, Trash2, AlertCircle, Users } from 'lucide-react';

interface Event {
  id: string;
  name: string;
  description: string | null;
  date: string;
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
  visibility: 'Public' | 'Members Only';
}

export default function Events() {
  const { profile, isClubAdmin } = useAuthNew();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState<EventForm>({
    name: '',
    description: '',
    date: '',
    visibility: 'Public',
  });

  useEffect(() => {
    fetchEvents();
  }, [profile]);

  const fetchEvents = async () => {
    try {
      // ✅ SÉCURITÉ : Vérifier les permissions avant de récupérer les événements
      if (!profile) {
        setLoading(false);
        return;
      }

      // ✅ Supporter sans association = aucun accès
      if (profile.role === 'Supporter' && !profile.association_id) {
        setEvents([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('events')
        .select(`
          *,
          clubs (name, association_id)
        `)
        .order('date', { ascending: true });

      // ✅ Filtrer selon le rôle et les permissions
      if (profile.role === 'Super Admin') {
        // Super Admin : tous les événements de son association
        query = query.eq('clubs.association_id', profile.association_id);
        
      } else if (profile.role === 'Club Admin') {
        // Club Admin : événements de son club + événements publics de l'association
        query = query.or(`club_id.eq.${profile.club_id},and(clubs.association_id.eq.${profile.association_id},visibility.eq.Public)`);
        
      } else if (profile.role === 'Member') {
        // Member : événements de son club + événements publics de l'association
        query = query.or(`club_id.eq.${profile.club_id},and(clubs.association_id.eq.${profile.association_id},visibility.eq.Public)`);
        
      } else if (profile.role === 'Supporter' && profile.association_id) {
        // Supporter avec association : seulement les événements publics de son association
        query = query.eq('clubs.association_id', profile.association_id).eq('visibility', 'Public');
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
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
      date: event.date.slice(0, 16), // Format for datetime-local input
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

  // ✅ SÉCURITÉ : Affichage spécial pour supporter sans association
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
        <h1 className="text-3xl font-bold text-gray-900">Événements</h1>
        {isClubAdmin && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingEvent(null);
              setEventForm({
                name: '',
                description: '',
                date: '',
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

      {/* ✅ Information contextuelle selon le rôle */}
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

      {/* Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingEvent ? 'Modifier l\'Événement' : 'Créer un Nouvel Événement'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  Description
                </label>
                <textarea
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingEvent ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Événements ({events.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {events.map((event) => (
            <div key={event.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                    <div className="flex items-center space-x-2">
                      {event.visibility === 'Public' ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-orange-600" />
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        event.visibility === 'Public'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {event.visibility}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{event.clubs.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(event.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                  )}
                </div>
                
                {canManageEvent(event) && (
                  <div className="flex space-x-2 ml-4">
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
          ))}
          {events.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Aucun événement trouvé</p>
              <p className="text-sm text-gray-400 mt-2">
                {profile?.role === 'Supporter' && 'Aucun événement public dans votre association.'}
                {profile?.role === 'Member' && 'Aucun événement dans votre club ou votre association.'}
                {(profile?.role === 'Club Admin' || profile?.role === 'Super Admin') && 'Commencez par créer un événement.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}