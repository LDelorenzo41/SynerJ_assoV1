import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Building, Users, UserPlus, ArrowRight, LogIn } from 'lucide-react';

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
        password: 'TempPassword123!', // Mot de passe temporaire plus fort
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">SynerJ</h1>
          <p className="text-xl text-gray-600 mb-8">
            Connectez associations, clubs et membres sur une seule plateforme
          </p>
          <div className="mb-8">
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Se connecter
            </Link>
          </div>
        </div>

        {!activeForm && (
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            <div 
              onClick={() => setActiveForm('association')}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
            >
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Créer une Association</h3>
                <p className="text-gray-600 mb-6">
                  Démarrez votre organisation et gérez plusieurs clubs sous une association.
                </p>
                <div className="flex items-center justify-center text-blue-600 font-semibold">
                  Commencer <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              </div>
            </div>

            <div 
              onClick={() => setActiveForm('club')}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
            >
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Créer un Club</h3>
                <p className="text-gray-600 mb-6">
                  Rejoignez une association et créez votre club pour organiser des événements et des membres.
                </p>
                <div className="flex items-center justify-center text-green-600 font-semibold">
                  Commencer <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              </div>
            </div>

            <div 
              onClick={() => setActiveForm('user')}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
            >
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <UserPlus className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Rejoindre en tant qu'Utilisateur</h3>
                <p className="text-gray-600 mb-6">
                  Inscrivez-vous pour rejoindre des clubs, participer à des événements et rester connecté.
                </p>
                <div className="flex items-center justify-center text-purple-600 font-semibold">
                  Commencer <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Association Form */}
        {activeForm === 'association' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Entrez le code d'association (ex: ASSOC-12345678)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={clubForm.description}
                  onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  minLength={6}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Entrez le code de club pour rejoindre en tant que membre (ex: CLUB-12345678)"
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

        {message && (
          <div className={`mt-6 max-w-2xl mx-auto p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}