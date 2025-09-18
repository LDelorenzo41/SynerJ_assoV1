// src/config/calendar.ts
// Configuration centralisée pour les fonctionnalités calendrier

export const CALENDAR_CONFIG = {
  // Export ICS
  ICS: {
    PRODUCT_ID: '-//SynerJ//Mon Calendrier//FR',
    DEFAULT_EVENT_DURATION: 2 * 60 * 60 * 1000, // 2 heures en millisecondes
    FILE_NAME: 'mon_calendrier_synerj.ics',
  },
  
  // Limites
  LIMITS: {
    MAX_EVENTS_PER_USER: 500,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_LOCATION_LENGTH: 255,
  },
  
  // Messages
  MESSAGES: {
    SUCCESS: {
      EVENT_ADDED: 'Événement ajouté à votre calendrier',
      EVENT_REMOVED: 'Événement retiré de votre calendrier',
      CALENDAR_EXPORTED: 'Calendrier exporté avec succès',
    },
    ERROR: {
      ADD_FAILED: 'Impossible d\'ajouter l\'événement au calendrier',
      REMOVE_FAILED: 'Impossible de retirer l\'événement du calendrier',
      LOAD_FAILED: 'Erreur lors du chargement du calendrier',
      EXPORT_FAILED: 'Erreur lors de l\'export du calendrier',
      ALREADY_IN_CALENDAR: 'Cet événement est déjà dans votre calendrier',
    },
  },
  
  // Formats de date
  DATE_FORMATS: {
    DISPLAY: "EEEE d MMMM yyyy 'à' HH:mm",
    SHORT: "d MMM yyyy",
    TIME: "HH:mm",
    ICS: "yyyyMMdd'T'HHmmss'Z'",
  },
  
  // Couleurs par type d'événement (pour future extension)
  COLORS: {
    PUBLIC: '#10B981', // green
    MEMBERS_ONLY: '#F59E0B', // orange
    PAST: '#6B7280', // gray
  },
  
  // URLs pour intégrations externes (future)
  INTEGRATIONS: {
    GOOGLE_CALENDAR: {
      BASE_URL: 'https://calendar.google.com/calendar/render',
      CREATE_EVENT: 'https://calendar.google.com/calendar/u/0/r/eventedit',
    },
    OUTLOOK: {
      BASE_URL: 'https://outlook.live.com/calendar/0/deeplink/compose',
    },
  },
};

// Types pour TypeScript
export type CalendarEventStatus = 'upcoming' | 'past' | 'today';
export type CalendarViewMode = 'list' | 'month' | 'week'; // pour futures vues

// Utilitaires de dates
export const CalendarUtils = {
  isEventPast: (dateString: string): boolean => {
    return new Date(dateString) < new Date();
  },
  
  isEventToday: (dateString: string): boolean => {
    const eventDate = new Date(dateString);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  },
  
  isEventThisWeek: (dateString: string): boolean => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    return eventDate >= weekStart && eventDate <= weekEnd;
  },
  
  getEventStatus: (dateString: string): CalendarEventStatus => {
    if (CalendarUtils.isEventToday(dateString)) return 'today';
    if (CalendarUtils.isEventPast(dateString)) return 'past';
    return 'upcoming';
  },
  
  // Génération URL Google Calendar
  generateGoogleCalendarUrl: (event: {
    name: string;
    description?: string;
    date: string;
    location?: string;
  }): string => {
    const startDate = new Date(event.date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(new Date(event.date).getTime() + CALENDAR_CONFIG.ICS.DEFAULT_EVENT_DURATION)
      .toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.name,
      dates: `${startDate}/${endDate}`,
      details: event.description || '',
      location: event.location || '',
    });
    
    return `${CALENDAR_CONFIG.INTEGRATIONS.GOOGLE_CALENDAR.CREATE_EVENT}?${params}`;
  },
};