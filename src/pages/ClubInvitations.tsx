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
        <div className="bg-white dark:bg-papier-2 rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <XCircle className="w-16 h-16 text-ds-danger mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-encre dark:text-white mb-2">
              Accès non autorisé
            </h2>
            <p className="text-encre-2 dark:text-encre-3">
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
        <div className="bg-white dark:bg-papier-2 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta dark:border-terracotta"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="bg-white dark:bg-papier-2 rounded-lg shadow-md">
        <div className="border-b border-[var(--ds-border)] dark:border-[var(--ds-border)]">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-terracotta dark:text-terracotta" />
              <div>
                <h1 className="text-2xl font-bold text-encre dark:text-white">
                  Inviter des membres
                </h1>
                <p className="text-sm text-encre-2 dark:text-encre-3">
                  Invitez de nouveaux membres à rejoindre votre club
                </p>
              </div>
            </div>

            <button
              onClick={refresh}
              className="p-2 text-encre-2 dark:text-encre-3 hover:bg-papier-2 dark:hover:bg-papier-3 rounded-lg transition-colors"
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
                  ? 'border-terracotta text-terracotta dark:text-terracotta'
                  : 'border-transparent text-encre-2 dark:text-encre-3 hover:text-encre dark:hover:text-encre-2'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Par email
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'link'
                  ? 'border-ds-info text-ds-info dark:text-ds-info'
                  : 'border-transparent text-encre-2 dark:text-encre-3 hover:text-encre dark:hover:text-encre-2'
              }`}
            >
              <Link2 className="w-4 h-4 inline mr-2" />
              Lien partageable
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-ds-success text-ds-success dark:text-ds-success'
                  : 'border-transparent text-encre-2 dark:text-encre-3 hover:text-encre dark:hover:text-encre-2'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Historique ({invitations.length})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'stats'
                  ? 'border-ds-warning text-ds-warning dark:text-ds-warning'
                  : 'border-transparent text-encre-2 dark:text-encre-3 hover:text-encre dark:hover:text-encre-2'
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
        <div className="bg-ds-success-soft dark:bg-ds-success-soft/20 border border-ds-success dark:border-ds-success rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-ds-success dark:text-ds-success flex-shrink-0" />
          <p className="text-ds-success dark:text-ds-success font-medium">{successMessage}</p>
        </div>
      )}

      {/* Erreur globale */}
      {error && (
        <div className="bg-ds-danger-soft dark:bg-ds-danger-soft border border-ds-danger dark:border-ds-danger rounded-lg p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-ds-danger dark:text-ds-danger flex-shrink-0" />
          <p className="text-ds-danger dark:text-ds-danger">{error}</p>
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
        <div className="bg-white dark:bg-papier-2 rounded-lg shadow-md">
          <div className="border-b border-[var(--ds-border)] dark:border-[var(--ds-border)] px-6 py-4">
            <h3 className="text-lg font-semibold text-encre dark:text-white">
              Historique des invitations par email
            </h3>
          </div>

          <div className="p-6">
            {invitations.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-encre-3 dark:text-encre-2 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-encre dark:text-white mb-2">
                  Aucune invitation envoyée
                </h4>
                <p className="text-encre-2 dark:text-encre-3">
                  Les invitations que vous envoyez apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-papier-2 dark:bg-papier-3">
                      <th className="px-4 py-3 text-left text-xs font-medium text-encre-3 dark:text-encre-3 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-encre-3 dark:text-encre-3 uppercase">
                        Rôle
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-encre-3 dark:text-encre-3 uppercase">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-encre-3 dark:text-encre-3 uppercase">
                        Date d'envoi
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-encre-3 dark:text-encre-3 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {invitations.map((invitation) => {
                      const statusColor = getInvitationStatusColor(invitation.status);
                      const statusLabel = getInvitationStatusLabel(invitation.status);

                      return (
                        <tr key={invitation.id} className="hover:bg-papier-2 dark:hover:bg-papier-3/50">
                          <td className="px-4 py-3 text-sm text-encre dark:text-white">
                            {invitation.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-encre-2 dark:text-encre-3">
                            {invitation.role === 'Member' ? 'Membre' : 'Administrateur'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusColor === 'blue' ? 'bg-terracotta-soft text-terracotta-deep dark:bg-terracotta-soft dark:text-terracotta' :
                              statusColor === 'green' ? 'bg-ds-success-soft text-ds-success dark:bg-ds-success-soft dark:text-ds-success' :
                              statusColor === 'red' ? 'bg-ds-danger-soft text-ds-danger dark:bg-ds-danger-soft dark:text-ds-danger' :
                              'bg-papier-2 text-encre dark:bg-papier-3 dark:text-encre-3'
                            }`}>
                              {statusLabel}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-encre-2 dark:text-encre-3">
                            {new Date(invitation.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {invitation.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => resendInvitation(invitation.id)}
                                    className="p-1 text-terracotta hover:bg-terracotta-soft dark:hover:bg-terracotta-soft rounded transition-colors"
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
                                    className="p-1 text-ds-warning hover:bg-ds-warning-soft dark:hover:bg-ds-warning-soft/20 rounded transition-colors"
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
                                className="p-1 text-ds-danger hover:bg-ds-danger-soft dark:hover:bg-ds-danger-soft rounded transition-colors"
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
          <div className="bg-white dark:bg-papier-2 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-encre dark:text-white">Invitations email</h3>
              <Mail className="w-5 h-5 text-terracotta dark:text-terracotta" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-encre-2 dark:text-encre-3">Total</span>
                <span className="text-sm font-medium text-encre dark:text-white">{stats.totalInvitations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-encre-2 dark:text-encre-3">En attente</span>
                <span className="text-sm font-medium text-terracotta">{stats.pendingInvitations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-encre-2 dark:text-encre-3">Acceptées</span>
                <span className="text-sm font-medium text-ds-success">{stats.acceptedInvitations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-encre-2 dark:text-encre-3">Expirées</span>
                <span className="text-sm font-medium text-encre-2">{stats.expiredInvitations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-encre-2 dark:text-encre-3">Révoquées</span>
                <span className="text-sm font-medium text-ds-danger">{stats.revokedInvitations}</span>
              </div>
            </div>
          </div>

          {/* Taux d'acceptation */}
          <div className="bg-white dark:bg-papier-2 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-encre dark:text-white">Taux d'acceptation</h3>
              <BarChart3 className="w-5 h-5 text-ds-success dark:text-ds-success" />
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-ds-success dark:text-ds-success mb-2">
                {stats.acceptanceRate}%
              </div>
              <p className="text-sm text-encre-2 dark:text-encre-3">
                {stats.acceptedInvitations} acceptées sur {stats.totalInvitations}
              </p>
              <div className="w-full bg-papier-3 dark:bg-papier-3 rounded-full h-2 mt-4">
                <div
                  className="bg-ds-success h-2 rounded-full transition-all"
                  style={{ width: `${stats.acceptanceRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Statistiques liens */}
          <div className="bg-white dark:bg-papier-2 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-encre dark:text-white">Liens d'invitation</h3>
              <Link2 className="w-5 h-5 text-ds-info dark:text-ds-info" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-encre-2 dark:text-encre-3">Total</span>
                <span className="text-sm font-medium text-encre dark:text-white">{stats.totalLinks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-encre-2 dark:text-encre-3">Actifs</span>
                <span className="text-sm font-medium text-ds-success">{stats.activeLinks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-encre-2 dark:text-encre-3">Utilisations</span>
                <span className="text-sm font-medium text-ds-info">{stats.totalLinkUses}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubInvitations;