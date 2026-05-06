import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  HelpCircle, 
  Search, 
  BookOpen, 
  Users, 
  Calendar, 
  Mail, 
  CreditCard, 
  Settings, 
  Shield, 
  Package, 
  MessageSquare,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Lightbulb,
  Zap,
  HeartHandshake,
  Eye
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
}

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  articles: HelpArticle[];
}

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('getting-started');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const categories: HelpCategory[] = [
    {
      id: 'getting-started',
      title: 'Démarrage rapide',
      description: 'Premiers pas avec SynerJ',
      icon: <Zap className="w-6 h-6" />,
      articles: [
        {
          id: 'create-account',
          title: 'Comment créer un compte ?',
          icon: <Users className="w-5 h-5" />,
          content: `
            <p>Pour créer un compte sur SynerJ :</p>
            <ol class="list-decimal list-inside space-y-2 mt-3">
              <li>Rendez-vous sur la page d'accueil de SynerJ</li>
              <li>Cliquez sur le bouton "Créer un compte" ou "S'inscrire"</li>
              <li>Choisissez votre rôle (Administrateur de club, Membre, Sponsor, etc.)</li>
              <li>Remplissez le formulaire avec vos informations :
                <ul class="list-disc list-inside ml-6 mt-1">
                  <li>Adresse e-mail valide</li>
                  <li>Mot de passe sécurisé (minimum 8 caractères)</li>
                  <li>Nom et prénom</li>
                </ul>
              </li>
              <li>Acceptez les Conditions Générales d'Utilisation</li>
              <li>Vérifiez votre e-mail et cliquez sur le lien de confirmation</li>
              <li>Connectez-vous avec vos identifiants</li>
            </ol>
            <div class="bg-terracotta-soft border-l-4 border-terracotta p-4 rounded-r-lg mt-4">
              <p class="text-terracotta-deep text-sm"><strong>Conseil :</strong> Utilisez un mot de passe unique et activez l'authentification à deux facteurs (2FA) pour plus de sécurité.</p>
            </div>
          `
        },
        {
          id: 'choose-plan',
          title: 'Quel plan d\'abonnement choisir ?',
          icon: <CreditCard className="w-5 h-5" />,
          content: `
            <p>SynerJ propose 3 formules adaptées à vos besoins :</p>
            <div class="space-y-4 mt-4">
              <div class="bg-slate-50 border-l-4 border-slate-400 p-4 rounded-r-lg">
                <h4 class="font-semibold text-slate-900 mb-2">🆓 Plan Gratuit</h4>
                <p class="text-slate-700 text-sm mb-2"><strong>Idéal pour :</strong> Petites associations débutantes (moins de 50 membres)</p>
                <ul class="list-disc list-inside text-slate-700 text-sm ml-4 space-y-1">
                  <li>Jusqu'à 50 membres</li>
                  <li>10 événements/mois</li>
                  <li>500 Mo de stockage</li>
                  <li>Fonctionnalités de base</li>
                </ul>
              </div>
              <div class="bg-terracotta-soft border-l-4 border-terracotta p-4 rounded-r-lg">
                <h4 class="font-semibold text-terracotta-deep mb-2">⭐ Plan Essentiel</h4>
                <p class="text-terracotta-deep text-sm mb-2"><strong>Idéal pour :</strong> Associations en croissance (50-200 membres)</p>
                <ul class="list-disc list-inside text-terracotta-deep text-sm ml-4 space-y-1">
                  <li>Jusqu'à 200 membres</li>
                  <li>Événements illimités</li>
                  <li>5 Go de stockage</li>
                  <li>Gestion de sponsors</li>
                  <li>Mailing avancé</li>
                  <li>Support prioritaire</li>
                </ul>
              </div>
              <div class="bg-ds-info-soft border-l-4 border-ds-info p-4 rounded-r-lg">
                <h4 class="font-semibold text-ds-info mb-2">💎 Plan Premium</h4>
                <p class="text-ds-info text-sm mb-2"><strong>Idéal pour :</strong> Grandes associations et fédérations</p>
                <ul class="list-disc list-inside text-ds-info text-sm ml-4 space-y-1">
                  <li>Membres illimités</li>
                  <li>Événements illimités</li>
                  <li>Stockage illimité</li>
                  <li>Site web personnalisé pour le club</li>
                  <li>Gestion multi-clubs</li>
                  <li>API et intégrations</li>
                  <li>Support 24/7</li>
                </ul>
              </div>
            </div>
            <p class="text-slate-700 mt-4 text-sm">💡 <strong>Astuce :</strong> Vous pouvez commencer gratuitement et upgrader à tout moment selon vos besoins.</p>
          `
        },
        {
          id: 'first-steps',
          title: 'Premiers pas après l\'inscription',
          icon: <Lightbulb className="w-5 h-5" />,
          content: `
            <p>Une fois votre compte créé, voici les étapes recommandées :</p>
            <div class="space-y-3 mt-4">
              <div class="flex items-start gap-3">
                <div class="bg-ds-info-soft text-ds-info rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                <div>
                  <h4 class="font-semibold text-slate-900">Complétez votre profil</h4>
                  <p class="text-slate-700 text-sm">Ajoutez une photo, vos coordonnées et vos préférences</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="bg-ds-info-soft text-ds-info rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                <div>
                  <h4 class="font-semibold text-slate-900">Créez ou rejoignez un club</h4>
                  <p class="text-slate-700 text-sm">En tant qu'admin, créez votre club. En tant que membre, demandez à rejoindre un club existant</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="bg-ds-info-soft text-ds-info rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                <div>
                  <h4 class="font-semibold text-slate-900">Invitez vos membres</h4>
                  <p class="text-slate-700 text-sm">Utilisez la fonction d'invitation pour ajouter vos membres</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="bg-ds-info-soft text-ds-info rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">4</div>
                <div>
                  <h4 class="font-semibold text-slate-900">Créez votre premier événement</h4>
                  <p class="text-slate-700 text-sm">Testez la plateforme en créant un événement de test</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="bg-ds-info-soft text-ds-info rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">5</div>
                <div>
                  <h4 class="font-semibold text-slate-900">Explorez les fonctionnalités</h4>
                  <p class="text-slate-700 text-sm">Découvrez le calendrier, les communications, le mailing, etc.</p>
                </div>
              </div>
            </div>
          `
        }
      ]
    },
    {
      id: 'events',
      title: 'Gestion des événements',
      description: 'Créer et gérer vos événements',
      icon: <Calendar className="w-6 h-6" />,
      articles: [
        {
          id: 'create-event',
          title: 'Comment créer un événement ?',
          icon: <Calendar className="w-5 h-5" />,
          content: `
            <p>Pour créer un événement dans SynerJ :</p>
            <ol class="list-decimal list-inside space-y-2 mt-3">
              <li>Connectez-vous à votre compte</li>
              <li>Accédez à la section "Événements" depuis le menu principal</li>
              <li>Cliquez sur le bouton "Nouvel événement" ou "Créer un événement"</li>
              <li>Remplissez les informations de l'événement :
                <ul class="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li><strong>Titre :</strong> Nom de l'événement</li>
                  <li><strong>Description :</strong> Détails sur l'événement</li>
                  <li><strong>Date et heure :</strong> Quand aura lieu l'événement</li>
                  <li><strong>Lieu :</strong> Adresse ou lieu de l'événement</li>
                  <li><strong>Type :</strong> Entraînement, compétition, réunion, social, etc.</li>
                  <li><strong>Participants :</strong> Qui peut participer (tous, membres seulement, etc.)</li>
                  <li><strong>Visibilité :</strong> Public ou privé</li>
                </ul>
              </li>
              <li>Ajoutez une image ou bannière (optionnel)</li>
              <li>Cliquez sur "Créer" ou "Publier"</li>
            </ol>
            <div class="bg-ds-success-soft border-l-4 border-ds-success p-4 rounded-r-lg mt-4">
              <p class="text-ds-success text-sm"><strong>Astuce :</strong> Les membres recevront une notification automatique pour les nouveaux événements !</p>
            </div>
          `
        },
        {
          id: 'manage-participants',
          title: 'Gérer les participants à un événement',
          icon: <Users className="w-5 h-5" />,
          content: `
            <p>Pour gérer les participants d'un événement :</p>
            <div class="space-y-3 mt-4">
              <div>
                <h4 class="font-semibold text-slate-900 mb-2">📋 Voir la liste des participants</h4>
                <ul class="list-disc list-inside text-slate-700 text-sm ml-4 space-y-1">
                  <li>Ouvrez l'événement depuis la page "Événements"</li>
                  <li>La liste des inscrits apparaît dans l'onglet "Participants"</li>
                  <li>Vous pouvez voir qui a confirmé, décliné ou n'a pas répondu</li>
                </ul>
              </div>
              <div>
                <h4 class="font-semibold text-slate-900 mb-2">✅ Valider ou refuser des inscriptions</h4>
                <p class="text-slate-700 text-sm">Si vous avez activé la validation manuelle, vous pouvez approuver ou rejeter les demandes d'inscription.</p>
              </div>
              <div>
                <h4 class="font-semibold text-slate-900 mb-2">📧 Envoyer un message aux participants</h4>
                <p class="text-slate-700 text-sm">Utilisez la fonction "Contacter les participants" pour envoyer un email à tous les inscrits.</p>
              </div>
              <div>
                <h4 class="font-semibold text-slate-900 mb-2">📊 Exporter la liste</h4>
                <p class="text-slate-700 text-sm">Vous pouvez exporter la liste des participants au format CSV pour l'utiliser dans d'autres outils.</p>
              </div>
            </div>
          `
        },
        {
          id: 'calendar-sync',
          title: 'Synchroniser le calendrier',
          icon: <Calendar className="w-5 h-5" />,
          content: `
            <p>Synchronisez vos événements SynerJ avec votre calendrier personnel :</p>
            <div class="space-y-4 mt-4">
              <div>
                <h4 class="font-semibold text-slate-900 mb-2">📅 Accéder à votre calendrier</h4>
                <p class="text-slate-700 text-sm">Cliquez sur "Mon Calendrier" dans le menu principal pour voir tous vos événements en vue calendrier.</p>
              </div>
              <div class="bg-terracotta-soft border-l-4 border-terracotta p-4 rounded-r-lg">
                <h4 class="font-semibold text-terracotta-deep mb-2">🔗 Export iCal (Google Calendar, Outlook, Apple Calendar)</h4>
                <p class="text-terracotta-deep text-sm mb-2">Pour synchroniser avec votre calendrier externe :</p>
                <ol class="list-decimal list-inside text-terracotta-deep text-sm ml-4 space-y-1">
                  <li>Accédez à vos Paramètres > Calendrier</li>
                  <li>Copiez le lien de synchronisation iCal</li>
                  <li>Ajoutez-le comme "Calendrier Internet" dans votre application calendrier</li>
                  <li>Vos événements se mettront à jour automatiquement</li>
                </ol>
              </div>
            </div>
          `
        }
      ]
    },
    {
      id: 'members',
      title: 'Gestion des membres',
      description: 'Inviter et gérer les membres',
      icon: <Users className="w-6 h-6" />,
      articles: [
        {
          id: 'invite-members',
          title: 'Comment inviter des membres ?',
          icon: <Mail className="w-5 h-5" />,
          content: `
            <p>Pour inviter des nouveaux membres dans votre club :</p>
            <div class="space-y-4 mt-4">
              <div>
                <h4 class="font-semibold text-slate-900 mb-2">✉️ Invitation par e-mail</h4>
                <ol class="list-decimal list-inside text-slate-700 text-sm ml-4 space-y-1">
                  <li>Allez dans "Mon Club" > "Membres"</li>
                  <li>Cliquez sur "Inviter des membres"</li>
                  <li>Entrez les adresses e-mail (séparées par des virgules ou une par ligne)</li>
                  <li>Sélectionnez le rôle à attribuer (Membre, Administrateur, etc.)</li>
                  <li>Ajoutez un message personnalisé (optionnel)</li>
                  <li>Cliquez sur "Envoyer les invitations"</li>
                </ol>
              </div>
              <div>
                <h4 class="font-semibold text-slate-900 mb-2">🔗 Lien d'invitation</h4>
                <p class="text-slate-700 text-sm">Vous pouvez aussi générer un lien d'invitation unique à partager sur vos réseaux sociaux ou par message.</p>
              </div>
              <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <p class="text-amber-800 text-sm"><strong>Note :</strong> Le nombre de membres que vous pouvez inviter dépend de votre plan d'abonnement.</p>
              </div>
            </div>
          `
        },
        {
          id: 'manage-roles',
          title: 'Gérer les rôles et permissions',
          icon: <Shield className="w-5 h-5" />,
          content: `
            <p>SynerJ propose plusieurs rôles avec des permissions différentes :</p>
            <div class="space-y-3 mt-4">
              <div class="bg-ds-danger-soft border-l-4 border-ds-danger p-3 rounded-r-lg">
                <h4 class="font-semibold text-ds-danger text-sm mb-1">🔴 Super Admin</h4>
                <p class="text-ds-danger text-xs">Accès complet : gestion de toutes les associations, clubs, paramètres système</p>
              </div>
              <div class="bg-ds-info-soft border-l-4 border-ds-info p-3 rounded-r-lg">
                <h4 class="font-semibold text-ds-info text-sm mb-1">🔵 Administrateur de Club</h4>
                <p class="text-ds-info text-xs">Gestion complète de son club : membres, événements, communications, finances</p>
              </div>
              <div class="bg-ds-success-soft border-l-4 border-ds-success p-3 rounded-r-lg">
                <h4 class="font-semibold text-ds-success text-sm mb-1">🟢 Membre</h4>
                <p class="text-ds-success text-xs">Participation aux événements, consultation du calendrier, profil personnel</p>
              </div>
              <div class="bg-terracotta-soft border-l-4 border-terracotta p-3 rounded-r-lg">
                <h4 class="font-semibold text-terracotta-deep text-sm mb-1">🔵 Supporter</h4>
                <p class="text-terracotta-deep text-xs">Suivi du club, réception des communications (sans participation active)</p>
              </div>
              <div class="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg">
                <h4 class="font-semibold text-amber-900 text-sm mb-1">🟡 Sponsor</h4>
                <p class="text-amber-800 text-xs">Gestion de profil sponsor, visibilité, statistiques de partenariat</p>
              </div>
            </div>
            <div class="bg-slate-50 rounded-lg p-4 mt-4">
              <h4 class="font-semibold text-slate-900 mb-2">Modifier le rôle d'un membre :</h4>
              <ol class="list-decimal list-inside text-slate-700 text-sm ml-4 space-y-1">
                <li>Allez dans "Mon Club" > "Membres"</li>
                <li>Cliquez sur le membre concerné</li>
                <li>Sélectionnez "Modifier le rôle"</li>
                <li>Choisissez le nouveau rôle</li>
                <li>Confirmez</li>
              </ol>
            </div>
          `
        }
      ]
    },
    {
      id: 'communication',
      title: 'Communication et mailing',
      description: 'Communiquer avec vos membres',
      icon: <Mail className="w-6 h-6" />,
      articles: [
        {
          id: 'create-post',
          title: 'Publier une communication',
          icon: <MessageSquare className="w-5 h-5" />,
          content: `
            <p>Pour publier une communication visible par vos membres :</p>
            <ol class="list-decimal list-inside space-y-2 mt-3">
              <li>Accédez à la section "Communications"</li>
              <li>Cliquez sur "Nouvelle publication"</li>
              <li>Rédigez votre message :
                <ul class="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>Titre accrocheur</li>
                  <li>Contenu (texte enrichi, formatage disponible)</li>
                  <li>Ajoutez des images ou fichiers joints</li>
                </ul>
              </li>
              <li>Choisissez la visibilité (tous les membres, un groupe spécifique, etc.)</li>
              <li>Activez les notifications si vous voulez alerter les membres</li>
              <li>Publiez ou programmez pour plus tard</li>
            </ol>
            <div class="bg-terracotta-soft border-l-4 border-terracotta p-4 rounded-r-lg mt-4">
              <p class="text-terracotta-deep text-sm"><strong>Astuce :</strong> Les membres peuvent liker et commenter vos publications pour créer de l'engagement !</p>
            </div>
          `
        },
        {
          id: 'send-mailing',
          title: 'Envoyer une campagne de mailing',
          icon: <Mail className="w-5 h-5" />,
          content: `
            <p>Pour envoyer un email à plusieurs membres simultanément :</p>
            <ol class="list-decimal list-inside space-y-2 mt-3">
              <li>Accédez à la section "Mailing"</li>
              <li>Cliquez sur "Nouvelle campagne"</li>
              <li>Sélectionnez les destinataires :
                <ul class="list-disc list-inside ml-6 mt-1">
                  <li>Tous les membres</li>
                  <li>Un groupe spécifique</li>
                  <li>Par rôle (membres, sponsors, etc.)</li>
                  <li>Liste personnalisée</li>
                </ul>
              </li>
              <li>Rédigez votre email :
                <ul class="list-disc list-inside ml-6 mt-1">
                  <li>Objet (important pour le taux d'ouverture)</li>
                  <li>Corps du message (éditeur HTML disponible)</li>
                  <li>Pièces jointes si nécessaire</li>
                </ul>
              </li>
              <li>Prévisualisez l'email</li>
              <li>Envoyez un test à vous-même d'abord (recommandé)</li>
              <li>Programmez ou envoyez immédiatement</li>
            </ol>
            <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
              <p class="text-amber-800 text-sm"><strong>Limites :</strong> Le nombre d'emails que vous pouvez envoyer dépend de votre plan d'abonnement.</p>
            </div>
          `
        }
      ]
    },
    {
      id: 'sponsors',
      title: 'Gestion des sponsors',
      description: 'Gérer vos partenariats',
      icon: <HeartHandshake className="w-6 h-6" />,
      articles: [
        {
          id: 'add-sponsor',
          title: 'Ajouter un sponsor',
          icon: <HeartHandshake className="w-5 h-5" />,
          content: `
            <p>Pour ajouter un sponsor à votre club :</p>
            <ol class="list-decimal list-inside space-y-2 mt-3">
              <li>Allez dans "Sponsors"</li>
              <li>Cliquez sur "Ajouter un sponsor"</li>
              <li>Remplissez les informations :
                <ul class="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>Nom de l'entreprise</li>
                  <li>Logo (format PNG ou JPG recommandé)</li>
                  <li>Description</li>
                  <li>Site web et réseaux sociaux</li>
                  <li>Niveau de partenariat (Bronze, Argent, Or, etc.)</li>
                  <li>Montant du partenariat (optionnel, privé)</li>
                  <li>Durée du contrat</li>
                </ul>
              </li>
              <li>Activez la visibilité publique si vous voulez afficher le sponsor sur votre site web</li>
              <li>Enregistrez</li>
            </ol>
            <div class="bg-ds-success-soft border-l-4 border-ds-success p-4 rounded-r-lg mt-4">
              <p class="text-ds-success text-sm"><strong>Avantage :</strong> Les sponsors apparaissent automatiquement dans un carrousel sur votre tableau de bord et site web public !</p>
            </div>
          `
        },
        {
          id: 'sponsor-visibility',
          title: 'Gérer la visibilité des sponsors',
          icon: <Eye className="w-5 h-5" />,
          content: `
            <p>Contrôlez où et comment vos sponsors sont affichés :</p>
            <div class="space-y-4 mt-4">
              <div>
                <h4 class="font-semibold text-slate-900 mb-2">🎯 Emplacements d'affichage</h4>
                <ul class="list-disc list-inside text-slate-700 text-sm ml-4 space-y-1">
                  <li>Bannière sur le tableau de bord</li>
                  <li>Carrousel dans les événements</li>
                  <li>Section dédiée sur le site web public du club</li>
                  <li>Footer des emails (option premium)</li>
                </ul>
              </div>
              <div>
                <h4 class="font-semibold text-slate-900 mb-2">⚙️ Personnalisation</h4>
                <ul class="list-disc list-inside text-slate-700 text-sm ml-4 space-y-1">
                  <li>Ordre d'affichage (glisser-déposer)</li>
                  <li>Taille du logo selon le niveau de partenariat</li>
                  <li>Activation/désactivation par sponsor</li>
                </ul>
              </div>
            </div>
          `
        }
      ]
    },
    {
      id: 'equipment',
      title: 'Gestion du matériel',
      description: 'Réserver et gérer le matériel',
      icon: <Package className="w-6 h-6" />,
      articles: [
        {
          id: 'add-equipment',
          title: 'Ajouter du matériel',
          icon: <Package className="w-5 h-5" />,
          content: `
            <p>Pour ajouter du matériel à votre inventaire (Super Admin seulement) :</p>
            <ol class="list-decimal list-inside space-y-2 mt-3">
              <li>Accédez à "Gestion du matériel"</li>
              <li>Cliquez sur "Ajouter du matériel"</li>
              <li>Remplissez la fiche :
                <ul class="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>Nom du matériel</li>
                  <li>Catégorie (sportif, technique, logistique, etc.)</li>
                  <li>Quantité disponible</li>
                  <li>Photo (optionnel)</li>
                  <li>État (neuf, bon, acceptable, à réparer)</li>
                  <li>Description et consignes d'utilisation</li>
                  <li>Disponibilité (réservable ou non)</li>
                </ul>
              </li>
              <li>Enregistrez</li>
            </ol>
          `
        },
        {
          id: 'reserve-equipment',
          title: 'Réserver du matériel',
          icon: <Calendar className="w-5 h-5" />,
          content: `
            <p>Pour réserver du matériel pour votre club :</p>
            <ol class="list-decimal list-inside space-y-2 mt-3">
              <li>Allez dans "Réservation de matériel"</li>
              <li>Parcourez le catalogue de matériel disponible</li>
              <li>Sélectionnez l'équipement souhaité</li>
              <li>Choisissez les dates de réservation (début et fin)</li>
              <li>Indiquez la quantité nécessaire</li>
              <li>Ajoutez une note explicative (raison de la demande)</li>
              <li>Soumettez la demande</li>
            </ol>
            <div class="bg-terracotta-soft border-l-4 border-terracotta p-4 rounded-r-lg mt-4">
              <p class="text-terracotta-deep text-sm"><strong>Important :</strong> Votre demande doit être validée par un Super Admin. Vous recevrez une notification une fois approuvée ou refusée.</p>
            </div>
          `
        }
      ]
    },
    {
      id: 'billing',
      title: 'Facturation et abonnement',
      description: 'Gérer votre abonnement et paiements',
      icon: <CreditCard className="w-6 h-6" />,
      articles: [
        {
          id: 'upgrade-plan',
          title: 'Changer de plan d\'abonnement',
          icon: <CreditCard className="w-5 h-5" />,
          content: `
            <p>Pour passer à un plan supérieur ou modifier votre abonnement :</p>
            <ol class="list-decimal list-inside space-y-2 mt-3">
              <li>Allez dans "Paramètres" > "Abonnement"</li>
              <li>Consultez votre plan actuel et les options disponibles</li>
              <li>Cliquez sur "Changer de plan" ou "Mettre à niveau"</li>
              <li>Sélectionnez le nouveau plan souhaité</li>
              <li>Choisissez la fréquence de paiement (mensuel ou annuel)</li>
              <li>Vérifiez le récapitulatif et le montant</li>
              <li>Confirmez et effectuez le paiement via Stripe</li>
            </ol>
            <div class="bg-ds-success-soft border-l-4 border-ds-success p-4 rounded-r-lg mt-4">
              <p class="text-ds-success text-sm"><strong>Bon à savoir :</strong> Le changement de plan est immédiat. Si vous passez à un plan supérieur, le montant sera calculé au prorata de la période restante.</p>
            </div>
          `
        },
        {
          id: 'manage-billing',
          title: 'Gérer vos informations de facturation',
          icon: <FileText className="w-5 h-5" />,
          content: `
            <p>Pour gérer vos informations de paiement et consulter vos factures :</p>
            <div class="space-y-4 mt-4">
              <div>
                <h4 class="font-semibold text-slate-900 mb-2">💳 Modifier votre carte bancaire</h4>
                <ol class="list-decimal list-inside text-slate-700 text-sm ml-4 space-y-1">
                  <li>Paramètres > Abonnement > "Gérer le paiement"</li>
                  <li>Vous serez redirigé vers le portail sécurisé Stripe</li>
                  <li>Cliquez sur "Ajouter un moyen de paiement"</li>
                  <li>Entrez les informations de votre nouvelle carte</li>
                  <li>Définissez-la comme moyen de paiement par défaut</li>
                </ol>
              </div>
              <div>
                <h4 class="font-semibold text-slate-900 mb-2">🧾 Consulter vos factures</h4>
                <p class="text-slate-700 text-sm">
                  Toutes vos factures sont disponibles dans le portail Stripe. Vous recevez également 
                  automatiquement une copie par email à chaque paiement.
                </p>
              </div>
              <div>
                <h4 class="font-semibold text-slate-900 mb-2">🔄 Annuler votre abonnement</h4>
                <p class="text-slate-700 text-sm mb-2">
                  Vous pouvez annuler votre abonnement à tout moment :
                </p>
                <ul class="list-disc list-inside text-slate-700 text-sm ml-4 space-y-1">
                  <li>L'annulation prend effet à la fin de votre période de facturation en cours</li>
                  <li>Vous conservez l'accès jusqu'à cette date</li>
                  <li>Aucun remboursement au prorata n'est effectué</li>
                  <li>Vous pouvez vous réabonner à tout moment</li>
                </ul>
              </div>
            </div>
          `
        }
      ]
    },
    {
      id: 'settings',
      title: 'Paramètres et personnalisation',
      description: 'Configurer votre compte et club',
      icon: <Settings className="w-6 h-6" />,
      articles: [
        {
          id: 'profile-settings',
          title: 'Modifier mon profil',
          icon: <Users className="w-5 h-5" />,
          content: `
            <p>Pour personnaliser votre profil utilisateur :</p>
            <ol class="list-decimal list-inside space-y-2 mt-3">
              <li>Cliquez sur votre avatar en haut à droite</li>
              <li>Sélectionnez "Paramètres" ou "Mon profil"</li>
              <li>Modifiez vos informations :
                <ul class="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>Photo de profil</li>
                  <li>Nom et prénom</li>
                  <li>Adresse e-mail</li>
                  <li>Numéro de téléphone</li>
                  <li>Bio/description (optionnel)</li>
                </ul>
              </li>
              <li>Enregistrez vos modifications</li>
            </ol>
            <div class="bg-terracotta-soft border-l-4 border-terracotta p-4 rounded-r-lg mt-4">
              <p class="text-terracotta-deep text-sm"><strong>Confidentialité :</strong> Vous pouvez contrôler la visibilité de vos informations dans les paramètres de confidentialité.</p>
            </div>
          `
        },
        {
          id: 'club-settings',
          title: 'Personnaliser mon club',
          icon: <Settings className="w-5 h-5" />,
          content: `
            <p>Pour personnaliser les informations de votre club (Admin seulement) :</p>
            <ol class="list-decimal list-inside space-y-2 mt-3">
              <li>Allez dans "Mon Club" > "Paramètres"</li>
              <li>Modifiez les informations du club :
                <ul class="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>Logo du club</li>
                  <li>Nom et description</li>
                  <li>Couleurs principales (pour le branding)</li>
                  <li>Coordonnées (adresse, email, téléphone)</li>
                  <li>Réseaux sociaux</li>
                  <li>Images de bannière</li>
                </ul>
              </li>
              <li>Configurez les préférences :
                <ul class="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>Validation automatique ou manuelle des nouveaux membres</li>
                  <li>Visibilité publique du club</li>
                  <li>Paramètres de notifications</li>
                </ul>
              </li>
              <li>Enregistrez</li>
            </ol>
          `
        },
        {
          id: 'notifications',
          title: 'Gérer les notifications',
          icon: <Settings className="w-5 h-5" />,
          content: `
            <p>Pour contrôler quelles notifications vous recevez :</p>
            <ol class="list-decimal list-inside space-y-2 mt-3">
              <li>Allez dans Paramètres > Notifications</li>
              <li>Activez ou désactivez par catégorie :
                <ul class="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>Nouveaux événements</li>
                  <li>Modifications d'événements</li>
                  <li>Nouvelles communications</li>
                  <li>Commentaires et likes</li>
                  <li>Demandes d'adhésion</li>
                  <li>Réponses aux réservations de matériel</li>
                  <li>Rappels avant événements</li>
                </ul>
              </li>
              <li>Choisissez le canal (email, notification push, dans l'app)</li>
              <li>Enregistrez vos préférences</li>
            </ol>
          `
        }
      ]
    }
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const toggleArticle = (articleId: string) => {
    setExpandedArticle(expandedArticle === articleId ? null : articleId);
  };

  // Filtrage par recherche
  const filteredCategories = categories.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      searchQuery === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.articles.length > 0 || searchQuery === '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-ds-info hover:text-ds-info transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <HelpCircle className="w-8 h-8 text-ds-info" />
                Centre d'aide
              </h1>
              <p className="text-slate-600 mt-2">
                Trouvez rapidement des réponses à vos questions
              </p>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="mt-6 relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher dans l'aide (ex: créer un événement, inviter des membres...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Liens rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/legal/faq"
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-200 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-6 h-6 text-ds-info" />
              <h3 className="font-semibold text-slate-900 group-hover:text-ds-info transition-colors">
                FAQ
              </h3>
            </div>
            <p className="text-slate-600 text-sm">
              Questions fréquemment posées
            </p>
          </Link>

          <Link
            to="/legal/documentation"
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-200 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-ds-info" />
              <h3 className="font-semibold text-slate-900 group-hover:text-ds-info transition-colors">
                Documentation
              </h3>
            </div>
            <p className="text-slate-600 text-sm">
              Guides détaillés et tutoriels
            </p>
          </Link>

          <a
            href="mailto:contact-synerj@teachtech.fr"
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-200 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-6 h-6 text-ds-info" />
              <h3 className="font-semibold text-slate-900 group-hover:text-ds-info transition-colors">
                Nous contacter
              </h3>
            </div>
            <p className="text-slate-600 text-sm">
              Support par e-mail
            </p>
          </a>
        </div>

        {/* Catégories d'aide */}
        <div className="space-y-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
            >
              {/* En-tête de catégorie */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-ds-info-soft text-ds-info p-3 rounded-lg">
                    {category.icon}
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-semibold text-slate-900">
                      {category.title}
                    </h2>
                    <p className="text-slate-600 text-sm mt-1">
                      {category.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {category.articles.length} {category.articles.length > 1 ? 'articles' : 'article'}
                  </span>
                  {expandedCategory === category.id ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Articles de la catégorie */}
              {expandedCategory === category.id && (
                <div className="border-t border-slate-200 bg-slate-50">
                  {category.articles.map((article) => (
                    <div key={article.id} className="border-b border-slate-200 last:border-b-0">
                      <button
                        onClick={() => toggleArticle(article.id)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-ds-info">
                            {article.icon}
                          </div>
                          <h3 className="font-medium text-slate-900">
                            {article.title}
                          </h3>
                        </div>
                        {expandedArticle === article.id ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                      </button>

                      {expandedArticle === article.id && (
                        <div className="px-6 pb-6 bg-white">
                          <div
                            className="prose prose-slate prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message si aucun résultat */}
        {searchQuery && filteredCategories.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aucun résultat trouvé
            </h3>
            <p className="text-slate-600 mb-6">
              Essayez avec d'autres mots-clés ou consultez notre{' '}
              <Link to="/legal/faq" className="text-ds-info hover:text-ds-info underline">
                FAQ
              </Link>
            </p>
            <a
              href="mailto:contact-synerj@teachtech.fr"
              className="inline-flex items-center gap-2 bg-ds-info text-white px-6 py-3 rounded-lg hover:bg-ds-info transition-colors"
            >
              <Mail className="w-5 h-5" />
              Contacter le support
            </a>
          </div>
        )}

        {/* Section d'aide supplémentaire */}
        <div className="mt-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                Vous ne trouvez pas ce que vous cherchez ?
              </h2>
              <p className="text-ds-info">
                Notre équipe de support est là pour vous aider. Contactez-nous par e-mail 
                et nous vous répondrons dans les plus brefs délais.
              </p>
            </div>
            <a
              href="mailto:contact-synerj@teachtech.fr"
              className="bg-white text-ds-info px-8 py-3 rounded-lg font-semibold hover:bg-ds-info-soft transition-colors flex items-center gap-2 flex-shrink-0"
            >
              <Mail className="w-5 h-5" />
              Contacter le support
            </a>
          </div>
        </div>

        {/* Liens vers autres pages */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <Link to="/legal/notices" className="text-ds-info hover:text-ds-info underline">
            Mentions Légales
          </Link>
          <span className="text-slate-300">•</span>
          <Link to="/legal/privacy-policy" className="text-ds-info hover:text-ds-info underline">
            Politique de confidentialité
          </Link>
          <span className="text-slate-300">•</span>
          <Link to="/legal/terms" className="text-ds-info hover:text-ds-info underline">
            CGU
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HelpCenter;