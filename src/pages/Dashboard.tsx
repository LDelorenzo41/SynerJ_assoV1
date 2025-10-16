import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { Calendar, Users, Building, Search, Eye, AlertCircle, MessageCircle, ArrowRight, CalendarDays, Clock, MapPin, ChevronRight, UserPlus, Check, X, ExternalLink } from 'lucide-react';
import { SponsorCarousel } from '../components/SponsorCarousel';
import WelcomeModal from '../components/WelcomeModal';
import PlanUpgrade from '../components/PlanUpgrade';
import { usePlanLimit } from '../hooks/usePlanLimit';

// Helper pour gérer les URLs de sites web (externes ou internes)
const getWebsiteUrl = (websiteUrl: string | null | undefined): string | null => {
  if (!websiteUrl) return null;
  
  // Si l'URL commence par http:// ou https://, c'est une URL externe
  if (websiteUrl.startsWith('http://') || websiteUrl.startsWith('https://')) {
    return websiteUrl;
  }
  
  // Si l'URL commence par /, c'est une URL relative (site généré)
  if (websiteUrl.startsWith('/')) {
    return window.location.origin + websiteUrl;
  }
  
  // Sinon, on considère que c'est un domaine sans protocole (ancien système)
  return `https://${websiteUrl}`;
};

interface AssociationInfo {
  id: string;
  name: string;
  logo_url: string | null;
}

interface ClubInfo {
  id: string;
  name: string;
  logo_url: string | null;
  website_url?: string | null;
}

interface FollowedClub {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  contact_email?: string | null;
  website_url?: string | null;
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
  const { profile, isSuperAdmin, isClubAdmin, updateProfile } = useAuthNew();
  
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
  const [structureSearchQuery, setStructureSearchQuery] = useState('');
  
  const [showBecomeMemberModal, setShowBecomeMemberModal] = useState(false);
  const [memberClubCode, setMemberClubCode] = useState('');
  const [clubCodeValidation, setClubCodeValidation] = useState<{loading: boolean, valid: boolean | null, clubName: string, clubId: string | null}>({
    loading: false,
    valid: null,
    clubName: '',
    clubId: null
  });

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  // Hook pour surveiller la limite de clubs (Super Admin uniquement)
const { planLimitData, loading: planLoading } = usePlanLimit(
  isSuperAdmin ? profile?.association_id || null : null
);

  useEffect(() => {
    if (profile && profile.first_login_completed === false) {
      setShowWelcomeModal(true);
    }
  }, [profile]);

  const handleCloseWelcomeModal = async () => {
    if (profile) {
      await updateProfile({ first_login_completed: true });
      setShowWelcomeModal(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [profile]);
  
  const fetchUpcomingEvents = async () => {
    if (!profile?.id) return;
    
    if (!['Member', 'Supporter', 'Sponsor', 'Club Admin'].includes(profile.role)) return;

    setEventsLoading(true);
    try {
      const now = new Date().toISOString();
      
      if (profile.role === 'Club Admin' && profile.club_id) {
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
          .select('id, name, logo_url, website_url')
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

      if (['Supporter', 'Member', 'Sponsor', 'Club Admin'].includes(profile.role)) {
        if (profile.role !== 'Club Admin') {
          const { data: userClubs, error: userClubsError } = await supabase
            .from('user_clubs')
            .select(`
              club_id,
              clubs(id, name, slug, logo_url, description, contact_email, website_url)
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
      await supabase
        .from('user_clubs')
        .delete()
        .eq('user_id', profile.id);

      await supabase
        .from('user_calendar_events')
        .delete()
        .eq('user_id', profile.id);

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

  const validateClubCode = async (code: string) => {
    if (!code || code.length < 8) {
      setClubCodeValidation({ loading: false, valid: null, clubName: '', clubId: null });
      return;
    }

    setClubCodeValidation({ loading: true, valid: null, clubName: '', clubId: null });

    try {
      const cleanClubCode = code.trim().toUpperCase();
      
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name, association_id')
        .eq('club_code', cleanClubCode)
        .single();

      if (error || !data) {
        setClubCodeValidation({ loading: false, valid: false, clubName: '', clubId: null });
      } else {
        if (profile?.association_id && data.association_id !== profile.association_id) {
          setClubCodeValidation({ loading: false, valid: false, clubName: '', clubId: null });
        } else {
          setClubCodeValidation({ loading: false, valid: true, clubName: data.name, clubId: data.id });
        }
      }
    } catch (err) {
      setClubCodeValidation({ loading: false, valid: false, clubName: '', clubId: null });
    }
  };

  const handleBecomeMember = async () => {
    if (!profile?.id || !clubCodeValidation.clubId) return;

    try {
      setLoading(true);

      const { data: existingFollow } = await supabase
        .from('user_clubs')
        .select('club_id')
        .eq('user_id', profile.id)
        .eq('club_id', clubCodeValidation.clubId)
        .single();

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: 'Member',
          club_id: clubCodeValidation.clubId
        })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      if (!existingFollow) {
        const { error: userClubError } = await supabase
          .from('user_clubs')
          .insert({
            user_id: profile.id,
            club_id: clubCodeValidation.clubId
          });

        if (userClubError) throw userClubError;
      }

      await fetchUserInfo();
      setShowBecomeMemberModal(false);
      setMemberClubCode('');
      setClubCodeValidation({ loading: false, valid: null, clubName: '', clubId: null });
      
      window.location.reload();
    } catch (error) {
      console.error('Error becoming member:', error);
      alert('Erreur lors de la mise à jour de votre statut. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'Super Admin': return 'Super Admin';
      case 'Club Admin': return 'Admin Club';
      case 'Member': return 'Membre';
      case 'Supporter': return 'Supporter';
      case 'Sponsor': return 'Sponsor';
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
    iconColor = 'text-gray-400 dark:text-slate-500' 
  }) => {
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

  const renderUpcomingEventsWidget = () => {
    if (!['Member', 'Supporter', 'Sponsor', 'Club Admin'].includes(profile?.role || '')) return null;

    const groupedEvents = groupEventsByDate(upcomingEvents);

    return (
      <div className="dark-card overflow-hidden shadow-sm rounded-lg h-full flex flex-col">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold dark-text flex items-center">
              <CalendarDays className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
              {profile?.role === 'Club Admin' ? 'Prochains événements du club' : 'Mes prochains événements'}
            </h2>
            <Link 
              to={profile?.role === 'Club Admin' ? "/events" : "/calendrier"}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center flex-shrink-0"
            >
              Voir tout
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 flex-1">
          {eventsLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 dark:border-purple-400"></div>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center flex flex-col justify-center h-full">
              <CalendarDays className="h-12 w-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="dark-text-muted mb-2">Aucun événement à venir</p>
              <p className="text-sm dark-text-muted">
                {profile?.role === 'Club Admin' 
                  ? "Créez des événements depuis la page Événements" 
                  : "Ajoutez des événements depuis la page Événements"
                }
              </p>
              <Link
                to="/events"
                className="inline-flex items-center justify-center mx-auto mt-3 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm"
              >
                <Eye className="h-4 w-4 mr-1" />
                {profile?.role === 'Club Admin' ? 'Gérer les événements' : 'Voir les événements'}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedEvents).map(([dateKey, events]) => (
                <div key={dateKey}>
                  <div className="flex items-center mb-3">
                    <div className="bg-purple-100 dark:bg-purple-900/50 rounded-full p-2 mr-3">
                      <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-semibold dark-text text-sm sm:text-base">
                      {formatEventDate(events[0].date)}
                    </h3>
                  </div>
                  
                  <div className="space-y-2 pl-4 sm:pl-10">
                    {events.map((event) => (
                      <div key={event.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                        <div className="flex items-center w-full">
                          <LogoDisplay 
                            src={event.club.logo_url} 
                            alt={`Logo ${event.club.name}`} 
                            size="w-8 h-8"
                            fallbackIcon={Building}
                            iconColor="text-purple-600 dark:text-purple-400"
                          />
                          
                          <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-medium dark-text truncate">
                              {event.name}
                            </p>
                            <div className="flex items-center space-x-3 mt-1 flex-wrap">
                              <div className="flex items-center text-xs dark-text-muted">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatEventTime(event.date)}
                              </div>
                              {event.location && (
                                <div className="flex items-center text-xs dark-text-muted">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span className="truncate">{event.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
                          {profile?.role !== 'Club Admin' && (
                            <span className="text-xs text-purple-600 dark:text-purple-300 bg-purple-200 dark:bg-purple-900/50 px-2 py-1 rounded font-medium truncate">
                              {event.club.name}
                            </span>
                          )}
                          {event.visibility === 'Public' ? (
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4 text-green-600 dark:text-green-400"/>
                              <span className="text-xs text-green-600 dark:text-green-400">Public</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-orange-600 dark:text-orange-400"/>
                              <span className="text-xs text-orange-600 dark:text-orange-400">Membres</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {upcomingEvents.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-600">
                  <Link
                    to={profile?.role === 'Club Admin' ? "/events" : "/calendrier"}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
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
    const cardPadding = "p-3 sm:p-4";
    if (profile?.role === 'Supporter') {
      return (
        <div className={`dark-bg ${cardPadding} rounded-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <LogoDisplay 
                src={null} 
                alt="Aucun club" 
                fallbackIcon={Users}
                iconColor="text-gray-400 dark:text-slate-500"
              />
              <div className="ml-3 min-w-0">
                <p className="text-xs sm:text-sm dark-text-muted">Club</p>
                <p className="text-base sm:text-lg font-semibold dark-text-muted truncate">Aucun club</p>
                <p className="text-xs dark-text-muted hidden sm:block">Accès aux événements publics</p>
              </div>
            </div>
            <button
              onClick={() => setShowBecomeMemberModal(true)}
              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-all hover:scale-110 group relative flex-shrink-0"
              title="Devenir membre d'un club"
            >
              <UserPlus className="h-6 w-6 animate-pulse" />
              <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                Devenir membre
              </span>
            </button>
          </div>
        </div>
      );
    }
    if (clubInfo) {
      return (
        <div className={`bg-green-50 dark:bg-green-900/20 ${cardPadding} rounded-lg`}>
          <div className="flex items-center">
            <LogoDisplay 
              src={clubInfo.logo_url} 
              alt={`Logo ${clubInfo.name}`} 
              fallbackIcon={Building}
              iconColor="text-green-600 dark:text-green-400"
            />
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-xs sm:text-sm dark-text-muted">Club</p>
              <p className="text-base sm:text-lg font-semibold dark-text truncate">{clubInfo.name}</p>
              {clubInfo.website_url && (
                <a 
                  href={getWebsiteUrl(clubInfo.website_url) || '#'}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors mt-1"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  <span className="truncate">Site web</span>
                </a>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  const renderAssociationSection = () => {
    const cardPadding = "p-3 sm:p-4";
    if (profile?.role === 'Supporter') {
      const hasAssociation = !!associationInfo;
      const bgColor = hasAssociation ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20';
      const iconColor = hasAssociation ? 'text-purple-600 dark:text-purple-400' : 'text-yellow-600 dark:text-yellow-400';
      const buttonHoverBg = hasAssociation ? 'hover:bg-purple-100 dark:hover:bg-purple-900/40' : 'hover:bg-yellow-100 dark:hover:bg-yellow-900/40';

      const otherAssociations = availableAssociations.filter(assoc => assoc.id !== profile?.association_id);
      
      const filteredAssociations = otherAssociations.filter(assoc => 
        assoc.name.toLowerCase().includes(structureSearchQuery.toLowerCase())
      );

      return (
        <div className={`${bgColor} ${cardPadding} rounded-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 min-w-0">
              <LogoDisplay 
                src={associationInfo?.logo_url || null} 
                alt={hasAssociation ? `Logo ${associationInfo?.name}` : 'Non affilié'} 
                fallbackIcon={Building}
                iconColor={iconColor}
              />
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-xs sm:text-sm dark-text-muted">Structure</p>
                <p className="text-base sm:text-lg font-semibold dark-text truncate">
                  {hasAssociation ? associationInfo?.name : 'Non affilié'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowAssociationSearch(!showAssociationSearch);
                setStructureSearchQuery('');
              }}
              className={`${iconColor} p-3 rounded-lg ${buttonHoverBg} transition-all hover:scale-110 group relative flex-shrink-0`}
              title={hasAssociation ? "Changer de structure" : "Choisir une structure"}
            >
              <Search className="h-6 w-6 animate-pulse" />
              <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                {hasAssociation ? "Changer" : "Choisir"}
              </span>
            </button>
          </div>
          
          {showAssociationSearch && (
            <div className="mt-4 space-y-3">
              <p className="text-sm dark-text-muted mb-2">
                {hasAssociation ? 'Changer pour :' : 'Structures disponibles :'}
              </p>
              
              {otherAssociations.length > 3 && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher une structure..."
                    value={structureSearchQuery}
                    onChange={(e) => setStructureSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 pl-9 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark-input text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              )}
              
              {filteredAssociations.length > 0 ? (
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {filteredAssociations.map((association) => (
                    <button
                      key={association.id}
                      onClick={() => handleAssociationSelection(association.id)}
                      className="w-full text-left px-3 py-2 text-sm dark-card rounded border border-gray-200 dark:border-gray-600 dark-hover transition-colors flex items-center space-x-2"
                    >
                      <LogoDisplay 
                        src={association.logo_url} 
                        alt={`Logo ${association.name}`} 
                        size="w-6 h-6"
                        fallbackIcon={Building}
                        iconColor="text-gray-400 dark:text-slate-500"
                      />
                      <span className="dark-text">{association.name}</span>
                    </button>
                  ))}
                </div>
              ) : structureSearchQuery ? (
                <p className="text-sm dark-text-muted italic px-3 py-2 dark-card rounded border border-gray-200 dark:border-gray-600">
                  Aucune structure ne correspond à votre recherche "{structureSearchQuery}"
                </p>
              ) : (
                <p className="text-sm dark-text-muted italic px-3 py-2 dark-card rounded border border-gray-200 dark:border-gray-600">
                  Aucune autre structure n'est disponible pour le moment.
                </p>
              )}
            </div>
          )}
        </div>
      );
    }

    if (associationInfo) {
      return (
        <div className={`bg-purple-50 dark:bg-purple-900/20 ${cardPadding} rounded-lg`}>
          <div className="flex items-center">
            <LogoDisplay 
              src={associationInfo.logo_url} 
              alt={`Logo ${associationInfo.name}`} 
              fallbackIcon={Building}
              iconColor="text-purple-600 dark:text-purple-400"
            />
            <div className="ml-3 min-w-0">
              <p className="text-xs sm:text-sm dark-text-muted">Structure</p>
              <p className="text-base sm:text-lg font-semibold dark-text truncate">{associationInfo.name}</p>
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
      <div className="dark-card overflow-hidden shadow-sm rounded-lg">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-lg sm:text-xl font-semibold dark-text flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Clubs que vous suivez ({followedClubs.length})
          </h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {followedClubs.map((club) => (
              <div key={club.id} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <LogoDisplay 
                    src={club.logo_url} 
                    alt={`Logo ${club.name}`} 
                    size="w-10 h-10"
                    fallbackIcon={Users}
                    iconColor="text-blue-600 dark:text-blue-400"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold dark-text truncate">
                      {club.name}
                    </h3>
                    {club.description && (
                      <p className="text-xs dark-text-muted mt-1 line-clamp-2">
                        {club.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <a
                        href={`/events?club=${club.slug}`}
                        className="inline-flex items-center text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors"
                        title="Voir les événements du club"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        Événements
                      </a>
                      {club.website_url && (
                        <a
                          href={getWebsiteUrl(club.website_url) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-900/70 transition-colors"
                          title="Visiter le site web"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Site web
                        </a>
                      )}
                      <a
                        href={`/clubs/${club.id}/communication`}
                        className="inline-flex items-center text-xs px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/70 transition-colors"
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
                className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  const QuickActionLink = ({ to, icon: Icon, title, subtitle, colorClass }: { to: string, icon: React.ElementType, title: string, subtitle: string, colorClass: string }) => {
    const colors: { [key: string]: { bg: string, iconBg: string, text: string } } = {
        blue: { bg: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30', iconBg: 'bg-blue-600', text: 'text-blue-800 dark:text-blue-200' },
        green: { bg: 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30', iconBg: 'bg-green-600', text: 'text-green-800 dark:text-green-200' },
        teal: { bg: 'bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30', iconBg: 'bg-teal-600', text: 'text-teal-800 dark:text-teal-200' },
        indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30', iconBg: 'bg-indigo-600', text: 'text-indigo-800 dark:text-indigo-200' },
        purple: { bg: 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30', iconBg: 'bg-purple-600', text: 'text-purple-800 dark:text-purple-200' },
        yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30', iconBg: 'bg-yellow-600', text: 'text-yellow-800 dark:text-yellow-200' },
        orange: { bg: 'bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30', iconBg: 'bg-orange-600', text: 'text-orange-800 dark:text-orange-200' },
    };
    const c = colors[colorClass] || colors.blue;

    return (
        <Link to={to} className={`${c.bg} p-3 sm:p-4 rounded-lg transition-colors group`}>
            <div className="flex items-center space-x-3">
                <div className={`p-2 ${c.iconBg} rounded-lg flex-shrink-0`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className={`font-semibold dark-text text-sm sm:text-base`}>{title}</p>
                    <p className="text-xs sm:text-sm dark-text-muted truncate">{subtitle}</p>
                </div>
            </div>
        </Link>
    );
  };

  return (
  <div className="space-y-6 sm:space-y-8">
    {showWelcomeModal && profile && (
      <WelcomeModal
        userFirstName={profile.first_name}
        onClose={handleCloseWelcomeModal}
      />
    )}

    {/* Système de détection de limite de clubs pour Super Admin */}
    {isSuperAdmin && planLimitData && !planLoading && (
      <PlanUpgrade
        currentPlan={planLimitData.currentPlan}
        currentClubCount={planLimitData.currentClubCount}
        associationId={profile?.association_id || ''}
        onUpgrade={() => window.location.reload()}
      />
    )}

    <div className="dark-card overflow-hidden shadow-sm rounded-lg">
        {associationInfo && (
          <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-purple-100 dark:border-purple-800">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <LogoDisplay 
                src={associationInfo.logo_url} 
                alt={`Logo ${associationInfo.name}`} 
                size="w-10 h-10 sm:w-12 sm:h-12"
                fallbackIcon={Building}
                iconColor="text-purple-600 dark:text-purple-400"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-purple-900 dark:text-purple-200 truncate">
                  {associationInfo.name}
                </h3>
                <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">
                  {`Tableau de bord ${getRoleDisplayName(profile?.role || '')}`}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h1 className="text-2xl sm:text-3xl font-bold dark-text">
            Bienvenue, {profile?.first_name}
          </h1>
          <p className="dark-text-muted mt-1 sm:mt-2 text-sm sm:text-base">
            Votre espace {getRoleDisplayName(profile?.role || '')}
          </p>
        </div>
        
        <div className="p-4 sm:p-6">
          {profile?.role === 'Supporter' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2 text-sm sm:text-base">Comment ça fonctionne ?</h3>
              <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <p>• <strong>Choisissez une structure</strong> pour voir ses clubs.</p>
                <p>• <strong>Suivez des clubs</strong> pour remplir votre agenda.</p>
                <p>• <strong>Consultez votre calendrier</strong> pour ne rien manquer.</p>
                {associationInfo && (
                  <p className="mt-2 pt-2 border-t border-blue-300 dark:border-blue-600">
                    ⚠️ <strong>Changement de structure :</strong> Vos clubs suivis seront réinitialisés.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg mr-3">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm dark-text-muted">Rôle</p>
                    <p className="text-base sm:text-lg font-semibold dark-text truncate">
                      {getRoleDisplayName(profile?.role || '')}
                    </p>
                  </div>
                </div>
              </div>
              
              {renderClubSection()}
              {renderAssociationSection()}

              {(profile?.role === 'Member' || profile?.role === 'Supporter' || profile?.role === 'Sponsor' || profile?.role === 'Club Admin') && (
                <div className="hidden lg:block">
                  <SponsorCarousel />
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              {renderUpcomingEventsWidget()}
            </div>
          </div>
          
          {(profile?.role === 'Member' || profile?.role === 'Supporter' || profile?.role === 'Sponsor' || profile?.role === 'Club Admin') && (
            <div className="lg:hidden mt-6">
              <SponsorCarousel />
            </div>
          )}
        </div>
      </div>

      {renderFollowedClubsSection()}

      <div className="dark-card overflow-hidden shadow-sm rounded-lg">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-lg sm:text-xl font-semibold dark-text flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Actions Rapides
          </h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {isSuperAdmin && (
              <>
                <QuickActionLink to="/associations" icon={Building} title="Structure" subtitle="Gérer la structure" colorClass="blue" />
                <QuickActionLink to="/clubs" icon={Users} title="Clubs" subtitle="Gérer les clubs" colorClass="green" />
                <QuickActionLink to="/communications" icon={MessageCircle} title="Communications" subtitle="Gérer les communications" colorClass="teal" />
              </>
            )}

            {isClubAdmin && (
              <>
                <QuickActionLink to="/my-club" icon={Users} title="Mon Club" subtitle="Gérer mon club" colorClass="green" />
                <QuickActionLink to="/events" icon={Calendar} title="Événements" subtitle="Créer et gérer" colorClass="indigo" />
                <QuickActionLink to="/communications" icon={MessageCircle} title="Communications" subtitle="Gérer les communications" colorClass="teal" />
                <QuickActionLink to="/sponsors" icon={Building} title="Nos Sponsors" subtitle="Découvrir qui nous soutient" colorClass="orange" />
              </>
            )}

            {profile?.role === 'Sponsor' && (
              <>
                <QuickActionLink to="/sponsor/profile" icon={Building} title="Mon Profil" subtitle="Gérer mes informations" colorClass="orange" />
                <QuickActionLink to="/mailing" icon={MessageCircle} title="Mes Campagnes" subtitle="Gérer mon mailing" colorClass="teal" />
                <QuickActionLink to="/events" icon={Eye} title="Événements" subtitle="Voir les événements" colorClass="indigo" />
                <QuickActionLink to="/calendrier" icon={CalendarDays} title="Mon Calendrier" subtitle="Mes événements" colorClass="purple" />
                <QuickActionLink to="/clubs" icon={Users} title="Clubs" subtitle="Découvrir les clubs" colorClass="green" />
              </>
            )}

            {(profile?.role === 'Member' || profile?.role === 'Supporter') && (
              <>
                <QuickActionLink to="/events" icon={Eye} title="Événements" subtitle="Voir les événements" colorClass="indigo" />
                <QuickActionLink to="/calendrier" icon={CalendarDays} title="Mon Calendrier" subtitle="Gérer mes événements" colorClass="purple" />
                <QuickActionLink to="/clubs" icon={Users} title="Découvrir Clubs" subtitle="Explorer et suivre" colorClass="yellow" />
                <QuickActionLink to="/sponsors" icon={Building} title="Nos Sponsors" subtitle="Découvrir qui nous soutient" colorClass="orange" />
              </>
            )}
          </div>
        </div>
      </div>

      {showChangeConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="dark-card p-4 sm:p-6 rounded-lg w-full max-w-md">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center mr-3">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold dark-text">Changer de structure</h3>
                <p className="text-sm dark-text-muted mt-1">Êtes-vous sûr de vouloir continuer ?</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-yellow-800 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-xs sm:text-sm">
                <strong>Attention :</strong> Cette action est irréversible. Vos clubs suivis et événements de calendrier seront réinitialisés.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => { setShowChangeConfirmation(false); setSelectedAssociationId(null); }}
                className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg dark-text dark-hover transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmAssociationChange}
                className="w-full py-2 px-4 bg-yellow-600 dark:bg-yellow-700 text-white rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-800 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {showBecomeMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="dark-card p-4 sm:p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mr-3">
                  <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold dark-text">Devenir Membre</h3>
              </div>
              <button
                onClick={() => { setShowBecomeMemberModal(false); setMemberClubCode(''); setClubCodeValidation({ loading: false, valid: null, clubName: '', clubId: null }); }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <X className="h-5 w-5 dark-text-muted" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="dark-text-muted mb-4 text-sm sm:text-base">
                Entrez le code fourni par votre club pour en devenir membre.
              </p>
              
              <label htmlFor="club-code" className="block text-xs sm:text-sm font-medium dark-text mb-2">
                Code du Club
              </label>
              <input
                id="club-code"
                type="text"
                value={memberClubCode}
                onChange={(e) => {
                  const code = e.target.value.toUpperCase();
                  setMemberClubCode(code);
                  validateClubCode(code);
                }}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all dark-input ${
                  clubCodeValidation.valid === true ? 'border-green-500' :
                  clubCodeValidation.valid === false ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Ex: CLUB-XYZ123"
              />
              
              <div className="h-5 mt-2 text-sm">
                {clubCodeValidation.loading && (
                  <p className="text-blue-600 dark:text-blue-400 flex items-center">
                    <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></span>
                    Vérification...
                  </p>
                )}
                {clubCodeValidation.valid === true && (
                  <p className="text-green-600 dark:text-green-400 flex items-center">
                    <Check className="w-4 h-4 mr-2" />
                    Club trouvé : {clubCodeValidation.clubName}
                  </p>
                )}
                {clubCodeValidation.valid === false && memberClubCode.length >= 8 && (
                  <p className="text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Code de club invalide ou indisponible.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => { setShowBecomeMemberModal(false); setMemberClubCode(''); setClubCodeValidation({ loading: false, valid: null, clubName: '', clubId: null }); }}
                className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg dark-text dark-hover transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleBecomeMember}
                disabled={!clubCodeValidation.valid || loading}
                className="w-full py-2 px-4 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Traitement...' : 'Devenir Membre'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}