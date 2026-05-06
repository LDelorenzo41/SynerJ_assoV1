import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn } from 'lucide-react';
import Footer from '../components/Footer';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Contenu principal qui prend l'espace disponible */}
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-terracotta-soft rounded-full flex items-center justify-center mb-4">
                <LogIn className="h-8 w-8 text-terracotta" />
              </div>
              <h1 className="text-3xl font-bold text-encre">Bon Retour</h1>
              <p className="text-encre-2 mt-2">Connectez-vous à votre compte SynerJ</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-encre-2 mb-2">
                  Courriel
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Entrez votre courriel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-encre-2 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Entrez votre mot de passe"
                />
              </div>

              {error && (
                <div className="bg-ds-danger-soft text-ds-danger p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* NOUVEAU : Lien mot de passe oublié */}
              <div className="text-right">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-terracotta hover:text-terracotta-deep font-medium"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-terracotta text-white rounded-lg hover:bg-terracotta-deep disabled:opacity-50 transition-colors font-medium"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-encre-2">
                Vous n'avez pas de compte ?{' '}
                <Link to="/" className="text-terracotta hover:text-terracotta-deep font-medium">
                  Inscrivez-vous ici
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer en bas de la page */}
      <Footer variant="app" />
    </div>
  );
}