import React from 'react';
import { Heart, Check, Play } from 'lucide-react';

interface FooterProps {
  showDemo: boolean;
  setShowDemo: (show: boolean) => void;
}

export default function Footer({ showDemo, setShowDemo }: FooterProps) {
  return (
    <>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                SynerJ
              </div>
              <p className="text-gray-400 mb-4">
                La plateforme qui connecte associations, clubs et membres pour un impact communautaire renforcé.
              </p>
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="text-gray-400">Fait avec passion</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sécurité</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SynerJ. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Démo de SynerJ</h3>
            <p className="text-gray-600 mb-6">
              Découvrez comment SynerJ transforme la gestion de vos organisations en quelques minutes.
            </p>
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center mb-6 border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Vidéo de démonstration à venir</p>
              </div>
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Création d'organisation en 2 minutes</h4>
                  <p className="text-gray-600 text-sm">Voyez comme il est simple de créer une association et ses clubs</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Gestion des membres intuitive</h4>
                  <p className="text-gray-600 text-sm">Découvrez les outils de gestion des membres et événements</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
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