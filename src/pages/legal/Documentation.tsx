import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Search, 
  Code, 
  Database, 
  Shield, 
  Zap, 
  Layout,
  Settings,
  Users,
  Calendar,
  Mail,
  Package,
  CreditCard,
  Globe,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info,
  Terminal,
  FileText,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  subsections: DocSubsection[];
}

interface DocSubsection {
  id: string;
  title: string;
  content: string;
}

const Documentation: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('introduction');

  const sections: DocSection[] = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'indigo',
      subsections: [
        {
          id: 'overview',
          title: 'Vue d\'ensemble de SynerJ',
          content: `
            <h3 class="text-xl font-semibold text-slate-900 mb-4">Qu'est-ce que SynerJ ?</h3>
            <p class="text-slate-700 mb-4">
              SynerJ est une plateforme SaaS (Software as a Service) moderne et complète conçue pour 
              simplifier la gestion des associations et clubs sportifs. Développée avec les technologies 
              web les plus récentes, SynerJ offre une solution tout-en-un pour :
            </p>
            <ul class="list-disc list-inside text-slate-700 mb-4 ml-4 space-y-2">
              <li>Gérer vos membres et leurs rôles</li>
              <li>Organiser et suivre vos événements</li>
              <li>Communiquer efficacement avec votre communauté</li>
              <li>Gérer vos sponsors et partenariats</li>
              <li>Réserver et gérer votre matériel</li>
              <li>Créer un site web public pour votre club</li>
              <li>Gérer les abonnements et paiements</li>
            </ul>
            
            <h4 class="text-lg font-semibold text-slate-900 mt-6 mb-3">🎯 Objectifs principaux</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-terracotta-soft border-l-4 border-terracotta p-4 rounded-r-lg">
                <p class="font-semibold text-terracotta-deep mb-1">Simplicité</p>
                <p class="text-terracotta-deep text-sm">Interface intuitive et facile à prendre en main</p>
              </div>
              <div class="bg-ds-success-soft border-l-4 border-ds-success p-4 rounded-r-lg">
                <p class="font-semibold text-ds-success mb-1">Centralisation</p>
                <p class="text-ds-success text-sm">Toutes vos données au même endroit</p>
              </div>
              <div class="bg-ds-info-soft border-l-4 border-ds-info p-4 rounded-r-lg">
                <p class="font-semibold text-ds-info mb-1">Collaboration</p>
                <p class="text-ds-info text-sm">Faciliter le travail d'équipe</p>
              </div>
              <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <p class="font-semibold text-amber-900 mb-1">Automatisation</p>
                <p class="text-amber-800 text-sm">Gagner du temps sur les tâches répétitives</p>
              </div>
            </div>
          `
        },
        {
          id: 'tech-stack',
          title: 'Stack technique',
          content: `
            <h3 class="text-xl font-semibold text-slate-900 mb-4">Technologies utilisées</h3>
            
            <div class="space-y-6">
              <div>
                <h4 class="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Code class="w-5 h-5 text-ds-info" />
                  Frontend
                </h4>
                <div class="bg-slate-50 rounded-lg p-4 space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-slate-900 font-medium">React 18</span>
                    <span class="text-slate-600 text-sm">Framework UI</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-900 font-medium">TypeScript</span>
                    <span class="text-slate-600 text-sm">Typage statique</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-900 font-medium">Vite 5</span>
                    <span class="text-slate-600 text-sm">Build tool rapide</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-900 font-medium">React Router v7</span>
                    <span class="text-slate-600 text-sm">Routing client-side</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-900 font-medium">Tailwind CSS 3</span>
                    <span class="text-slate-600 text-sm">Framework CSS utility-first</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-900 font-medium">Framer Motion</span>
                    <span class="text-slate-600 text-sm">Animations fluides</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-900 font-medium">Lucide React</span>
                    <span class="text-slate-600 text-sm">Bibliothèque d'icônes</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-900 font-medium">React Hook Form</span>
                    <span class="text-slate-600 text-sm">Gestion de formulaires</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Database class="w-5 h-5 text-ds-info" />
                  Backend & Base de données
                </h4>
                <div class="bg-slate-50 rounded-lg p-4 space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-slate-900 font-medium">Supabase</span>
                    <span class="text-slate-600 text-sm">Backend as a Service (BaaS)</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-900 font-medium">PostgreSQL</span>
                    <span class="text-slate-600 text-sm">Base de données relationnelle</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-900 font-medium">Supabase Auth</span>
                    <span class="text-slate-600 text-sm">Authentification sécurisée</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-900 font-medium">Row Level Security (RLS)</span>
                    <span class="text-slate-600 text-sm">Sécurité au niveau des lignes</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-900 font-medium">Realtime Subscriptions</span>
                    <span class="text-slate-600 text-sm">Notifications en temps réel</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <CreditCard class="w-5 h-5 text-ds-info" />
                  Paiements & Facturation
                </h4>
                <div class="bg-slate-50 rounded-lg p-4 space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-slate-900 font-medium">Stripe</span>
                    <span class="text-slate-600 text-sm">Plateforme de paiement sécurisée</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-900 font-medium">Stripe Checkout</span>
                    <span class="text-slate-600 text-sm">Pages de paiement hébergées</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-900 font-medium">Customer Portal</span>
                    <span class="text-slate-600 text-sm">Gestion des abonnements</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Globe class="w-5 h-5 text-ds-info" />
                  Hébergement & Infrastructure
                </h4>
                <div class="bg-slate-50 rounded-lg p-4 space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-slate-900 font-medium">Vercel</span>
                    <span class="text-slate-600 text-sm">Hébergement frontend (Edge Network)</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-900 font-medium">Supabase Cloud</span>
                    <span class="text-slate-600 text-sm">Hébergement backend et données</span>
                  </div>
                </div>
              </div>
            </div>
          `
        },
        {
          id: 'architecture',
          title: 'Architecture de l\'application',
          content: `
            <h3 class="text-xl font-semibold text-slate-900 mb-4">Architecture globale</h3>
            
            <div class="bg-slate-50 rounded-lg p-6 mb-6">
              <pre class="text-sm text-slate-800 overflow-x-auto">
SynerJ/
├── src/
│   ├── pages/              # Pages/routes de l'application
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Events.tsx
│   │   ├── Associations.tsx
│   │   ├── Clubs.tsx
│   │   ├── MyClub.tsx
│   │   ├── Settings.tsx
│   │   ├── Sponsors.tsx
│   │   ├── Communications.tsx
│   │   ├── Mailing.tsx
│   │   ├── MonCalendrier.tsx
│   │   └── legal/          # Pages légales
│   │
│   ├── components/         # Composants réutilisables
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   ├── equipment/      # Gestion du matériel
│   │   └── sections/       # Sections landing page
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuthNew.ts
│   │   ├── useCalendar.ts
│   │   ├── useCommunications.ts
│   │   ├── useEquipment.ts
│   │   └── ...
│   │
│   ├── services/          # Logique métier & API
│   │   ├── commentsService.ts
│   │   ├── communicationService.ts
│   │   ├── equipmentService.ts
│   │   └── notificationService.ts
│   │
│   ├── types/             # Définitions TypeScript
│   │   └── index.ts
│   │
│   ├── lib/               # Utilitaires
│   │   └── supabase.ts
│   │
│   ├── config/            # Configuration
│   │
│   ├── App.tsx            # Routeur principal
│   └── main.tsx           # Point d'entrée
│
├── public/                # Assets statiques
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
              </pre>
            </div>

            <h4 class="text-lg font-semibold text-slate-900 mb-3">🏗️ Principes architecturaux</h4>
            <div class="space-y-3">
              <div class="bg-terracotta-soft border-l-4 border-terracotta p-4 rounded-r-lg">
                <p class="font-semibold text-terracotta-deep mb-1">Séparation des responsabilités</p>
                <p class="text-terracotta-deep text-sm">
                  Les pages gèrent l'affichage, les hooks gèrent l'état, les services gèrent la logique métier
                </p>
              </div>
              <div class="bg-ds-success-soft border-l-4 border-ds-success p-4 rounded-r-lg">
                <p class="font-semibold text-ds-success mb-1">Composants réutilisables</p>
                <p class="text-ds-success text-sm">
                  Code DRY (Don't Repeat Yourself) avec des composants modulaires
                </p>
              </div>
              <div class="bg-ds-info-soft border-l-4 border-ds-info p-4 rounded-r-lg">
                <p class="font-semibold text-ds-info mb-1">TypeScript strict</p>
                <p class="text-ds-info text-sm">
                  Typage fort pour éviter les bugs et améliorer la maintenabilité
                </p>
              </div>
              <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <p class="font-semibold text-amber-900 mb-1">Security-first</p>
                <p class="text-amber-800 text-sm">
                  RLS sur Supabase, authentification sécurisée, validation des données
                </p>
              </div>
            </div>
          `
        }
      ]
    },
    {
      id: 'authentication',
      title: 'Authentification & Sécurité',
      icon: <Shield className="w-5 h-5" />,
      color: 'green',
      subsections: [
        {
          id: 'auth-flow',
          title: 'Flux d\'authentification',
          content: `
            <h3 class="text-xl font-semibold text-slate-900 mb-4">Comment fonctionne l'authentification ?</h3>
            
            <p class="text-slate-700 mb-4">
              SynerJ utilise <strong>Supabase Auth</strong> pour gérer l'authentification de manière sécurisée. 
              Le flux d'authentification est le suivant :
            </p>

            <div class="bg-slate-50 rounded-lg p-6 mb-6">
              <ol class="list-decimal list-inside space-y-3 text-slate-700">
                <li>L'utilisateur saisit ses identifiants (email + mot de passe)</li>
                <li>Les identifiants sont envoyés de manière sécurisée (HTTPS) à Supabase Auth</li>
                <li>Supabase vérifie les identifiants et génère un JWT (JSON Web Token)</li>
                <li>Le JWT est stocké dans le localStorage du navigateur</li>
                <li>Chaque requête API inclut ce JWT dans les headers pour authentifier l'utilisateur</li>
                <li>Les règles RLS (Row Level Security) sur PostgreSQL vérifient les permissions</li>
              </ol>
            </div>

            <h4 class="text-lg font-semibold text-slate-900 mb-3">🔐 Méthodes d'authentification disponibles</h4>
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-slate-700">
                <CheckCircle class="w-5 h-5 text-ds-success" />
                <span>Email + Mot de passe (méthode principale)</span>
              </div>
              <div class="flex items-center gap-2 text-slate-700">
                <CheckCircle class="w-5 h-5 text-ds-success" />
                <span>Magic Link (lien de connexion par email)</span>
              </div>
              <div class="flex items-center gap-2 text-slate-700">
                <CheckCircle class="w-5 h-5 text-ds-success" />
                <span>Authentification à deux facteurs (2FA) - optionnel</span>
              </div>
            </div>

            <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-6">
              <p class="text-amber-900 font-semibold mb-2 flex items-center gap-2">
                <AlertCircle class="w-5 h-5" />
                Bonnes pratiques de sécurité
              </p>
              <ul class="list-disc list-inside text-amber-800 text-sm ml-4 space-y-1">
                <li>Utilisez un mot de passe unique et complexe (min. 8 caractères)</li>
                <li>Activez la 2FA pour une sécurité renforcée</li>
                <li>Ne partagez jamais vos identifiants</li>
                <li>Déconnectez-vous sur les ordinateurs partagés</li>
              </ul>
            </div>
          `
        },
        {
          id: 'roles-permissions',
          title: 'Rôles et permissions',
          content: `
            <h3 class="text-xl font-semibold text-slate-900 mb-4">Système de rôles multi-niveaux</h3>
            
            <p class="text-slate-700 mb-4">
              SynerJ implémente un système de contrôle d'accès basé sur les rôles (RBAC - Role-Based Access Control).
              Chaque utilisateur se voit attribuer un ou plusieurs rôles qui déterminent ses permissions.
            </p>

            <div class="space-y-4">
              <div class="bg-ds-danger-soft border-l-4 border-ds-danger p-4 rounded-r-lg">
                <h4 class="font-semibold text-ds-danger mb-2 flex items-center gap-2">
                  <Shield class="w-5 h-5" />
                  Super Admin
                </h4>
                <p class="text-ds-danger text-sm mb-2">Accès et contrôle complets sur toute la plateforme</p>
                <p class="text-ds-danger font-medium text-sm mb-1">Permissions :</p>
                <ul class="list-disc list-inside text-ds-danger text-sm ml-4 space-y-1">
                  <li>Gestion de toutes les associations et clubs</li>
                  <li>Gestion de tous les utilisateurs</li>
                  <li>Gestion du matériel (ajout, modification, suppression)</li>
                  <li>Validation des réservations de matériel</li>
                  <li>Accès aux statistiques globales</li>
                  <li>Configuration système</li>
                </ul>
              </div>

              <div class="bg-ds-info-soft border-l-4 border-ds-info p-4 rounded-r-lg">
                <h4 class="font-semibold text-ds-info mb-2 flex items-center gap-2">
                  <Users class="w-5 h-5" />
                  Administrateur de Club
                </h4>
                <p class="text-ds-info text-sm mb-2">Gestion complète de son club</p>
                <p class="text-ds-info font-medium text-sm mb-1">Permissions :</p>
                <ul class="list-disc list-inside text-ds-info text-sm ml-4 space-y-1">
                  <li>Gestion des membres de son club</li>
                  <li>Création et gestion d'événements</li>
                  <li>Publication de communications</li>
                  <li>Envoi de campagnes de mailing</li>
                  <li>Gestion des sponsors</li>
                  <li>Réservation de matériel</li>
                  <li>Personnalisation du club (logo, couleurs, etc.)</li>
                  <li>Consultation des statistiques du club</li>
                </ul>
              </div>

              <div class="bg-ds-success-soft border-l-4 border-ds-success p-4 rounded-r-lg">
                <h4 class="font-semibold text-ds-success mb-2 flex items-center gap-2">
                  <CheckCircle class="w-5 h-5" />
                  Membre
                </h4>
                <p class="text-ds-success text-sm mb-2">Utilisateur standard avec accès aux fonctionnalités de base</p>
                <p class="text-ds-success font-medium text-sm mb-1">Permissions :</p>
                <ul class="list-disc list-inside text-ds-success text-sm ml-4 space-y-1">
                  <li>Consultation des événements</li>
                  <li>Inscription aux événements</li>
                  <li>Consultation du calendrier</li>
                  <li>Lecture des communications</li>
                  <li>Commentaires et likes</li>
                  <li>Gestion de son profil personnel</li>
                </ul>
              </div>

              <div class="bg-terracotta-soft border-l-4 border-terracotta p-4 rounded-r-lg">
                <h4 class="font-semibold text-terracotta-deep mb-2 flex items-center gap-2">
                  <Info class="w-5 h-5" />
                  Supporter
                </h4>
                <p class="text-terracotta-deep text-sm mb-2">Suiveur du club sans participation active</p>
                <p class="text-terracotta-deep font-medium text-sm mb-1">Permissions :</p>
                <ul class="list-disc list-inside text-terracotta-deep text-sm ml-4 space-y-1">
                  <li>Consultation des événements publics</li>
                  <li>Réception des communications</li>
                  <li>Consultation du site web public du club</li>
                </ul>
              </div>

              <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <h4 class="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <CreditCard class="w-5 h-5" />
                  Sponsor
                </h4>
                <p class="text-amber-800 text-sm mb-2">Partenaire commercial avec visibilité</p>
                <p class="text-amber-900 font-medium text-sm mb-1">Permissions :</p>
                <ul class="list-disc list-inside text-amber-800 text-sm ml-4 space-y-1">
                  <li>Gestion de son profil sponsor</li>
                  <li>Consultation des statistiques de visibilité</li>
                  <li>Consultation des événements du club sponsorisé</li>
                  <li>Envoi de mailings (selon le niveau de partenariat)</li>
                </ul>
              </div>
            </div>

            <div class="bg-slate-100 rounded-lg p-4 mt-6">
              <p class="text-slate-900 font-semibold mb-2">💡 Comment sont appliquées les permissions ?</p>
              <p class="text-slate-700 text-sm">
                Les permissions sont appliquées à deux niveaux : <strong>côté client</strong> (masquage des 
                éléments UI non autorisés) et <strong>côté serveur</strong> (Row Level Security sur Supabase). 
                Même si un utilisateur contourne les restrictions client, le serveur bloque toute action non autorisée.
              </p>
            </div>
          `
        },
        {
          id: 'data-security',
          title: 'Sécurité des données',
          content: `
            <h3 class="text-xl font-semibold text-slate-900 mb-4">Protection et sécurisation des données</h3>
            
            <div class="space-y-4">
              <div class="bg-ds-success-soft border-l-4 border-ds-success p-4 rounded-r-lg">
                <h4 class="font-semibold text-ds-success mb-2 flex items-center gap-2">
                  <Shield class="w-5 h-5" />
                  Chiffrement des données
                </h4>
                <ul class="list-disc list-inside text-ds-success text-sm ml-4 space-y-1">
                  <li><strong>En transit :</strong> TLS 1.3 / SSL pour toutes les communications (HTTPS)</li>
                  <li><strong>Au repos :</strong> AES-256 pour le stockage des données sur Supabase</li>
                  <li><strong>Mots de passe :</strong> Hachage bcrypt avec salt unique par utilisateur</li>
                  <li><strong>Tokens :</strong> JWT signés avec algorithme HS256</li>
                </ul>
              </div>

              <div class="bg-terracotta-soft border-l-4 border-terracotta p-4 rounded-r-lg">
                <h4 class="font-semibold text-terracotta-deep mb-2 flex items-center gap-2">
                  <Database class="w-5 h-5" />
                  Row Level Security (RLS)
                </h4>
                <p class="text-terracotta-deep text-sm mb-2">
                  Chaque table PostgreSQL est protégée par des politiques RLS qui garantissent que :
                </p>
                <ul class="list-disc list-inside text-terracotta-deep text-sm ml-4 space-y-1">
                  <li>Un utilisateur ne peut accéder qu'à ses propres données</li>
                  <li>Un membre ne voit que les données de son club</li>
                  <li>Un admin de club ne peut gérer que son club</li>
                  <li>Les données sensibles (emails, téléphones) ne sont visibles que par les autorisés</li>
                </ul>
              </div>

              <div class="bg-ds-info-soft border-l-4 border-ds-info p-4 rounded-r-lg">
                <h4 class="font-semibold text-ds-info mb-2 flex items-center gap-2">
                  <CheckCircle class="w-5 h-5" />
                  Conformité RGPD
                </h4>
                <ul class="list-disc list-inside text-ds-info text-sm ml-4 space-y-1">
                  <li>Consentement explicite lors de l'inscription</li>
                  <li>Droit d'accès, de rectification, d'effacement</li>
                  <li>Portabilité des données (export CSV/JSON)</li>
                  <li>Durées de conservation définies</li>
                  <li>Registre des traitements maintenu</li>
                  <li>Notification en cas de violation de données (< 72h)</li>
                </ul>
              </div>

              <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <h4 class="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <AlertCircle class="w-5 h-5" />
                  Sauvegardes et récupération
                </h4>
                <ul class="list-disc list-inside text-amber-800 text-sm ml-4 space-y-1">
                  <li>Sauvegardes automatiques quotidiennes sur Supabase</li>
                  <li>Rétention des sauvegardes : 7 jours (plan standard)</li>
                  <li>Point-in-time recovery (PITR) disponible</li>
                  <li>Réplication multi-régions pour haute disponibilité</li>
                </ul>
              </div>

              <div class="bg-ds-danger-soft border-l-4 border-ds-danger p-4 rounded-r-lg">
                <h4 class="font-semibold text-ds-danger mb-2 flex items-center gap-2">
                  <Shield class="w-5 h-5" />
                  Protection contre les attaques
                </h4>
                <ul class="list-disc list-inside text-ds-danger text-sm ml-4 space-y-1">
                  <li><strong>SQL Injection :</strong> Requêtes paramétrées via Supabase client</li>
                  <li><strong>XSS :</strong> Sanitisation des inputs utilisateur</li>
                  <li><strong>CSRF :</strong> Tokens CSRF sur les actions sensibles</li>
                  <li><strong>DDoS :</strong> Rate limiting sur les API</li>
                  <li><strong>Brute force :</strong> Limitation des tentatives de connexion</li>
                </ul>
              </div>
            </div>
          `
        }
      ]
    },
    {
      id: 'features',
      title: 'Fonctionnalités principales',
      icon: <Zap className="w-5 h-5" />,
      color: 'blue',
      subsections: [
        {
          id: 'events-management',
          title: 'Gestion des événements',
          content: `
            <h3 class="text-xl font-semibold text-slate-900 mb-4">Système de gestion d'événements</h3>
            
            <p class="text-slate-700 mb-4">
              Le module de gestion d'événements permet de créer, organiser et suivre tous types d'événements 
              pour votre association : entraînements, compétitions, réunions, événements sociaux, etc.
            </p>

            <h4 class="text-lg font-semibold text-slate-900 mb-3">🎯 Fonctionnalités clés</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div class="bg-terracotta-soft p-4 rounded-lg">
                <p class="font-semibold text-terracotta-deep mb-1">✅ Création d'événements</p>
                <p class="text-terracotta-deep text-sm">Formulaire complet avec tous les détails nécessaires</p>
              </div>
              <div class="bg-terracotta-soft p-4 rounded-lg">
                <p class="font-semibold text-terracotta-deep mb-1">📅 Vue calendrier</p>
                <p class="text-terracotta-deep text-sm">Visualisation mensuelle, hebdomadaire, quotidienne</p>
              </div>
              <div class="bg-terracotta-soft p-4 rounded-lg">
                <p class="font-semibold text-terracotta-deep mb-1">👥 Gestion des participants</p>
                <p class="text-terracotta-deep text-sm">Inscriptions, confirmations, liste d'attente</p>
              </div>
              <div class="bg-terracotta-soft p-4 rounded-lg">
                <p class="font-semibold text-terracotta-deep mb-1">🔔 Notifications automatiques</p>
                <p class="text-terracotta-deep text-sm">Rappels avant événement, modifications, annulations</p>
              </div>
              <div class="bg-terracotta-soft p-4 rounded-lg">
                <p class="font-semibold text-terracotta-deep mb-1">💬 Commentaires et likes</p>
                <p class="text-terracotta-deep text-sm">Interaction sociale autour des événements</p>
              </div>
              <div class="bg-terracotta-soft p-4 rounded-lg">
                <p class="font-semibold text-terracotta-deep mb-1">📊 Statistiques</p>
                <p class="text-terracotta-deep text-sm">Taux de participation, événements populaires</p>
              </div>
            </div>

            <h4 class="text-lg font-semibold text-slate-900 mb-3">📋 Structure d'un événement</h4>
            <div class="bg-slate-50 rounded-lg p-4">
              <pre class="text-sm text-slate-800 overflow-x-auto">
{
  "id": "uuid",
  "title": "Entraînement hebdomadaire",
  "description": "Description de l'événement...",
  "event_type": "training",
  "start_date": "2025-10-30T18:00:00Z",
  "end_date": "2025-10-30T20:00:00Z",
  "location": "Gymnase municipal",
  "max_participants": 30,
  "is_public": true,
  "club_id": "uuid",
  "created_by": "uuid",
  "image_url": "https://...",
  "status": "confirmed"
}
              </pre>
            </div>

            <div class="bg-ds-success-soft border-l-4 border-ds-success p-4 rounded-r-lg mt-4">
              <p class="text-ds-success font-semibold mb-2">💡 Bonnes pratiques</p>
              <ul class="list-disc list-inside text-ds-success text-sm ml-4 space-y-1">
                <li>Créez vos événements au moins 1 semaine à l'avance</li>
                <li>Ajoutez une image attractive pour plus d'engagement</li>
                <li>Activez les rappels automatiques 24h avant l'événement</li>
                <li>Limitez le nombre de participants pour mieux organiser</li>
              </ul>
            </div>
          `
        },
        {
          id: 'members-management',
          title: 'Gestion des membres',
          content: `
            <h3 class="text-xl font-semibold text-slate-900 mb-4">Système de gestion des membres</h3>
            
            <p class="text-slate-700 mb-4">
              Le module de gestion des membres permet d'inviter, organiser et suivre tous les membres 
              de votre association avec un système de rôles granulaire.
            </p>

            <h4 class="text-lg font-semibold text-slate-900 mb-3">👥 Fonctionnalités</h4>
            <ul class="list-disc list-inside text-slate-700 ml-4 space-y-2 mb-6">
              <li>Invitation par email (individuelle ou en masse)</li>
              <li>Génération de liens d'invitation uniques</li>
              <li>Gestion des rôles et permissions</li>
              <li>Annuaire des membres avec recherche et filtres</li>
              <li>Profils personnalisables (photo, bio, coordonnées)</li>
              <li>Historique d'activité par membre</li>
              <li>Statistiques d'engagement</li>
              <li>Export des listes de membres (CSV)</li>
            </ul>

            <h4 class="text-lg font-semibold text-slate-900 mb-3">🔄 Flux d'invitation</h4>
            <div class="bg-slate-50 rounded-lg p-6">
              <ol class="list-decimal list-inside space-y-2 text-slate-700">
                <li>L'admin envoie une invitation par email</li>
                <li>Le destinataire reçoit un lien d'inscription unique</li>
                <li>Il crée son compte avec ses informations</li>
                <li>L'admin peut valider l'inscription (si validation manuelle activée)</li>
                <li>Le nouveau membre accède à l'application avec ses permissions</li>
              </ol>
            </div>
          `
        },
        {
          id: 'communications',
          title: 'Communications et mailing',
          content: `
            <h3 class="text-xl font-semibold text-slate-900 mb-4">Système de communication</h3>
            
            <p class="text-slate-700 mb-4">
              SynerJ offre deux canaux de communication complémentaires : les publications internes 
              (feed social) et les campagnes d'emailing.
            </p>

            <h4 class="text-lg font-semibold text-slate-900 mb-3">📢 Publications / Communications</h4>
            <p class="text-slate-700 mb-2">Feed social interne à votre club :</p>
            <ul class="list-disc list-inside text-slate-700 ml-4 space-y-1 mb-6">
              <li>Texte enrichi avec formatage</li>
              <li>Images et fichiers joints</li>
              <li>Likes et commentaires</li>
              <li>Notifications en temps réel</li>
              <li>Épinglage des publications importantes</li>
              <li>Ciblage par groupes ou rôles</li>
            </ul>

            <h4 class="text-lg font-semibold text-slate-900 mb-3">✉️ Campagnes de mailing</h4>
            <p class="text-slate-700 mb-2">Emails professionnels à vos membres :</p>
            <ul class="list-disc list-inside text-slate-700 ml-4 space-y-1 mb-6">
              <li>Éditeur HTML WYSIWYG</li>
              <li>Templates personnalisables</li>
              <li>Sélection des destinataires (tous, groupe, rôle, liste custom)</li>
              <li>Prévisualisation avant envoi</li>
              <li>Envoi de test</li>
              <li>Programmation d'envoi différé</li>
              <li>Statistiques d'ouverture et de clics (si suivi activé)</li>
              <li>Gestion des désabonnements (conformité RGPD)</li>
            </ul>

            <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <p class="text-amber-900 font-semibold mb-2">⚠️ Limites d'envoi</p>
              <p class="text-amber-800 text-sm">
                Le nombre d'emails envoyés par mois dépend de votre plan d'abonnement. 
                Vérifiez vos quotas dans Paramètres > Abonnement.
              </p>
            </div>
          `
        },
        {
          id: 'equipment',
          title: 'Gestion du matériel',
          content: `
            <h3 class="text-xl font-semibold text-slate-900 mb-4">Système de gestion et réservation de matériel</h3>
            
            <p class="text-slate-700 mb-4">
              Module complet pour gérer l'inventaire de matériel et les réservations entre clubs.
            </p>

            <h4 class="text-lg font-semibold text-slate-900 mb-3">📦 Fonctionnalités</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div class="bg-slate-50 p-4 rounded-lg">
                <p class="font-semibold text-slate-900 mb-2">Inventaire centralisé</p>
                <ul class="list-disc list-inside text-slate-700 text-sm ml-4 space-y-1">
                  <li>Catalogue de matériel complet</li>
                  <li>Photos et descriptions</li>
                  <li>État et disponibilité</li>
                  <li>Catégorisation</li>
                </ul>
              </div>
              <div class="bg-slate-50 p-4 rounded-lg">
                <p class="font-semibold text-slate-900 mb-2">Réservations</p>
                <ul class="list-disc list-inside text-slate-700 text-sm ml-4 space-y-1">
                  <li>Demandes de réservation</li>
                  <li>Validation par Super Admin</li>
                  <li>Calendrier de disponibilité</li>
                  <li>Notifications automatiques</li>
                </ul>
              </div>
              <div class="bg-slate-50 p-4 rounded-lg">
                <p class="font-semibold text-slate-900 mb-2">Suivi et statistiques</p>
                <ul class="list-disc list-inside text-slate-700 text-sm ml-4 space-y-1">
                  <li>Historique des réservations</li>
                  <li>Taux d'utilisation</li>
                  <li>Matériel populaire</li>
                  <li>Export des données</li>
                </ul>
              </div>
              <div class="bg-slate-50 p-4 rounded-lg">
                <p class="font-semibold text-slate-900 mb-2">Gestion avancée</p>
                <ul class="list-disc list-inside text-slate-700 text-sm ml-4 space-y-1">
                  <li>Maintenance et réparations</li>
                  <li>Alertes de disponibilité</li>
                  <li>Gestion des conflits</li>
                  <li>Tableaux de bord dédiés</li>
                </ul>
              </div>
            </div>

            <h4 class="text-lg font-semibold text-slate-900 mb-3">🔄 Workflow de réservation</h4>
            <div class="bg-terracotta-soft rounded-lg p-6">
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <div class="bg-terracotta text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                  <p class="text-terracotta-deep text-sm"><strong>Admin Club</strong> sélectionne le matériel et les dates</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="bg-terracotta text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                  <p class="text-terracotta-deep text-sm"><strong>Demande créée</strong> avec statut "En attente"</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="bg-terracotta text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                  <p class="text-terracotta-deep text-sm"><strong>Super Admin</strong> reçoit une notification</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="bg-terracotta text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">4</div>
                  <p class="text-terracotta-deep text-sm"><strong>Validation ou refus</strong> de la demande</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="bg-terracotta text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">5</div>
                  <p class="text-terracotta-deep text-sm"><strong>Notification</strong> envoyée au demandeur</p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="bg-terracotta text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">6</div>
                  <p class="text-terracotta-deep text-sm"><strong>Matériel bloqué</strong> pour les dates réservées</p>
                </div>
              </div>
            </div>
          `
        },
        {
          id: 'sponsors',
          title: 'Gestion des sponsors',
          content: `
            <h3 class="text-xl font-semibold text-slate-900 mb-4">Système de gestion des sponsors et partenariats</h3>
            
            <p class="text-slate-700 mb-4">
              Module dédié pour gérer vos sponsors, suivre les partenariats et maximiser leur visibilité.
            </p>

            <h4 class="text-lg font-semibold text-slate-900 mb-3">🤝 Fonctionnalités sponsors</h4>
            <ul class="list-disc list-inside text-slate-700 ml-4 space-y-2 mb-6">
              <li>Profils sponsors détaillés (logo, description, site web, réseaux sociaux)</li>
              <li>Niveaux de partenariat personnalisables (Bronze, Argent, Or, Platine, etc.)</li>
              <li>Gestion des contrats et durées de partenariat</li>
              <li>Visibilité modulable selon le niveau</li>
              <li>Carrousel automatique sur le tableau de bord</li>
              <li>Section dédiée sur le site web public du club</li>
              <li>Statistiques de visibilité et d'engagement</li>
              <li>Export des données sponsors</li>
            </ul>

            <h4 class="text-lg font-semibold text-slate-900 mb-3">🎯 Emplacements d'affichage</h4>
            <div class="space-y-2 mb-6">
              <div class="flex items-center gap-2 text-slate-700">
                <CheckCircle class="w-5 h-5 text-ds-success" />
                <span>Bannière sur le tableau de bord</span>
              </div>
              <div class="flex items-center gap-2 text-slate-700">
                <CheckCircle class="w-5 h-5 text-ds-success" />
                <span>Carrousel dans les pages d'événements</span>
              </div>
              <div class="flex items-center gap-2 text-slate-700">
                <CheckCircle class="w-5 h-5 text-ds-success" />
                <span>Page sponsors dédiée sur le site web public</span>
              </div>
              <div class="flex items-center gap-2 text-slate-700">
                <CheckCircle class="w-5 h-5 text-ds-success" />
                <span>Footer des emails (plans Premium)</span>
              </div>
            </div>

            <div class="bg-ds-success-soft border-l-4 border-ds-success p-4 rounded-r-lg">
              <p class="text-ds-success font-semibold mb-2">💡 Maximiser la visibilité</p>
              <ul class="list-disc list-inside text-ds-success text-sm ml-4 space-y-1">
                <li>Ajoutez des logos haute résolution (PNG transparent recommandé)</li>
                <li>Rédigez des descriptions attractives avec mots-clés</li>
                <li>Liez les sponsors à des événements spécifiques</li>
                <li>Partagez les statistiques de visibilité avec vos sponsors</li>
              </ul>
            </div>
          `
        }
      ]
    },
    {
      id: 'subscription',
      title: 'Abonnements et paiements',
      icon: <CreditCard className="w-5 h-5" />,
      color: 'amber',
      subsections: [
        {
          id: 'pricing-plans',
          title: 'Plans tarifaires',
          content: `
            <h3 class="text-xl font-semibold text-slate-900 mb-4">Formules d'abonnement</h3>
            
            <div class="space-y-4">
              <div class="bg-slate-50 border-2 border-slate-300 rounded-xl p-6">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-xl font-bold text-slate-900">Plan Gratuit</h4>
                  <span class="text-3xl font-bold text-slate-900">0€</span>
                </div>
                <p class="text-slate-600 mb-4">Idéal pour débuter et tester la plateforme</p>
                <ul class="space-y-2 text-slate-700 text-sm">
                  <li class="flex items-start gap-2">
                    <CheckCircle class="w-5 h-5 text-ds-success flex-shrink-0 mt-0.5" />
                    <span>Jusqu'à <strong>50 membres</strong></span>
                  </li>
                  <li class="flex items-start gap-2">
                    <CheckCircle class="w-5 h-5 text-ds-success flex-shrink-0 mt-0.5" />
                    <span><strong>10 événements/mois</strong></span>
                  </li>
                  <li class="flex items-start gap-2">
                    <CheckCircle class="w-5 h-5 text-ds-success flex-shrink-0 mt-0.5" />
                    <span><strong>500 Mo</strong> de stockage</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <CheckCircle class="w-5 h-5 text-ds-success flex-shrink-0 mt-0.5" />
                    <span>Fonctionnalités de base</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <CheckCircle class="w-5 h-5 text-ds-success flex-shrink-0 mt-0.5" />
                    <span>Support par email</span>
                  </li>
                </ul>
              </div>

              <div class="bg-terracotta-soft border-2 border-terracotta rounded-xl p-6">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-xl font-bold text-terracotta-deep">Plan Essentiel</h4>
                  <span class="text-3xl font-bold text-terracotta-deep">Sur devis</span>
                </div>
                <p class="text-terracotta-deep mb-4">Pour les associations en croissance</p>
                <ul class="space-y-2 text-terracotta-deep text-sm">
                  <li class="flex items-start gap-2">
                    <CheckCircle class="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
                    <span>Jusqu'à <strong>200 membres</strong></span>
                  </li>
                  <li class="flex items-start gap-2">
                    <CheckCircle class="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
                    <span><strong>Événements illimités</strong></span>
                  </li>
                  <li class="flex items-start gap-2">
                    <CheckCircle class="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
                    <span><strong>5 Go</strong> de stockage</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <CheckCircle class="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
                    <span>Gestion des sponsors</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <CheckCircle class="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
                    <span>Mailing avancé</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <CheckCircle class="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
                    <span>Support prioritaire</span>
                  </li>
                </ul>
              </div>

              <div class="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-ds-info rounded-xl p-6 relative overflow-hidden">
                <div class="absolute top-0 right-0 bg-ds-info text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                  POPULAIRE
                </div>
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-xl font-bold text-ds-info">Plan Premium</h4>
                  <span class="text-3xl font-bold text-ds-info">Sur devis</span>
                </div>
                <p class="text-ds-info mb-4">Pour les grandes structures et fédérations</p>
                <ul class="space-y-2 text-ds-info text-sm">
                  <li class="flex items-start gap-2">
                    <CheckCircle class="w-5 h-5 text-ds-info flex-shrink-0 mt-0.5" />
                    <span><strong>Membres illimités</strong></span>
                  </li>
                  <li class="flex items-start gap-2">
                    <CheckCircle class="w-5 h-5 text-ds-info flex-shrink-0 mt-0.5" />
                    <span><strong>Événements illimités</strong></span>
                  </li>
                  <li class="flex items-start gap-2">
                    <CheckCircle class="w-5 h-5 text-ds-info flex-shrink-0 mt-0.5" />
                    <span><strong>Stockage illimité</strong></span>
                  </li>
                  <li class="flex items-start gap-2">
                    <CheckCircle class="w-5 h-5 text-ds-info flex-shrink-0 mt-0.5" />
                    <span>Site web personnalisé pour le club</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <CheckCircle class="w-5 h-5 text-ds-info flex-shrink-0 mt-0.5" />
                    <span>Gestion multi-clubs</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <CheckCircle class="w-5 h-5 text-ds-info flex-shrink-0 mt-0.5" />
                    <span>API et intégrations</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <CheckCircle class="w-5 h-5 text-ds-info flex-shrink-0 mt-0.5" />
                    <span>Support 24/7</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <CheckCircle class="w-5 h-5 text-ds-info flex-shrink-0 mt-0.5" />
                    <span>Gestionnaire de compte dédié</span>
                  </li>
                </ul>
              </div>
            </div>
          `
        },
        {
          id: 'stripe-integration',
          title: 'Intégration Stripe',
          content: `
            <h3 class="text-xl font-semibold text-slate-900 mb-4">Paiements sécurisés avec Stripe</h3>
            
            <p class="text-slate-700 mb-4">
              SynerJ utilise <strong>Stripe</strong>, leader mondial du paiement en ligne, pour gérer 
              tous les aspects de facturation et paiements de manière 100% sécurisée.
            </p>

            <h4 class="text-lg font-semibold text-slate-900 mb-3">💳 Fonctionnalités Stripe</h4>
            <div class="space-y-3 mb-6">
              <div class="bg-ds-success-soft border-l-4 border-ds-success p-4 rounded-r-lg">
                <p class="font-semibold text-ds-success mb-1">Stripe Checkout</p>
                <p class="text-ds-success text-sm">
                  Pages de paiement hébergées et sécurisées par Stripe. Vous êtes redirigé vers un 
                  environnement Stripe pour effectuer le paiement, puis redirigé vers SynerJ.
                </p>
              </div>
              <div class="bg-terracotta-soft border-l-4 border-terracotta p-4 rounded-r-lg">
                <p class="font-semibold text-terracotta-deep mb-1">Customer Portal</p>
                <p class="text-terracotta-deep text-sm">
                  Portail client sécurisé pour gérer vos moyens de paiement, consulter vos factures, 
                  et modifier votre abonnement.
                </p>
              </div>
              <div class="bg-ds-info-soft border-l-4 border-ds-info p-4 rounded-r-lg">
                <p class="font-semibold text-ds-info mb-1">Abonnements récurrents</p>
                <p class="text-ds-info text-sm">
                  Gestion automatique des renouvellements mensuels ou annuels. Vous recevez une 
                  facture par email à chaque paiement.
                </p>
              </div>
            </div>

            <h4 class="text-lg font-semibold text-slate-900 mb-3">🔒 Sécurité des paiements</h4>
            <ul class="list-disc list-inside text-slate-700 ml-4 space-y-1 mb-6">
              <li><strong>Certification PCI-DSS niveau 1</strong> (plus haut niveau de sécurité)</li>
              <li><strong>3D Secure</strong> pour l'authentification forte</li>
              <li><strong>Chiffrement TLS 1.3</strong> pour toutes les transactions</li>
              <li><strong>Détection de fraude</strong> automatique par IA (Stripe Radar)</li>
              <li><strong>Aucune donnée bancaire</strong> stockée sur nos serveurs</li>
            </ul>

            <h4 class="text-lg font-semibold text-slate-900 mb-3">🔄 Workflow de paiement</h4>
            <div class="bg-slate-50 rounded-lg p-6">
              <ol class="list-decimal list-inside space-y-2 text-slate-700">
                <li>Sélectionnez votre plan dans SynerJ</li>
                <li>Cliquez sur "Souscrire" ou "Mettre à niveau"</li>
                <li>Vous êtes redirigé vers Stripe Checkout (page sécurisée)</li>
                <li>Entrez vos informations de paiement</li>
                <li>Validez le paiement</li>
                <li>Vous êtes redirigé vers SynerJ avec confirmation</li>
                <li>Votre abonnement est activé immédiatement</li>
                <li>Vous recevez une facture par email</li>
              </ol>
            </div>

            <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-6">
              <p class="text-amber-900 font-semibold mb-2 flex items-center gap-2">
                <AlertCircle class="w-5 h-5" />
                En cas de problème de paiement
              </p>
              <p class="text-amber-800 text-sm">
                Si votre paiement échoue (carte expirée, solde insuffisant), vous recevrez un email 
                avec des instructions. Mettez à jour votre carte via le Customer Portal pour éviter 
                la suspension de votre compte.
              </p>
            </div>
          `
        }
      ]
    },
    {
      id: 'api',
      title: 'API et intégrations',
      icon: <Terminal className="w-5 h-5" />,
      color: 'purple',
      subsections: [
        {
          id: 'api-overview',
          title: 'Vue d\'ensemble de l\'API',
          content: `
            <h3 class="text-xl font-semibold text-slate-900 mb-4">API REST SynerJ</h3>
            
            <div class="bg-terracotta-soft border-l-4 border-terracotta p-4 rounded-r-lg mb-6">
              <p class="text-terracotta-deep font-semibold mb-2 flex items-center gap-2">
                <Info class="w-5 h-5" />
                Disponibilité
              </p>
              <p class="text-terracotta-deep text-sm">
                L'API REST de SynerJ est disponible uniquement pour les clients <strong>Plan Premium</strong>. 
                Contactez-nous pour obtenir vos clés API.
              </p>
            </div>

            <h4 class="text-lg font-semibold text-slate-900 mb-3">📡 Points d'accès API</h4>
            <p class="text-slate-700 mb-3">Base URL : <code class="bg-slate-100 px-2 py-1 rounded">https://api.synerj.app/v1</code></p>
            
            <div class="bg-slate-50 rounded-lg p-4 mb-6">
              <p class="font-semibold text-slate-900 mb-3">Endpoints disponibles :</p>
              <div class="space-y-2 text-sm font-mono">
                <div class="flex items-center gap-2">
                  <span class="bg-ds-success text-white px-2 py-1 rounded text-xs">GET</span>
                  <span class="text-slate-700">/clubs</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="bg-ds-success text-white px-2 py-1 rounded text-xs">GET</span>
                  <span class="text-slate-700">/clubs/:id</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="bg-ds-success text-white px-2 py-1 rounded text-xs">GET</span>
                  <span class="text-slate-700">/events</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="bg-terracotta text-white px-2 py-1 rounded text-xs">POST</span>
                  <span class="text-slate-700">/events</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="bg-ds-success text-white px-2 py-1 rounded text-xs">GET</span>
                  <span class="text-slate-700">/members</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="bg-amber-600 text-white px-2 py-1 rounded text-xs">PUT</span>
                  <span class="text-slate-700">/members/:id</span>
                </div>
              </div>
            </div>

            <h4 class="text-lg font-semibold text-slate-900 mb-3">🔑 Authentification</h4>
            <p class="text-slate-700 mb-3">Toutes les requêtes API nécessitent une clé API dans les headers :</p>
            <div class="bg-slate-900 text-white rounded-lg p-4 mb-6">
              <pre class="text-sm overflow-x-auto"><code>Authorization: Bearer YOUR_API_KEY
Content-Type: application/json</code></pre>
            </div>

            <h4 class="text-lg font-semibold text-slate-900 mb-3">📝 Exemple de requête</h4>
            <div class="bg-slate-900 text-white rounded-lg p-4">
              <pre class="text-sm overflow-x-auto"><code>curl -X GET "https://api.synerj.app/v1/events" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"</code></pre>
            </div>
          `
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Dépannage',
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'red',
      subsections: [
        {
          id: 'common-issues',
          title: 'Problèmes courants',
          content: `
            <h3 class="text-xl font-semibold text-slate-900 mb-4">Solutions aux problèmes fréquents</h3>
            
            <div class="space-y-4">
              <div class="bg-ds-danger-soft border-l-4 border-ds-danger p-4 rounded-r-lg">
                <h4 class="font-semibold text-ds-danger mb-2">❌ Je ne peux pas me connecter</h4>
                <p class="text-ds-danger text-sm mb-2"><strong>Solutions :</strong></p>
                <ul class="list-disc list-inside text-ds-danger text-sm ml-4 space-y-1">
                  <li>Vérifiez que votre email et mot de passe sont corrects</li>
                  <li>Vérifiez que vous avez validé votre email (cliquez sur le lien reçu)</li>
                  <li>Utilisez "Mot de passe oublié" pour réinitialiser</li>
                  <li>Vérifiez que JavaScript et les cookies sont activés</li>
                  <li>Essayez en navigation privée pour éliminer les problèmes de cache</li>
                </ul>
              </div>

              <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <h4 class="font-semibold text-amber-900 mb-2">⚠️ La page ne charge pas / erreur 500</h4>
                <p class="text-amber-800 text-sm mb-2"><strong>Solutions :</strong></p>
                <ul class="list-disc list-inside text-amber-800 text-sm ml-4 space-y-1">
                  <li>Rafraîchissez la page (Ctrl+R ou Cmd+R)</li>
                  <li>Videz le cache de votre navigateur</li>
                  <li>Vérifiez votre connexion Internet</li>
                  <li>Essayez un autre navigateur</li>
                  <li>Si le problème persiste, contactez le support</li>
                </ul>
              </div>

              <div class="bg-terracotta-soft border-l-4 border-terracotta p-4 rounded-r-lg">
                <h4 class="font-semibold text-terracotta-deep mb-2">📧 Je ne reçois pas les emails</h4>
                <p class="text-terracotta-deep text-sm mb-2"><strong>Solutions :</strong></p>
                <ul class="list-disc list-inside text-terracotta-deep text-sm ml-4 space-y-1">
                  <li>Vérifiez votre dossier spam/courrier indésirable</li>
                  <li>Ajoutez noreply@synerj.app à vos contacts</li>
                  <li>Vérifiez que votre adresse email est correcte dans vos paramètres</li>
                  <li>Contactez votre fournisseur email (certains bloquent les emails automatiques)</li>
                </ul>
              </div>

              <div class="bg-ds-success-soft border-l-4 border-ds-success p-4 rounded-r-lg">
                <h4 class="font-semibold text-ds-success mb-2">💳 Mon paiement a échoué</h4>
                <p class="text-ds-success text-sm mb-2"><strong>Solutions :</strong></p>
                <ul class="list-disc list-inside text-ds-success text-sm ml-4 space-y-1">
                  <li>Vérifiez que votre carte n'est pas expirée</li>
                  <li>Vérifiez le solde de votre compte</li>
                  <li>Assurez-vous que la 3D Secure est activée</li>
                  <li>Essayez avec une autre carte</li>
                  <li>Contactez votre banque (certaines bloquent les paiements en ligne)</li>
                  <li>Si le problème persiste, contactez notre support</li>
                </ul>
              </div>

              <div class="bg-ds-info-soft border-l-4 border-ds-info p-4 rounded-r-lg">
                <h4 class="font-semibold text-ds-info mb-2">📱 L'application est lente sur mobile</h4>
                <p class="text-ds-info text-sm mb-2"><strong>Solutions :</strong></p>
                <ul class="list-disc list-inside text-ds-info text-sm ml-4 space-y-1">
                  <li>Fermez les autres onglets du navigateur</li>
                  <li>Fermez les applications en arrière-plan</li>
                  <li>Vérifiez votre connexion 4G/5G ou WiFi</li>
                  <li>Mettez à jour votre navigateur</li>
                  <li>Redémarrez votre téléphone</li>
                </ul>
              </div>
            </div>

            <div class="bg-slate-100 rounded-lg p-6 mt-6">
              <p class="text-slate-900 font-semibold mb-3 flex items-center gap-2">
                <Mail class="w-5 h-5 text-ds-info" />
                Toujours un problème ?
              </p>
              <p class="text-slate-700 text-sm mb-3">
                Si aucune de ces solutions ne fonctionne, contactez notre support technique :
              </p>
              <a 
                href="mailto:contact-synerj@teachtech.fr"
                class="inline-flex items-center gap-2 bg-ds-info text-white px-6 py-3 rounded-lg hover:bg-ds-info transition-colors text-sm font-medium"
              >
                <Mail class="w-4 h-4" />
                contact-synerj@teachtech.fr
              </a>
            </div>
          `
        }
      ]
    }
  ];

  // Filtrer les sections selon la recherche
  const filteredSections = sections.map(section => ({
    ...section,
    subsections: section.subsections.filter(sub =>
      searchQuery === '' ||
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.subsections.length > 0 || searchQuery === '');

  const activeSubsection = sections
    .flatMap(s => s.subsections)
    .find(sub => sub.id === activeSection);

  const currentSection = sections.find(s =>
    s.subsections.some(sub => sub.id === activeSection)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-ds-info hover:text-ds-info transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-ds-info" />
            Documentation technique
          </h1>
          <p className="text-slate-600 mt-2">
            Guide complet pour comprendre et utiliser SynerJ
          </p>

          {/* Barre de recherche */}
          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher dans la documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Liens rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/legal/help-center"
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-200 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <HelpCircle className="w-6 h-6 text-ds-info" />
              <h3 className="font-semibold text-slate-900 group-hover:text-ds-info transition-colors">
                Centre d'aide
              </h3>
            </div>
            <p className="text-slate-600 text-sm">
              Guides pratiques et tutoriels
            </p>
          </Link>

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

          <a
            href="mailto:contact-synerj@teachtech.fr"
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-200 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-6 h-6 text-ds-info" />
              <h3 className="font-semibold text-slate-900 group-hover:text-ds-info transition-colors">
                Support technique
              </h3>
            </div>
            <p className="text-slate-600 text-sm">
              Contactez notre équipe
            </p>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar navigation */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                Sommaire
              </h2>
              <nav className="space-y-1">
                {filteredSections.map((section) => (
                  <div key={section.id}>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm ${
                      currentSection?.id === section.id
                        ? `bg-${section.color}-50 text-${section.color}-700`
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}>
                      {section.icon}
                      <span>{section.title}</span>
                    </div>
                    {section.subsections.length > 0 && (
                      <div className="ml-4 mt-1 space-y-1">
                        {section.subsections.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => setActiveSection(sub.id)}
                            className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                              activeSection === sub.id
                                ? `bg-${section.color}-100 text-${section.color}-900 font-medium`
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {sub.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            {activeSubsection ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
                  <span>{currentSection?.title}</span>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-slate-900 font-medium">{activeSubsection.title}</span>
                </div>

                {/* Contenu */}
                <div 
                  className="prose prose-slate prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: activeSubsection.content }}
                />
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Bienvenue dans la documentation SynerJ
                </h3>
                <p className="text-slate-600">
                  Sélectionnez une section dans le menu pour commencer
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-12 flex flex-wrap justify-center gap-4 text-sm">
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

export default Documentation;