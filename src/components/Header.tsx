import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export default function Header() {
  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          SynerJ
        </div>
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
        
        {/* Menu mobile */}
        <div className="md:hidden">
          <Link
            to="/login"
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Connexion
          </Link>
        </div>
      </div>
    </nav>
  );
}