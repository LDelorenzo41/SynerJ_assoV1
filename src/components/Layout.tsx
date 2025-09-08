import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthNew } from '../hooks/useAuthNew';
import { LogOut, Users, Calendar, Building, Home } from 'lucide-react';

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
                <span className="text-sm text-gray-700">
                  {profile?.first_name} {profile?.last_name}
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {profile?.role}
                  </span>
                </span>
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