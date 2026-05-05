// Sponsors.tsx - Version corrigée avec Edge Function

import React, { useState, useEffect } from 'react';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { Building2, ExternalLink, Mail, Phone, MapPin, Users, Heart, AlertCircle, Plus, X, Upload, Send, Edit, Trash2 } from 'lucide-react';

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
  sponsor_type: 'Platine' | 'Or' | 'Argent' | 'Bronze' | 'Partenaire';
}

export default function Sponsors() {
  const { profile, isSuperAdmin, isClubAdmin } = useAuthNew();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'association' | 'club'>('association');
  
  const [followedClubIds, setFollowedClubIds] = useState<string[]>([]);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingVisual, setUploadingVisual] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [createdSponsor, setCreatedSponsor] = useState<{
    sponsor: Sponsor, 
    credentials: { email: string, password: string }
  } | null>(null);
  const [formData, setFormData] = useState<SponsorFormData>({
    name: '',
    logo_url: '',
    visual_url: '',
    website: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    sponsor_type: 'Bronze'
  });

  useEffect(() => {
    if (profile) {
      loadFollowedClubs();
    }
  }, [profile]);

  const loadFollowedClubs = async () => {
    if (!profile) return;
    
    try {
      // ✅ AJOUTER 'Sponsor' dans la condition
      if (profile.role === 'Member' || profile.role === 'Supporter' || profile.role === 'Sponsor') {
        console.log(`🔍 [${profile.role}] Récupération des clubs suivis...`);
        
        const { data: userClubs, error } = await supabase
          .from('user_clubs')
          .select('club_id')
          .eq('user_id', profile.id);
        
        if (error) {
          console.error('Error fetching followed clubs:', error);
        } else {
          const clubIds = userClubs?.map(uc => uc.club_id) || [];
          console.log(`✅ [${profile.role}] Clubs suivis trouvés:`, clubIds.length);
          setFollowedClubIds(clubIds);
        }
      }
      
      await loadSponsors();
    } catch (err) {
      console.error('Error in loadFollowedClubs:', err);
      await loadSponsors();
    }
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      logo_url: '',
      visual_url: '',
      website: '',
      description: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      sponsor_type: 'Bronze'
    });
  };

  const loadSponsors = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('sponsors')
        .select('*')
        .order('created_at', { ascending: false });

      if (profile.role === 'Super Admin' && profile.association_id) {
        query = query.eq('association_id', profile.association_id);
        
      } else if (profile.role === 'Club Admin' && profile.club_id) {
        query = query.or(`club_id.eq.${profile.club_id},association_id.eq.${profile.association_id}`);
        
      } else if (profile.role === 'Member' && profile.club_id) {
        const allowedClubIds = [profile.club_id, ...followedClubIds];
        const uniqueClubIds = [...new Set(allowedClubIds)];
        
        if (uniqueClubIds.length > 0) {
          const clubConditions = uniqueClubIds.map(clubId => `club_id.eq.${clubId}`).join(',');
          query = query.or(`${clubConditions},association_id.eq.${profile.association_id}`);
        } else {
          query = query.eq('association_id', profile.association_id);
        }
        
      } else if (profile.role === 'Supporter' && profile.association_id) {
        if (followedClubIds.length > 0) {
          const clubConditions = followedClubIds.map(clubId => `club_id.eq.${clubId}`).join(',');
          query = query.or(`${clubConditions},association_id.eq.${profile.association_id}`);
        } else {
          query = query.eq('association_id', profile.association_id);
        }
        
      } 
      // ✅ AJOUTER CE BLOC POUR LES SPONSORS
      else if (profile.role === 'Sponsor' && profile.association_id) {
        console.log('🔍 [Sponsor] Chargement des sponsors...');
        console.log('📋 [Sponsor] Clubs suivis:', followedClubIds);

        // Les Sponsors voient :
        // 1. Les sponsors de leur club principal (s'ils sont sponsor de club)
        // 2. Les sponsors des clubs qu'ils suivent
        // 3. Les sponsors de l'association

        if (followedClubIds.length > 0) {
          // Cas 1 : Le Sponsor suit des clubs
          const clubConditions = followedClubIds.map(clubId => `club_id.eq.${clubId}`).join(',');
          query = query.or(`${clubConditions},association_id.eq.${profile.association_id}`);
          console.log('✅ [Sponsor] Requête avec clubs suivis:', clubConditions);
        } else {
          // Cas 2 : Le Sponsor ne suit aucun club (uniquement sponsors d'association)
          query = query.eq('association_id', profile.association_id);
          console.log('✅ [Sponsor] Requête uniquement sponsors d\'association');
        }
        
      }
      else {
        // Aucun rôle valide
        setSponsors([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching sponsors:', fetchError);
        throw fetchError;
      }

      console.log(`✅ [${profile.role}] Sponsors chargés:`, data?.length || 0);
      setSponsors(data || []);
    } catch (err: any) {
      console.error('Error loading sponsors:', err);
      setError(err.message || 'Erreur lors du chargement des sponsors');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      setUploadingLogo(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
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
      console.error('Error uploading logo:', error);
      alert('Erreur lors de l\'upload du logo: ' + error.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleVisualUpload = async (file: File) => {
    try {
      setUploadingVisual(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
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
      console.error('Error uploading visual:', error);
      alert('Erreur lors de l\'upload du visuel: ' + error.message);
    } finally {
      setUploadingVisual(false);
    }
  };

  const generateEmailContent = (
    sponsor: Sponsor, 
    credentials: { email: string, password: string }
  ) => {
    const subject = `Bienvenue sur SynerJ - Vos identifiants sponsor - ${sponsor.name}`;
    
    const sponsorTypeLimits: Record<string, string> = {
      'Platine': '4 campagnes par mois',
      'Or': '3 campagnes par mois',
      'Argent': '2 campagnes par mois',
      'Bronze': '1 campagne par mois',
      'Partenaire': '1 campagne par mois'
    };

    const body = `Bonjour,

Nous tenons à vous remercier chaleureusement pour votre soutien en tant que sponsor ${sponsor.sponsor_type}. 🙏

🎉 VOTRE COMPTE A ÉTÉ CRÉÉ !

Vous pouvez maintenant accéder à votre espace sponsor sur notre plateforme SynerJ.

🔑 VOS IDENTIFIANTS DE CONNEXION :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email : ${credentials.email}
Mot de passe temporaire : ${credentials.password}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ IMPORTANT : Pour votre sécurité, nous vous recommandons de changer ce mot de passe dès votre première connexion.

🌐 SE CONNECTER :
👉 ${window.location.origin}/login

✨ CE QUE VOUS POUVEZ FAIRE :
✓ Gérer votre profil sponsor (logo, description, coordonnées)
✓ Envoyer des campagnes de mailing à nos membres (${sponsorTypeLimits[sponsor.sponsor_type]})
✓ Accéder à des outils de communication dédiés

📝 VOS INFORMATIONS ACTUELLES :
- Nom : ${sponsor.name}
- Email : ${sponsor.contact_email}
- Niveau de sponsoring : ${sponsor.sponsor_type}
${sponsor.description ? `- Description : ${sponsor.description}` : ''}

Pour toute question, n'hésitez pas à me contacter.
Encore merci pour votre confiance et votre engagement à nos côtés. 💙

Cordialement,
${profile?.first_name} ${profile?.last_name}`;

    return { subject, body };
  };

  const openMailClient = (
    sponsor: Sponsor, 
    credentials: { email: string, password: string }
  ) => {
    const { subject, body } = generateEmailContent(sponsor, credentials);
    const mailtoLink = `mailto:${sponsor.contact_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  const deleteSponsor = async (sponsorId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce sponsor ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sponsors')
        .delete()
        .eq('id', sponsorId);

      if (error) throw error;

      setSuccessMessage('Sponsor supprimé avec succès !');
      setTimeout(() => setSuccessMessage(''), 4000);
      await loadSponsors();
    } catch (error: any) {
      console.error('Error deleting sponsor:', error);
      alert('Erreur lors de la suppression: ' + error.message);
    }
  };

  const openCreateForm = () => {
    resetFormData();
    setShowCreateForm(true);
  };
  
  const openEditForm = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      name: sponsor.name,
      logo_url: sponsor.logo_url || '',
      visual_url: sponsor.visual_url || '',
      website: sponsor.website || '',
      description: sponsor.description || '',
      contact_email: sponsor.contact_email || '',
      contact_phone: sponsor.contact_phone || '',
      address: sponsor.address || '',
      sponsor_type: sponsor.sponsor_type
    });
    setShowEditForm(true);
  };

  const handleUpdateSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingSponsor) return;
    if (!formData.name || !formData.contact_email) {
      alert('Veuillez remplir au minimum le nom et l\'email de contact');
      return;
    }

    try {
      setSubmitting(true);
      
      const updateData = {
        ...formData,
        website: formData.website.startsWith('http') ? formData.website : (formData.website ? `https://${formData.website}` : ''),
      };

      const { error } = await supabase
        .from('sponsors')
        .update(updateData)
        .eq('id', editingSponsor.id);

      if (error) throw error;
      
      setShowEditForm(false);
      setEditingSponsor(null);
      await loadSponsors();
      
      setSuccessMessage('Sponsor mis à jour avec succès !');
      setTimeout(() => setSuccessMessage(''), 4000);

    } catch (error: any) {
      console.error('Error updating sponsor:', error);
      alert('Erreur lors de la mise à jour: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;
    if (!formData.name || !formData.contact_email) {
      alert('Veuillez remplir au minimum le nom et l\'email de contact');
      return;
    }

    try {
      setSubmitting(true);
      
      // Préparer les données du sponsor
      const sponsorData = {
        name: formData.name,
        logo_url: formData.logo_url || null,
        visual_url: formData.visual_url || null,
        website: formData.website.startsWith('http') ? formData.website : (formData.website ? `https://${formData.website}` : null),
        description: formData.description || null,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone || null,
        address: formData.address || null,
        sponsor_type: formData.sponsor_type,
        association_id: profile.association_id,
        club_id: profile.role === 'Club Admin' ? profile.club_id : null,
      };

      // Appeler l'Edge Function pour créer le sponsor + compte utilisateur
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'create-sponsor-user',
        {
          body: {
            sponsorData,
            createdBy: profile.id
          }
        }
      );

      if (functionError) {
        console.error('Error calling edge function:', functionError);
        throw new Error(functionError.message || 'Erreur lors de la création du sponsor');
      }

      if (!functionData.success) {
        throw new Error(functionData.error || 'Erreur lors de la création du sponsor');
      }

      console.log('✅ Sponsor créé avec succès:', functionData.sponsor);
      console.log('🔑 Identifiants générés:', functionData.credentials);

      // Stocker les identifiants pour l'email
      setCreatedSponsor({
        sponsor: functionData.sponsor,
        credentials: functionData.credentials
      });

      setShowCreateForm(false);
      await loadSponsors();
      
      setSuccessMessage('Sponsor et compte utilisateur créés avec succès ! Vous pouvez maintenant lui envoyer ses identifiants par email.');

    } catch (error: any) {
      console.error('Error creating sponsor:', error);
      alert('Erreur lors de la création du sponsor: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSponsors = sponsors.filter(sponsor => {
    if (filter === 'all') return true;
    if (filter === 'association') return sponsor.association_id === profile?.association_id && !sponsor.club_id;
    if (filter === 'club') {
      if (profile?.club_id && sponsor.club_id === profile.club_id) return true;
      return followedClubIds.includes(sponsor.club_id || '');
    }
    return true;
  });

  if (profile?.role === 'Supporter' && !profile?.association_id) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-encre">Nos Sponsors</h1>
        </div>
        <div className="bg-ds-warning-soft dark:bg-ds-warning-soft/20 border border-ds-warning dark:border-ds-warning rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-ds-warning dark:text-ds-warning mr-3 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-ds-warning dark:text-ds-warning mb-2">Association requise</h2>
              <p className="text-ds-warning dark:text-ds-warning mb-4">
                Pour voir les sponsors, vous devez d'abord rejoindre une association. 
                Rendez-vous sur votre tableau de bord pour choisir une association à suivre.
              </p>
              <a href="/dashboard" className="inline-flex items-center px-4 py-2 bg-ds-warning text-white rounded-lg hover:bg-ds-warning dark:bg-ds-warning dark:hover:bg-ds-warning transition-colors">
                <Users className="h-4 w-4 mr-2" />
                Aller au tableau de bord
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-terracotta dark:border-terracotta"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-encre">Nos Sponsors</h1>
        <div className="bg-ds-danger-soft dark:bg-ds-danger-soft border border-ds-danger dark:border-ds-danger rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-ds-danger dark:text-ds-danger mr-3 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-ds-danger dark:text-ds-danger mb-2">Erreur de chargement</h2>
              <p className="text-ds-danger dark:text-ds-danger mb-4">{error}</p>
              <button onClick={loadSponsors} className="inline-flex items-center px-4 py-2 bg-ds-danger text-white rounded-lg hover:bg-ds-danger dark:bg-ds-danger dark:hover:bg-ds-danger transition-colors">
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-encre">Nos Sponsors</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-encre-3">
            {filteredSponsors.length} sponsor{filteredSponsors.length > 1 ? 's' : ''}
          </div>
          {(isSuperAdmin || isClubAdmin) && (
            <button onClick={openCreateForm} className="inline-flex items-center px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta-deep dark:bg-terracotta dark:hover:bg-terracotta transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un sponsor
            </button>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="bg-ds-success-soft dark:bg-ds-success-soft/20 border border-ds-success dark:border-ds-success rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-ds-success" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-ds-success dark:text-ds-success">{successMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <button onClick={() => setSuccessMessage('')} className="inline-flex rounded-md bg-ds-success-soft dark:bg-ds-success-soft/20 p-1.5 text-ds-success dark:text-ds-success hover:bg-ds-success-soft dark:hover:bg-ds-success-soft/30">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {createdSponsor && (
        <div className="bg-ds-success-soft dark:bg-ds-success-soft/20 border border-ds-success dark:border-ds-success rounded-lg p-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-ds-success dark:text-ds-success">Sponsor et compte créés !</h3>
              <p className="text-sm text-ds-success dark:text-ds-success">
                Cliquez pour envoyer les identifiants de connexion par email à {createdSponsor.sponsor.name}
              </p>
              <p className="text-xs text-ds-success dark:text-ds-success mt-1">
                Email : {createdSponsor.credentials.email} | Mot de passe : {createdSponsor.credentials.password}
              </p>
            </div>
            <button
              onClick={() => {
                openMailClient(createdSponsor.sponsor, createdSponsor.credentials);
                setCreatedSponsor(null);
                setSuccessMessage('');
              }}
              className="inline-flex items-center px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta-deep dark:bg-terracotta dark:hover:bg-terracotta transition-colors"
            >
              <Send className="h-4 w-4 mr-2" />
              Envoyer l'email
            </button>
          </div>
        </div>
      )}

      {sponsors.length > 0 && (
        <div className="bg-terracotta-soft dark:bg-terracotta-soft border border-terracotta dark:border-terracotta rounded-lg p-6">
          <div className="flex items-start">
            <Heart className="h-6 w-6 text-terracotta dark:text-terracotta mr-3 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-terracotta-deep dark:text-terracotta mb-2">Un grand merci à nos partenaires !</h2>
              <p className="text-terracotta-deep dark:text-terracotta">
                Grâce au soutien de nos sponsors et partenaires, nous pouvons développer nos activités, 
                organiser des événements de qualité et offrir des services à nos membres. 
                Leur confiance et leur engagement sont essentiels à notre réussite.
              </p>
            </div>
          </div>
        </div>
      )}

      {sponsors.length > 0 && (
        <div className="flex space-x-4 border-b border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
          {profile?.association_id && (
            <button onClick={() => setFilter('association')} className={`pb-2 px-1 text-sm font-medium transition-colors ${filter === 'association' ? 'text-terracotta dark:text-terracotta border-b-2 border-terracotta dark:border-terracotta' : 'text-encre-3 hover:text-encre-2 dark:hover:text-encre-3'}`}>
              Sponsors de l'association
            </button>
          )}
          {(profile?.club_id || followedClubIds.length > 0) && (
            <button onClick={() => setFilter('club')} className={`pb-2 px-1 text-sm font-medium transition-colors ${filter === 'club' ? 'text-terracotta dark:text-terracotta border-b-2 border-terracotta dark:border-terracotta' : 'text-encre-3 hover:text-encre-2 dark:hover:text-encre-3'}`}>
              Sponsors de mes clubs
            </button>
          )}
          <button onClick={() => setFilter('all')} className={`pb-2 px-1 text-sm font-medium transition-colors ${filter === 'all' ? 'text-terracotta dark:text-terracotta border-b-2 border-terracotta dark:border-terracotta' : 'text-encre-3 hover:text-encre-2 dark:hover:text-encre-3'}`}>
            Tous mes sponsors
          </button>
        </div>
      )}

      {/* Formulaire de création */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-encre">Ajouter un nouveau sponsor</h2>
                <button onClick={() => setShowCreateForm(false)} className="p-2 hover:bg-papier-2 dark:hover:bg-slate-700 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitSponsor} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">Nom de l'entreprise *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent" placeholder="Ex: Restaurant Le Gourmet" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">Email de contact *</label>
                  <input type="email" required value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent" placeholder="contact@entreprise.com" />
                  <p className="text-xs text-encre-3 mt-1">Un compte utilisateur sera automatiquement créé avec cet email</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">Logo de l'entreprise</label>
                  {formData.logo_url && (
                    <div className="mb-4 relative">
                      <img src={formData.logo_url} alt="Logo" className="w-32 h-32 object-contain border rounded-lg bg-papier-2 dark:bg-slate-700 border-[var(--ds-border)] dark:border-[var(--ds-border-2)]" />
                      <button type="button" onClick={() => setFormData({ ...formData, logo_url: '' })} className="absolute -top-2 -right-2 p-1 bg-ds-danger text-white rounded-full hover:bg-ds-danger dark:bg-ds-danger dark:hover:bg-ds-danger">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <label className="block">
                    <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleLogoUpload(file); }} className="hidden" disabled={uploadingLogo} />
                    <div className="w-full p-4 border-2 border-dashed border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg text-center cursor-pointer hover:border-terracotta hover:bg-terracotta-soft dark:hover:border-terracotta dark:hover:bg-terracotta-soft transition-colors">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-encre-3 dark:text-encre-3" />
                      <span className="text-sm text-encre-3">{uploadingLogo ? 'Upload du logo...' : 'Télécharger un logo'}</span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">Visuel promotionnel</label>
                  {formData.visual_url && (
                    <div className="mb-4 relative">
                      <img src={formData.visual_url} alt="Visuel" className="w-full h-32 object-cover border rounded-lg bg-papier-2 dark:bg-slate-700 border-[var(--ds-border)] dark:border-[var(--ds-border-2)]" />
                      <button type="button" onClick={() => setFormData({ ...formData, visual_url: '' })} className="absolute -top-2 -right-2 p-1 bg-ds-danger text-white rounded-full hover:bg-ds-danger dark:bg-ds-danger dark:hover:bg-ds-danger">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <label className="block">
                    <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleVisualUpload(file); }} className="hidden" disabled={uploadingVisual} />
                    <div className="w-full p-4 border-2 border-dashed border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg text-center cursor-pointer hover:border-ds-success hover:bg-ds-success-soft dark:hover:border-ds-success dark:hover:bg-ds-success-soft/20 transition-colors">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-encre-3 dark:text-encre-3" />
                      <span className="text-sm text-encre-3">{uploadingVisual ? 'Upload du visuel...' : 'Télécharger un visuel'}</span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">Description rapide</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent" placeholder="Description de l'entreprise et de son activité..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">Site web (optionnel)</label>
                  <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent" placeholder="www.entreprise.com" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">Téléphone (optionnel)</label>
                  <input type="tel" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent" placeholder="01 23 45 67 89" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">Adresse (optionnelle)</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent" placeholder="123 Rue de la Paix, 75001 Paris" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">Niveau de sponsoring *</label>
                  <select
                    value={formData.sponsor_type}
                    onChange={(e) => setFormData({ ...formData, sponsor_type: e.target.value as any })}
                    className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  >
                    <option value="Platine">Platine (4 campagnes/mois)</option>
                    <option value="Or">Or (3 campagnes/mois)</option>
                    <option value="Argent">Argent (2 campagnes/mois)</option>
                    <option value="Bronze">Bronze (1 campagne/mois)</option>
                    <option value="Partenaire">Partenaire (1 campagne/mois)</option>
                  </select>
                  <p className="text-xs text-encre-3 mt-1">
                    Le niveau détermine le nombre de campagnes de mailing autorisées par mois
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
                  <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 text-encre-3 bg-white dark:bg-slate-700 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg hover:bg-papier-2 dark:hover:bg-slate-600 transition-colors">
                    Annuler
                  </button>
                  <button type="submit" disabled={submitting || !formData.name || !formData.contact_email} className="flex items-center px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta-deep dark:bg-terracotta dark:hover:bg-terracotta transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : <Send className="h-4 w-4 mr-2" />}
                    {submitting ? 'Création en cours...' : 'Créer le sponsor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire d'édition */}
      {showEditForm && editingSponsor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-encre">Modifier le sponsor</h2>
                <button onClick={() => { setShowEditForm(false); setEditingSponsor(null); }} className="p-2 hover:bg-papier-2 dark:hover:bg-slate-700 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateSponsor} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">Nom de l'entreprise *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">Email de contact *</label>
                  <input type="email" required value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">Logo de l'entreprise</label>
                  {formData.logo_url && (
                    <div className="mb-4 relative">
                      <img src={formData.logo_url} alt="Logo" className="w-32 h-32 object-contain border rounded-lg bg-papier-2 dark:bg-slate-700 border-[var(--ds-border)] dark:border-[var(--ds-border-2)]" />
                      <button type="button" onClick={() => setFormData({ ...formData, logo_url: '' })} className="absolute -top-2 -right-2 p-1 bg-ds-danger text-white rounded-full hover:bg-ds-danger dark:bg-ds-danger dark:hover:bg-ds-danger">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <label className="block">
                    <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleLogoUpload(file); }} className="hidden" disabled={uploadingLogo} />
                    <div className="w-full p-4 border-2 border-dashed border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg text-center cursor-pointer hover:border-terracotta hover:bg-terracotta-soft dark:hover:border-terracotta dark:hover:bg-terracotta-soft transition-colors">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-encre-3 dark:text-encre-3" />
                      <span className="text-sm text-encre-3">{uploadingLogo ? 'Upload du logo...' : 'Modifier le logo'}</span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">Visuel promotionnel</label>
                  {formData.visual_url && (
                    <div className="mb-4 relative">
                      <img src={formData.visual_url} alt="Visuel" className="w-full h-32 object-cover border rounded-lg bg-papier-2 dark:bg-slate-700 border-[var(--ds-border)] dark:border-[var(--ds-border-2)]" />
                      <button type="button" onClick={() => setFormData({ ...formData, visual_url: '' })} className="absolute -top-2 -right-2 p-1 bg-ds-danger text-white rounded-full hover:bg-ds-danger dark:bg-ds-danger dark:hover:bg-ds-danger">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <label className="block">
                    <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleVisualUpload(file); }} className="hidden" disabled={uploadingVisual} />
                    <div className="w-full p-4 border-2 border-dashed border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg text-center cursor-pointer hover:border-ds-success hover:bg-ds-success-soft dark:hover:border-ds-success dark:hover:bg-ds-success-soft/20 transition-colors">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-encre-3 dark:text-encre-3" />
                      <span className="text-sm text-encre-3">{uploadingVisual ? 'Upload du visuel...' : 'Modifier le visuel'}</span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">Description rapide</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent" placeholder="Description de l'entreprise et de son activité..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">Site web (optionnel)</label>
                  <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent" placeholder="www.entreprise.com" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">Téléphone (optionnel)</label>
                  <input type="tel" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent" placeholder="01 23 45 67 89" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">Adresse (optionnelle)</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent" placeholder="123 Rue de la Paix, 75001 Paris" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">Niveau de sponsoring *</label>
                  <select
                    value={formData.sponsor_type}
                    onChange={(e) => setFormData({ ...formData, sponsor_type: e.target.value as any })}
                    className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  >
                    <option value="Platine">Platine (4 campagnes/mois)</option>
                    <option value="Or">Or (3 campagnes/mois)</option>
                    <option value="Argent">Argent (2 campagnes/mois)</option>
                    <option value="Bronze">Bronze (1 campagne/mois)</option>
                    <option value="Partenaire">Partenaire (1 campagne/mois)</option>
                  </select>
                  <p className="text-xs text-encre-3 mt-1">
                    Le niveau détermine le nombre de campagnes de mailing autorisées par mois
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
                  <button type="button" onClick={() => { setShowEditForm(false); setEditingSponsor(null); }} className="px-4 py-2 text-encre-3 bg-white dark:bg-slate-700 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg hover:bg-papier-2 dark:hover:bg-slate-600 transition-colors">
                    Annuler
                  </button>
                  <button type="submit" disabled={submitting || !formData.name || !formData.contact_email} className="flex items-center px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta-deep dark:bg-terracotta dark:hover:bg-terracotta transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : <Send className="h-4 w-4 mr-2" />}
                    {submitting ? 'Mise à jour...' : 'Mettre à jour'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {filteredSponsors.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSponsors.map((sponsor) => (
            <div key={sponsor.id} className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)] overflow-hidden hover:shadow-md transition-shadow">
              {sponsor.visual_url && (
                <div className="h-48 overflow-hidden">
                  <img src={sponsor.visual_url} alt={`Visuel ${sponsor.name}`} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="p-6 border-b border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {sponsor.logo_url ? (
                      <img src={sponsor.logo_url} alt={`Logo ${sponsor.name}`} className="h-12 w-12 object-contain rounded" />
                    ) : (
                      <div className="h-12 w-12 bg-papier-2 dark:bg-slate-700 rounded flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-encre-3 dark:text-encre-3" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-encre flex items-center flex-wrap gap-2">
                        {sponsor.name}
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          sponsor.sponsor_type === 'Platine' ? 'bg-ds-info-soft dark:bg-ds-info-soft/30 text-ds-info dark:text-ds-info' :
                          sponsor.sponsor_type === 'Or' ? 'bg-ds-warning-soft dark:bg-ds-warning-soft/30 text-ds-warning dark:text-ds-warning' :
                          sponsor.sponsor_type === 'Argent' ? 'bg-papier-2 dark:bg-papier-3 text-encre-2 dark:text-encre-3' :
                          'bg-ds-warning-soft dark:bg-ds-warning-soft/30 text-ds-warning dark:text-ds-warning'
                        }`}>
                          {sponsor.sponsor_type}
                        </span>
                        {!sponsor.is_confirmed && (
                          <span className="px-2 py-1 text-xs bg-ds-warning-soft dark:bg-ds-warning-soft/30 text-ds-warning dark:text-ds-warning rounded-full">
                            En attente
                          </span>
                        )}
                      </h3>
                    </div>
                  </div>
                  
                  {(isSuperAdmin || isClubAdmin) && (
                    <div className="flex space-x-2">
                      <button onClick={() => openEditForm(sponsor)} className="p-2 text-terracotta dark:text-terracotta hover:bg-terracotta-soft dark:hover:bg-terracotta-soft rounded-lg transition-colors" title="Modifier">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteSponsor(sponsor.id)} className="p-2 text-ds-danger dark:text-ds-danger hover:bg-ds-danger-soft dark:hover:bg-ds-danger-soft rounded-lg transition-colors" title="Supprimer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-4">
                {sponsor.description && (
                  <p className="text-encre-3 text-sm leading-relaxed">{sponsor.description}</p>
                )}

                <div className="space-y-2">
                  {sponsor.website && (
                    <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-terracotta dark:text-terracotta hover:text-terracotta-deep dark:hover:text-terracotta text-sm transition-colors">
                      <ExternalLink className="h-4 w-4 mr-2" />Site web
                    </a>
                  )}
                  {sponsor.contact_email && (
                    <a href={`mailto:${sponsor.contact_email}`} className="flex items-center text-encre-3 hover:text-encre dark:hover:text-encre-3 text-sm transition-colors">
                      <Mail className="h-4 w-4 mr-2" />{sponsor.contact_email}
                    </a>
                  )}
                  {sponsor.contact_phone && (
                    <a href={`tel:${sponsor.contact_phone}`} className="flex items-center text-encre-3 hover:text-encre dark:hover:text-encre-3 text-sm transition-colors">
                      <Phone className="h-4 w-4 mr-2" />{sponsor.contact_phone}
                    </a>
                  )}
                  {sponsor.address && (
                    <div className="flex items-center text-encre-3 text-sm">
                      <MapPin className="h-4 w-4 mr-2" />{sponsor.address}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
                  <div className="flex items-center justify-between text-xs text-encre-3 dark:text-encre-3">
                    <span>{sponsor.club_id ? 'Sponsor de club' : 'Sponsor d\'association'}</span>
                    <span>Depuis {new Date(sponsor.created_at).getFullYear()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-encre-3 dark:text-encre-3 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-encre mb-2">Aucun sponsor pour le moment</h2>
          <p className="text-encre-3 mb-6">
            {(isSuperAdmin || isClubAdmin) ? 'Commencez par ajouter vos premiers sponsors et partenaires.' : 'Aucun sponsor n\'est encore référencé pour votre association.'}
          </p>
          {(isSuperAdmin || isClubAdmin) && (
            <button onClick={openCreateForm} className="inline-flex items-center px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta-deep dark:bg-terracotta dark:hover:bg-terracotta transition-colors">
              <Plus className="h-4 w-4 mr-2" />Ajouter le premier sponsor
            </button>
          )}
        </div>
      )}
    </div>
  );
}