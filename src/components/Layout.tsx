import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthNew } from '../hooks/useAuthNew';
import { LogOut, Users, Calendar, Building, Home, Settings, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { profile, signOut, isAuthenticated } = useAuthNew();

  const handleSignOut = async () => {
    console.log('Layout: Sign out clicked');
    await signOut();
    console.log('Layout: Sign out completed, should redirect');
    // Force page reload to ensure clean state
    window.location.href = '/';
  };

  const getNavigationItems = () => {
    if (!isAuthenticated || !profile) return [];

    const items = [
      { path: '/dashboard', label: 'Tableau de bord', icon: Home },
    ];

    if (profile.role === 'Super Admin') {
      items.push(
        { path: '/associations', label: 'Association', icon: Building },
        { path: '/clubs', label: 'Clubs', icon: Users },
      );
    }

    if (profile.role === 'Club Admin') {
      items.push(
        { path: '/my-club', label: 'Mon Club', icon: Users },
        { path: '/events', label: 'Événements', icon: Calendar },
      );
    }

    if (profile.role === 'Member' || profile.role === 'Supporter') {
      items.push(
        { path: '/events', label: 'Événements', icon: Calendar },
        { path: '/clubs', label: 'Clubs', icon: Users },
      );
    }

    // Ajouter les paramètres pour tous les utilisateurs connectés
    items.push({ path: '/settings', label: 'Paramètres', icon: Settings });

    return items;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && (
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link to="/dashboard" className="text-2xl font-bold text-blue-600">
                  SynerJ
                </Link>
                <div className="hidden md:flex space-x-4">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Affichage du profil avec photo */}
                <div className="flex items-center space-x-3">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Photo de profil"
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="text-gray-700 font-medium">
                      {profile?.first_name} {profile?.last_name}
                    </span>
                    <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full inline-block ml-2">
                      {profile?.role}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}