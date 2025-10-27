// ============================================================
// PAGE: GESTION DES INVITATIONS DE MEMBRES DU CLUB
// ============================================================

import React, { useState } from 'react';
import { UserPlus, Mail, Link2, BarChart3, Clock, CheckCircle, XCircle, RefreshCw, Trash2, Send } from 'lucide-react';
import { useAuthNew } from '../hooks/useAuthNew';
import { useInvitations } from '../hooks/useInvitations';
import InviteByEmail from '../components/InviteByEmail';
import InviteByLink from '../components/InviteByLink';
import type { SendInvitationEmailsResponse } from '../types/invitations';
import { getInvitationStatusColor, getInvitationStatusLabel } from '../types/invitations';

type TabType = 'email' | 'link' | 'history' | 'stats';

const ClubInvitations: React.FC = () => {
  const { profile } = useAuthNew();
  const [activeTab, setActiveTab] = useState<TabType>('email');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Charger les invitations du club
  const {
    invitations,
    links,
    stats,
    loading,
    error,
    sendInvitations,
    revokeInvitation,
    deleteInvitation,
    resendInvitation,
    createLink,
    deactivateLink,
    deleteLink,
    refresh,
  } = useInvitations(profile?.club_id || '');

  // Gérer le succès d'envoi d'invitations
  const handleInvitationsSent = (result: SendInvitationEmailsResponse) => {
    if (result.sent > 0) {
      setSuccessMessage(
        `${result.sent} invitation${result.sent > 1 ? 's' : ''} envoyée${result.sent > 1 ? 's' : ''} avec succès !`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  // Vérifier les permissions
  if (!profile || profile.role !== 'Club Admin') {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Accès non autorisé
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Seuls les administrateurs de club peuvent gérer les invitations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !invitations.length) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Inviter des membres
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Invitez de nouveaux membres à rejoindre votre club
                </p>
              </div>
            </div>

            <button
              onClick={refresh}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Actualiser"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-6">
            <button
              onClick={() => setActiveTab('email')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'email'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Par email
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'link'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Link2 className="w-4 h-4 inline mr-2" />
              Lien partageable
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-green-600 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Historique ({invitations.length})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'stats'
                  ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Statistiques
            </button>
          </div>
        </div>
      </div>

      {/* Message de succès global */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <p className="text-green-800 dark:text-green-200 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Erreur globale */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Contenu selon l'onglet */}
      {activeTab === 'email' && (
        <InviteByEmail
          clubId={profile.club_id!}
          onSendInvitations={sendInvitations}
          onInvitationsSent={handleInvitationsSent}
        />
      )}

      {activeTab === 'link' && (
        <InviteByLink
          clubId={profile.club_id!}
          links={links}
          onCreateLink={createLink}
          onDeactivateLink={deactivateLink}
          onDeleteLink={deleteLink}
        />
      )}

      {activeTab === 'history' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Historique des invitations par email
            </h3>
          </div>

          <div className="p-6">
            {invitations.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Aucune invitation envoyée
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Les invitations que vous envoyez apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Rôle
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Date d'envoi
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {invitations.map((invitation) => {
                      const statusColor = getInvitationStatusColor(invitation.status);
                      const statusLabel = getInvitationStatusLabel(invitation.status);

                      return (
                        <tr key={invitation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {invitation.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {invitation.role === 'Member' ? 'Membre' : 'Administrateur'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusColor === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              statusColor === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              statusColor === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {statusLabel}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(invitation.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {invitation.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => resendInvitation(invitation.id)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                    title="Renvoyer"
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm('Révoquer cette invitation ?')) {
                                        revokeInvitation(invitation.id);
                                      }
                                    }}
                                    className="p-1 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors"
                                    title="Révoquer"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  if (confirm('Supprimer cette invitation ?')) {
                                    deleteInvitation(invitation.id);
                                  }
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Statistiques invitations email */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Invitations email</h3>
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.totalInvitations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">En attente</span>
                <span className="text-sm font-medium text-blue-600">{stats.pendingInvitations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Acceptées</span>
                <span className="text-sm font-medium text-green-600">{stats.acceptedInvitations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Expirées</span>
                <span className="text-sm font-medium text-gray-600">{stats.expiredInvitations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Révoquées</span>
                <span className="text-sm font-medium text-red-600">{stats.revokedInvitations}</span>
              </div>
            </div>
          </div>

          {/* Taux d'acceptation */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Taux d'acceptation</h3>
              <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                {stats.acceptanceRate}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats.acceptedInvitations} acceptées sur {stats.totalInvitations}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.acceptanceRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Statistiques liens */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Liens d'invitation</h3>
              <Link2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.totalLinks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Actifs</span>
                <span className="text-sm font-medium text-green-600">{stats.activeLinks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Utilisations</span>
                <span className="text-sm font-medium text-purple-600">{stats.totalLinkUses}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubInvitations;