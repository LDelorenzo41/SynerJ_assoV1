import React, { useState } from 'react';
import { Heart, Mail, MapPin, Linkedin, ChevronDown } from 'lucide-react';

interface FooterProps {
  showDemo?: boolean;
  setShowDemo?: (show: boolean) => void;
  variant?: 'landing' | 'app'; // Pour différencier le footer landing du footer app
}

export default function Footer({ showDemo, setShowDemo, variant = 'landing' }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [isLegalMenuOpen, setIsLegalMenuOpen] = useState(false);

  return (
    <>
      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        {/* Section principale */}
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0">
              
              {/* Section gauche - Informations entreprise */}
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://res.cloudinary.com/dhva6v5n8/image/upload/v1728059847/LOGO_T_T_zcdp8s.jpg" 
                    alt="LD Teach & Tech" 
                    className="h-12 w-12 rounded-lg object-cover mr-4"
                  />
                  <div>
                    <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      LD Teach & Tech
                    </div>
                    <div className="text-sm text-gray-400">Innovation & Formation</div>
                  </div>
                </div>
                
                <p className="text-gray-400 mb-4 max-w-md">
                  Nous créons votre outil numérique sur demande.
                </p>
                
                {/* Informations de contact */}
                <div className="space-y-2">
                  <div className="flex items-center text-gray-400 hover:text-white transition-colors">
                    <Mail className="h-4 w-4 mr-3" />
                    <a href="mailto:lionel.delorenzo@teachtech.fr" className="hover:underline">
                      lionel.delorenzo@teachtech.fr
                    </a>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <MapPin className="h-4 w-4 mr-3" />
                    <span>Busloup, France</span>
                  </div>
                </div>
              </div>

              {/* Section centre - Menu déroulant Support & Légal */}
              <div className="relative flex-shrink-0 mx-8">
                <button
                  onClick={() => setIsLegalMenuOpen(!isLegalMenuOpen)}
                  className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors font-medium"
                >
                  <span>Support & Légal</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isLegalMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Menu déroulant qui apparaît vers le haut */}
                {isLegalMenuOpen && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-lg shadow-xl py-2 min-w-[220px] z-50 border border-gray-700">
                    <a href="#" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-sm">
                      Centre d'Aide
                    </a>
                    <a href="#" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-sm">
                      Documentation
                    </a>
                    <a href="#" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-sm">
                      FAQ
                    </a>
                    <hr className="border-gray-600 my-1" />
                    <a href="#" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-sm">
                      Mentions Légales
                    </a>
                    <a href="#" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-sm">
                      Politique de Confidentialité
                    </a>
                    <a href="#" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-sm">
                      CGU
                    </a>
                  </div>
                )}
              </div>

              {/* Section droite - Réseaux sociaux */}
              <div className="flex space-x-3 flex-shrink-0">
                <a 
                  href="#" 
                  className="w-8 h-8 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a 
                  href="#" 
                  className="w-8 h-8 bg-gray-800 hover:bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de copyright */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
              <div className="flex items-center space-x-2 text-sm">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-gray-400">
                  © {currentYear} LD Teach & Tech. Fait avec passion.
                </span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">
                  Plan du Site
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Cookies
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Accessibilité
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal - Uniquement pour variant landing avec showDemo */}
      {variant === 'landing' && showDemo && setShowDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Démo de SynerJ</h3>
            <p className="text-gray-600 mb-6">
              Découvrez comment SynerJ transforme la gestion de vos organisations en quelques minutes.
            </p>
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center mb-6 border-2 border-dashed border-gray-300">
              <div className="text-center">
                <div className="h-16 w-16 text-gray-400 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <p className="text-gray-500">Vidéo de démonstration à venir</p>
              </div>
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="h-5 w-5 text-green-500 mt-0.5">✓</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Création d'organisation en 2 minutes</h4>
                  <p className="text-gray-600 text-sm">Voyez comme il est simple de créer une association et ses clubs</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-5 w-5 text-green-500 mt-0.5">✓</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Gestion des membres intuitive</h4>
                  <p className="text-gray-600 text-sm">Découvrez les outils de gestion des membres et événements</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-5 w-5 text-green-500 mt-0.5">✓</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Tableaux de bord personnalisés</h4>
                  <p className="text-gray-600 text-sm">Explorez les interfaces selon votre rôle</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDemo(false)}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}