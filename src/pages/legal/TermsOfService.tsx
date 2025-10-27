import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Shield, Users, CreditCard, XCircle, Scale, Clock, UserCheck, Lock } from 'lucide-react';

const TermsOfService: React.FC = () => {
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
            <FileText className="w-8 h-8 text-indigo-600" />
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-slate-600 mt-2">
            Conditions régissant l'utilisation de la plateforme SynerJ
          </p>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          
          {/* Avertissement important */}
          <section>
            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-lg font-semibold text-indigo-900 mb-2">
                    Veuillez lire attentivement ces conditions
                  </h2>
                  <p className="text-indigo-800 text-sm">
                    En utilisant SynerJ, vous acceptez sans réserve les présentes Conditions Générales 
                    d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Table des matières */}
          <section className="bg-slate-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Sommaire</h2>
            <nav className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <a href="#article1" className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm">
                1. Définitions
              </a>
              <a href="#article2" className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm">
                2. Objet
              </a>
              <a href="#article3" className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm">
                3. Accès au service
              </a>
              <a href="#article4" className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm">
                4. Création de compte
              </a>
              <a href="#article5" className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm">
                5. Abonnements et tarifs
              </a>
              <a href="#article6" className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm">
                6. Obligations des utilisateurs
              </a>
              <a href="#article7" className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm">
                7. Propriété intellectuelle
              </a>
              <a href="#article8" className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm">
                8. Données personnelles
              </a>
              <a href="#article9" className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm">
                9. Responsabilité
              </a>
              <a href="#article10" className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm">
                10. Garanties
              </a>
              <a href="#article11" className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm">
                11. Résiliation
              </a>
              <a href="#article12" className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm">
                12. Modification des CGU
              </a>
              <a href="#article13" className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm">
                13. Droit applicable et juridiction
              </a>
              <a href="#article14" className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm">
                14. Contact
              </a>
            </nav>
          </section>

          {/* Article 1 : Définitions */}
          <section id="article1">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-600" />
              Article 1 - Définitions
            </h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 mb-3">
                Les termes ci-après définis ont, dans les présentes Conditions Générales d'Utilisation, 
                la signification suivante :
              </p>
              <div className="bg-slate-50 rounded-lg p-6 space-y-3">
                <div>
                  <p className="font-semibold text-slate-900">• Plateforme / Service</p>
                  <p className="text-slate-700 text-sm ml-4">
                    Désigne l'application web SynerJ accessible à l'adresse synerj.net, permettant 
                    la gestion d'associations et de clubs sportifs.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">• Éditeur</p>
                  <p className="text-slate-700 text-sm ml-4">
                    Désigne LD Teach & Tech, société éditrice de la Plateforme.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">• Utilisateur</p>
                  <p className="text-slate-700 text-sm ml-4">
                    Désigne toute personne physique ou morale utilisant la Plateforme, quel que soit son rôle 
                    (Super Admin, Administrateur de Club, Membre, Supporter, Sponsor).
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">• Association / Club</p>
                  <p className="text-slate-700 text-sm ml-4">
                    Désigne l'entité (association loi 1901, club sportif, etc.) représentée sur la Plateforme.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">• Compte</p>
                  <p className="text-slate-700 text-sm ml-4">
                    Désigne l'espace personnel créé par l'Utilisateur lui permettant d'accéder aux fonctionnalités 
                    de la Plateforme.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">• Abonnement</p>
                  <p className="text-slate-700 text-sm ml-4">
                    Désigne la souscription à l'un des plans tarifaires proposés (Gratuit, Essentiel, Premium).
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">• Contenu Utilisateur</p>
                  <p className="text-slate-700 text-sm ml-4">
                    Désigne l'ensemble des données, textes, images, vidéos, et autres contenus publiés par 
                    l'Utilisateur sur la Plateforme.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Article 2 : Objet */}
          <section id="article2">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-indigo-600" />
              Article 2 - Objet
            </h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700">
                Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour objet de définir 
                les modalités et conditions d'utilisation de la Plateforme SynerJ, ainsi que les droits et 
                obligations des Utilisateurs.
              </p>
              <p className="text-slate-700 mt-3">
                SynerJ est une plateforme SaaS (Software as a Service) dédiée à la gestion complète 
                d'associations et de clubs, incluant notamment :
              </p>
              <ul className="list-disc list-inside text-slate-700 ml-4 mt-2 space-y-1">
                <li>Gestion des membres et des rôles</li>
                <li>Organisation et suivi d'événements</li>
                <li>Communication interne (publications, mailing)</li>
                <li>Gestion de sponsors et partenariats</li>
                <li>Réservation et gestion de matériel</li>
                <li>Création de sites web publics pour les clubs</li>
                <li>Gestion des abonnements et paiements</li>
              </ul>
            </div>
          </section>

          {/* Article 3 : Accès au service */}
          <section id="article3">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              Article 3 - Accès au service
            </h2>
            <div className="prose prose-slate max-w-none">
              <h3 className="text-lg font-semibold text-slate-900 mt-4">3.1 Conditions d'accès</h3>
              <p className="text-slate-700">
                L'accès à la Plateforme est ouvert à toute personne physique ou morale ayant la capacité 
                juridique de contracter. Les mineurs doivent obtenir l'autorisation de leurs représentants légaux.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-4">3.2 Disponibilité du service</h3>
              <p className="text-slate-700">
                La Plateforme est accessible 24h/24 et 7j/7, sous réserve des opérations de maintenance, 
                mises à jour et pannes éventuelles.
              </p>
              <p className="text-slate-700 mt-2">
                L'Éditeur s'efforce d'assurer une disponibilité maximale du service mais ne peut garantir 
                une accessibilité permanente et sans interruption.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-4">3.3 Prérequis techniques</h3>
              <div className="bg-slate-50 rounded-lg p-4 mt-2">
                <p className="text-slate-700 font-medium mb-2">Pour utiliser la Plateforme, vous devez disposer de :</p>
                <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1">
                  <li>Une connexion Internet stable</li>
                  <li>Un navigateur web récent (Chrome, Firefox, Safari, Edge)</li>
                  <li>JavaScript activé</li>
                  <li>Cookies techniques autorisés</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Article 4 : Création de compte */}
          <section id="article4">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-indigo-600" />
              Article 4 - Création de compte
            </h2>
            <div className="prose prose-slate max-w-none">
              <h3 className="text-lg font-semibold text-slate-900 mt-4">4.1 Inscription</h3>
              <p className="text-slate-700">
                L'utilisation de la Plateforme nécessite la création d'un Compte Utilisateur. 
                Lors de l'inscription, l'Utilisateur s'engage à fournir des informations exactes, 
                complètes et à jour.
              </p>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-3">
                <p className="text-amber-800 text-sm">
                  <strong>Important :</strong> Toute fausse information ou usurpation d'identité peut 
                  entraîner la suspension ou la suppression immédiate du Compte.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mt-4">4.2 Identifiants et sécurité</h3>
              <p className="text-slate-700">
                L'Utilisateur est seul responsable de la confidentialité de ses identifiants de connexion 
                (adresse e-mail et mot de passe). Il s'engage à :
              </p>
              <ul className="list-disc list-inside text-slate-700 ml-4 mt-2 space-y-1">
                <li>Choisir un mot de passe fort et unique</li>
                <li>Ne pas communiquer ses identifiants à des tiers</li>
                <li>Informer immédiatement l'Éditeur en cas d'utilisation non autorisée de son Compte</li>
                <li>Se déconnecter après chaque session, notamment sur un ordinateur partagé</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-900 mt-4">4.3 Rôles et permissions</h3>
              <div className="bg-slate-50 rounded-lg p-4 mt-2">
                <p className="text-slate-700 mb-3">La Plateforme propose différents rôles avec des niveaux d'accès distincts :</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">Super Admin</p>
                      <p className="text-slate-700">Accès complet à toutes les fonctionnalités de gestion</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">Administrateur de Club</p>
                      <p className="text-slate-700">Gestion de son club, événements, membres, matériel</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">Membre</p>
                      <p className="text-slate-700">Participation aux événements, consultations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">Sponsor</p>
                      <p className="text-slate-700">Gestion de son profil sponsor et visibilité</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Article 5 : Abonnements et tarifs */}
          <section id="article5">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-indigo-600" />
              Article 5 - Abonnements et tarifs
            </h2>
            <div className="prose prose-slate max-w-none">
              <h3 className="text-lg font-semibold text-slate-900 mt-4">5.1 Plans d'abonnement</h3>
              <p className="text-slate-700 mb-3">
                SynerJ propose plusieurs formules d'abonnement adaptées aux besoins des associations :
              </p>
              <div className="space-y-3">
                <div className="bg-slate-50 border-l-4 border-slate-400 rounded-r-lg p-4">
                  <p className="font-semibold text-slate-900">Plan Gratuit</p>
                  <p className="text-slate-700 text-sm mt-1">
                    Fonctionnalités de base avec limitations (nombre de membres, événements, stockage).
                  </p>
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                  <p className="font-semibold text-blue-900">Plan Essentiel (payant)</p>
                  <p className="text-blue-800 text-sm mt-1">
                    Fonctionnalités avancées avec limites étendues.
                  </p>
                </div>
                <div className="bg-indigo-50 border-l-4 border-indigo-600 rounded-r-lg p-4">
                  <p className="font-semibold text-indigo-900">Plan Premium (payant)</p>
                  <p className="text-indigo-800 text-sm mt-1">
                    Accès complet sans limitation, support prioritaire.
                  </p>
                </div>
              </div>
              <p className="text-slate-700 mt-3 text-sm">
                Les tarifs et fonctionnalités détaillés de chaque plan sont disponibles sur notre page de tarification.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-4">5.2 Modalités de paiement</h3>
              <p className="text-slate-700">
                Les paiements sont effectués de manière sécurisée via notre prestataire <strong>Stripe</strong>.
              </p>
              <ul className="list-disc list-inside text-slate-700 ml-4 mt-2 space-y-1">
                <li>Les abonnements sont payables mensuellement ou annuellement</li>
                <li>Le paiement s'effectue par carte bancaire</li>
                <li>Les factures sont envoyées automatiquement par e-mail</li>
                <li>Les prix sont affichés en euros TTC (TVA applicable selon la législation en vigueur)</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-900 mt-4">5.3 Renouvellement et résiliation</h3>
              <p className="text-slate-700">
                Les abonnements sont reconduits tacitement à chaque échéance, sauf résiliation par l'Utilisateur.
              </p>
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mt-3">
                <p className="text-green-800 text-sm">
                  <strong>Résiliation :</strong> Vous pouvez résilier votre abonnement à tout moment depuis 
                  vos paramètres de compte ou votre portail client Stripe. La résiliation prend effet à la 
                  fin de la période de facturation en cours. Aucun remboursement au prorata ne sera effectué.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mt-4">5.4 Modification des tarifs</h3>
              <p className="text-slate-700">
                L'Éditeur se réserve le droit de modifier ses tarifs à tout moment. Les nouveaux tarifs 
                seront communiqués aux Utilisateurs au moins 30 jours avant leur entrée en vigueur.
              </p>
              <p className="text-slate-700 mt-2">
                En cas de désaccord, l'Utilisateur pourra résilier son abonnement avant l'application 
                des nouveaux tarifs.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-4">5.5 Retard ou défaut de paiement</h3>
              <p className="text-slate-700">
                En cas de défaut de paiement, l'accès au Compte pourra être suspendu après notification. 
                Le Compte sera définitivement supprimé si le paiement n'est pas régularisé dans un délai de 30 jours.
              </p>
            </div>
          </section>

          {/* Article 6 : Obligations des utilisateurs */}
          <section id="article6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-indigo-600" />
              Article 6 - Obligations des utilisateurs
            </h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 mb-3">
                L'Utilisateur s'engage à utiliser la Plateforme de manière conforme aux présentes CGU 
                et à la législation en vigueur. Il s'engage notamment à :
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-4">6.1 Usage licite</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="font-semibold text-slate-900 mb-2">✅ Usages autorisés :</p>
                <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1 text-sm">
                  <li>Gérer son association ou club de manière professionnelle</li>
                  <li>Publier des contenus légaux et respectueux</li>
                  <li>Respecter les droits des autres utilisateurs</li>
                  <li>Protéger la confidentialité des données des membres</li>
                </ul>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 mt-4">
                <p className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  ❌ Usages interdits :
                </p>
                <ul className="list-disc list-inside text-red-800 ml-4 space-y-1 text-sm">
                  <li>Publier des contenus illégaux, diffamatoires, haineux ou pornographiques</li>
                  <li>Usurper l'identité d'une personne ou d'une entité</li>
                  <li>Diffuser des virus, malwares ou tout code malveillant</li>
                  <li>Tenter de contourner les mesures de sécurité de la Plateforme</li>
                  <li>Procéder à du web scraping ou extraction automatisée de données</li>
                  <li>Revendre ou céder l'accès à la Plateforme à des tiers</li>
                  <li>Utiliser la Plateforme à des fins commerciales non autorisées</li>
                  <li>Spammer ou envoyer des communications non sollicitées</li>
                  <li>Violer les droits de propriété intellectuelle de tiers</li>
                </ul>
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mt-4">6.2 Contenu Utilisateur</h3>
              <p className="text-slate-700">
                L'Utilisateur est seul responsable des contenus qu'il publie sur la Plateforme. 
                Il garantit disposer de tous les droits nécessaires sur ces contenus.
              </p>
              <p className="text-slate-700 mt-2">
                L'Éditeur se réserve le droit de supprimer tout contenu manifestement illicite ou 
                contraire aux présentes CGU, sans préavis ni indemnité.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-4">6.3 Signalement</h3>
              <p className="text-slate-700">
                Tout Utilisateur peut signaler un contenu ou un comportement inapproprié en contactant : 
                <a href="mailto:contact-synerj@teachtech.fr" className="text-indigo-600 hover:text-indigo-800 underline ml-1">
                  contact-synerj@teachtech.fr
                </a>
              </p>
            </div>
          </section>

          {/* Article 7 : Propriété intellectuelle */}
          <section id="article7">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-indigo-600" />
              Article 7 - Propriété intellectuelle
            </h2>
            <div className="prose prose-slate max-w-none">
              <h3 className="text-lg font-semibold text-slate-900 mt-4">7.1 Propriété de la Plateforme</h3>
              <p className="text-slate-700">
                La Plateforme SynerJ, son code source, sa structure, son design, ses logos, ses marques 
                et tous les éléments qui la composent sont la propriété exclusive de <strong>LD Teach & Tech</strong> 
                et sont protégés par les lois relatives à la propriété intellectuelle.
              </p>
              <p className="text-slate-700 mt-2">
                Toute reproduction, représentation, modification, publication ou adaptation totale ou 
                partielle de la Plateforme est strictement interdite sans autorisation écrite préalable.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-4">7.2 Licence d'utilisation</h3>
              <p className="text-slate-700">
                L'Éditeur concède à l'Utilisateur une licence personnelle, non exclusive, non cessible 
                et non transférable d'utilisation de la Plateforme, limitée à la durée de son Abonnement.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-4">7.3 Contenu Utilisateur</h3>
              <p className="text-slate-700">
                L'Utilisateur conserve l'intégralité de ses droits de propriété intellectuelle sur les 
                contenus qu'il publie sur la Plateforme.
              </p>
              <p className="text-slate-700 mt-2">
                En publiant du contenu, l'Utilisateur accorde à l'Éditeur une licence mondiale, gratuite, 
                non exclusive pour héberger, stocker, reproduire et afficher ce contenu dans le cadre 
                du fonctionnement de la Plateforme.
              </p>
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mt-3">
                <p className="text-green-800 text-sm">
                  <strong>Important :</strong> L'Éditeur n'utilise pas vos contenus à des fins commerciales 
                  et ne les partage pas avec des tiers sans votre consentement.
                </p>
              </div>
            </div>
          </section>

          {/* Article 8 : Données personnelles */}
          <section id="article8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-indigo-600" />
              Article 8 - Données personnelles
            </h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700">
                Le traitement de vos données personnelles est effectué conformément au Règlement Général 
                sur la Protection des Données (RGPD) et à notre{' '}
                <Link to="/legal/privacy-policy" className="text-indigo-600 hover:text-indigo-800 underline">
                  Politique de confidentialité
                </Link>.
              </p>
              <p className="text-slate-700 mt-3">
                En utilisant la Plateforme, vous consentez à la collecte et au traitement de vos données 
                personnelles dans les conditions décrites dans notre Politique de confidentialité.
              </p>
              <div className="bg-indigo-50 rounded-lg p-4 mt-3">
                <p className="font-semibold text-indigo-900 mb-2">Vos droits RGPD :</p>
                <ul className="list-disc list-inside text-indigo-800 ml-4 space-y-1 text-sm">
                  <li>Droit d'accès et de rectification</li>
                  <li>Droit à l'effacement ("droit à l'oubli")</li>
                  <li>Droit à la portabilité des données</li>
                  <li>Droit d'opposition au traitement</li>
                  <li>Droit de réclamation auprès de la CNIL</li>
                </ul>
                <p className="text-indigo-800 text-sm mt-2">
                  Pour exercer ces droits : <a href="mailto:contact-synerj@teachtech.fr" className="underline">contact-synerj@teachtech.fr</a>
                </p>
              </div>
            </div>
          </section>

          {/* Article 9 : Responsabilité */}
          <section id="article9">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Scale className="w-6 h-6 text-indigo-600" />
              Article 9 - Responsabilité
            </h2>
            <div className="prose prose-slate max-w-none">
              <h3 className="text-lg font-semibold text-slate-900 mt-4">9.1 Responsabilité de l'Éditeur</h3>
              <p className="text-slate-700">
                L'Éditeur met en œuvre tous les moyens raisonnables pour assurer le bon fonctionnement 
                de la Plateforme, mais ne peut garantir :
              </p>
              <ul className="list-disc list-inside text-slate-700 ml-4 mt-2 space-y-1">
                <li>Une disponibilité permanente et sans interruption</li>
                <li>L'absence totale d'erreurs ou de bugs</li>
                <li>La compatibilité avec tous les environnements techniques</li>
                <li>La protection absolue contre les cyberattaques</li>
              </ul>
              <p className="text-slate-700 mt-3">
                L'Éditeur ne pourra être tenu responsable des dommages indirects tels que perte de chiffre 
                d'affaires, perte de données, préjudice commercial, etc.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-4">9.2 Responsabilité de l'Utilisateur</h3>
              <p className="text-slate-700">
                L'Utilisateur est responsable :
              </p>
              <ul className="list-disc list-inside text-slate-700 ml-4 mt-2 space-y-1">
                <li>De la sécurité de ses identifiants de connexion</li>
                <li>De l'utilisation faite de son Compte</li>
                <li>Des contenus qu'il publie sur la Plateforme</li>
                <li>Du respect de la législation en vigueur</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-900 mt-4">9.3 Force majeure</h3>
              <p className="text-slate-700">
                L'Éditeur ne pourra être tenu responsable en cas de force majeure ou d'événements 
                indépendants de sa volonté (catastrophes naturelles, pannes d'infrastructures tierces, 
                cyberattaques d'ampleur, etc.).
              </p>
            </div>
          </section>

          {/* Article 10 : Garanties */}
          <section id="article10">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-indigo-600" />
              Article 10 - Garanties
            </h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700">
                La Plateforme est fournie « en l'état ». L'Éditeur ne fournit aucune garantie, 
                expresse ou implicite, autre que celles légalement applicables.
              </p>
              <p className="text-slate-700 mt-3">
                L'Éditeur s'engage néanmoins à :
              </p>
              <ul className="list-disc list-inside text-slate-700 ml-4 mt-2 space-y-1">
                <li>Maintenir et améliorer continuellement la Plateforme</li>
                <li>Corriger les bugs critiques dans les meilleurs délais</li>
                <li>Assurer un support technique par e-mail</li>
                <li>Sauvegarder régulièrement les données</li>
              </ul>
            </div>
          </section>

          {/* Article 11 : Résiliation */}
          <section id="article11">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-indigo-600" />
              Article 11 - Résiliation
            </h2>
            <div className="prose prose-slate max-w-none">
              <h3 className="text-lg font-semibold text-slate-900 mt-4">11.1 Résiliation par l'Utilisateur</h3>
              <p className="text-slate-700">
                L'Utilisateur peut résilier son Compte à tout moment en :
              </p>
              <ul className="list-disc list-inside text-slate-700 ml-4 mt-2 space-y-1">
                <li>Annulant son abonnement depuis ses paramètres ou le portail Stripe</li>
                <li>Supprimant son compte depuis les paramètres de l'application</li>
              </ul>
              <p className="text-slate-700 mt-2">
                La suppression du compte entraîne la suppression définitive de toutes les données 
                associées après un délai de conservation de 30 jours.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-4">11.2 Résiliation par l'Éditeur</h3>
              <p className="text-slate-700">
                L'Éditeur peut suspendre ou résilier le Compte d'un Utilisateur en cas de :
              </p>
              <ul className="list-disc list-inside text-slate-700 ml-4 mt-2 space-y-1">
                <li>Violation des présentes CGU</li>
                <li>Comportement frauduleux ou malveillant</li>
                <li>Défaut de paiement prolongé</li>
                <li>Contenu illégal ou préjudiciable</li>
              </ul>
              <p className="text-slate-700 mt-2">
                La résiliation sera notifiée par e-mail. En cas de manquement grave, la résiliation 
                peut être immédiate et sans préavis.
              </p>

              <h3 className="text-lg font-semibold text-slate-900 mt-4">11.3 Conséquences de la résiliation</h3>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <p className="text-amber-800 text-sm">
                  <strong>Attention :</strong> La résiliation entraîne la perte définitive de l'accès 
                  à la Plateforme et la suppression de vos données après le délai de conservation. 
                  Pensez à exporter vos données importantes avant de résilier.
                </p>
              </div>
            </div>
          </section>

          {/* Article 12 : Modification des CGU */}
          <section id="article12">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-600" />
              Article 12 - Modification des CGU
            </h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700">
                L'Éditeur se réserve le droit de modifier les présentes CGU à tout moment pour 
                refléter les évolutions légales, réglementaires ou fonctionnelles de la Plateforme.
              </p>
              <p className="text-slate-700 mt-3">
                Les Utilisateurs seront informés de toute modification substantielle par e-mail ou 
                notification dans l'application au moins 30 jours avant l'entrée en vigueur.
              </p>
              <p className="text-slate-700 mt-3">
                La poursuite de l'utilisation de la Plateforme après l'entrée en vigueur des nouvelles 
                CGU vaut acceptation de celles-ci. En cas de désaccord, l'Utilisateur peut résilier 
                son Compte.
              </p>
            </div>
          </section>

          {/* Article 13 : Droit applicable */}
          <section id="article13">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Scale className="w-6 h-6 text-indigo-600" />
              Article 13 - Droit applicable et juridiction
            </h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700">
                Les présentes CGU sont régies par le droit français.
              </p>
              <p className="text-slate-700 mt-3">
                En cas de litige relatif à l'interprétation ou à l'exécution des présentes CGU, 
                les parties s'engagent à rechercher une solution amiable.
              </p>
              <p className="text-slate-700 mt-3">
                À défaut d'accord amiable dans un délai de 60 jours, le litige sera porté devant 
                les tribunaux compétents du ressort du siège social de l'Éditeur, sauf dispositions 
                légales impératives contraires.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mt-3">
                <p className="text-blue-900 font-semibold mb-2">🇪🇺 Médiation pour les consommateurs</p>
                <p className="text-blue-800 text-sm">
                  Conformément à l'article L.612-1 du Code de la consommation, les consommateurs 
                  ont le droit de recourir gratuitement à un médiateur de la consommation en vue 
                  de la résolution amiable d'un litige.
                </p>
              </div>
            </div>
          </section>

          {/* Article 14 : Contact */}
          <section id="article14">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Article 14 - Contact
            </h2>
            <div className="bg-indigo-50 border-l-4 border-indigo-600 rounded-r-lg p-6">
              <p className="text-indigo-900 font-semibold mb-3">
                Pour toute question relative aux présentes CGU :
              </p>
              <div className="space-y-2">
                <p className="text-indigo-800">
                  <strong>LD Teach & Tech</strong>
                </p>
                <p className="text-indigo-800">
                  <strong>E-mail :</strong>{' '}
                  <a href="mailto:contact-synerj@teachtech.fr" className="underline hover:text-indigo-700">
                    contact-synerj@teachtech.fr
                  </a>
                </p>
                <p className="text-indigo-800">
                  <strong>Adresse :</strong> 8 sentier du coteau, 41160 Busloup
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="pt-8 mt-8 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-500">
                Version en vigueur au {new Date().toLocaleDateString('fr-FR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <div className="flex gap-4 text-sm">
                <Link to="/legal/notices" className="text-indigo-600 hover:text-indigo-800 underline">
                  Mentions Légales
                </Link>
                <Link to="/legal/privacy-policy" className="text-indigo-600 hover:text-indigo-800 underline">
                  Politique de confidentialité
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;