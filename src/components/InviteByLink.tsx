// COMPOSANT: INVITATION PAR LIEN PARTAGEABLE
// ============================================================

import React, { useState } from 'react';
import { Link2, Copy, Check, AlertCircle, Plus, QrCode, Calendar, Users, Trash2, Power, X } from 'lucide-react';
import type { 
  CreateInvitationLinkData, 
  InvitationRole,
  ClubInvitationLink 
} from '../types/invitations';
import { getInvitationLinkUrl, isInvitationLinkValid } from '../types/invitations';

interface InviteByLinkProps {
  clubId: string;
  links: ClubInvitationLink[];
  onCreateLink: (data: CreateInvitationLinkData) => Promise<ClubInvitationLink>;
  onDeactivateLink: (linkId: string) => Promise<void>;
  onDeleteLink: (linkId: string) => Promise<void>;
}

const InviteByLink: React.FC<InviteByLinkProps> = ({
  clubId,
  links,
  onCreateLink,
  onDeactivateLink,
  onDeleteLink,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [defaultRole, setDefaultRole] = useState<InvitationRole>('Member');
  const [maxUses, setMaxUses] = useState('');
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Créer un nouveau lien
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const data: CreateInvitationLinkData = {
        club_id: clubId,
        default_role: defaultRole,
        max_uses: maxUses ? parseInt(maxUses, 10) : undefined,
        expires_at: hasExpiration && expiresAt ? new Date(expiresAt).toISOString() : undefined,
      };

      await onCreateLink(data);

      // Réinitialiser le formulaire
      setDefaultRole('Member');
      setMaxUses('');
      setHasExpiration(false);
      setExpiresAt('');
      setShowCreateForm(false);
    } catch (err: any) {
      console.error('Erreur lors de la création du lien:', err);
      setError(err.message || 'Erreur lors de la création du lien');
    } finally {
      setLoading(false);
    }
  };

  // Copier un lien dans le presse-papier
  const copyToClipboard = (code: string) => {
    const url = getInvitationLinkUrl(code);
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Désactiver un lien
  const handleDeactivate = async (linkId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver ce lien ?')) return;
    
    try {
      await onDeactivateLink(linkId);
    } catch (err: any) {
      alert('Erreur lors de la désactivation: ' + err.message);
    }
  };

  // Supprimer un lien
  const handleDelete = async (linkId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lien ? Cette action est irréversible.')) return;
    
    try {
      await onDeleteLink(linkId);
    } catch (err: any) {
      alert('Erreur lors de la suppression: ' + err.message);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Liens d'invitation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Créez des liens partageables sur vos réseaux sociaux
              </p>
            </div>
          </div>
          
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau lien
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Formulaire de création */}
        {showCreateForm && (
          <form onSubmit={handleSubmit} className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Créer un nouveau lien</h4>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rôle par défaut */}
            <div>
              <label htmlFor="link-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rôle par défaut *
              </label>
              <select
                id="link-role"
                value={defaultRole}
                onChange={(e) => setDefaultRole(e.target.value as InvitationRole)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                disabled={loading}
              >
                <option value="Member">Membre</option>
                <option value="Club Admin">Administrateur</option>
              </select>
            </div>

            {/* Limite d'utilisations */}
            <div>
              <label htmlFor="max-uses" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Limite d'utilisations (optionnel)
              </label>
              <input
                type="number"
                id="max-uses"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Illimité"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white placeholder-gray-400"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Laissez vide pour un nombre illimité
              </p>
            </div>

            {/* Expiration */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="has-expiration"
                  checked={hasExpiration}
                  onChange={(e) => setHasExpiration(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  disabled={loading}
                />
                <label htmlFor="has-expiration" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date d'expiration
                </label>
              </div>
              {hasExpiration && (
                <input
                  type="datetime-local"
                  id="expires-at"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  disabled={loading}
                  required
                />
              )}
            </div>

            {/* Erreur */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Créer le lien
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Liste des liens */}
        {links.length === 0 ? (
          <div className="text-center py-12">
            <Link2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucun lien d'invitation
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Créez un lien partageable pour inviter facilement de nouveaux membres
            </p>
            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Créer mon premier lien
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {links.map((link) => {
              const url = getInvitationLinkUrl(link.code);
              const isValid = isInvitationLinkValid(link);
              const isCopied = copiedCode === link.code;

              return (
                <div
                  key={link.id}
                  className={`border rounded-lg p-4 ${
                    isValid
                      ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 opacity-75'
                  }`}
                >
                  {/* En-tête du lien */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-lg font-mono font-bold text-purple-600 dark:text-purple-400">
                          {link.code}
                        </code>
                        {!isValid && (
                          <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded">
                            Inactif
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {link.current_uses}/{link.max_uses || '∞'}
                        </span>
                        {link.expires_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Expire le {new Date(link.expires_at).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {link.is_active && (
                        <button
                          onClick={() => handleDeactivate(link.id)}
                          className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                          title="Désactiver"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* URL et actions de copie */}
                  {isValid && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center gap-3">
                      <code className="flex-1 text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
                        {url}
                      </code>
                      <button
                        onClick={() => copyToClipboard(link.code)}
                        className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0 ${
                          isCopied
                            ? 'bg-green-600 text-white'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copié !
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copier
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Informations supplémentaires */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
                    Rôle: <span className="font-medium">{link.default_role === 'Member' ? 'Membre' : 'Administrateur'}</span>
                    {' • '}
                    Créé le {new Date(link.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteByLink;