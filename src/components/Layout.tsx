// Layout.tsx - Version finale corrigée (bottom nav jusqu'à 1024px)
import React, { useState, useEffect } from 'react';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  Calendar, 
  Building, 
  Home, 
  Settings,
  CalendarDays,
  Package,
  Clipboard,
  Heart,
  MessageSquare
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { SponsorBanner } from './SponsorBanner';
import MobileBottomNav from './MobileBottomNav';

interface AssociationInfo {
  id: string;
  name: string;
  logo_url: string | null;
}

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, profile, signOut } = useAuthNew();
  const [associationInfo, setAssociationInfo] = useState<AssociationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    fetchAssociationInfo();
  }, [profile]);

  // Gérer le resize et fermer la sidebar mobile en mode desktop
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      
      // Fermer la sidebar mobile si on passe en mode desktop
      if (width >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchAssociationInfo = async () => {
    if (!isAuthenticated || !profile?.association_id) {
      setLoading(false);
      return;
    }

    try {
      const { data: association, error } = await supabase
        .from('associations')
        .select('id, name, logo_url')
        .eq('id', profile.association_id)
        .single();

      if (!error && association) {
        setAssociationInfo(association);
      }
    } catch (error) {
      console.error('Error fetching association info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  // Dans Layout.tsx, remplacer la fonction getNavigationItems par celle-ci :

const getNavigationItems = (): NavigationItem[] => {
  if (!isAuthenticated || !profile) return [];

  const items = [
    { path: '/dashboard', label: 'Tableau de bord', icon: Home },
  ];

  if (profile.role === 'Super Admin') {
    items.push(
      { path: '/associations', label: 'Association', icon: Building },
      { path: '/clubs', label: 'Clubs', icon: Users },
      { path: '/communications', label: 'Communications', icon: MessageSquare },
      { path: '/equipment-management', label: 'Gestion Matériel', icon: Package },
      { path: '/sponsors', label: 'Sponsors', icon: Heart },
    );
  }

  if (profile.role === 'Club Admin') {
    items.push(
      { path: '/my-club', label: 'Mon Club', icon: Users },
      { path: '/events', label: 'Événements', icon: Calendar },
      { path: '/communications', label: 'Communications', icon: MessageSquare },
      { path: '/equipment-reservation', label: 'Réserver Matériel', icon: Clipboard },
      { path: '/sponsors', label: 'Sponsors', icon: Heart },
    );
  }

  // ✅ NOUVELLE SECTION POUR LES SPONSORS
  if (profile.role === 'Sponsor') {
    items.push(
      { path: '/events', label: 'Événements', icon: Calendar },
      { path: '/communications', label: 'Communications', icon: MessageSquare },
      { path: '/clubs', label: 'Clubs', icon: Users },
      { path: '/sponsors', label: 'Sponsors', icon: Heart },
    );
  }

  if (profile.role === 'Member' || profile.role === 'Supporter') {
    items.push(
      { path: '/events', label: 'Événements', icon: Calendar },
      { path: '/communications', label: 'Communications', icon: MessageSquare },
      { path: '/calendrier', label: 'Mon Calendrier', icon: CalendarDays },
      { path: '/clubs', label: 'Clubs', icon: Users },
      { path: '/sponsors', label: 'Sponsors', icon: Heart },
    );
  }

  items.push({ path: '/settings', label: 'Paramètres', icon: Settings });
  return items;
};

  const toggleSidebar = () => {
    if (windowWidth < 1024) {
      // Mobile/Tablet: toggle open/close
      setSidebarOpen(!sidebarOpen);
    } else {
      // Desktop: toggle collapsed/expanded
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const navigationItems = getNavigationItems();

  // Pour les utilisateurs non connectés ou les pages publiques
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen dark-bg">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen dark-bg flex">
      {/* Sidebar - visible uniquement sur desktop (≥1024px) */}
      <Sidebar
        isOpen={windowWidth < 1024 ? sidebarOpen : !sidebarCollapsed}
        onToggle={toggleSidebar}
        profile={profile}
        associationInfo={associationInfo}
        navigationItems={navigationItems}
        onSignOut={handleSignOut}
        loading={loading}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Content avec marge adaptative */}
        <main className={`
          flex-1 p-4 sm:p-6 
          pt-6 lg:pt-6 
          pb-32 lg:pb-20
          transition-all duration-300
        `}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Bottom Navigation - visible < 1024px (mobile + tablette) */}
        <MobileBottomNav 
          onMenuClick={() => setSidebarOpen(true)}
          userRole={profile?.role}
        />

        {/* Bandeau sponsors - au-dessus de la bottom nav sur mobile/tablette */}
        <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-30">
          <SponsorBanner />
        </div>
      </div>
    </div>
  );
}