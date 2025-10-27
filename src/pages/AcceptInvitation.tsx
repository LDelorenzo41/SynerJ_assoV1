// ============================================================
// PAGE: ACCEPTER UNE INVITATION PAR EMAIL
// ============================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Clock, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { useAuthNew } from '../hooks/useAuthNew';
import { useInvitationByToken } from '../hooks/useInvitations';
import { isInvitationExpired } from '../types/invitations';

const AcceptInvitation: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuthNew();
  const { invitation, loading, error, accepting, acceptInvitation } = useInvitationByToken(token || '');
  const [accepted, setAccepted] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  // Rediriger si déjà accepté avec succès
  useEffect(() => {
    if (accepted) {
      setTimeout(() => {
        navigate('/my-club');
      }, 3000);
    }
  }, [accepted, navigate]);

  // Gérer l'acceptation
  const handleAccept = async () => {
    try {
      setAcceptError(null);
      const result = await acceptInvitation();
      setAccepted(true);
    } catch (err: any) {
      console.error('Erreur lors de l\'acceptation:', err);
      setAcceptError(err.message || 'Erreur lors de l\'acceptation de l\'invitation');
    }
  };

  // Chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Chargement de l'invitation...
          </p>
        </div>
      </div>
    );
  }

  // Erreur de chargement
  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Invitation introuvable
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'Cette invitation n\'existe pas ou a été supprimée.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Invitation expirée
  const expired = isInvitationExpired(invitation);
  if (expired || invitation.status === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <Clock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Invitation expirée
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Cette invitation a expiré le {new Date(invitation.expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.
              <br />
              Contactez l'administrateur du club pour recevoir une nouvelle invitation.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Invitation déjà acceptée
  if (invitation.status === 'accepted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Invitation déjà acceptée
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Cette invitation a déjà été acceptée
              {invitation.accepted_at && ` le ${new Date(invitation.accepted_at).toLocaleDateString('fr-FR')}`}.
            </p>
            {user ? (
              <button
                onClick={() => navigate('/my-club')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Accéder à mon club
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Se connecter
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Invitation révoquée
  if (invitation.status === 'revoked') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Invitation révoquée
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Cette invitation a été annulée par l'administrateur du club.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Succès d'acceptation
  if (accepted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Bienvenue dans le club !
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Vous avez rejoint <strong>{invitation.club_name}</strong> avec succès.
              <br />
              Redirection en cours...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Utilisateur non connecté
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Mail className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Invitation à rejoindre un club
            </h2>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {invitation.club_name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Rôle : <span className="font-medium">{invitation.role === 'Member' ? 'Membre' : 'Administrateur'}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Invité par : <span className="font-medium">{invitation.invited_by_name}</span>
            </p>
            {invitation.personal_message && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "{invitation.personal_message}"
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Pour accepter cette invitation, vous devez d'abord vous connecter ou créer un compte.
            </p>

            <button
              onClick={() => navigate(`/login?redirect=/invitation/accept/${token}`)}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Se connecter
            </button>

            <button
              onClick={() => navigate(`/signup?redirect=/invitation/accept/${token}`)}
              className="w-full px-6 py-3 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Créer un compte
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
            Cette invitation expire le {new Date(invitation.expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    );
  }

  // Utilisateur connecté - prêt à accepter
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <Mail className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Invitation à rejoindre un club
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
  Connecté en tant que <strong>{user?.email}</strong>
</p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {invitation.club_name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Rôle : <span className="font-medium">{invitation.role === 'Member' ? 'Membre' : 'Administrateur'}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Invité par : <span className="font-medium">{invitation.invited_by_name}</span>
          </p>
          {invitation.personal_message && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                "{invitation.personal_message}"
              </p>
            </div>
          )}
        </div>

        {acceptError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Erreur</p>
              <p className="text-sm text-red-700 dark:text-red-300">{acceptError}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {accepting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Acceptation en cours...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Accepter et rejoindre le club
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
          Cette invitation expire le {new Date(invitation.expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
    </div>
  );
};

export default AcceptInvitation;