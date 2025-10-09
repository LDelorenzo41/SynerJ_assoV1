import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Building2, Upload, Save, CheckCircle, AlertCircle, X, UserPlus } from 'lucide-react';
import Footer from '../components/Footer';

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  visual_url: string | null;
  website: string | null;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  sponsor_type: 'Platine' | 'Or' | 'Argent' | 'Bronze' | 'Partenaire';
  association_id: string | null;
  club_id: string | null;
  created_at: string;
  edit_token?: string;
  is_confirmed?: boolean;
}

interface SponsorFormData {
  name: string;
  logo_url: string;
  visual_url: string;
  website: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
}

export default function SponsorEdit() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingVisual, setUploadingVisual] = useState(false);

  const [formData, setFormData] = useState<SponsorFormData>({
    name: '',
    logo_url: '',
    visual_url: '',
    website: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    address: ''
  });

  useEffect(() => {
    if (token) {
      loadSponsorByToken();
    } else {
      setError('Token manquant');
      setLoading(false);
    }
  }, [token]);

  const loadSponsorByToken = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('sponsors')
        .select('*')
        .eq('edit_token', token)
        .single();

      if (fetchError || !data) {
        throw new Error('Token invalide ou expiré');
      }

      setSponsor(data);
      setFormData({
        name: data.name,
        logo_url: data.logo_url || '',
        visual_url: data.visual_url || '',
        website: data.website || '',
        description: data.description || '',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        address: data.address || ''
      });
    } catch (err: any) {
      console.error('Erreur chargement sponsor:', err);
      setError('Impossible de charger les informations. Le lien est peut-être invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      setUploadingLogo(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `sponsor-logo-${Date.now()}.${fileExt}`;
      const filePath = `sponsors/${fileName}`;

      const { error } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, logo_url: publicUrl });
    } catch (error: any) {
      alert('Erreur lors de l\'upload du logo: ' + error.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleVisualUpload = async (file: File) => {
    try {
      setUploadingVisual(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `sponsor-visual-${Date.now()}.${fileExt}`;
      const filePath = `sponsors/${fileName}`;

      const { error } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, visual_url: publicUrl });
    } catch (error: any) {
      alert('Erreur lors de l\'upload du visuel: ' + error.message);
    } finally {
      setUploadingVisual(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsor) return;

    try {
      setSubmitting(true);

      const updateData = {
        ...formData,
        website: formData.website.startsWith('http') ? formData.website : (formData.website ? `https://${formData.website}` : ''),
        is_confirmed: true,
      };

      const { error } = await supabase
        .from('sponsors')
        .update(updateData)
        .eq('id', sponsor.id);

      if (error) throw error;

      setSuccess(true);
    } catch (error: any) {
      alert('Erreur lors de la mise à jour: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen dark-bg flex items-center justify-center">
        <div className="max-w-md w-full dark-card rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-red-500 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-center dark-text mb-4">Lien invalide</h1>
          <p className="dark-text-muted text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen dark-bg flex items-center justify-center">
        <div className="max-w-md w-full dark-card rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-center dark-text mb-4">Profil validé !</h1>
          <p className="dark-text-muted text-center mb-6">
            Vos informations ont été validées avec succès. Merci pour votre partenariat !
          </p>
          
          {/* CTA pour créer un compte sponsor */}
          <div className="space-y-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 dark:text-orange-300 mb-2">
                Prochaine étape : Créez votre compte sponsor
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                Pour accéder à la plateforme et gérer vos campagnes de mailing, créez maintenant votre compte sponsor.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 transition-colors"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Créer mon compte sponsor
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Vous avez déjà un compte ? <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Se connecter</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark-bg py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="dark-card rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 dark:bg-blue-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Building2 className="h-6 w-6 mr-2" />
              Valider mon profil sponsor
            </h1>
            <p className="text-blue-100 dark:text-blue-200 text-sm mt-1">
              Validez vos informations pour finaliser votre profil public
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium dark-text-muted mb-2">
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="dark-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark-text-muted mb-2">
                Email de contact *
              </label>
              <input
                type="email"
                required
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="dark-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark-text-muted mb-2">
                Logo de l'entreprise
              </label>
              {formData.logo_url && (
                <div className="mb-4 relative">
                  <img 
                    src={formData.logo_url} 
                    alt="Logo" 
                    className="w-32 h-32 object-contain border rounded-lg bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, logo_url: '' })}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file);
                  }}
                  className="hidden"
                  disabled={uploadingLogo}
                />
                <div className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:border-blue-500 dark:hover:bg-blue-900/20 transition-colors">
                  <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm dark-text-muted">
                    {uploadingLogo ? 'Upload du logo...' : 'Télécharger un logo'}
                  </span>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium dark-text-muted mb-2">
                Visuel promotionnel
              </label>
              {formData.visual_url && (
                <div className="mb-4 relative">
                  <img 
                    src={formData.visual_url} 
                    alt="Visuel" 
                    className="w-full h-32 object-cover border rounded-lg bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, visual_url: '' })}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVisualUpload(file);
                  }}
                  className="hidden"
                  disabled={uploadingVisual}
                />
                <div className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center cursor-pointer hover:border-green-400 hover:bg-green-50 dark:hover:border-green-500 dark:hover:bg-green-900/20 transition-colors">
                  <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm dark-text-muted">
                    {uploadingVisual ? 'Upload du visuel...' : 'Télécharger un visuel'}
                  </span>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium dark-text-muted mb-2">
                Description de l'entreprise
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="dark-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                placeholder="Décrivez votre entreprise et vos services..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark-text-muted mb-2">
                Site web
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="dark-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                placeholder="https://www.votre-site.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark-text-muted mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="dark-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                placeholder="01 23 45 67 89"
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark-text-muted mb-2">
                Adresse
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="dark-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                placeholder="123 Rue de la Paix, 75001 Paris"
              />
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                {submitting ? 'Validation en cours...' : 'Valider mon profil'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer variant="app" />
    </div>
  );
}