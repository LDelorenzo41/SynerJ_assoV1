import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Globe, AlertCircle, Mail, FileText, Calendar, Users } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-ds-info hover:text-ds-info transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Lock className="w-8 h-8 text-ds-info" />
            Politique de confidentialité
          </h1>
          <p className="text-slate-600 mt-2">
            Protection de vos données personnelles - Conforme RGPD
          </p>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <div className="bg-ds-info-soft border-l-4 border-ds-info p-6 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-ds-info flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-lg font-semibold text-ds-info mb-2">
                    Votre vie privée est notre priorité
                  </h2>
                  <p className="text-ds-info">
                    Cette politique de confidentialité vous informe sur la manière dont nous collectons, 
                    utilisons et protégeons vos données personnelles conformément au Règlement Général 
                    sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Table des matières */}
          <section className="bg-slate-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Sommaire</h2>
            <nav className="space-y-2">
              <a href="#responsable" className="block text-ds-info hover:text-ds-info hover:underline">
                1. Responsable du traitement
              </a>
              <a href="#donnees-collectees" className="block text-ds-info hover:text-ds-info hover:underline">
                2. Données collectées et finalités
              </a>
              <a href="#base-legale" className="block text-ds-info hover:text-ds-info hover:underline">
                3. Base légale du traitement
              </a>
              <a href="#destinataires" className="block text-ds-info hover:text-ds-info hover:underline">
                4. Destinataires des données
              </a>
              <a href="#conservation" className="block text-ds-info hover:text-ds-info hover:underline">
                5. Durée de conservation
              </a>
              <a href="#transferts" className="block text-ds-info hover:text-ds-info hover:underline">
                6. Transferts hors UE
              </a>
              <a href="#securite" className="block text-ds-info hover:text-ds-info hover:underline">
                7. Sécurité des données
              </a>
              <a href="#droits" className="block text-ds-info hover:text-ds-info hover:underline">
                8. Vos droits
              </a>
              <a href="#cookies" className="block text-ds-info hover:text-ds-info hover:underline">
                9. Cookies et technologies similaires
              </a>
              <a href="#modifications" className="block text-ds-info hover:text-ds-info hover:underline">
                10. Modifications de la politique
              </a>
            </nav>
          </section>

          {/* 1. Responsable du traitement */}
          <section id="responsable">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-ds-info" />
              1. Responsable du traitement des données
            </h2>
            <div className="bg-slate-50 rounded-lg p-6 space-y-3">
              <p className="text-slate-700">
                <strong className="text-slate-900">Raison sociale :</strong> LD Teach & Tech
              </p>
              <p className="text-slate-700">
                <strong className="text-slate-900">Adresse :</strong> 8 sentier du coteau, 41160 Busloup
              </p>
              <p className="text-slate-700 flex items-center gap-2">
                <Mail className="w-5 h-5 text-ds-info" />
                <strong className="text-slate-900">Contact DPO/Responsable :</strong> 
                <a href="mailto:contact-synerj@teachtech.fr" className="text-ds-info hover:text-ds-info underline">
                  contact-synerj@teachtech.fr
                </a>
              </p>
            </div>
          </section>

          {/* 2. Données collectées */}
          <section id="donnees-collectees">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-ds-info" />
              2. Données collectées et finalités
            </h2>
            
            <div className="space-y-6">
              {/* Données d'identification */}
              <div className="border border-slate-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-ds-info" />
                  Données d'identification et d'authentification
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-slate-900">Données collectées :</p>
                    <ul className="list-disc list-inside text-slate-700 ml-4 mt-1 space-y-1">
                      <li>Adresse e-mail</li>
                      <li>Mot de passe (chiffré)</li>
                      <li>Nom et prénom</li>
                      <li>Photo de profil (optionnel)</li>
                      <li>Numéro de téléphone (optionnel)</li>
                      <li>Rôle (Super Admin, Administrateur Club, Membre, Supporter, Sponsor)</li>
                    </ul>
                  </div>
                  <div className="bg-ds-info-soft p-4 rounded-lg">
                    <p className="font-medium text-ds-info">Finalités :</p>
                    <ul className="list-disc list-inside text-ds-info ml-4 mt-1 space-y-1">
                      <li>Création et gestion de votre compte utilisateur</li>
                      <li>Authentification et sécurisation de l'accès</li>
                      <li>Communication avec vous concernant votre compte</li>
                      <li>Gestion des droits d'accès selon votre rôle</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Données d'association/club */}
              <div className="border border-slate-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-ds-info" />
                  Données d'association et de club
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-slate-900">Données collectées :</p>
                    <ul className="list-disc list-inside text-slate-700 ml-4 mt-1 space-y-1">
                      <li>Nom de l'association/club</li>
                      <li>Logo et images</li>
                      <li>Coordonnées (adresse, email, téléphone)</li>
                      <li>Description et informations publiques</li>
                      <li>Nombre de membres</li>
                      <li>Plan d'abonnement</li>
                    </ul>
                  </div>
                  <div className="bg-ds-info-soft p-4 rounded-lg">
                    <p className="font-medium text-ds-info">Finalités :</p>
                    <ul className="list-disc list-inside text-ds-info ml-4 mt-1 space-y-1">
                      <li>Gestion de votre association/club sur la plateforme</li>
                      <li>Affichage des informations publiques du club</li>
                      <li>Gestion des abonnements et facturation</li>
                      <li>Génération de site web public pour le club</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Données d'événements */}
              <div className="border border-slate-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-ds-info" />
                  Données d'événements et d'activités
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-slate-900">Données collectées :</p>
                    <ul className="list-disc list-inside text-slate-700 ml-4 mt-1 space-y-1">
                      <li>Titre, description, date et lieu des événements</li>
                      <li>Participants et inscriptions</li>
                      <li>Commentaires et likes sur les événements</li>
                      <li>Photos et documents associés</li>
                    </ul>
                  </div>
                  <div className="bg-ds-info-soft p-4 rounded-lg">
                    <p className="font-medium text-ds-info">Finalités :</p>
                    <ul className="list-disc list-inside text-ds-info ml-4 mt-1 space-y-1">
                      <li>Organisation et gestion des événements</li>
                      <li>Communication avec les participants</li>
                      <li>Suivi des participations et statistiques</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Données de communication */}
              <div className="border border-slate-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Données de communication et mailing
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-slate-900">Données collectées :</p>
                    <ul className="list-disc list-inside text-slate-700 ml-4 mt-1 space-y-1">
                      <li>Publications et communications créées</li>
                      <li>Listes de diffusion et destinataires</li>
                      <li>Statistiques d'ouverture et de clics (si applicable)</li>
                      <li>Commentaires et interactions</li>
                    </ul>
                  </div>
                  <div className="bg-ds-info-soft p-4 rounded-lg">
                    <p className="font-medium text-ds-info">Finalités :</p>
                    <ul className="list-disc list-inside text-ds-info ml-4 mt-1 space-y-1">
                      <li>Diffusion d'informations aux membres</li>
                      <li>Campagnes de mailing ciblées</li>
                      <li>Mesure de l'engagement</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Données de paiement */}
              <div className="border border-slate-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Données de paiement et facturation
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-slate-900">Données collectées :</p>
                    <ul className="list-disc list-inside text-slate-700 ml-4 mt-1 space-y-1">
                      <li>Informations de facturation (via Stripe)</li>
                      <li>Historique des paiements</li>
                      <li>Plan d'abonnement actif</li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                    <p className="font-medium text-amber-900 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Important
                    </p>
                    <p className="text-amber-800 mt-1 text-sm">
                      Les données bancaires (numéro de carte, CVV) ne sont jamais stockées sur nos serveurs. 
                      Elles sont traitées directement et de manière sécurisée par notre prestataire de paiement 
                      Stripe, certifié PCI-DSS niveau 1.
                    </p>
                  </div>
                  <div className="bg-ds-info-soft p-4 rounded-lg">
                    <p className="font-medium text-ds-info">Finalités :</p>
                    <ul className="list-disc list-inside text-ds-info ml-4 mt-1 space-y-1">
                      <li>Traitement des paiements d'abonnement</li>
                      <li>Facturation et comptabilité</li>
                      <li>Prévention de la fraude</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Données techniques */}
              <div className="border border-slate-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Données techniques et de connexion
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-slate-900">Données collectées :</p>
                    <ul className="list-disc list-inside text-slate-700 ml-4 mt-1 space-y-1">
                      <li>Adresse IP</li>
                      <li>Type et version du navigateur</li>
                      <li>Système d'exploitation</li>
                      <li>Dates et heures de connexion</li>
                      <li>Pages visitées et actions effectuées</li>
                      <li>Statut en ligne/hors ligne</li>
                    </ul>
                  </div>
                  <div className="bg-ds-info-soft p-4 rounded-lg">
                    <p className="font-medium text-ds-info">Finalités :</p>
                    <ul className="list-disc list-inside text-ds-info ml-4 mt-1 space-y-1">
                      <li>Fonctionnement et amélioration du service</li>
                      <li>Sécurité et détection de fraudes</li>
                      <li>Statistiques d'utilisation anonymisées</li>
                      <li>Support technique</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Base légale */}
          <section id="base-legale">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-ds-info" />
              3. Base légale du traitement
            </h2>
            <div className="prose prose-slate max-w-none space-y-4">
              <p className="text-slate-700">
                Conformément au RGPD, nous traitons vos données sur les bases légales suivantes :
              </p>
              <div className="bg-slate-50 rounded-lg p-6 space-y-3">
                <div>
                  <p className="font-semibold text-slate-900">📋 Exécution du contrat</p>
                  <p className="text-slate-700 text-sm mt-1">
                    Le traitement de vos données est nécessaire à l'exécution de nos Conditions 
                    Générales d'Utilisation et à la fourniture des services SynerJ.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">✅ Consentement</p>
                  <p className="text-slate-700 text-sm mt-1">
                    Pour certaines fonctionnalités optionnelles (newsletters, notifications push), 
                    nous nous appuyons sur votre consentement explicite.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">⚖️ Obligation légale</p>
                  <p className="text-slate-700 text-sm mt-1">
                    Certaines données sont conservées pour répondre à nos obligations légales 
                    (facturation, comptabilité).
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">🎯 Intérêt légitime</p>
                  <p className="text-slate-700 text-sm mt-1">
                    Pour la sécurité du service, la prévention de la fraude et l'amélioration 
                    de nos fonctionnalités.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Destinataires */}
          <section id="destinataires">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-ds-info" />
              4. Destinataires des données
            </h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 mb-4">
                Vos données personnelles sont accessibles aux catégories de destinataires suivants :
              </p>
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="font-semibold text-slate-900">🏢 Personnel autorisé de LD Teach & Tech</p>
                  <p className="text-slate-700 text-sm mt-1">
                    Uniquement les employés ayant besoin d'accéder aux données dans le cadre de leurs fonctions.
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="font-semibold text-slate-900">☁️ Prestataires techniques</p>
                  <ul className="list-disc list-inside text-slate-700 text-sm mt-2 ml-4 space-y-1">
                    <li><strong>Supabase</strong> : hébergement de la base de données et authentification</li>
                    <li><strong>Vercel</strong> : hébergement de l'application web</li>
                    <li><strong>Stripe</strong> : traitement des paiements</li>
                  </ul>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="font-semibold text-slate-900">👥 Membres de votre association/club</p>
                  <p className="text-slate-700 text-sm mt-1">
                    Certaines données (nom, photo de profil, publications) peuvent être visibles 
                    par les autres membres de votre association selon vos paramètres de confidentialité.
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="font-semibold text-slate-900">⚖️ Autorités légales</p>
                  <p className="text-slate-700 text-sm mt-1">
                    En cas de réquisition judiciaire ou d'obligation légale.
                  </p>
                </div>
              </div>
              <div className="bg-ds-success-soft border-l-4 border-ds-success p-4 rounded-r-lg mt-4">
                <p className="text-ds-success text-sm">
                  <strong>Engagement :</strong> Nous ne vendons jamais vos données personnelles à des tiers.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Conservation */}
          <section id="conservation">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-ds-info" />
              5. Durée de conservation des données
            </h2>
            <div className="space-y-3">
              <p className="text-slate-700">
                Nous conservons vos données personnelles pendant la durée nécessaire aux finalités 
                pour lesquelles elles ont été collectées :
              </p>
              <div className="bg-slate-50 rounded-lg p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-slate-900 font-medium">Données de compte actif</span>
                  <span className="text-ds-info font-semibold">Pendant toute la durée d'utilisation</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-slate-900 font-medium">Données après suppression de compte</span>
                  <span className="text-ds-info font-semibold">30 jours (puis suppression définitive)</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-slate-900 font-medium">Données de facturation</span>
                  <span className="text-ds-info font-semibold">10 ans (obligation légale)</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-slate-900 font-medium">Logs de connexion</span>
                  <span className="text-ds-info font-semibold">12 mois maximum</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-slate-900 font-medium">Cookies techniques</span>
                  <span className="text-ds-info font-semibold">13 mois maximum</span>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Transferts de données */}
<section id="transferts">
  <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
    <Globe className="w-6 h-6 text-ds-info" />
    6. Transferts de données
  </h2>

  <div className="prose prose-slate max-w-none">
    {/* Hébergement européen */}
    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-lg mb-4">
      <div className="flex items-start gap-3">
        <Shield className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-emerald-900 mb-2">Hébergement au sein de l’Union Européenne</p>
          <p className="text-emerald-800 text-sm">
            Vos données sont hébergées sur les serveurs européens de <strong>Supabase</strong>, situés dans l’Union Européenne. 
            Aucun transfert de données hors de l’Union Européenne n’est effectué dans le cadre de cet hébergement.
          </p>
        </div>
      </div>
    </div>

    <p className="text-slate-700">
      <strong>Mesures de conformité :</strong>
    </p>
    <ul className="list-disc list-inside text-slate-700 ml-4 mt-2 space-y-2">
      <li>
        Supabase est conforme au <abbr title="Règlement Général sur la Protection des Données">RGPD</abbr> et applique des standards élevés de sécurité.
      </li>
      <li>
        Les données sont chiffrées en transit (TLS/SSL) et au repos (AES-256).
      </li>
      <li>
        Des sauvegardes et contrôles réguliers garantissent l’intégrité et la disponibilité des informations.
      </li>
    </ul>

    {/* Prestataires externes */}
    <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg mt-8">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-900 mb-2">Traitements réalisés par des prestataires tiers</p>
          <p className="text-amber-800 text-sm">
            Certaines fonctionnalités de l’application (par exemple la réécriture de texte ou la génération d’images)
            reposent sur des services externes tels qu’<strong>OpenAI</strong> et <strong>Google Cloud</strong>.
            Ces traitements peuvent impliquer un transfert temporaire de données vers des serveurs situés
            hors de l’Union Européenne, notamment aux États-Unis.
          </p>
          <p className="text-amber-800 text-sm mt-2">
            Ces prestataires sont engagés dans le respect du <abbr title="Règlement Général sur la Protection des Données">RGPD</abbr>
            et des <strong>Clauses Contractuelles Types (CCT)</strong> approuvées par la Commission Européenne,
            garantissant un niveau de protection adéquat pour les données transférées.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>



          {/* 7. Sécurité */}
          <section id="securite">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-ds-info" />
              7. Sécurité des données
            </h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 mb-4">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées 
                pour protéger vos données personnelles contre tout accès, modification, divulgation 
                ou destruction non autorisés :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-5 h-5 text-ds-info" />
                    <p className="font-semibold text-slate-900">Chiffrement</p>
                  </div>
                  <p className="text-slate-700 text-sm">
                    SSL/TLS pour les communications, AES-256 pour le stockage, bcrypt pour les mots de passe
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="w-5 h-5 text-ds-info" />
                    <p className="font-semibold text-slate-900">Authentification</p>
                  </div>
                  <p className="text-slate-700 text-sm">
                    Authentification sécurisée via Supabase Auth, possibilité d'activer la 2FA
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-5 h-5 text-ds-info" />
                    <p className="font-semibold text-slate-900">Contrôles d'accès</p>
                  </div>
                  <p className="text-slate-700 text-sm">
                    Row Level Security (RLS) sur Supabase, accès basé sur les rôles (RBAC)
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-ds-info" />
                    <p className="font-semibold text-slate-900">Surveillance</p>
                  </div>
                  <p className="text-slate-700 text-sm">
                    Logs de sécurité, détection d'anomalies, sauvegardes régulières
                  </p>
                </div>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
                <p className="text-amber-800 text-sm">
                  <strong>Important :</strong> Aucun système n'est totalement sécurisé. En cas de violation 
                  de données vous concernant, nous vous en informerons dans les 72 heures conformément au RGPD.
                </p>
              </div>
            </div>
          </section>

          {/* 8. Vos droits */}
          <section id="droits">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-ds-info" />
              8. Vos droits sur vos données
            </h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 mb-4">
                Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
              </p>
              <div className="space-y-3">
                <div className="bg-ds-info-soft rounded-lg p-4">
                  <p className="font-semibold text-ds-info flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Droit d'accès
                  </p>
                  <p className="text-ds-info text-sm mt-1">
                    Vous pouvez demander l'accès à vos données personnelles et obtenir une copie de celles-ci.
                  </p>
                </div>
                <div className="bg-ds-info-soft rounded-lg p-4">
                  <p className="font-semibold text-ds-info flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Droit de rectification
                  </p>
                  <p className="text-ds-info text-sm mt-1">
                    Vous pouvez demander la correction de données inexactes ou incomplètes. 
                    Vous pouvez modifier la plupart de vos informations directement depuis vos paramètres.
                  </p>
                </div>
                <div className="bg-ds-info-soft rounded-lg p-4">
                  <p className="font-semibold text-ds-info flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Droit à l'effacement ("droit à l'oubli")
                  </p>
                  <p className="text-ds-info text-sm mt-1">
                    Vous pouvez demander la suppression de vos données personnelles dans certaines conditions. 
                    Vous pouvez supprimer votre compte à tout moment depuis vos paramètres.
                  </p>
                </div>
                <div className="bg-ds-info-soft rounded-lg p-4">
                  <p className="font-semibold text-ds-info flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Droit à la limitation du traitement
                  </p>
                  <p className="text-ds-info text-sm mt-1">
                    Vous pouvez demander de limiter temporairement le traitement de vos données dans certains cas.
                  </p>
                </div>
                <div className="bg-ds-info-soft rounded-lg p-4">
                  <p className="font-semibold text-ds-info flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Droit à la portabilité
                  </p>
                  <p className="text-ds-info text-sm mt-1">
                    Vous pouvez recevoir vos données dans un format structuré et couramment utilisé, 
                    et les transmettre à un autre responsable de traitement.
                  </p>
                </div>
                <div className="bg-ds-info-soft rounded-lg p-4">
                  <p className="font-semibold text-ds-info flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Droit d'opposition
                  </p>
                  <p className="text-ds-info text-sm mt-1">
                    Vous pouvez vous opposer au traitement de vos données pour des motifs légitimes, 
                    notamment pour le marketing direct.
                  </p>
                </div>
                <div className="bg-ds-info-soft rounded-lg p-4">
                  <p className="font-semibold text-ds-info flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Droit de retirer votre consentement
                  </p>
                  <p className="text-ds-info text-sm mt-1">
                    Lorsque le traitement est basé sur votre consentement, vous pouvez le retirer à tout moment.
                  </p>
                </div>
                <div className="bg-ds-info-soft rounded-lg p-4">
                  <p className="font-semibold text-ds-info flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Droit de définir des directives post-mortem
                  </p>
                  <p className="text-ds-info text-sm mt-1">
                    Vous pouvez définir des directives relatives à la conservation, l'effacement et 
                    la communication de vos données après votre décès.
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-6 mt-6">
                <p className="font-semibold text-slate-900 mb-3">💬 Comment exercer vos droits ?</p>
                <p className="text-slate-700 text-sm mb-3">
                  Pour exercer l'un de ces droits, vous pouvez :
                </p>
                <ul className="list-disc list-inside text-slate-700 text-sm ml-4 space-y-1">
                  <li>
                    Accéder à vos paramètres dans l'application (pour modification, suppression de compte)
                  </li>
                  <li>
                    Nous contacter par e-mail à : 
                    <a href="mailto:contact-synerj@teachtech.fr" className="text-ds-info hover:text-ds-info underline ml-1">
                      contact-synerj@teachtech.fr
                    </a>
                  </li>
                </ul>
                <p className="text-slate-700 text-sm mt-3">
                  <strong>Délai de réponse :</strong> Nous nous engageons à répondre à votre demande 
                  dans un délai d'un mois maximum. Ce délai peut être prolongé de deux mois en cas de 
                  demande complexe.
                </p>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
                <p className="font-semibold text-amber-900 mb-2">🏛️ Droit de réclamation</p>
                <p className="text-amber-800 text-sm">
                  Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une 
                  réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) : 
                  <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                    www.cnil.fr
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* 9. Cookies */}
          <section id="cookies">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              9. Cookies et technologies similaires
            </h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 mb-4">
                Nous utilisons des cookies et technologies similaires pour améliorer votre expérience :
              </p>
              <div className="space-y-3">
                <div className="bg-ds-success-soft border-l-4 border-ds-success rounded-r-lg p-4">
                  <p className="font-semibold text-ds-success mb-2">🍪 Cookies strictement nécessaires</p>
                  <p className="text-ds-success text-sm mb-2">
                    Ces cookies sont indispensables au fonctionnement du site. Ils ne peuvent pas être désactivés.
                  </p>
                  <ul className="list-disc list-inside text-ds-success text-sm ml-4 space-y-1">
                    <li>Authentification et session utilisateur (Supabase Auth)</li>
                    <li>Sécurité et prévention de la fraude</li>
                    <li>Préférences d'interface (thème clair/sombre)</li>
                  </ul>
                </div>
                <div className="bg-terracotta-soft border-l-4 border-terracotta rounded-r-lg p-4">
                  <p className="font-semibold text-terracotta-deep mb-2">📊 Cookies de fonctionnalité (optionnels)</p>
                  <p className="text-terracotta-deep text-sm mb-2">
                    Ces cookies permettent d'améliorer votre expérience utilisateur.
                  </p>
                  <ul className="list-disc list-inside text-terracotta-deep text-sm ml-4 space-y-1">
                    <li>Mémorisation de vos préférences</li>
                    <li>Langue et paramètres régionaux</li>
                  </ul>
                </div>
              </div>
              <p className="text-slate-700 mt-4 text-sm">
                <strong>Gestion des cookies :</strong> Vous pouvez gérer vos préférences de cookies 
                via les paramètres de votre navigateur. La désactivation de certains cookies peut 
                affecter le fonctionnement du site.
              </p>
              <p className="text-slate-700 mt-2 text-sm">
                <strong>Durée de conservation :</strong> 13 mois maximum, conformément aux recommandations de la CNIL.
              </p>
            </div>
          </section>

          {/* 10. Modifications */}
          <section id="modifications">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              10. Modifications de la politique de confidentialité
            </h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700">
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment 
                pour refléter les évolutions légales, réglementaires ou fonctionnelles.
              </p>
              <p className="text-slate-700 mt-3">
                En cas de modification substantielle, nous vous en informerons par e-mail ou par une 
                notification dans l'application au moins 30 jours avant l'entrée en vigueur des changements.
              </p>
              <p className="text-slate-700 mt-3">
                La version en vigueur est toujours accessible sur cette page avec sa date de dernière mise à jour.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-ds-info-soft border-l-4 border-ds-info rounded-r-lg p-6">
            <h2 className="text-xl font-semibold text-ds-info mb-3 flex items-center gap-2">
              <Mail className="w-6 h-6" />
              Questions ou préoccupations ?
            </h2>
            <p className="text-ds-info mb-4">
              Si vous avez des questions concernant cette politique de confidentialité ou le traitement 
              de vos données personnelles, n'hésitez pas à nous contacter :
            </p>
            <div className="space-y-2">
              <p className="text-ds-info">
                <strong>E-mail :</strong>{' '}
                <a href="mailto:contact-synerj@teachtech.fr" className="underline hover:text-ds-info">
                  contact-synerj@teachtech.fr
                </a>
              </p>
              <p className="text-ds-info">
                <strong>Adresse :</strong> 8 sentier du coteau, 41160 Busloup
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="pt-8 mt-8 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-500">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <div className="flex gap-4 text-sm">
                <Link to="/legal/notices" className="text-ds-info hover:text-ds-info underline">
                  Mentions Légales
                </Link>
                <Link to="/legal/terms" className="text-ds-info hover:text-ds-info underline">
                  CGU
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;