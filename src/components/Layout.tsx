// Layout.tsx - Version mise à jour avec sidebar responsive et navigation équipement + sponsors
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
  Package,    // NOUVEAU: icône pour le matériel
  Clipboard,  // NOUVEAU: icône pour les demandes
  Heart       // NOUVEAU: icône pour les sponsors
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { MobileTopBar } from './MobileTopBar';
import { SponsorBanner } from './SponsorBanner';

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

  useEffect(() => {
    fetchAssociationInfo();
  }, [profile]);

  // Gérer la fermeture de la sidebar mobile lors du redimensionnement
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
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

  const getNavigationItems = (): NavigationItem[] => {
    if (!isAuthenticated || !profile) return [];

    const items = [
      { path: '/dashboard', label: 'Tableau de bord', icon: Home },
    ];

    if (profile.role === 'Super Admin') {
      items.push(
        { path: '/associations', label: 'Association', icon: Building },
        { path: '/clubs', label: 'Clubs', icon: Users },
        // Navigation pour Super Admin
        { path: '/equipment-management', label: 'Gestion Matériel', icon: Package },
        { path: '/sponsors', label: 'Sponsors', icon: Heart },
      );
    }

    if (profile.role === 'Club Admin') {
      items.push(
        { path: '/my-club', label: 'Mon Club', icon: Users },
        { path: '/events', label: 'Événements', icon: Calendar },
        // Navigation pour Club Admin
        { path: '/equipment-reservation', label: 'Réserver Matériel', icon: Clipboard },
        { path: '/sponsors', label: 'Sponsors', icon: Heart },
      );
    }

    if (profile.role === 'Member' || profile.role === 'Supporter') {
      items.push(
        { path: '/events', label: 'Événements', icon: Calendar },
        { path: '/calendrier', label: 'Mon Calendrier', icon: CalendarDays },
        { path: '/clubs', label: 'Clubs', icon: Users },
        { path: '/sponsors', label: 'Sponsors', icon: Heart },
      );
    }

    items.push({ path: '/settings', label: 'Paramètres', icon: Settings });
    return items;
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      // Mobile: toggle open/close
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
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen || !sidebarCollapsed}
        onToggle={toggleSidebar}
        profile={profile}
        associationInfo={associationInfo}
        navigationItems={navigationItems}
        onSignOut={handleSignOut}
        loading={loading}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile TopBar */}
        <MobileTopBar 
          onMenuToggle={() => setSidebarOpen(true)}
          associationInfo={associationInfo}
          loading={loading}
        />

        {/* Content avec marge adaptative */}
        <main className={`
          flex-1 p-4 sm:p-6 
          pt-20 lg:pt-6 pb-16
          transition-all duration-300
        `}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer fixe avec bandeau sponsors */}
        <footer className="fixed bottom-0 left-0 right-0 z-30">
          <SponsorBanner />
        </footer>
      </div>
    </div>
  );
}