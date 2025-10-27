import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Search, ChevronDown, ChevronUp, MessageSquare, Mail, BookOpen } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqItems: FAQItem[] = [
    // Général
    {
      id: 'what-is-synerj',
      question: 'Qu\'est-ce que SynerJ ?',
      answer: 'SynerJ est une plateforme SaaS (Software as a Service) complète dédiée à la gestion d\'associations et de clubs sportifs. Elle permet de gérer vos membres, organiser des événements, communiquer efficacement, gérer vos sponsors, réserver du matériel et bien plus encore, le tout depuis une interface unique et intuitive.',
      category: 'general'
    },
    {
      id: 'who-is-synerj-for',
      question: 'À qui s\'adresse SynerJ ?',
      answer: 'SynerJ s\'adresse à toutes les associations et clubs, quelle que soit leur taille : associations sportives, clubs de loisirs, associations culturelles, fédérations, etc. Que vous soyez une petite association de 10 membres ou une grande fédération avec plusieurs clubs, SynerJ s\'adapte à vos besoins.',
      category: 'general'
    },
    {
      id: 'free-trial',
      question: 'Y a-t-il une période d\'essai gratuite ?',
      answer: 'Oui ! SynerJ propose un plan 100% gratuit avec des fonctionnalités de base (jusqu\'à 50 membres, 10 événements/mois, 500 Mo de stockage). Vous pouvez commencer gratuitement et upgrader à tout moment vers un plan payant si vous avez besoin de fonctionnalités avancées ou de limites étendues.',
      category: 'general'
    },
    {
      id: 'data-security',
      question: 'Mes données sont-elles sécurisées ?',
      answer: 'Absolument ! Nous prenons la sécurité très au sérieux. Vos données sont hébergées sur Supabase avec chiffrement AES-256 au repos et SSL/TLS en transit. Nous appliquons le Row Level Security (RLS) pour garantir que chaque utilisateur n\'accède qu\'à ses propres données. Nous sommes conformes au RGPD et effectuons des sauvegardes régulières. Les paiements sont traités de manière 100% sécurisée par Stripe (certification PCI-DSS niveau 1).',
      category: 'general'
    },

    // Compte et inscription
    {
      id: 'create-account',
      question: 'Comment créer un compte ?',
      answer: 'Cliquez sur "Créer un compte" sur la page d\'accueil, choisissez votre rôle (Administrateur de club, Membre, Sponsor), remplissez le formulaire avec votre email et mot de passe, validez votre email via le lien de confirmation reçu, et c\'est tout ! Vous pouvez ensuite vous connecter et commencer à utiliser SynerJ.',
      category: 'account'
    },
    {
      id: 'forgot-password',
      question: 'J\'ai oublié mon mot de passe, que faire ?',
      answer: 'Sur la page de connexion, cliquez sur "Mot de passe oublié ?". Entrez votre adresse e-mail, vous recevrez un lien de réinitialisation par email. Cliquez sur ce lien et créez un nouveau mot de passe sécurisé. Si vous ne recevez pas l\'email, vérifiez vos spams ou contactez-nous à contact-synerj@teachtech.fr.',
      category: 'account'
    },
    {
      id: 'change-email',
      question: 'Puis-je modifier mon adresse e-mail ?',
      answer: 'Oui ! Allez dans Paramètres > Mon profil, modifiez votre adresse e-mail et enregistrez. Vous recevrez un email de confirmation à la nouvelle adresse pour valider le changement.',
      category: 'account'
    },
    {
      id: 'delete-account',
      question: 'Comment supprimer mon compte ?',
      answer: 'Rendez-vous dans Paramètres > Mon compte > "Supprimer mon compte". Attention : cette action est irréversible ! Toutes vos données seront supprimées définitivement après un délai de conservation de 30 jours. Si vous êtes administrateur d\'un club, pensez à transférer la gestion à un autre administrateur avant de supprimer votre compte.',
      category: 'account'
    },

    // Plans et tarification
    {
      id: 'pricing',
      question: 'Quels sont les tarifs de SynerJ ?',
      answer: 'SynerJ propose 3 plans : <strong>Gratuit</strong> (0€ - jusqu\'à 50 membres, fonctionnalités de base), <strong>Essentiel</strong> (tarif sur demande - jusqu\'à 200 membres, fonctionnalités avancées), <strong>Premium</strong> (tarif sur demande - illimité, toutes les fonctionnalités). Les prix exacts sont disponibles sur notre page de tarification. Vous pouvez payer mensuellement ou annuellement (avec réduction).',
      category: 'pricing'
    },
    {
      id: 'upgrade-plan',
      question: 'Comment changer de plan ?',
      answer: 'Allez dans Paramètres > Abonnement > "Changer de plan". Sélectionnez le nouveau plan souhaité, choisissez la fréquence de paiement et confirmez. Le changement est immédiat. Si vous passez à un plan supérieur, le montant sera calculé au prorata de la période restante.',
      category: 'pricing'
    },
    {
      id: 'cancel-subscription',
      question: 'Comment annuler mon abonnement ?',
      answer: 'Vous pouvez annuler votre abonnement à tout moment depuis Paramètres > Abonnement > "Annuler l\'abonnement", ou via votre portail client Stripe. L\'annulation prend effet à la fin de votre période de facturation en cours. Vous conservez l\'accès jusqu\'à cette date. Aucun remboursement au prorata n\'est effectué. Vous pouvez vous réabonner à tout moment.',
      category: 'pricing'
    },
    {
      id: 'payment-methods',
      question: 'Quels moyens de paiement acceptez-vous ?',
      answer: 'Nous acceptons toutes les cartes bancaires (Visa, Mastercard, American Express) via notre partenaire de paiement sécurisé Stripe. Les paiements sont 100% sécurisés et nous ne stockons jamais vos informations bancaires sur nos serveurs.',
      category: 'pricing'
    },
    {
      id: 'refund',
      question: 'Puis-je être remboursé ?',
      answer: 'Les abonnements ne sont généralement pas remboursables. Cependant, si vous rencontrez un problème technique majeur que nous ne pouvons pas résoudre, ou en cas de facturation erronée, contactez-nous à contact-synerj@teachtech.fr et nous étudierons votre demande au cas par cas.',
      category: 'pricing'
    },

    // Événements
    {
      id: 'create-event',
      question: 'Comment créer un événement ?',
      answer: 'Accédez à la section "Événements", cliquez sur "Nouvel événement", remplissez les informations (titre, description, date, lieu, type, etc.), ajoutez une image si souhaité, définissez la visibilité (public/privé), et publiez. Les membres recevront une notification automatique !',
      category: 'events'
    },
    {
      id: 'event-types',
      question: 'Quels types d\'événements puis-je créer ?',
      answer: 'Vous pouvez créer tous types d\'événements : entraînements, compétitions, matchs, réunions, assemblées générales, événements sociaux, sorties, stages, etc. Vous pouvez personnaliser les catégories selon vos besoins.',
      category: 'events'
    },
    {
      id: 'recurring-events',
      question: 'Puis-je créer des événements récurrents ?',
      answer: 'Actuellement, les événements récurrents ne sont pas encore disponibles, mais cette fonctionnalité est en développement ! En attendant, vous pouvez dupliquer un événement existant pour gagner du temps.',
      category: 'events'
    },
    {
      id: 'event-limit',
      question: 'Y a-t-il une limite au nombre d\'événements ?',
      answer: 'Le plan Gratuit permet 10 événements par mois. Les plans Essentiel et Premium offrent des événements illimités. Si vous atteignez la limite du plan gratuit, vous pouvez upgrader à tout moment.',
      category: 'events'
    },

    // Membres
    {
      id: 'invite-members',
      question: 'Comment inviter des membres dans mon club ?',
      answer: 'Allez dans "Mon Club" > "Membres" > "Inviter des membres". Entrez les adresses e-mail (séparées par des virgules), sélectionnez le rôle à attribuer, ajoutez un message personnalisé si souhaité, et envoyez les invitations. Les membres recevront un email avec un lien d\'inscription.',
      category: 'members'
    },
    {
      id: 'member-limit',
      question: 'Combien de membres puis-je avoir ?',
      answer: 'Cela dépend de votre plan : Plan Gratuit (jusqu\'à 50 membres), Plan Essentiel (jusqu\'à 200 membres), Plan Premium (membres illimités).',
      category: 'members'
    },
    {
      id: 'member-roles',
      question: 'Quels sont les différents rôles disponibles ?',
      answer: 'SynerJ propose 5 rôles : <strong>Super Admin</strong> (gestion complète de toutes les associations), <strong>Administrateur de Club</strong> (gestion complète de son club), <strong>Membre</strong> (participation aux événements), <strong>Supporter</strong> (suivi du club sans participation active), <strong>Sponsor</strong> (gestion de profil sponsor et visibilité).',
      category: 'members'
    },
    {
      id: 'remove-member',
      question: 'Comment retirer un membre de mon club ?',
      answer: 'Allez dans "Mon Club" > "Membres", cliquez sur le membre concerné, puis sélectionnez "Retirer du club". Vous pouvez aussi suspendre temporairement un membre sans le retirer définitivement.',
      category: 'members'
    },

    // Communication
    {
      id: 'send-email',
      question: 'Comment envoyer un email à mes membres ?',
      answer: 'Utilisez la fonctionnalité "Mailing" pour créer une campagne d\'emailing. Sélectionnez vos destinataires (tous les membres, un groupe spécifique, par rôle, etc.), rédigez votre message avec l\'éditeur HTML, prévisualisez, envoyez un test à vous-même, puis envoyez à tous ou programmez l\'envoi.',
      category: 'communication'
    },
    {
      id: 'email-limit',
      question: 'Y a-t-il une limite d\'emails envoyés ?',
      answer: 'Oui, le nombre d\'emails que vous pouvez envoyer dépend de votre plan d\'abonnement. Contactez-nous si vous avez besoin d\'augmenter votre quota.',
      category: 'communication'
    },
    {
      id: 'notifications',
      question: 'Comment gérer mes notifications ?',
      answer: 'Allez dans Paramètres > Notifications. Vous pouvez activer/désactiver les notifications par catégorie (événements, communications, commentaires, etc.) et choisir le canal (email, notification push, dans l\'app).',
      category: 'communication'
    },

    // Sponsors
    {
      id: 'add-sponsor',
      question: 'Comment ajouter un sponsor ?',
      answer: 'Allez dans "Sponsors" > "Ajouter un sponsor". Remplissez les informations (nom, logo, description, site web, niveau de partenariat, montant optionnel, durée du contrat). Activez la visibilité publique si vous voulez afficher le sponsor sur votre site web.',
      category: 'sponsors'
    },
    {
      id: 'sponsor-visibility',
      question: 'Où apparaissent les sponsors ?',
      answer: 'Les sponsors apparaissent dans plusieurs emplacements : bannière sur le tableau de bord, carrousel dans les événements, section dédiée sur le site web public du club, et optionnellement dans le footer des emails (plan Premium).',
      category: 'sponsors'
    },

    // Matériel
    {
      id: 'reserve-equipment',
      question: 'Comment réserver du matériel ?',
      answer: 'Allez dans "Réservation de matériel", parcourez le catalogue, sélectionnez l\'équipement souhaité, choisissez les dates de réservation, indiquez la quantité nécessaire, ajoutez une note explicative et soumettez la demande. Un Super Admin doit valider votre demande.',
      category: 'equipment'
    },
    {
      id: 'equipment-approval',
      question: 'Qui peut approuver les réservations de matériel ?',
      answer: 'Seuls les Super Admins peuvent approuver ou refuser les demandes de réservation de matériel. Vous recevrez une notification une fois votre demande traitée.',
      category: 'equipment'
    },

    // Technique
    {
      id: 'mobile-app',
      question: 'Y a-t-il une application mobile ?',
      answer: 'SynerJ est une application web responsive qui fonctionne parfaitement sur mobile via votre navigateur. Une application mobile native (iOS/Android) est prévue dans notre feuille de route future.',
      category: 'technical'
    },
    {
      id: 'browsers',
      question: 'Quels navigateurs sont supportés ?',
      answer: 'SynerJ fonctionne sur tous les navigateurs modernes : Chrome, Firefox, Safari, Edge (versions récentes). Nous recommandons de toujours utiliser la dernière version de votre navigateur pour une expérience optimale.',
      category: 'technical'
    },
    {
      id: 'data-export',
      question: 'Puis-je exporter mes données ?',
      answer: 'Oui ! Conformément au RGPD, vous avez le droit à la portabilité de vos données. Vous pouvez exporter vos données au format CSV ou JSON depuis vos paramètres, ou en nous contactant à contact-synerj@teachtech.fr.',
      category: 'technical'
    },
    {
      id: 'offline-mode',
      question: 'SynerJ fonctionne-t-il hors ligne ?',
      answer: 'SynerJ nécessite une connexion Internet pour fonctionner car c\'est une application cloud. Cependant, certaines données sont mises en cache localement pour améliorer les performances.',
      category: 'technical'
    },

    // Support
    {
      id: 'support-contact',
      question: 'Comment contacter le support ?',
      answer: 'Vous pouvez nous contacter par email à contact-synerj@teachtech.fr. Nous nous efforçons de répondre dans les 24-48 heures pour les plans gratuits et sous 24 heures pour les plans payants. Les utilisateurs Premium bénéficient d\'un support prioritaire.',
      category: 'support'
    },
    {
      id: 'support-hours',
      question: 'Quels sont les horaires du support ?',
      answer: 'Notre support est disponible du lundi au vendredi de 9h à 18h (heure de Paris). Pour les urgences critiques sur les plans Premium, un support 24/7 est disponible.',
      category: 'support'
    },
    {
      id: 'bug-report',
      question: 'Comment signaler un bug ?',
      answer: 'Si vous rencontrez un bug, envoyez-nous un email à contact-synerj@teachtech.fr avec une description détaillée du problème, les étapes pour le reproduire, des captures d\'écran si possible, et votre navigateur/système d\'exploitation. Nous traiterons votre rapport rapidement.',
      category: 'support'
    },
    {
      id: 'feature-request',
      question: 'Puis-je suggérer de nouvelles fonctionnalités ?',
      answer: 'Absolument ! Nous adorons recevoir les suggestions de nos utilisateurs. Envoyez vos idées à contact-synerj@teachtech.fr. Nous prenons en compte tous les retours pour améliorer continuellement SynerJ.',
      category: 'support'
    }
  ];

  const categories = [
    { id: 'all', label: 'Toutes les catégories', count: faqItems.length },
    { id: 'general', label: 'Général', count: faqItems.filter(item => item.category === 'general').length },
    { id: 'account', label: 'Compte & Inscription', count: faqItems.filter(item => item.category === 'account').length },
    { id: 'pricing', label: 'Plans & Tarification', count: faqItems.filter(item => item.category === 'pricing').length },
    { id: 'events', label: 'Événements', count: faqItems.filter(item => item.category === 'events').length },
    { id: 'members', label: 'Membres', count: faqItems.filter(item => item.category === 'members').length },
    { id: 'communication', label: 'Communication', count: faqItems.filter(item => item.category === 'communication').length },
    { id: 'sponsors', label: 'Sponsors', count: faqItems.filter(item => item.category === 'sponsors').length },
    { id: 'equipment', label: 'Matériel', count: faqItems.filter(item => item.category === 'equipment').length },
    { id: 'technical', label: 'Technique', count: faqItems.filter(item => item.category === 'technical').length },
    { id: 'support', label: 'Support', count: faqItems.filter(item => item.category === 'support').length }
  ];

  const toggleItem = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  // Filtrage
  const filteredItems = faqItems.filter(item => {
    const matchesSearch = searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-indigo-600" />
            Questions fréquentes (FAQ)
          </h1>
          <p className="text-slate-600 mt-2">
            Trouvez rapidement des réponses aux questions les plus courantes
          </p>

          {/* Barre de recherche */}
          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une question... (ex: mot de passe, tarif, événement)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Liens rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            to="/legal/help-center"
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-200 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <HelpCircle className="w-6 h-6 text-indigo-600" />
              <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Centre d'aide
              </h3>
            </div>
            <p className="text-slate-600 text-sm">
              Guides détaillés et tutoriels pas à pas
            </p>
          </Link>

          <Link
            to="/legal/documentation"
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-200 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Documentation
              </h3>
            </div>
            <p className="text-slate-600 text-sm">
              Documentation technique complète
            </p>
          </Link>
        </div>

        {/* Filtres par catégorie */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Filtrer par catégorie :</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Liste des questions */}
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-start gap-3 flex-1">
                  <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-slate-900">
                    {item.question}
                  </h3>
                </div>
                {expandedItem === item.id ? (
                  <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 ml-4" />
                )}
              </button>

              {expandedItem === item.id && (
                <div className="px-6 pb-4 border-t border-slate-100 pt-4">
                  <p 
                    className="text-slate-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message si aucun résultat */}
        {filteredItems.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aucune question trouvée
            </h3>
            <p className="text-slate-600 mb-6">
              Essayez avec d'autres mots-clés ou consultez notre{' '}
              <Link to="/legal/help-center" className="text-indigo-600 hover:text-indigo-800 underline">
                Centre d'aide
              </Link>
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* Section contact */}
        <div className="mt-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">
                Vous ne trouvez pas votre réponse ?
              </h2>
              <p className="text-indigo-100">
                Notre équipe de support est là pour vous aider. Contactez-nous par e-mail 
                et nous vous répondrons rapidement.
              </p>
            </div>
            <a
              href="mailto:contact-synerj@teachtech.fr"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-2 flex-shrink-0"
            >
              <Mail className="w-5 h-5" />
              Contacter le support
            </a>
          </div>
        </div>

        {/* Compteur de questions affichées */}
        {filteredItems.length > 0 && (
          <div className="mt-8 text-center text-sm text-slate-500">
            Affichage de {filteredItems.length} question{filteredItems.length > 1 ? 's' : ''} 
            {selectedCategory !== 'all' && ` dans la catégorie "${categories.find(c => c.id === selectedCategory)?.label}"`}
          </div>
        )}

        {/* Liens footer */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <Link to="/legal/notices" className="text-indigo-600 hover:text-indigo-800 underline">
            Mentions Légales
          </Link>
          <span className="text-slate-300">•</span>
          <Link to="/legal/privacy-policy" className="text-indigo-600 hover:text-indigo-800 underline">
            Politique de confidentialité
          </Link>
          <span className="text-slate-300">•</span>
          <Link to="/legal/terms" className="text-indigo-600 hover:text-indigo-800 underline">
            CGU
          </Link>
        </div>
      </main>
    </div>
  );
};

export default FAQ;