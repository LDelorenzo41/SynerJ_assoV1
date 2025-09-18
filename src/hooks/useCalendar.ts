// src/hooks/useCalendar.ts
// Hook personnalisé pour centraliser la logique du calendrier utilisateur

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthNew } from './useAuthNew';

export interface CalendarEvent {
  id: string;
  name: string;
  description: string | null;
  date: string;
  location: string | null;
  image_url: string | null;
  visibility: 'Public' | 'Members Only';
  club_id: string;
  club?: {
    name: string;
    slug?: string;
  };
  added_at: string;
}

export const useCalendar = () => {
  const { profile } = useAuthNew();
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [userCalendarEventIds, setUserCalendarEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les événements du calendrier utilisateur
  const fetchUserCalendarEvents = async () => {
    if (!profile?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('user_calendar_events')
        .select(`
          id,
          event_id,
          added_at,
          events (
            id,
            name,
            description,
            date,
            location,
            image_url,
            visibility,
            club_id,
            clubs (
              name,
              slug
            )
          )
        `)
        .eq('user_id', profile.id)
        .order('events(date)', { ascending: true });

      if (error) throw error;

      const transformedEvents = data?.map((item: any) => ({
        id: item.events.id,
        name: item.events.name,
        description: item.events.description,
        date: item.events.date,
        location: item.events.location,
        image_url: item.events.image_url,
        visibility: item.events.visibility,
        club_id: item.events.club_id,
        club: item.events.clubs,
        added_at: item.added_at,
      })) || [];

      setCalendarEvents(transformedEvents);
    } catch (error: any) {
      setError('Erreur lors du chargement du calendrier: ' + error.message);
      console.error('Error fetching user calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer seulement les IDs des événements du calendrier (pour les boutons)
  const fetchUserCalendarEventIds = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_calendar_events')
        .select('event_id')
        .eq('user_id', profile.id);

      if (error) throw error;

      const eventIds = data?.map(item => item.event_id) || [];
      setUserCalendarEventIds(eventIds);
    } catch (error: any) {
      console.error('Error fetching user calendar event IDs:', error);
    }
  };

  // Ajouter un événement au calendrier
  const addEventToCalendar = async (eventId: string): Promise<boolean> => {
    if (!profile?.id) return false;

    try {
      const { error } = await supabase
        .from('user_calendar_events')
        .insert({
          user_id: profile.id,
          event_id: eventId
        });

      if (error) throw error;

      setUserCalendarEventIds(prev => [...prev, eventId]);
      return true;
    } catch (error: any) {
      setError('Erreur lors de l\'ajout au calendrier: ' + error.message);
      console.error('Error adding event to calendar:', error);
      return false;
    }
  };

  // Retirer un événement du calendrier
  const removeEventFromCalendar = async (eventId: string): Promise<boolean> => {
    if (!profile?.id) return false;

    try {
      const { error } = await supabase
        .from('user_calendar_events')
        .delete()
        .eq('user_id', profile.id)
        .eq('event_id', eventId);

      if (error) throw error;

      setUserCalendarEventIds(prev => prev.filter(id => id !== eventId));
      setCalendarEvents(prev => prev.filter(event => event.id !== eventId));
      return true;
    } catch (error: any) {
      setError('Erreur lors de la suppression du calendrier: ' + error.message);
      console.error('Error removing event from calendar:', error);
      return false;
    }
  };

  // Toggle (ajouter/retirer) un événement du calendrier
  const toggleEventInCalendar = async (eventId: string): Promise<boolean> => {
    const isInCalendar = userCalendarEventIds.includes(eventId);
    
    if (isInCalendar) {
      return await removeEventFromCalendar(eventId);
    } else {
      return await addEventToCalendar(eventId);
    }
  };

  // Vérifier si un événement est dans le calendrier
  const isEventInCalendar = (eventId: string): boolean => {
    return userCalendarEventIds.includes(eventId);
  };

  // Générer le contenu ICS pour l'export
  const generateICSContent = (events: CalendarEvent[]): string => {
    const icsHeader = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SynerJ//Mon Calendrier//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH`;

    const icsFooter = `END:VCALENDAR`;

    const icsEvents = events.map(event => {
      const startDate = new Date(event.date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endDate = new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      return `BEGIN:VEVENT
UID:${event.id}@synerj.com
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.name}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
ORGANIZER:CN=${event.club?.name || 'Club'}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT`;
    }).join('\n');

    return `${icsHeader}\n${icsEvents}\n${icsFooter}`;
  };

  // Exporter le calendrier en fichier ICS
  const exportCalendarToICS = () => {
    if (calendarEvents.length === 0) {
      alert('Aucun événement à exporter');
      return;
    }

    const icsContent = generateICSContent(calendarEvents);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mon_calendrier_synerj.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Charger les données au montage du hook
useEffect(() => {
  if (profile?.id) {
    fetchUserCalendarEventIds();
    fetchUserCalendarEvents();
  }
}, [profile]);

  return {
    // État
    calendarEvents,
    userCalendarEventIds,
    loading,
    error,
    
    // Actions
    fetchUserCalendarEvents,
    fetchUserCalendarEventIds,
    addEventToCalendar,
    removeEventFromCalendar,
    toggleEventInCalendar,
    exportCalendarToICS,
    
    // Utilitaires
    isEventInCalendar,
    
    // Stats
    calendarEventsCount: calendarEvents.length,
  };
};