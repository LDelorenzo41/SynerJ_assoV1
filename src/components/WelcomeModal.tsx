import React from 'react';
import { Mail, ArrowRight, PartyPopper } from 'lucide-react';

interface WelcomeModalProps {
  userFirstName: string | null;
  onClose: () => void;
}

export default function WelcomeModal({ userFirstName, onClose }: WelcomeModalProps) {
  const appUrl = "synerj.net";
  const subject = `Rejoins-moi sur SynerJ !`;
  const body = `Salut,\n\nJe pense que cette application pourrait t'intéresser pour gérer et suivre les activités des clubs et associations.\n\nJette un œil et inscris-toi ici : https://${appUrl}\n\nÀ bientôt !`;
  
  const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg mx-4 transform transition-all duration-300 scale-95 animate-scale-in">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mb-5">
            <PartyPopper className="h-9 w-9 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bienvenue sur SynerJ, {userFirstName || 'nouvel utilisateur'} !
          </h2>
          <p className="mt-4 text-gray-600 dark:text-slate-300">
            Nous sommes ravis de vous compter parmi nous. Préparez-vous à connecter, organiser et participer comme jamais auparavant.
          </p>
        </div>

        <div className="mt-8 p-6 bg-gray-50 dark:bg-slate-700 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">
            Faites grandir la communauté !
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
            Le meilleur moyen de profiter de SynerJ est avec vos amis et collègues. Invitez-les à rejoindre la plateforme.
          </p>
          <a
            href={mailtoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
          >
            <Mail className="h-5 w-5 mr-3" />
            Inviter par e-mail
          </a>
        </div>

        <div className="mt-8">
          <button
            onClick={onClose}
            className="w-full py-3 px-6 bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-slate-100 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors flex items-center justify-center group"
          >
            Commencer à explorer
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}