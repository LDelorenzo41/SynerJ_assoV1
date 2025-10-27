import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Shield, FileText } from 'lucide-react';

const LegalNotices: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header avec bouton retour */}
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
            <Shield className="w-8 h-8 text-indigo-600" />
            Mentions Légales
          </h1>
          <p className="text-slate-600 mt-2">Informations légales relatives à SynerJ</p>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          
          {/* Éditeur du site */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-indigo-600" />
              Éditeur du site
            </h2>
            <div className="bg-slate-50 rounded-lg p-6 space-y-3">
              <p className="text-slate-700">
                <strong className="text-slate-900">Raison sociale :</strong> LD Teach & Tech
              </p>
              <p className="text-slate-700">
                <strong className="text-slate-900">Forme juridique :</strong> Micro-entreprise
              </p>
              <p className="text-slate-700">
                <strong className="text-slate-900">Capital social :</strong> Non applicable
              </p>
              <p className="text-slate-700">
                <strong className="text-slate-900">Numéro SIRET :</strong> 95948210700018
              </p>
              <p className="text-slate-700">
                <strong className="text-slate-900">Numéro TVA intracommunautaire :</strong> Non applicable
              </p>
              <p className="text-slate-700 flex items-start gap-2">
                <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900">Siège social :</strong><br />
                  8 sentier du coteau<br />
                  41160 Busloup<br />
                  France
                </span>
              </p>
            </div>
          </section>

          {/* Directeur de la publication */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-600" />
              Directeur de la publication
            </h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700">
                <strong className="text-slate-900">Nom :</strong> Delorenzo Lionel
              </p>
              <p className="text-slate-700 mt-2">
                <strong className="text-slate-900">Qualité :</strong> Micro-entrepreneur
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-indigo-600" />
              Contact
            </h2>
            <div className="bg-slate-50 rounded-lg p-6 space-y-3">
              <p className="text-slate-700 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                <strong className="text-slate-900">Email :</strong> 
                <a href="mailto:contact-synerj@teachtech.fr" className="text-indigo-600 hover:text-indigo-800 underline">
                  contact-synerj@teachtech.fr
                </a>
              </p>
              <p className="text-slate-700 flex items-center gap-2">
                <Phone className="w-5 h-5 text-indigo-600" />
                <strong className="text-slate-900">Téléphone :</strong> Contact par mail
              </p>
            </div>
          </section>

          {/* Hébergement */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Hébergement</h2>
            <div className="bg-slate-50 rounded-lg p-6 space-y-3">
              <p className="text-slate-700">
                <strong className="text-slate-900">Hébergeur web :</strong> Vercel Inc.
              </p>
              <p className="text-slate-700">
                <strong className="text-slate-900">Adresse :</strong><br />
                340 S Lemon Ave #4133<br />
                Walnut, CA 91789<br />
                États-Unis
              </p>
              <p className="text-slate-700 mt-4">
                <strong className="text-slate-900">Hébergeur base de données :</strong> Supabase Inc.
              </p>
              <p className="text-slate-700">
                <strong className="text-slate-900">Adresse :</strong><br />
                970 Toa Payoh North #07-04<br />
                Singapore 318992
              </p>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Propriété intellectuelle</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700">
                L'ensemble du contenu de ce site (structure, textes, logos, images, vidéos, etc.) 
                est la propriété exclusive de <strong>LD Teach & Tech</strong>, sauf mention contraire.
              </p>
              <p className="text-slate-700 mt-3">
                Toute reproduction, distribution, modification, adaptation, retransmission ou publication 
                de ces différents éléments est strictement interdite sans l'accord exprès par écrit de 
                <strong> LD Teach & Tech</strong>.
              </p>
              <p className="text-slate-700 mt-3">
                L'utilisation non autorisée du site ou de son contenu pourra faire l'objet de poursuites judiciaires.
              </p>
            </div>
          </section>

          {/* CNIL et données personnelles */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Protection des données personnelles</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700">
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi 
                Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de 
                suppression et d'opposition aux données vous concernant.
              </p>
              <p className="text-slate-700 mt-3">
                Pour exercer ces droits, veuillez nous contacter à l'adresse : 
                <a href="mailto:contact-synerj@teachtech.fr" className="text-indigo-600 hover:text-indigo-800 underline ml-1">
                  contact-synerj@teachtech.fr
                </a>
              </p>
              <p className="text-slate-700 mt-3">
                Pour plus d'informations sur la gestion de vos données personnelles, consultez notre{' '}
                <Link to="/legal/privacy-policy" className="text-indigo-600 hover:text-indigo-800 underline">
                  Politique de confidentialité
                </Link>.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Cookies</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700">
                Ce site utilise des cookies strictement nécessaires à son fonctionnement 
                (authentification, préférences utilisateur). Aucun cookie de tracking ou 
                publicitaire n'est utilisé sans votre consentement explicite.
              </p>
              <p className="text-slate-700 mt-3">
                Vous pouvez à tout moment désactiver les cookies via les paramètres de votre navigateur.
              </p>
            </div>
          </section>

          {/* Loi applicable */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Loi applicable</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700">
                Les présentes mentions légales sont soumises au droit français. 
                En cas de litige, et après échec de toute tentative de règlement amiable, 
                les tribunaux français seront seuls compétents.
              </p>
            </div>
          </section>

          {/* Crédits */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Crédits</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700">
                <strong>Conception et développement :</strong> LD Teach & Tech
              </p>
              <p className="text-slate-700 mt-2">
                <strong>Icônes :</strong> Lucide Icons
              </p>
              <p className="text-slate-700 mt-2">
                <strong>Framework :</strong> React + TypeScript + Vite
              </p>
            </div>
          </section>

          {/* Footer de la page */}
          <div className="pt-8 mt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500 text-center">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LegalNotices;