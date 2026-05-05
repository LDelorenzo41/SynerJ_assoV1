// src/pages/SponsorProfile.tsx - Nouveau fichier pour le profil sponsor

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { Building2, Upload, Save, CheckCircle, AlertCircle, X, ArrowLeft } from 'lucide-react';

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

export default function SponsorProfile() {
  const { profile } = useAuthNew();
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
    // Vérifier que l'utilisateur est bien un sponsor
    if (!profile) return;
    
    if (profile.role !== 'Sponsor') {
      navigate('/dashboard');
      return;
    }

    loadSponsorProfile();
  }, [profile, navigate]);

  const loadSponsorProfile = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      setError(null);

      // Récupérer le sponsor lié à cet utilisateur
      const { data, error: fetchError } = await supabase
        .from('sponsors')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (fetchError || !data) {
        throw new Error('Profil sponsor introuvable');
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
      console.error('Erreur chargement profil sponsor:', err);
      setError('Impossible de charger votre profil sponsor.');
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
      
      // Recharger le profil
      await loadSponsorProfile();
      
      // Revenir au dashboard après 2 secondes
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      alert('Erreur lors de la mise à jour: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-papier flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-terracotta dark:border-terracotta"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-papier flex items-center justify-center">
        <div className="max-w-md w-full bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-ds-danger dark:text-ds-danger" />
          </div>
          <h1 className="text-2xl font-bold text-center text-encre mb-4">Erreur</h1>
          <p className="text-encre-3 text-center mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta-deep dark:bg-terracotta dark:hover:bg-terracotta transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dashboard
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-papier flex items-center justify-center">
        <div className="max-w-md w-full bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-ds-success dark:text-ds-success" />
          </div>
          <h1 className="text-2xl font-bold text-center text-encre mb-4">Profil mis à jour !</h1>
          <p className="text-encre-3 text-center mb-6">
            Vos informations ont été mises à jour avec succès. Redirection vers le dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-papier py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-terracotta dark:bg-terracotta-deep px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <Building2 className="h-6 w-6 mr-2" />
                  Mon profil sponsor
                </h1>
                <p className="text-terracotta dark:text-terracotta text-sm mt-1">
                  Gérez vos informations publiques
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-white hover:bg-terracotta-deep dark:hover:bg-terracotta-deep rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Info niveau de sponsoring */}
          {sponsor && (
            <div className="bg-papier-2 dark:bg-slate-700 px-6 py-3 border-b border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-encre-3">Niveau de sponsoring :</span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  sponsor.sponsor_type === 'Platine' ? 'bg-ds-info-soft dark:bg-ds-info-soft/30 text-ds-info dark:text-ds-info' :
                  sponsor.sponsor_type === 'Or' ? 'bg-ds-warning-soft dark:bg-ds-warning-soft/30 text-ds-warning dark:text-ds-warning' :
                  sponsor.sponsor_type === 'Argent' ? 'bg-papier-2 dark:bg-papier-3 text-encre-2 dark:text-encre-3' :
                  'bg-ds-warning-soft dark:bg-ds-warning-soft/30 text-ds-warning dark:text-ds-warning'
                }`}>
                  {sponsor.sponsor_type}
                </span>
              </div>
              <p className="text-xs text-encre-3 mt-1">
                Contactez votre association pour modifier votre niveau de sponsoring
              </p>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-encre-3 mb-2">
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-encre-3 mb-2">
                Email de contact *
              </label>
              <input
                type="email"
                required
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-encre-3 mb-2">
                Logo de l'entreprise
              </label>
              {formData.logo_url && (
                <div className="mb-4 relative">
                  <img 
                    src={formData.logo_url} 
                    alt="Logo" 
                    className="w-32 h-32 object-contain border rounded-lg bg-papier-2 dark:bg-slate-700 border-[var(--ds-border)] dark:border-[var(--ds-border-2)]"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, logo_url: '' })}
                    className="absolute -top-2 -right-2 p-1 bg-ds-danger text-white rounded-full hover:bg-ds-danger dark:bg-ds-danger dark:hover:bg-ds-danger"
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
                <div className="w-full p-4 border-2 border-dashed border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg text-center cursor-pointer hover:border-terracotta hover:bg-terracotta-soft dark:hover:border-terracotta dark:hover:bg-terracotta-soft transition-colors">
                  <Upload className="h-6 w-6 mx-auto mb-2 text-encre-3 dark:text-encre-3" />
                  <span className="text-sm text-encre-3">
                    {uploadingLogo ? 'Upload du logo...' : 'Télécharger un logo'}
                  </span>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-encre-3 mb-2">
                Visuel promotionnel
              </label>
              {formData.visual_url && (
                <div className="mb-4 relative">
                  <img 
                    src={formData.visual_url} 
                    alt="Visuel" 
                    className="w-full h-32 object-cover border rounded-lg bg-papier-2 dark:bg-slate-700 border-[var(--ds-border)] dark:border-[var(--ds-border-2)]"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, visual_url: '' })}
                    className="absolute -top-2 -right-2 p-1 bg-ds-danger text-white rounded-full hover:bg-ds-danger dark:bg-ds-danger dark:hover:bg-ds-danger"
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
                <div className="w-full p-4 border-2 border-dashed border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg text-center cursor-pointer hover:border-ds-success hover:bg-ds-success-soft dark:hover:border-ds-success dark:hover:bg-ds-success-soft/20 transition-colors">
                  <Upload className="h-6 w-6 mx-auto mb-2 text-encre-3 dark:text-encre-3" />
                  <span className="text-sm text-encre-3">
                    {uploadingVisual ? 'Upload du visuel...' : 'Télécharger un visuel'}
                  </span>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-encre-3 mb-2">
                Description de l'entreprise
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                placeholder="Décrivez votre entreprise et vos services..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-encre-3 mb-2">
                Site web
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                placeholder="https://www.votre-site.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-encre-3 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                placeholder="01 23 45 67 89"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-encre-3 mb-2">
                Adresse
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                placeholder="123 Rue de la Paix, 75001 Paris"
              />
            </div>

            <div className="pt-4 border-t border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center px-4 py-3 bg-terracotta text-white rounded-lg hover:bg-terracotta-deep dark:bg-terracotta dark:hover:bg-terracotta transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                {submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}