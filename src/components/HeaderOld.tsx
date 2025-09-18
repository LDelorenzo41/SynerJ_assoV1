import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, LogOut, Users, Calendar, Building, Home, Settings, User, Menu, X, CalendarDays } from 'lucide-react';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';

interface AssociationInfo {
  id: string;
  name: string;
  logo_url: string | null;
}

export default function Header() {
  const { isAuthenticated, profile, signOut } = useAuthNew();
  const [associationInfo, setAssociationInfo] = useState<AssociationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchAssociationInfo();
  }, [profile]);

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
        { path: '/calendrier', label: 'Mon Calendrier', icon: CalendarDays },
        { path: '/clubs', label: 'Clubs', icon: Users },
      );
    }

    items.push({ path: '/settings', label: 'Paramètres', icon: Settings });
    return items;
  };

  const renderAssociationInfo = () => {
    if (!isAuthenticated || !associationInfo) return null;

    return (
      <div className="flex items-center space-x-2 text-sm">
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
          {associationInfo.logo_url ? (
            <img 
              src={associationInfo.logo_url} 
              alt={`Logo ${associationInfo.name}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent && !parent.querySelector('.fallback-icon')) {
                  const fallback = document.createElement('div');
                  fallback.className = 'fallback-icon';
                  fallback.innerHTML = '<svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4l-1-1-1 1-1-1-1 1V5z" clip-rule="evenodd"></path></svg>';
                  parent.appendChild(fallback);
                }
              }}
            />
          ) : (
            <Building className="w-4 h-4 text-gray-400" />
          )}
        </div>
        <span className="text-gray-600 font-medium max-w-32 truncate hidden md:block">
          {associationInfo.name}
        </span>
      </div>
    );
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header principal */}
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {/* Logo SynerJ */}
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isAuthenticated ? (
                <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
                  SynerJ
                </Link>
              ) : (
                'SynerJ'
              )}
            </div>
            
            {/* Nom de l'association avec logo */}
            {!loading && renderAssociationInfo()}
          </div>

          {/* Navigation utilisateur connecté - Desktop */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-1">
              {/* Menu de navigation */}
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

              {/* Séparateur */}
              <div className="h-6 w-px bg-gray-300 mx-2"></div>

              {/* Profil utilisateur */}
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
              
              {/* Bouton déconnexion */}
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          ) : (
            /* Navigation utilisateur non connecté */
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Fonctionnalités
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
                Comment ça marche
              </a>
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Se connecter
              </Link>
            </div>
          )}
          
          {/* Menu mobile - bouton */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile - contenu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 pt-4 pb-6">
            {isAuthenticated ? (
              <div className="space-y-4">
                {/* Profil mobile */}
                <div className="flex items-center space-x-3 px-2 py-3 bg-gray-50 rounded-lg">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Photo de profil"
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {profile?.first_name} {profile?.last_name}
                    </div>
                    <div className="text-xs text-gray-500">{profile?.role}</div>
                  </div>
                </div>

                {/* Navigation mobile */}
                <div className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Déconnexion mobile */}
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            ) : (
              /* Menu mobile non connecté */
              <div className="space-y-3">
                <a 
                  href="#features" 
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Fonctionnalités
                </a>
                <a 
                  href="#how-it-works" 
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Comment ça marche
                </a>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200"
                >
                  Se connecter
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}