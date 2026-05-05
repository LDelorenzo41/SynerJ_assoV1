// PublicHeader.tsx - Header pour les pages publiques (Landing, Login, etc.)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Menu, X } from 'lucide-react';

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    // [DS] Header public look "papier chaleureux"
    <nav
      className="fixed top-0 w-full backdrop-blur-sm border-b border-[var(--ds-border)] z-50"
      style={{ background: 'rgba(251,248,243,0.95)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="font-display text-3xl text-terracotta-deep hover:text-terracotta transition-colors">
              SynerJ
            </Link>
          </div>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <a
              href="#features"
              className="text-encre-2 hover:text-encre transition-colors font-sans font-medium"
            >
              Fonctionnalités
            </a>
            <a
              href="#how-it-works"
              className="text-encre-2 hover:text-encre transition-colors font-sans font-medium"
            >
              Comment ça marche
            </a>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 bg-terracotta text-white font-semibold rounded-xl hover:bg-terracotta-deep transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,.22),0_1px_2px_rgba(168,74,46,.25)]"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Se connecter
            </Link>
          </div>

          {/* Bouton menu mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-encre-3 hover:text-encre hover:bg-papier-2"
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
          <div className="md:hidden border-t border-[var(--ds-border)] pt-4 pb-6">
            <div className="space-y-3">
              <a
                href="#features"
                className="block px-3 py-2 text-base font-medium text-encre-2 hover:text-encre hover:bg-papier-2 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Fonctionnalités
              </a>
              <a
                href="#how-it-works"
                className="block px-3 py-2 text-base font-medium text-encre-2 hover:text-encre hover:bg-papier-2 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Comment ça marche
              </a>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 bg-terracotta text-white font-semibold rounded-xl hover:bg-terracotta-deep transition-all duration-200"
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