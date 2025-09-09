import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Building, 
  Users, 
  UserPlus, 
  ArrowRight, 
  LogIn, 
  Calendar,
  Shield,
  Check,
  Play,
  Heart
} from 'lucide-react';

type FormType = 'association' | 'club' | 'user' | null;

interface AssociationForm {
  name: string;
  city: string;
  email: string;
  phone: string;
  description: string;
}

interface ClubForm {
  name: string;
  description: string;
  club_email: string;
  association_code: string;
}

interface UserForm {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  club_code: string;
}

export default function Landing() {
  const [activeForm, setActiveForm] = useState<FormType>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const navigate = useNavigate();

  const [associationForm, setAssociationForm] = useState<AssociationForm>({
    name: '',
    city: '',
    email: '',
    phone: '',
    description: '',
  });

  const [clubForm, setClubForm] = useState<ClubForm>({
    name: '',
    description: '',
    club_email: '',
    association_code: '',
  });

  const [userForm, setUserForm] = useState<UserForm>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    club_code: '',
  });

  const handleCreateAssociation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase.auth.getUser();
      let userId = null;
      
      if (existingUser?.user) {
        // User is already logged in
        userId = existingUser.user.id;
      } else {
        // Try to sign up the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: associationForm.email,
          password: 'TempPassword123!',
          options: {
            data: {
              first_name: 'Super',
              last_name: 'Admin'
            }
          }
        });

        if (authError) {
          if (authError.message.includes('User already registered')) {
            // User exists, try to sign in instead
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: associationForm.email,
              password: 'TempPassword123!'
            });
            
            if (signInError) {
              throw new Error('Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.');
            } else {
              userId = signInData.user?.id;
            }
          } else {
            throw authError;
          }
        } else {
          userId = authData.user?.id;
        }
      }

      if (!userId) {
        throw new Error('Impossible de créer ou récupérer l\'utilisateur');
      }

      // Create association after user is authenticated
      const { data: association, error: assocError } = await supabase
        .from('associations')
        .insert([associationForm])
        .select()
        .single();

      if (assocError) throw assocError;

      if (userId) {
        // Update profile with Super Admin role
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            first_name: 'Super',
            last_name: 'Admin',
            role: 'Super Admin',
            association_id: association.id,
          });

        if (profileError) throw profileError;
      }

      setMessage({
        type: 'success',
        text: `Association créée avec succès! Code: ${association.association_code}. Mot de passe temporaire: TempPassword123! (changez-le après connexion)`,
      });

      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Clean and normalize the association code
      const cleanAssociationCode = clubForm.association_code.trim().toUpperCase();
      
      // Verify association code
      const { data: association, error: assocError } = await supabase
        .from('associations')
        .select('id')
        .eq('association_code', cleanAssociationCode)
        .single();

      if (assocError) {
        if (assocError.code === 'PGRST116') {
          throw new Error(`Code d'association invalide: ${cleanAssociationCode}`);
        }
        throw assocError;
      }

      // Sign up the user as Club Admin FIRST
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: clubForm.club_email,
        password: 'TempPassword123!',
        options: {
          data: {
            first_name: 'Club',
            last_name: 'Admin'
          }
        }
      });

      if (authError) throw authError;

      // Create club AFTER user is authenticated
      const { data: club, error: clubError } = await supabase
        .from('clubs')
        .insert([{
          name: clubForm.name,
          description: clubForm.description,
          club_email: clubForm.club_email,
          association_id: association.id
        }])
        .select()
        .single();

      if (clubError) throw clubError;

      if (authData.user) {
        // Update profile with Club Admin role
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: 'Club',
            last_name: 'Admin',
            role: 'Club Admin',
            club_id: club.id,
            association_id: association.id,
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;
      }

      setMessage({
        type: 'success',
        text: `Club créé avec succès! Code: ${club.club_code}. Mot de passe temporaire: TempPassword123! (changez-le après connexion)`,
      });

      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUserRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let clubId = null;
      let associationId = null;
      let role: 'Member' | 'Supporter' = 'Supporter';

      // Check if club code is provided
      if (userForm.club_code.trim()) {
        const { data: club, error: clubError } = await supabase
          .from('clubs')
          .select('id, association_id')
          .eq('club_code', userForm.club_code)
          .single();

        if (clubError || !club) {
          throw new Error('Invalid club code');
        }

        clubId = club.id;
        associationId = club.association_id;
        role = 'Member';
      }

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userForm.email,
        password: userForm.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: userForm.first_name,
            last_name: userForm.last_name,
            role,
            club_id: clubId,
            association_id: associationId,
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;

        // If joining a club, add to user_clubs
        if (clubId) {
          const { error: userClubError } = await supabase
            .from('user_clubs')
            .insert([{ user_id: authData.user.id, club_id: clubId }]);

          if (userClubError) console.error('Error adding to user_clubs:', userClubError);
        }
      }

      setMessage({
        type: 'success',
        text: 'Registration successful! Please check your email to verify your account.',
      });

      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SynerJ
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Fonctionnalités
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
              Comment ça marche
            </a>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Se connecter
            </Link>
          </div>
          
          {/* Menu mobile */}
          <div className="md:hidden">
            <Link
              to="/login"
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Connexion
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Connectez vos
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {" "}associations{" "}
              </span>
              et clubs
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              La plateforme tout-en-un pour gérer associations, clubs et membres. 
              Organisez des événements, connectez vos communautés et développez votre impact.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => document.getElementById('registration')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
              >
                Créer votre association aujourd'hui !
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={() => setShowDemo(true)}
                className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
              >
                <Play className="mr-2 h-5 w-5" />
                Voir la démo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex justify-center items-center">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-500">100% sécurisé</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              SynerJ simplifie la gestion de vos organisations avec des outils puissants et intuitifs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Building className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Gestion d'associations</h3>
              <p className="text-gray-600 mb-6">
                Créez et gérez facilement vos associations avec des outils de gestion complets et intuitifs.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Tableaux de bord dédiés
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Gestion multi-clubs
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Codes d'invitation uniques
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Clubs dynamiques</h3>
              <p className="text-gray-600 mb-6">
                Organisez vos clubs, gérez les membres et créez des communautés engagées.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Gestion des membres
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Événements privés/publics
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Communication intégrée
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Événements intelligents</h3>
              <p className="text-gray-600 mb-6">
                Créez, gérez et promouvez vos événements avec des outils avancés de planification.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Calendrier synchronisé
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Inscriptions automatiques
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Notifications intelligentes
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              En 3 étapes simples, lancez votre organisation sur SynerJ
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Créez votre organisation</h3>
                <p className="text-gray-600">
                  Commencez par créer votre association ou rejoignez-en une existante en tant que club.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Invitez vos membres</h3>
                <p className="text-gray-600">
                  Utilisez vos codes uniques pour inviter facilement les membres et constituer votre communauté.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Organisez et grandissez</h3>
                <p className="text-gray-600">
                  Créez des événements, gérez vos activités et développez votre impact communautaire.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="registration" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Commencez dès aujourd'hui
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choisissez votre point de départ et rejoignez la communauté SynerJ
            </p>
          </div>

          {!activeForm && (
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
              <div 
                onClick={() => setActiveForm('association')}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-3 border-2 border-transparent hover:border-blue-200"
              >
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Building className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Créer une Association</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Démarrez votre organisation et gérez plusieurs clubs sous une association. 
                    Parfait pour les grandes organisations.
                  </p>
                  <div className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                    Commencer
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setActiveForm('club')}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-3 border-2 border-transparent hover:border-green-200"
              >
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Créer un Club</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Rejoignez une association existante et créez votre club pour organiser 
                    des événements et des membres.
                  </p>
                  <div className="inline-flex items-center text-green-600 font-semibold group-hover:text-green-700">
                    Commencer
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setActiveForm('user')}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-3 border-2 border-transparent hover:border-purple-200"
              >
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <UserPlus className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Rejoindre en tant qu'Utilisateur</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Inscrivez-vous pour rejoindre des clubs, participer à des événements 
                    et rester connecté avec vos communautés.
                  </p>
                  <div className="inline-flex items-center text-purple-600 font-semibold group-hover:text-purple-700">
                    Commencer
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Association Form */}
          {activeForm === 'association' && (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Créer une Association</h2>
              <form onSubmit={handleCreateAssociation} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'Association *
                  </label>
                  <input
                    type="text"
                    required
                    value={associationForm.name}
                    onChange={(e) => setAssociationForm({ ...associationForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nom de votre association"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Courriel *
                  </label>
                  <input
                    type="email"
                    required
                    value={associationForm.email}
                    onChange={(e) => setAssociationForm({ ...associationForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="contact@association.com"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={associationForm.city}
                      onChange={(e) => setAssociationForm({ ...associationForm, city: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Paris"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={associationForm.phone}
                      onChange={(e) => setAssociationForm({ ...associationForm, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="01 23 45 67 89"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={associationForm.description}
                    onChange={(e) => setAssociationForm({ ...associationForm, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Décrivez brièvement votre association..."
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setActiveForm(null)}
                    className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Création...' : 'Créer l\'Association'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Club Form */}
          {activeForm === 'club' && (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Créer un Club</h2>
              <form onSubmit={handleCreateClub} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du Club *
                  </label>
                  <input
                    type="text"
                    required
                    value={clubForm.name}
                    onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Nom de votre club"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Courriel du Club *
                  </label>
                  <input
                    type="email"
                    required
                    value={clubForm.club_email}
                    onChange={(e) => setClubForm({ ...clubForm, club_email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="contact@club.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code d'Association *
                  </label>
                  <input
                    type="text"
                    required
                    value={clubForm.association_code}
                    onChange={(e) => setClubForm({ ...clubForm, association_code: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="ASSOC-12345678"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Demandez le code d'association au super admin de votre organisation
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={clubForm.description}
                    onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Décrivez brièvement votre club..."
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setActiveForm(null)}
                    className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Création...' : 'Créer le Club'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* User Registration Form */}
          {activeForm === 'user' && (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Inscription Utilisateur</h2>
              <form onSubmit={handleUserRegistration} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      required
                      value={userForm.first_name}
                      onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Jean"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      required
                      value={userForm.last_name}
                      onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Dupont"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Courriel *
                  </label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="jean.dupont@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    required
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    minLength={6}
                    placeholder="Minimum 6 caractères"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code de Club (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={userForm.club_code}
                    onChange={(e) => setUserForm({ ...userForm, club_code: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="CLUB-12345678"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Laissez vide pour vous inscrire en tant que supporter avec accès aux événements publics uniquement.
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setActiveForm(null)}
                    className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Inscription...' : 'S\'inscrire'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Success/Error Messages */}
          {message && (
            <div className={`mt-8 max-w-2xl mx-auto p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <Check className="h-5 w-5 mr-2" />
                ) : (
                  <div className="h-5 w-5 mr-2 rounded-full bg-red-600 flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                )}
                {message.text}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                SynerJ
              </div>
              <p className="text-gray-400 mb-4">
                La plateforme qui connecte associations, clubs et membres pour un impact communautaire renforcé.
              </p>
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="text-gray-400">Fait avec passion</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sécurité</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SynerJ. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Démo de SynerJ</h3>
            <p className="text-gray-600 mb-6">
              Découvrez comment SynerJ transforme la gestion de vos organisations en quelques minutes.
            </p>
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center mb-6 border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Vidéo de démonstration à venir</p>
              </div>
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Création d'organisation en 2 minutes</h4>
                  <p className="text-gray-600 text-sm">Voyez comme il est simple de créer une association et ses clubs</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Gestion des membres intuitive</h4>
                  <p className="text-gray-600 text-sm">Découvrez les outils de gestion des membres et événements</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Tableaux de bord personnalisés</h4>
                  <p className="text-gray-600 text-sm">Explorez les interfaces selon votre rôle</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDemo(false)}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}