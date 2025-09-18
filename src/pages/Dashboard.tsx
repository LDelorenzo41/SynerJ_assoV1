import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { Calendar, Users, Building, Search, Eye, AlertCircle, MessageCircle, ArrowRight, CalendarDays, Clock, MapPin, ChevronRight } from 'lucide-react';

interface AssociationInfo {
  id: string;
  name: string;
  logo_url: string | null;
}

interface ClubInfo {
  id: string;
  name: string;
  logo_url: string | null;
}

interface FollowedClub {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  contact_email?: string | null;
}

interface UpcomingEvent {
  id: string;
  name: string;
  date: string;
  location: string | null;
  visibility: 'Public' | 'Members Only';
  status: 'active' | 'archived' | 'cancelled';
  club: {
    name: string;
    logo_url?: string | null;
  };
}

export default function Dashboard() {
  const { profile, isSuperAdmin, isClubAdmin } = useAuthNew();
  const location = useLocation();
  const [associationInfo, setAssociationInfo] = useState<AssociationInfo | null>(null);
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
  const [followedClubs, setFollowedClubs] = useState<FollowedClub[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);

  const [availableAssociations, setAvailableAssociations] = useState<AssociationInfo[]>([]);
  const [showAssociationSearch, setShowAssociationSearch] = useState(false);
  const [showChangeConfirmation, setShowChangeConfirmation] = useState(false);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserInfo();
  }, [profile]);
  
  const fetchUpcomingEvents = async () => {
    if (!profile?.id) return;
    
    if (profile.role !== 'Member' && profile.role !== 'Supporter' && profile.role !== 'Club Admin') return;

    setEventsLoading(true);
    try {
      const now = new Date().toISOString();
      
      if (profile.role === 'Club Admin' && profile.club_id) {
        // Récupérer les événements et infos du club séparément
        const [eventsResult, clubResult] = await Promise.all([
          supabase
            .from('events')
            .select('id, name, date, location, visibility, status')
            .eq('club_id', profile.club_id)
            .eq('status', 'active')
            .gte('date', now)
            .order('date', { ascending: true })
            .limit(6),
          supabase
            .from('clubs')
            .select('name, logo_url')
            .eq('id', profile.club_id)
            .single()
        ]);

        if (eventsResult.error) throw eventsResult.error;
        if (clubResult.error) throw clubResult.error;

        const transformedEvents = eventsResult.data?.map((event: any) => ({
          id: event.id,
          name: event.name,
          date: event.date,
          location: event.location,
          visibility: event.visibility,
          status: event.status,
          club: {
            name: clubResult.data.name,
            logo_url: clubResult.data.logo_url
          }
        })) || [];

        setUpcomingEvents(transformedEvents);
      } else {
        const { data, error } = await supabase
          .from('user_calendar_events')
          .select(`
            events!inner (
              id,
              name,
              date,
              location,
              visibility,
              status,
              clubs (
                name,
                logo_url
              )
            )
          `)
          .eq('user_id', profile.id)
          .eq('events.status', 'active')
          .gte('events.date', now)
          .order('events(date)', { ascending: true })
          .limit(4);

        if (error) throw error;

        const transformedEvents = data?.map((item: any) => ({
          id: item.events.id,
          name: item.events.name,
          date: item.events.date,
          location: item.events.location,
          visibility: item.events.visibility,
          status: item.events.status,
          club: item.events.clubs,
        })) || [];

        setUpcomingEvents(transformedEvents);
      }

    } catch (error: any) {
      console.error('Error fetching upcoming events:', error);
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    if (!profile) return;

    try {
      if (profile.association_id) {
        const { data: association, error: assocError } = await supabase
          .from('associations')
          .select('id, name, logo_url')
          .eq('id', profile.association_id)
          .single();
        if (!assocError && association) setAssociationInfo(association);
      }

      if (profile.club_id) {
        const { data: club, error: clubError } = await supabase
          .from('clubs')
          .select('id, name, logo_url')
          .eq('id', profile.club_id)
          .single();
        if (!clubError && club) setClubInfo(club);
      }
      
      if (profile.role === 'Supporter') {
        const { data: associations, error: assocError } = await supabase
          .from('associations')
          .select('id, name, logo_url')
          .order('name');
        if (!assocError && associations) {
          setAvailableAssociations(associations);
        }
      }

      if (profile.role === 'Supporter' || profile.role === 'Member' || profile.role === 'Club Admin') {
        if (profile.role !== 'Club Admin') {
          const { data: userClubs, error: userClubsError } = await supabase
            .from('user_clubs')
            .select(`
              club_id,
              clubs(id, name, slug, logo_url, description, contact_email)
            `)
            .eq('user_id', profile.id);

          if (!userClubsError && userClubs) {
            const followedClubsData = userClubs
              .map((uc: any) => uc.clubs)
              .filter((club: any): club is FollowedClub => club !== null);
            setFollowedClubs(followedClubsData);
          }
        }

        fetchUpcomingEvents();
      }

    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinAssociation = async (associationId: string) => {
    if (!profile?.id) return;
    try {
      // 1. Supprimer tous les clubs suivis de l'ancienne association
      await supabase
        .from('user_clubs')
        .delete()
        .eq('user_id', profile.id);

      // 2. Supprimer tous les événements du calendrier personnel  
      await supabase
        .from('user_calendar_events')
        .delete()
        .eq('user_id', profile.id);

      // 3. Changer l'association
      const { error } = await supabase
        .from('profiles')
        .update({ association_id: associationId })
        .eq('id', profile.id);
        
      if (error) throw error;
      
      await fetchUserInfo();
      setShowAssociationSearch(false);
      window.location.reload();
    } catch (error) {
      console.error('Error joining association:', error);
    }
  };
  
  const handleAssociationSelection = (associationId: string) => {
    setSelectedAssociationId(associationId);
    setShowChangeConfirmation(true);
  };

  const confirmAssociationChange = () => {
    if (selectedAssociationId) {
      handleJoinAssociation(selectedAssociationId);
    }
    setShowChangeConfirmation(false);
    setSelectedAssociationId(null);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'Super Admin': return 'Super Admin';
      case 'Club Admin': return 'Admin Club';
      case 'Member': return 'Membre';
      case 'Supporter': return 'Supporter';
      default: return role;
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    if (isToday) return 'Aujourd\'hui';
    if (isTomorrow) return 'Demain';
    
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatEventDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const groupEventsByDate = (events: UpcomingEvent[]) => {
    return events.reduce((groups, event) => {
      const dateKey = new Date(event.date).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
      return groups;
    }, {} as Record<string, UpcomingEvent[]>);
  };

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
    iconColor = 'text-gray-400' 
  }) => {
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

  const renderUpcomingEventsWidget = () => {
    if (profile?.role !== 'Member' && profile?.role !== 'Supporter' && profile?.role !== 'Club Admin') return null;

    const groupedEvents = groupEventsByDate(upcomingEvents);

    return (
      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <CalendarDays className="h-5 w-5 mr-2 text-purple-600" />
              {profile?.role === 'Club Admin' ? 'Prochains événements du club' : 'Mes prochains événements'}
            </h2>
            <Link 
              to={profile?.role === 'Club Admin' ? "/events" : "/calendrier"}
              className="text-sm text-purple-600 hover:text-purple-700 flex items-center"
            >
              Voir tout
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          {eventsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">Aucun événement à venir</p>
              <p className="text-sm text-gray-400">
                {profile?.role === 'Club Admin' 
                  ? "Créez des événements depuis la page Événements" 
                  : "Ajoutez des événements depuis la page Événements"
                }
              </p>
              <Link
                to="/events"
                className="inline-flex items-center mt-3 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
              >
                <Eye className="h-4 w-4 mr-1" />
                {profile?.role === 'Club Admin' ? 'Gérer les événements' : 'Voir les événements'}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedEvents).map(([dateKey, events]) => (
                <div key={dateKey} className="border-l-4 border-purple-200 pl-4">
                  <div className="flex items-center mb-3">
                    <div className="bg-purple-100 rounded-full p-2 mr-3">
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {formatEventDate(events[0].date)}
                    </h3>
                    <span className="ml-2 text-sm text-gray-500 font-normal">
                      ({formatEventDateShort(events[0].date)})
                    </span>
                  </div>
                  
                  <div className="space-y-2 ml-10">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <LogoDisplay 
                          src={event.club.logo_url} 
                          alt={`Logo ${event.club.name}`} 
                          size="w-8 h-8"
                          fallbackIcon={Building}
                          iconColor="text-purple-600"
                        />
                        
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {event.name}
                          </p>
                          <div className="flex items-center space-x-3 mt-1">
                            <div className="flex items-center text-xs text-gray-600">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatEventTime(event.date)}
                            </div>
                            {event.location && (
                              <div className="flex items-center text-xs text-gray-600">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span className="truncate max-w-32">{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {profile?.role !== 'Club Admin' && (
                            <span className="text-xs text-purple-600 bg-purple-200 px-2 py-1 rounded font-medium">
                              {event.club.name}
                            </span>
                          )}
                          {event.visibility === 'Public' ? (
                            <Eye className="h-3 w-3 text-green-600" />
                          ) : (
                            <Users className="h-3 w-3 text-orange-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {upcomingEvents.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <Link
                    to={profile?.role === 'Club Admin' ? "/events" : "/calendrier"}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    {profile?.role === 'Club Admin' 
                      ? 'Voir tous les événements du club' 
                      : 'Voir mon calendrier complet'
                    }
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderClubSection = () => {
    if (profile?.role === 'Supporter') {
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center">
            <LogoDisplay 
              src={null} 
              alt="Aucun club" 
              fallbackIcon={Users}
              iconColor="text-gray-400"
            />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Club</p>
              <p className="text-lg font-semibold text-gray-500">Aucun club</p>
              <p className="text-xs text-gray-400">Accès aux événements publics</p>
            </div>
          </div>
        </div>
      );
    }
    if (clubInfo) {
      return (
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <LogoDisplay 
              src={clubInfo.logo_url} 
              alt={`Logo ${clubInfo.name}`} 
              fallbackIcon={Building}
              iconColor="text-green-600"
            />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Club</p>
              <p className="text-lg font-semibold text-gray-900">{clubInfo.name}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  const renderAssociationSection = () => {
    if (profile?.role === 'Supporter') {
      const hasAssociation = !!associationInfo;
      const bgColor = hasAssociation ? 'bg-purple-50' : 'bg-yellow-50';
      const iconColor = hasAssociation ? 'text-purple-600' : 'text-yellow-600';
      const buttonHoverBg = hasAssociation ? 'hover:bg-purple-100' : 'hover:bg-yellow-100';

      const otherAssociations = availableAssociations.filter(assoc => assoc.id !== profile?.association_id);

      return (
        <div className={`${bgColor} p-4 rounded-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <LogoDisplay 
                src={associationInfo?.logo_url || null} 
                alt={hasAssociation ? `Logo ${associationInfo?.name}` : 'Non affilié'} 
                fallbackIcon={Building}
                iconColor={iconColor}
              />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Association</p>
                <p className="text-lg font-semibold text-gray-900">
                  {hasAssociation ? associationInfo?.name : 'Non affilié'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAssociationSearch(!showAssociationSearch)}
              className={`${iconColor} p-2 rounded-lg ${buttonHoverBg}`}
              title={hasAssociation ? "Changer d'association" : "Rechercher une association"}
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
          
          {showAssociationSearch && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 mb-2">
                {hasAssociation ? 'Changer pour :' : 'Associations disponibles :'}
              </p>
              
              {otherAssociations.length > 0 ? (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {otherAssociations.map((association) => (
                    <button
                      key={association.id}
                      onClick={() => handleAssociationSelection(association.id)}
                      className="w-full text-left px-3 py-2 text-sm bg-white rounded border hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <LogoDisplay 
                        src={association.logo_url} 
                        alt={`Logo ${association.name}`} 
                        size="w-6 h-6"
                        fallbackIcon={Building}
                        iconColor="text-gray-400"
                      />
                      <span>{association.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic px-3 py-2 bg-white rounded border">
                  Aucune autre association n'est disponible pour le moment.
                </p>
              )}
            </div>
          )}
        </div>
      );
    }

    if (associationInfo) {
      return (
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <LogoDisplay 
              src={associationInfo.logo_url} 
              alt={`Logo ${associationInfo.name}`} 
              fallbackIcon={Building}
              iconColor="text-purple-600"
            />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Association</p>
              <p className="text-lg font-semibold text-gray-900">{associationInfo.name}</p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderFollowedClubsSection = () => {
    if ((profile?.role !== 'Supporter' && profile?.role !== 'Member') || followedClubs.length === 0) {
      return null;
    }

    return (
      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Clubs que vous suivez ({followedClubs.length})
          </h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {followedClubs.map((club) => (
              <div key={club.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <LogoDisplay 
                    src={club.logo_url} 
                    alt={`Logo ${club.name}`} 
                    size="w-10 h-10"
                    fallbackIcon={Users}
                    iconColor="text-blue-600"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {club.name}
                    </h3>
                    {club.contact_email && (
                      <p className="text-xs text-blue-600 mt-1">
                        📧 {club.contact_email}
                      </p>
                    )}
                    {club.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {club.description}
                      </p>
                    )}
                    <div className="flex space-x-2 mt-3">
                      <a
                        href={`/events?club=${club.slug}`}
                        className="inline-flex items-center text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        title="Voir les événements du club"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        Événements
                      </a>
                      <a
                        href={`/clubs/${club.id}/communication`}
                        className="inline-flex items-center text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        title="Communication du club"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Communication
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {followedClubs.length > 0 && (
            <div className="mt-6 text-center">
              <a 
                href="/clubs" 
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Gérer vos abonnements aux clubs
                <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        {associationInfo && (
          <div className="px-6 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-100">
            <div className="flex items-center space-x-4">
              <LogoDisplay 
                src={associationInfo.logo_url} 
                alt={`Logo ${associationInfo.name}`} 
                size="w-12 h-12"
                fallbackIcon={Building}
                iconColor="text-purple-600"
              />
              <div>
                <h3 className="text-lg font-semibold text-purple-900">
                  {associationInfo.name}
                </h3>
                <p className="text-sm text-purple-700">
                  {getRoleDisplayName(profile?.role || '') === 'Super Admin' 
                    ? 'Tableau de bord de l\'association'
                    : getRoleDisplayName(profile?.role || '') === 'Admin Club'
                    ? 'Tableau de bord du club'
                    : getRoleDisplayName(profile?.role || '') === 'Membre'
                    ? 'Tableau de bord membre'
                    : 'Tableau de bord supporter'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenue, {profile?.first_name} {profile?.last_name}
          </h1>
          <p className="text-gray-600 mt-2">
            Tableau de bord {getRoleDisplayName(profile?.role || '')}
          </p>
        </div>
        
        <div className="p-6">
          {profile?.role === 'Supporter' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">Comment ça fonctionne ?</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>Choisissez votre association</strong> pour découvrir ses clubs</p>
                <p>• <strong>Suivez les clubs</strong> qui vous intéressent pour voir leurs événements</p>
                <p>• <strong>Ajoutez à votre calendrier</strong> les événements auxquels vous voulez participer</p>
                {associationInfo && (
                  <p className="mt-2 pt-2 border-t border-blue-300">
                    ⚠️ <strong>Changement d'association :</strong> Vos clubs suivis et événements seront réinitialisés
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Rôle</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {getRoleDisplayName(profile?.role || '')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {renderClubSection()}
                
                {renderAssociationSection()}
              </div>
            </div>

            <div className="lg:col-span-8">
              {renderUpcomingEventsWidget()}
            </div>
          </div>
        </div>
      </div>

      {renderFollowedClubsSection()}

      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Actions Rapides
          </h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {isSuperAdmin && (
              <>
                <Link to="/associations" className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Association</p>
                      <p className="text-sm text-gray-600">Gérer l'association</p>
                    </div>
                  </div>
                </Link>
                <Link to="/clubs" className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-600 rounded-lg group-hover:bg-green-700 transition-colors">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Clubs</p>
                      <p className="text-sm text-gray-600">Gérer les clubs</p>
                    </div>
                  </div>
                </Link>
              </>
            )}

            {isClubAdmin && (
              <>
                <Link to="/my-club" className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-600 rounded-lg group-hover:bg-green-700 transition-colors">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Mon Club</p>
                      <p className="text-sm text-gray-600">Gérer mon club</p>
                    </div>
                  </div>
                </Link>
                <Link to="/events" className="bg-indigo-50 p-4 rounded-lg hover:bg-indigo-100 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-700 transition-colors">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Événements</p>
                      <p className="text-sm text-gray-600">Créer et gérer</p>
                    </div>
                  </div>
                </Link>
              </>
            )}

            {(profile?.role === 'Member' || profile?.role === 'Supporter') && (
              <>
                <Link to="/events" className="bg-indigo-50 p-4 rounded-lg hover:bg-indigo-100 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-700 transition-colors">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Événements</p>
                      <p className="text-sm text-gray-600">Voir les événements</p>
                    </div>
                  </div>
                </Link>
                <Link to="/calendrier" className="bg-purple-50 p-4 rounded-lg hover:bg-purple-100 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-600 rounded-lg group-hover:bg-purple-700 transition-colors">
                      <CalendarDays className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Mon Calendrier</p>
                      <p className="text-sm text-gray-600">Gérer mes événements</p>
                    </div>
                  </div>
                </Link>
                <Link to="/clubs" className="bg-yellow-50 p-4 rounded-lg hover:bg-yellow-100 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-600 rounded-lg group-hover:bg-yellow-700 transition-colors">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Découvrir Clubs</p>
                      <p className="text-sm text-gray-600">Explorer et suivre</p>
                    </div>
                  </div>
                </Link>
              </>
            )}

            <Link to="/sponsors" className="bg-orange-50 p-4 rounded-lg hover:bg-orange-100 transition-colors group">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-600 rounded-lg group-hover:bg-orange-700 transition-colors">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Nos Sponsors</p>
                  <p className="text-sm text-gray-600">Découvrir qui nous soutient</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {showChangeConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Changer d'association</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Vous êtes sur le point de changer d'association. Cette action va :
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
                <li>Supprimer tous vos clubs suivis actuels</li>
                <li>Réinitialiser vos préférences de clubs</li>
                <li>Vous donner accès aux clubs de la nouvelle association</li>
              </ul>
              <p className="text-yellow-800 bg-yellow-50 p-3 rounded text-sm">
                <strong>Attention :</strong> Cette action est irréversible. Vous devrez à nouveau choisir les clubs à suivre dans votre nouvelle association.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowChangeConfirmation(false);
                  setSelectedAssociationId(null);
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmAssociationChange}
                className="flex-1 py-2 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Confirmer le changement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}