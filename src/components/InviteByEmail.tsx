// ============================================================
// COMPOSANT: INVITATION PAR EMAIL
// ============================================================

import React, { useState } from 'react';
import { Mail, Send, AlertCircle, CheckCircle, X, User } from 'lucide-react';
import type { 
  CreateEmailInvitationData, 
  InvitationRole,
  SendInvitationEmailsResponse 
} from '../types/invitations';
import { validateEmailList, parseEmailList } from '../types/invitations';

interface InviteByEmailProps {
  clubId: string;
  onInvitationsSent?: (result: SendInvitationEmailsResponse) => void;
  onSendInvitations: (data: CreateEmailInvitationData) => Promise<SendInvitationEmailsResponse>;
}

const InviteByEmail: React.FC<InviteByEmailProps> = ({
  clubId,
  onInvitationsSent,
  onSendInvitations,
}) => {
  const [emailsText, setEmailsText] = useState('');
  const [role, setRole] = useState<InvitationRole>('Member');
  const [personalMessage, setPersonalMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SendInvitationEmailsResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Valider les emails en temps réel
  const handleEmailsChange = (value: string) => {
    setEmailsText(value);
    setValidationError(null);
    setResult(null);

    if (value.trim().length > 0) {
      const { valid, invalid } = validateEmailList(value);
      if (invalid.length > 0) {
        setValidationError(`${invalid.length} email(s) invalide(s): ${invalid.slice(0, 3).join(', ')}${invalid.length > 3 ? '...' : ''}`);
      }
    }
  };

  // Envoyer les invitations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const { valid, invalid } = validateEmailList(emailsText);
    
    if (valid.length === 0) {
      setValidationError('Veuillez entrer au moins une adresse email valide');
      return;
    }

    if (invalid.length > 0) {
      setValidationError(`Impossible d'envoyer : ${invalid.length} email(s) invalide(s)`);
      return;
    }

    try {
      setLoading(true);
      setValidationError(null);

      const data: CreateEmailInvitationData = {
        club_id: clubId,
        emails: valid,
        role,
        personal_message: personalMessage.trim() || undefined,
      };

      const response = await onSendInvitations(data);
      setResult(response);

      // Si succès complet, réinitialiser le formulaire
      if (response.success && response.failed === 0) {
        setEmailsText('');
        setPersonalMessage('');
      }

      // Callback
      if (onInvitationsSent) {
        onInvitationsSent(response);
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi:', error);
      setValidationError(error.message || 'Erreur lors de l\'envoi des invitations');
    } finally {
      setLoading(false);
    }
  };

  const { valid: validEmails } = emailsText.trim() 
  ? validateEmailList(emailsText) 
  : { valid: [] };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Inviter par email
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Envoyez des invitations personnalisées par email
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Adresses email */}
        <div>
          <label htmlFor="emails" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Adresses email *
          </label>
          <textarea
            id="emails"
            value={emailsText}
            onChange={(e) => handleEmailsChange(e.target.value)}
            placeholder="exemple1@email.com&#10;exemple2@email.com&#10;exemple3@email.com&#10;&#10;Ou séparez par des virgules: email1@test.com, email2@test.com"
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 resize-vertical"
            disabled={loading}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Entrez une adresse par ligne ou séparez par des virgules
            </p>
            {validEmails.length > 0 && (
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                {validEmails.length} email{validEmails.length > 1 ? 's' : ''} valide{validEmails.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Rôle */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rôle à attribuer *
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as InvitationRole)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={loading}
          >
            <option value="Member">Membre</option>
            <option value="Club Admin">Administrateur</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {role === 'Member' 
              ? 'Les membres peuvent voir les événements et communications du club' 
              : 'Les administrateurs peuvent gérer le club, créer des événements et inviter des membres'}
          </p>
        </div>

        {/* Message personnalisé */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message personnalisé (optionnel)
          </label>
          <textarea
            id="message"
            value={personalMessage}
            onChange={(e) => setPersonalMessage(e.target.value)}
            placeholder="Ajoutez un message personnel pour accompagner l'invitation..."
            rows={4}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 resize-vertical"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {personalMessage.length}/500 caractères
          </p>
        </div>

        {/* Erreur de validation */}
        {validationError && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Erreur de validation
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                {validationError}
              </p>
            </div>
          </div>
        )}

        {/* Résultat de l'envoi */}
        {result && (
          <div className={`flex items-start gap-3 p-4 border rounded-lg ${
            result.failed === 0
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          }`}>
            {result.failed === 0 ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                result.failed === 0
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-yellow-800 dark:text-yellow-200'
              }`}>
                {result.sent > 0 && `${result.sent} invitation${result.sent > 1 ? 's' : ''} envoyée${result.sent > 1 ? 's' : ''} avec succès`}
                {result.failed > 0 && ` • ${result.failed} échec${result.failed > 1 ? 's' : ''}`}
              </p>
              {result.errors && result.errors.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {result.errors.slice(0, 3).map((error, index) => (
                    <li key={index} className="text-xs text-yellow-700 dark:text-yellow-300">
                      • {error.email}: {error.error}
                    </li>
                  ))}
                  {result.errors.length > 3 && (
                    <li className="text-xs text-yellow-700 dark:text-yellow-300">
                      • ... et {result.errors.length - 3} autre{result.errors.length - 3 > 1 ? 's' : ''} erreur{result.errors.length - 3 > 1 ? 's' : ''}
                    </li>
                  )}
                </ul>
              )}
            </div>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {validEmails.length > 0 ? (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {validEmails.length} destinataire{validEmails.length > 1 ? 's' : ''}
              </span>
            ) : (
              <span>Entrez des adresses email pour commencer</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || validEmails.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Envoyer {validEmails.length > 0 && `(${validEmails.length})`}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InviteByEmail;