import React, { useState } from 'react';
import { Send, Eye, AlertCircle, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MailingFormProps {
  recipientDetails: {
    total: number;
    directMembers: number;
    supporters: number;
  };
  userRole: string;
  profile: any;
  sponsorInfo: any;
  campaignQuota: any;
}

interface MailingCampaign {
  subject: string;
  message: string;
}

const MailingForm: React.FC<MailingFormProps> = ({
  recipientDetails,
  userRole,
  profile,
  sponsorInfo,
  campaignQuota
}) => {
  const [campaign, setCampaign] = useState<MailingCampaign>({
    subject: '',
    message: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validation du formulaire
  const isValid = campaign.subject.trim().length > 0 && 
                  campaign.message.trim().length > 0 && 
                  recipientDetails.total > 0;

  // Gérer les changements du formulaire
  const handleChange = (field: keyof MailingCampaign, value: string) => {
    setCampaign(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Prévisualisation du message
  const renderPreview = () => {
    const senderName = `${profile?.first_name} ${profile?.last_name}`;
    const sourceName = userRole === 'SuperAdmin' 
      ? 'Association' 
      : userRole === 'ClubAdmin' 
        ? 'Club'
        : `Sponsor ${sponsorInfo?.level}`;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto">
        {/* En-tête email simulé */}
        <div className="border-b border-gray-200 pb-4 mb-6">
          <div className="text-sm text-gray-500 mb-2">
            <strong>De:</strong> {sourceName} - {senderName}
          </div>
          <div className="text-sm text-gray-500 mb-2">
            <strong>À:</strong> {recipientDetails.total} destinataire{recipientDetails.total > 1 ? 's' : ''}
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {campaign.subject || 'Sujet de l\'email'}
          </div>
        </div>

        {/* Contenu du message */}
        <div className="prose prose-sm max-w-none">
          {campaign.message.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-3 text-gray-700">
              {paragraph || <span className="text-gray-400 italic">Votre message apparaîtra ici...</span>}
            </p>
          ))}
        </div>

        {/* Pied de page */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <p>Cet email a été envoyé via SynerJ</p>
          <p>Vous recevez cet email car vous avez consenti à recevoir des communications.</p>
        </div>
      </div>
    );
  };

  // Envoyer la campagne
  const handleSendCampaign = async () => {
    if (!isValid) return;

    try {
      setLoading(true);

      // Déterminer le type de consentement nécessaire
      const consentType = userRole === 'SuperAdmin' 
        ? 'email_consent_association'
        : userRole === 'Sponsor'
          ? 'email_consent_sponsors'
          : 'email_consent_clubs';

      // Préparer les données de la campagne (adaptées à votre structure DB)
      const campaignData = {
        subject: campaign.subject.trim(),
        message: campaign.message.trim(),
        sent_by: profile.id, // Votre table utilise 'sent_by' au lieu de 'sender_id'
        sender_role: userRole,
        club_id: userRole === 'ClubAdmin' || (userRole === 'Sponsor' && sponsorInfo?.sponsor_type === 'club') 
          ? (profile.club_id || sponsorInfo?.club_id) 
          : null,
        association_id: profile.association_id || sponsorInfo?.association_id,
        consent_type: consentType,
        recipient_count: recipientDetails.total,
        message_preview: campaign.message.trim().substring(0, 100),
        sponsor_type: userRole === 'Sponsor' ? sponsorInfo?.sponsor_type : null,
        sponsor_level: userRole === 'Sponsor' ? sponsorInfo?.level : null
      };

      // Appeler l'Edge Function pour envoyer les emails
      const { data, error } = await supabase.functions.invoke('send-mailing-campaign', {
        body: campaignData
      });

      if (error) throw error;

      // Succès
      setSuccess(true);
      setCampaign({ subject: '', message: '' });
      setShowConfirmModal(false);
      
      // Masquer le message de succès après 5 secondes
      setTimeout(() => setSuccess(false), 5000);

    } catch (error: any) {
      console.error('Erreur lors de l\'envoi:', error);
      alert('Erreur lors de l\'envoi de la campagne: ' + (error?.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  // Modale de confirmation
  const ConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <Send className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Confirmer l'envoi
          </h3>
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Sujet:</strong> {campaign.subject}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Destinataires:</strong> {recipientDetails.total} personne{recipientDetails.total > 1 ? 's' : ''}
          </p>
          {recipientDetails.directMembers > 0 && (
            <p className="text-xs text-gray-500">
              • {recipientDetails.directMembers} membre{recipientDetails.directMembers > 1 ? 's' : ''}
            </p>
          )}
          {recipientDetails.supporters > 0 && (
            <p className="text-xs text-gray-500">
              • {recipientDetails.supporters} supporter{recipientDetails.supporters > 1 ? 's' : ''}
            </p>
          )}
          
          {userRole === 'Sponsor' && campaignQuota && (
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Il vous restera {campaignQuota.remaining - 1} campagne{campaignQuota.remaining - 1 > 1 ? 's' : ''} ce mois
            </p>
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Êtes-vous sûr de vouloir envoyer cette campagne ? Cette action ne peut pas être annulée.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSendCampaign}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Envoyer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (recipientDetails.total === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-16 h-16 text-orange-300 dark:text-orange-700 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Aucun destinataire
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Il n'y a actuellement aucun membre ayant consenti à recevoir des emails.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Message de succès */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
          <div>
            <p className="font-semibold text-green-800 dark:text-green-200">
              Campagne envoyée avec succès !
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Votre message a été envoyé à {recipientDetails.total} destinataire{recipientDetails.total > 1 ? 's' : ''}.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Formulaire */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Colonne gauche - Formulaire */}
          <div className="space-y-6">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sujet de l'email *
              </label>
              <input
                type="text"
                id="subject"
                value={campaign.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="Ex: Nouvelle information importante du club"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {campaign.subject.length}/100 caractères
              </p>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                value={campaign.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Rédigez votre message ici...&#10;&#10;Vous pouvez utiliser plusieurs paragraphes pour structurer votre contenu."
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 resize-vertical"
                maxLength={5000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {campaign.message.length}/5000 caractères
              </p>
            </div>
          </div>

          {/* Colonne droite - Prévisualisation */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Prévisualisation
              </label>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Masquer' : 'Voir'}
              </button>
            </div>

            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 max-h-96 overflow-y-auto">
              {showPreview ? renderPreview() : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Cliquez sur "Voir" pour prévisualiser votre email</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-600">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isValid ? (
              <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                <Check className="w-4 h-4" />
                Prêt à envoyer
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                <X className="w-4 h-4" />
                Veuillez remplir tous les champs
              </span>
            )}
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={!isValid || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Envoyer la campagne
          </button>
        </div>
      </div>

      {/* Modale de confirmation */}
      {showConfirmModal && <ConfirmModal />}
    </>
  );
};

export default MailingForm;