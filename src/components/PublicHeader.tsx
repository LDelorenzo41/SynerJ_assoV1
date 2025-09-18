// PublicHeader.tsx - Header pour les pages publiques (Landing, Login, etc.)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Menu, X } from 'lucide-react';

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SynerJ
            </div>
          </div>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <a 
              href="#features" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Fonctionnalités
            </a>
            <a 
              href="#how-it-works" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
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
          
          {/* Bouton menu mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 pt-4 pb-6">
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
          </div>
        )}
      </div>
    </nav>
  );
}