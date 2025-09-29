import React from 'react';
import { Building, Users, Calendar, Check } from 'lucide-react';

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            SynerJ simplifie la gestion de vos organisations avec des outils puissants et intuitifs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Building className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Gestion de structures</h3>
            <p className="text-gray-600 mb-6">
              Créez et gérez facilement vos structures (associations ou services municipaux) avec des outils complets.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-700">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Tableaux de bord dédiés
              </li>
              <li className="flex items-center text-gray-700">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Gestion multi-clubs
              </li>
              <li className="flex items-center text-gray-700">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Codes d'invitation uniques
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl">
            <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-6">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Clubs & Communication</h3>
            <p className="text-gray-600 mb-6">
              Organisez vos clubs, gérez les membres et communiquez efficacement avec vos communautés.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-700">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Gestion des membres
              </li>
              <li className="flex items-center text-gray-700">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Communications ciblées
              </li>
              <li className="flex items-center text-gray-700">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Événements privés/publics
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl">
            <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Événements & Ressources</h3>
            <p className="text-gray-600 mb-6">
              Créez des événements, gérez votre calendrier et réservez du matériel en toute simplicité.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-700">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Calendrier synchronisé
              </li>
              <li className="flex items-center text-gray-700">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Réservation de matériel
              </li>
              <li className="flex items-center text-gray-700">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Notifications intelligentes
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}