// ============================================================
// PAGE: UTILISER UN LIEN D'INVITATION
// ============================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link2, CheckCircle, XCircle, Clock, AlertCircle, LogIn, UserPlus, Users } from 'lucide-react';
import { useAuthNew } from '../hooks/useAuthNew';
import { useInvitationLinkByCode } from '../hooks/useInvitations';
import { isInvitationLinkValid } from '../types/invitations';

const UseInvitationLink: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuthNew();
  const { link, loading, error, using, useLink } = useInvitationLinkByCode(code || '');
  const [joined, setJoined] = useState(false);
  const [clubName, setClubName] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  // Rediriger si déjà rejoint avec succès
  useEffect(() => {
    if (joined) {
      setTimeout(() => {
        navigate('/my-club');
      }, 3000);
    }
  }, [joined, navigate]);

  // Gérer l'utilisation du lien
  const handleUseLink = async () => {
    try {
      setJoinError(null);
      const result = await useLink();
      setClubName(result.club_name);
      
      if (result.already_member) {
        setJoinError('Vous êtes déjà membre de ce club');
      } else {
        setJoined(true);
      }
    } catch (err: any) {
      console.error('Erreur lors de l\'utilisation du lien:', err);
      setJoinError(err.message || 'Erreur lors de l\'utilisation du lien');
    }
  };

  // Chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400"></div>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Vérification du lien d'invitation...
          </p>
        </div>
      </div>
    );
  }

  // Erreur de chargement
  if (error || !link) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Lien introuvable
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'Ce lien d\'invitation n\'existe pas ou a été supprimé.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Lien non valide
  const valid = isInvitationLinkValid(link);
  if (!valid) {
    let reason = 'Ce lien n\'est plus actif.';
    
    if (!link.is_active) {
      reason = 'Ce lien a été désactivé par l\'administrateur.';
    } else if (link.expires_at && new Date(link.expires_at) < new Date()) {
      reason = `Ce lien a expiré le ${new Date(link.expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.`;
    } else if (link.max_uses && link.current_uses >= link.max_uses) {
      reason = 'Ce lien a atteint sa limite d\'utilisations.';
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <Clock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Lien non disponible
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {reason}
              <br />
              Contactez l'administrateur du club pour obtenir un nouveau lien.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Succès d'utilisation du lien
  if (joined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Bienvenue dans le club !
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Vous avez rejoint <strong>{clubName}</strong> avec succès.
              <br />
              Redirection en cours...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Utilisateur non connecté
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Link2 className="w-16 h-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Invitation à rejoindre un club
            </h2>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-700 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <code className="text-lg font-mono font-bold text-purple-600 dark:text-purple-400">
                {link.code}
              </code>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Rôle par défaut : <span className="font-medium">{link.default_role === 'Member' ? 'Membre' : 'Administrateur'}</span>
            </p>
            {link.max_uses && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4 inline mr-1" />
                {link.current_uses}/{link.max_uses} utilisations
              </p>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Pour rejoindre ce club, vous devez d'abord vous connecter ou créer un compte.
            </p>

            <button
              onClick={() => navigate(`/login?redirect=/invitation/link/${code}`)}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Se connecter
            </button>

            <button
              onClick={() => navigate(`/signup?redirect=/invitation/link/${code}`)}
              className="w-full px-6 py-3 border border-purple-600 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Créer un compte
            </button>
          </div>

          {link.expires_at && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
              Ce lien expire le {new Date(link.expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Utilisateur connecté - prêt à rejoindre
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <Link2 className="w-16 h-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Rejoindre un club
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Connecté en tant que <strong>{user?.email}</strong>
        </p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <code className="text-lg font-mono font-bold text-purple-600 dark:text-purple-400">
              {link.code}
            </code>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Rôle par défaut : <span className="font-medium">{link.default_role === 'Member' ? 'Membre' : 'Administrateur'}</span>
          </p>
          {link.max_uses && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4 inline mr-1" />
              {link.current_uses}/{link.max_uses} utilisations
            </p>
          )}
        </div>

        {joinError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Erreur</p>
              <p className="text-sm text-red-700 dark:text-red-300">{joinError}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleUseLink}
          disabled={using}
          className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {using ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Traitement en cours...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Rejoindre le club
            </>
          )}
        </button>

        {link.expires_at && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
            Ce lien expire le {new Date(link.expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>
    </div>
  );
};

export default UseInvitationLink;