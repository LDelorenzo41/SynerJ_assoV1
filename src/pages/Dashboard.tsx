import React from 'react';
import { useAuthNew } from '../hooks/useAuthNew';
import { Calendar, Users, Building } from 'lucide-react';

export default function Dashboard() {
  const { profile, isSuperAdmin, isClubAdmin } = useAuthNew();

  return (
    <div className="space-y-8">
      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenue, {profile?.first_name} {profile?.last_name}
          </h1>
          <p className="text-gray-600 mt-2">
            Tableau de bord {profile?.role}
          </p>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Rôle</p>
                  <p className="text-lg font-semibold text-gray-900">{profile?.role}</p>
                </div>
              </div>
            </div>
            
            {profile?.club_id && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Building className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Club</p>
                    <p className="text-lg font-semibold text-gray-900">Mon Club</p>
                  </div>
                </div>
              </div>
            )}
            
            {profile?.association_id && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Building className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Association</p>
                    <p className="text-lg font-semibold text-gray-900">Mon Association</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Actions Rapides
          </h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isSuperAdmin && (
              <>
                <a
                  href="/associations"
                  className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Building className="h-6 w-6 text-blue-600 mb-2" />
                  <p className="font-medium text-gray-900">Gérer Association</p>
                  <p className="text-sm text-gray-600">Modifier les détails</p>
                </a>
                <a
                  href="/clubs"
                  className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Users className="h-6 w-6 text-green-600 mb-2" />
                  <p className="font-medium text-gray-900">Voir Clubs</p>
                  <p className="text-sm text-gray-600">Gérer les clubs</p>
                </a>
              </>
            )}
            
            {isClubAdmin && (
              <>
                <a
                  href="/my-club"
                  className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Users className="h-6 w-6 text-green-600 mb-2" />
                  <p className="font-medium text-gray-900">Mon Club</p>
                  <p className="text-sm text-gray-600">Gérer mon club</p>
                </a>
                <a
                  href="/events"
                  className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Calendar className="h-6 w-6 text-purple-600 mb-2" />
                  <p className="font-medium text-gray-900">Événements</p>
                  <p className="text-sm text-gray-600">Créer et gérer</p>
                </a>
              </>
            )}
            
            <a
              href="/events"
              className="block p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <Calendar className="h-6 w-6 text-yellow-600 mb-2" />
              <p className="font-medium text-gray-900">Voir Événements</p>
              <p className="text-sm text-gray-600">Parcourir les événements</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}