import React, { useState, useRef, useEffect } from 'react';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { Camera, Lock, Save, User, AlertCircle, Building2, Mail, Globe, Check } from 'lucide-react';
import WebsiteGenerator from '../components/WebsiteGenerator';

interface Message {
  type: 'success' | 'error';
  text: string;
}

interface ClubData {
  id: string;
  name: string;
  contact_email: string | null;
  website_url: string | null;
  logo_url: string | null;
}

interface AssociationData {
  id: string;
  name: string;
  logo_url: string | null;
}

export default function Settings() {
  const { profile, user } = useAuthNew();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const clubLogoInputRef = useRef<HTMLInputElement>(null);
  const associationLogoInputRef = useRef<HTMLInputElement>(null);
  
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(
    profile?.avatar_url || null
  );
  
  // État pour les données du club (Club Admin uniquement)
  const [clubData, setClubData] = useState<ClubData | null>(null);
  const [clubLoading, setClubLoading] = useState(false);
  
  // État pour les données de l'association (Super Admin uniquement)
  const [associationData, setAssociationData] = useState<AssociationData | null>(null);
  const [associationLoading, setAssociationLoading] = useState(false);
  
  // État pour la vérification du pseudo
  const [pseudoAvailable, setPseudoAvailable] = useState<boolean | null>(null);
  const [checkingPseudo, setCheckingPseudo] = useState(false);
  
  // État pour le changement de mot de passe
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // État pour les informations de profil
  const [profileForm, setProfileForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    pseudo: profile?.pseudo || '',
  });

  // État pour les informations du club
  const [clubForm, setClubForm] = useState({
    contact_email: '',
    website_url: '',
  });

  // ✅ AJOUT : État pour les préférences email
  const [emailPreferences, setEmailPreferences] = useState({
  email_consent_clubs: false,
  email_consent_association: false,
  email_consent_municipality: false,
  email_consent_sponsors: false,
});
  const [emailPreferencesLoading, setEmailPreferencesLoading] = useState(false);

// Ajoutez ce useEffect après la déclaration des states (vers la ligne 70)

// Charger les données du profil dans le formulaire quand le profil est disponible
useEffect(() => {
  if (profile) {
    setProfileForm({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      pseudo: profile.pseudo || '',
    });
    // ✅ AJOUT : Charger aussi les préférences email
    fetchEmailPreferences();
  }
}, [profile]); // Se déclenche quand profile change

  // Charger les données du club si l'utilisateur est Club Admin
  useEffect(() => {
    if (profile?.role === 'Club Admin' && profile?.club_id) {
      fetchClubData();
    }
    if (profile?.role === 'Super Admin' && profile?.association_id) {
      fetchAssociationData();
    }
  }, [profile]);

  const fetchClubData = async () => {
    if (!profile?.club_id) return;

    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name, contact_email, website_url, logo_url')
        .eq('id', profile.club_id)
        .single();

      if (error) throw error;

      setClubData(data);
      setClubForm({
        contact_email: data.contact_email || '',
        website_url: data.website_url || '',
      });
    } catch (err: any) {
      console.error('Erreur lors du chargement des données du club:', err);
    }
  };

  const fetchAssociationData = async () => {
    if (!profile?.association_id) return;

    try {
      const { data, error } = await supabase
        .from('associations')
        .select('id, name, logo_url')
        .eq('id', profile.association_id)
        .single();

      if (error) throw error;

      setAssociationData(data);
    } catch (err: any) {
      console.error('Erreur lors du chargement des données de l\'association:', err);
    }
  };

  // Vérification de la disponibilité du pseudo
  const checkPseudoAvailability = async (pseudo: string) => {
    if (pseudo.length < 3 || pseudo === profile?.pseudo) {
      setPseudoAvailable(null);
      return;
    }

    setCheckingPseudo(true);
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('pseudo')
        .eq('pseudo', pseudo.trim().toLowerCase())
        .maybeSingle();

      setCheckingPseudo(false);
      setPseudoAvailable(!data);
    } catch {
      setCheckingPseudo(false);
      setPseudoAvailable(null);
    }
  };

  const handlePseudoChange = (pseudo: string) => {
    setProfileForm({ ...profileForm, pseudo });
    
    const timeoutId = setTimeout(() => {
      checkPseudoAvailability(pseudo);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // ✅ AJOUT : Gestion des préférences email
  const handleEmailPreferencesUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailPreferencesLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          email_consent_clubs: emailPreferences.email_consent_clubs,
          email_consent_association: emailPreferences.email_consent_association,
          email_consent_municipality: emailPreferences.email_consent_municipality,
          email_consent_sponsors: emailPreferences.email_consent_sponsors,
        })
        .eq('id', user!.id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Préférences email mises à jour avec succès !',
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setEmailPreferencesLoading(false);
    }
  };
  // ✅ AJOUTER : cette nouvelle fonction après vos autres fonctions
const fetchEmailPreferences = async () => {
  if (!user?.id) return;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email_consent_clubs, email_consent_association, email_consent_municipality, email_consent_sponsors')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    if (data) {
      setEmailPreferences({
        email_consent_clubs: data.email_consent_clubs || false,
        email_consent_association: data.email_consent_association || false,
        email_consent_municipality: data.email_consent_municipality || false,
        email_consent_sponsors: data.email_consent_sponsors || false,
      });
    }
  } catch (err: any) {
    console.error('Erreur lors du chargement des préférences email:', err);
  }
};

  // Upload de logo (réutilise la logique de RegistrationForms.tsx)
  const uploadLogo = async (file: File, type: 'association' | 'club', entityId: string): Promise<string | null> => {
    try {
      console.log(`Début upload ${type} logo pour l'entité ${entityId}`);

      // Vérifier que le fichier est valide
      if (!file || file.size === 0) {
        throw new Error('Fichier invalide');
      }

      // Vérifier la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Le fichier ne doit pas dépasser 2MB');
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        throw new Error('Seuls les fichiers image sont acceptés');
      }

      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${entityId}-${Date.now()}.${fileExt}`;
      
      // Utiliser le bucket "logos" avec le bon dossier selon le type
      const bucketName = 'logos';
      const folderName = type === 'association' ? 'association-logos' : 'club-logos';
      const filePath = `${folderName}/${fileName}`;
      
      console.log(`Tentative upload vers le bucket "${bucketName}", chemin: ${filePath}`);

      // Essayer directement l'upload
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error('Erreur upload logo:', uploadError);
        throw new Error(`Échec de l'upload du logo: ${uploadError.message}`);
      }
      
      if (!uploadData) {
        throw new Error('Upload échoué: aucune donnée retournée');
      }
      
      console.log('Upload réussi:', uploadData);
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
        
      console.log('URL publique générée:', publicUrl);
      
      return publicUrl;
    } catch (error: any) {
      console.error('Erreur lors de l\'upload:', error);
      throw error;
    }
  };

  const handleClubLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clubData) return;

    setClubLoading(true);
    setMessage(null);

    try {
      console.log('=== DÉBUT UPLOAD LOGO CLUB ===');
      console.log('Club ID:', clubData.id);
      console.log('Fichier:', file.name, file.size, file.type);

      // Upload du nouveau logo
      const logoUrl = await uploadLogo(file, 'club', clubData.id);
      console.log('URL retournée par uploadLogo:', logoUrl);
      
      if (logoUrl) {
        console.log('=== MISE À JOUR BASE DE DONNÉES ===');
        // Mettre à jour la base de données
        const { data: updateData, error: updateError } = await supabase
          .from('clubs')
          .update({ logo_url: logoUrl })
          .eq('id', clubData.id)
          .select();

        console.log('Résultat mise à jour BDD:', { updateData, updateError });

        if (updateError) {
          console.error('Erreur mise à jour BDD:', updateError);
          throw updateError;
        }

        // Vérifier que la mise à jour a bien eu lieu
        const { data: verifyData, error: verifyError } = await supabase
          .from('clubs')
          .select('logo_url')
          .eq('id', clubData.id)
          .single();

        console.log('Vérification après mise à jour:', { verifyData, verifyError });

        if (verifyData) {
          console.log('Logo URL sauvegardé en BDD:', verifyData.logo_url);
          if (verifyData.logo_url === logoUrl) {
            console.log('✅ URL correctement sauvegardée');
          } else {
            console.log('❌ URL différente en BDD:', verifyData.logo_url, 'vs attendue:', logoUrl);
          }
        }

        // Mettre à jour les données locales
        setClubData({
          ...clubData,
          logo_url: logoUrl,
        });

        setMessage({
          type: 'success',
          text: 'Logo du club mis à jour avec succès !',
        });

        console.log('=== UPLOAD LOGO CLUB TERMINÉ ===');
      } else {
        throw new Error('Upload échoué: aucune URL retournée');
      }
    } catch (error: any) {
      console.error('=== ERREUR UPLOAD LOGO CLUB ===', error);
      setMessage({ type: 'error', text: `Erreur upload logo: ${error.message}` });
    } finally {
      setClubLoading(false);
    }
  };

  const handleAssociationLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !associationData) return;

    setAssociationLoading(true);
    setMessage(null);

    try {
      // Upload du nouveau logo
      const logoUrl = await uploadLogo(file, 'association', associationData.id);
      
      if (logoUrl) {
        // Mettre à jour la base de données
        const { error: updateError } = await supabase
          .from('associations')
          .update({ logo_url: logoUrl })
          .eq('id', associationData.id);

        if (updateError) throw updateError;

        // Mettre à jour les données locales
        setAssociationData({
          ...associationData,
          logo_url: logoUrl,
        });

        setMessage({
          type: 'success',
          text: 'Logo de l\'association mis à jour avec succès !',
        });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `Erreur upload logo: ${error.message}` });
    } finally {
      setAssociationLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Vérifier que les nouveaux mots de passe correspondent
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('Les nouveaux mots de passe ne correspondent pas');
      }

      // Vérifier la force du mot de passe
      if (passwordForm.newPassword.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères');
      }

      // Changer le mot de passe avec Supabase
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Mot de passe modifié avec succès !',
      });

      // Réinitialiser le formulaire
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    setMessage(null);

    try {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        throw new Error('Veuillez sélectionner un fichier image');
      }

      // Vérifier la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('L\'image ne doit pas dépasser 2MB');
      }

      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Supprimer l'ancienne photo s'il y en a une
      if (profilePicture) {
        const oldPath = profilePicture.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`avatars/${oldPath}`]);
        }
      }

      // Uploader la nouvelle photo
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Mettre à jour le profil dans la base de données
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfilePicture(publicUrl);
      setMessage({
        type: 'success',
        text: 'Photo de profil mise à jour avec succès !',
      });

      // Actualiser la page pour afficher immédiatement les changements
      setTimeout(() => {
        window.location.reload();
      }, 1500); // Délai pour que l'utilisateur voie le message de succès
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Vérifier si le pseudo est disponible
      if (profileForm.pseudo !== profile?.pseudo && pseudoAvailable === false) {
        throw new Error('Ce pseudo est déjà utilisé');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileForm.first_name,
          last_name: profileForm.last_name,
          pseudo: profileForm.pseudo.trim().toLowerCase(),
        })
        .eq('id', user!.id);

      if (error) {
        if (error.code === '23505') {
          throw new Error('Ce pseudo est déjà utilisé');
        }
        throw error;
      }

      setMessage({
        type: 'success',
        text: 'Informations mises à jour avec succès !',
      });

      // Réinitialiser l'état de disponibilité du pseudo
      setPseudoAvailable(null);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClubUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubData) return;

    setClubLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('clubs')
        .update({
          contact_email: clubForm.contact_email.trim() || null,
          website_url: clubForm.website_url.trim() || null,
        })
        .eq('id', clubData.id);

      if (error) throw error;

      // Mettre à jour les données locales
      setClubData({
        ...clubData,
        contact_email: clubForm.contact_email.trim() || null,
        website_url: clubForm.website_url.trim() || null,
      });

      setMessage({
        type: 'success',
        text: 'Informations du club mises à jour avec succès !',
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setClubLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
          <h1 className="text-3xl font-bold text-encre">Paramètres du compte</h1>
          <p className="text-encre-3 mt-2">
            Gérez vos informations personnelles et paramètres de sécurité
          </p>
        </div>

        {message && (
          <div className={`mx-6 mt-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-ds-success-soft text-ds-success border border-ds-success dark:bg-ds-success-soft/20 dark:text-ds-success dark:border-ds-success' 
              : 'bg-ds-danger-soft text-ds-danger border border-ds-danger dark:bg-ds-danger-soft dark:text-ds-danger dark:border-ds-danger'
          }`}>
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {message.text}
            </div>
          </div>
        )}

        <div className="p-6 space-y-8">
          {/* Section Photo de Profil */}
          <div className="border-b border-[var(--ds-border)] dark:border-[var(--ds-border-2)] pb-8">
            <h2 className="text-xl font-semibold text-encre mb-4 flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Photo de profil
            </h2>
            
            <div className="flex items-center space-x-6">
              <div className="relative">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Photo de profil"
                    className="w-24 h-24 rounded-full object-cover border-4 border-[var(--ds-border)] dark:border-[var(--ds-border-2)]"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-papier-3 dark:bg-slate-700 flex items-center justify-center border-4 border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
                    <User className="h-8 w-8 text-encre-3 dark:text-encre-3" />
                  </div>
                )}
                <button
                  onClick={triggerFileInput}
                  disabled={loading}
                  className="absolute bottom-0 right-0 bg-terracotta text-white p-2 rounded-full hover:bg-terracotta-deep dark:bg-terracotta dark:hover:bg-terracotta transition-colors shadow-lg"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              
              <div>
                <h3 className="font-medium text-encre">
                  {profile?.first_name} {profile?.last_name}
                </h3>
                <p className="text-sm text-encre-3 mb-2">{profile?.role}</p>
                <button
                  onClick={triggerFileInput}
                  disabled={loading}
                  className="text-sm bg-papier-2 dark:bg-slate-700 text-encre-3 px-4 py-2 rounded-lg hover:bg-papier-3 dark:hover:bg-slate-600 transition-colors"
                >
                  {loading ? 'Chargement...' : 'Changer la photo'}
                </button>
                <p className="text-xs text-encre-3 mt-1">
                  Formats acceptés: JPG, PNG (max 2MB)
                </p>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
          </div>

          {/* Section Informations Personnelles */}
          <div className="border-b border-[var(--ds-border)] dark:border-[var(--ds-border-2)] pb-8">
            <h2 className="text-xl font-semibold text-encre mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informations personnelles
            </h2>
            
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm({
                      ...profileForm,
                      first_name: e.target.value
                    })}
                    className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-4 py-3 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    placeholder="Votre prénom"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm({
                      ...profileForm,
                      last_name: e.target.value
                    })}
                    className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-4 py-3 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              {/* Champ Pseudo */}
              <div>
                <label className="block text-sm font-medium text-encre-3 mb-2">
                  Pseudo <span className="text-xs">(visible publiquement)</span>
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={30}
                  
                  value={profileForm.pseudo}
                  onChange={(e) => handlePseudoChange(e.target.value)}
                  className={`bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent ${
                    pseudoAvailable === true ? 'border-ds-success' :
                    pseudoAvailable === false ? 'border-ds-danger' : 'border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)]'
                  }`}
                  placeholder="votre_pseudo"
                />
                <p className="text-xs text-encre-3 mt-1">
                  3-30 caractères : lettres, chiffres, tirets (-) et underscores (_)
                </p>
                
                {checkingPseudo && (
                  <p className="mt-2 text-sm text-terracotta dark:text-terracotta flex items-center">
                    <div className="animate-spin w-4 h-4 border-2 border-terracotta border-t-transparent rounded-full mr-2"></div>
                    Vérification du pseudo...
                  </p>
                )}
                
                {pseudoAvailable === true && (
                  <p className="mt-2 text-sm text-ds-success dark:text-ds-success flex items-center">
                    <Check className="w-4 h-4 mr-2" />
                    Pseudo disponible
                  </p>
                )}
                
                {pseudoAvailable === false && profileForm.pseudo && profileForm.pseudo !== profile?.pseudo && (
                  <p className="mt-2 text-sm text-ds-danger dark:text-ds-danger flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Pseudo déjà pris
                  </p>
                )}
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading || (pseudoAvailable === false && profileForm.pseudo !== profile?.pseudo)}
                  className="bg-terracotta text-white px-6 py-3 rounded-lg hover:bg-terracotta-deep dark:bg-terracotta dark:hover:bg-terracotta disabled:opacity-50 transition-colors flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Sauvegarde...' : 'Sauvegarder les informations'}
                </button>
              </div>
            </form>
          </div>

          {/* ✅ NOUVELLE SECTION : Préférences Email */}
          <div className="border-b border-[var(--ds-border)] dark:border-[var(--ds-border-2)] pb-8">
            <h2 className="text-xl font-semibold text-encre mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Préférences de notification email
            </h2>
            
            <div className="bg-terracotta-soft dark:bg-terracotta-soft p-4 rounded-lg mb-6">
              <p className="text-sm text-terracotta-deep dark:text-terracotta">
                Vous pouvez à tout moment activer ou désactiver les notifications email selon vos préférences. 
                Ces paramètres respectent le RGPD et vous donnent un contrôle total sur vos données.
              </p>
            </div>

            <form onSubmit={handleEmailPreferencesUpdate} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-papier-2 dark:bg-slate-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-encre">Emails des clubs</h3>
                    <p className="text-sm text-encre-3">Notifications et actualités des clubs que vous suivez</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailPreferences.email_consent_clubs}
                      onChange={(e) => setEmailPreferences({
                        ...emailPreferences,
                        email_consent_clubs: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-papier-3 dark:bg-papier-3 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--ds-border-2)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-[var(--ds-border-2)] peer-checked:bg-terracotta"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-papier-2 dark:bg-slate-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-encre">Emails de l'association</h3>
                    <p className="text-sm text-encre-3">Communications officielles de votre association</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailPreferences.email_consent_association}
                      onChange={(e) => setEmailPreferences({
                        ...emailPreferences,
                        email_consent_association: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-papier-3 dark:bg-papier-3 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--ds-border-2)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-[var(--ds-border-2)] peer-checked:bg-terracotta"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-papier-2 dark:bg-slate-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-encre">Emails de la mairie</h3>
                    <p className="text-sm text-encre-3">Informations municipales et événements locaux</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailPreferences.email_consent_municipality}
                      onChange={(e) => setEmailPreferences({
                        ...emailPreferences,
                        email_consent_municipality: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-papier-3 dark:bg-papier-3 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--ds-border-2)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-[var(--ds-border-2)] peer-checked:bg-terracotta"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-papier-2 dark:bg-slate-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-encre">Emails des sponsors</h3>
                    <p className="text-sm text-encre-3">Offres et communications des partenaires du club</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailPreferences.email_consent_sponsors}
                      onChange={(e) => setEmailPreferences({
                        ...emailPreferences,
                        email_consent_sponsors: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-papier-3 dark:bg-papier-3 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--ds-border-2)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-[var(--ds-border-2)] peer-checked:bg-terracotta"></div>
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={emailPreferencesLoading}
                className="bg-terracotta text-white px-6 py-3 rounded-lg hover:bg-terracotta-deep dark:bg-terracotta dark:hover:bg-terracotta disabled:opacity-50 transition-colors flex items-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                {emailPreferencesLoading ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
              </button>
            </form>
          </div>

          {/* Section Club (uniquement pour les Club Admins) */}
          {profile?.role === 'Club Admin' && clubData && (
            <div className="border-b border-[var(--ds-border)] dark:border-[var(--ds-border-2)] pb-8">
              <h2 className="text-xl font-semibold text-encre mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Paramètres du club
              </h2>
              
              <div className="bg-ds-success-soft dark:bg-ds-success-soft/20 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-ds-success dark:text-ds-success mb-2">{clubData.name}</h3>
                <p className="text-sm text-ds-success dark:text-ds-success">
                  Vous êtes administrateur de ce club. Vous pouvez modifier les informations de contact et le logo.
                </p>
              </div>

              {/* Logo du club */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-encre mb-4 flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Logo du club
                </h3>
                
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {clubData.logo_url ? (
                      <img
                        src={clubData.logo_url}
                        alt={`Logo ${clubData.name}`}
                        className="w-24 h-24 rounded-lg object-cover border-4 border-[var(--ds-border)] dark:border-[var(--ds-border-2)]"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-papier-3 dark:bg-slate-700 flex items-center justify-center border-4 border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
                        <Building2 className="h-8 w-8 text-encre-3 dark:text-encre-3" />
                      </div>
                    )}
                    <button
                      onClick={() => clubLogoInputRef.current?.click()}
                      disabled={clubLoading}
                      className="absolute bottom-0 right-0 bg-ds-success text-white p-2 rounded-full hover:bg-ds-success dark:bg-ds-success dark:hover:bg-ds-success transition-colors shadow-lg"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-encre">Logo du club</h4>
                    <p className="text-sm text-encre-3 mb-2">
                      {clubData.logo_url ? 'Logo actuel' : 'Aucun logo défini'}
                    </p>
                    <button
                      onClick={() => clubLogoInputRef.current?.click()}
                      disabled={clubLoading}
                      className="text-sm bg-papier-2 dark:bg-slate-700 text-encre-3 px-4 py-2 rounded-lg hover:bg-papier-3 dark:hover:bg-slate-600 transition-colors"
                    >
                      {clubLoading ? 'Chargement...' : 'Changer le logo'}
                    </button>
                    <p className="text-xs text-encre-3 mt-1">
                      Formats acceptés: JPG, PNG (max 2MB)
                    </p>
                  </div>
                </div>
                
                <input
                  ref={clubLogoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleClubLogoChange}
                  className="hidden"
                />
              </div>
              
              <form onSubmit={handleClubUpdate} className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">
                    Email de contact du club
                  </label>
                  <input
                    type="email"
                    value={clubForm.contact_email}
                    onChange={(e) => setClubForm({
                      ...clubForm,
                      contact_email: e.target.value
                    })}
                    className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-4 py-3 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent"
                    placeholder="contact@club.com"
                  />
                  <p className="mt-2 text-sm text-encre-3">
                    Cet email sera affiché aux membres et followers pour vous contacter. 
                    Laissez vide si vous ne souhaitez pas afficher d'email de contact.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-encre-3 mb-2">
                    Site web du club
                  </label>
                  <input
                    type="url"
                    value={clubForm.website_url}
                    onChange={(e) => setClubForm({
                      ...clubForm,
                      website_url: e.target.value
                    })}
                    className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-4 py-3 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent"
                    placeholder="https://www.monclub.com"
                  />
                  <p className="mt-2 text-sm text-encre-3">
                    URL complète du site web du club (optionnel). Sera affichée aux membres et followers.
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={clubLoading}
                  className="bg-ds-success text-white px-6 py-3 rounded-lg hover:bg-ds-success dark:bg-ds-success dark:hover:bg-ds-success disabled:opacity-50 transition-colors flex items-center"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {clubLoading ? 'Sauvegarde...' : 'Mettre à jour les informations'}
                </button>
              </form>

              {/* ✅ CORRECTION : Section Générateur de Site Web */}
              {/* Ne passer currentWebsiteUrl que si c'est un site GÉNÉRÉ (commence par /) */}
              {profile?.role === 'Club Admin' && clubData && (
                <div className="mt-8">
                  <WebsiteGenerator
                    clubId={clubData.id}
                    clubName={clubData.name}
                    currentWebsiteUrl={clubData.website_url?.startsWith('/') ? clubData.website_url : null}
                    onSuccess={(websiteUrl) => {
                      // Mettre à jour les données locales après génération
                      setClubData({ ...clubData, website_url: websiteUrl });
                      setClubForm({ ...clubForm, website_url: websiteUrl });
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Section Association (uniquement pour les Super Admins) */}
          {profile?.role === 'Super Admin' && associationData && (
            <div className="border-b border-[var(--ds-border)] dark:border-[var(--ds-border-2)] pb-8">
              <h2 className="text-xl font-semibold text-encre mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Paramètres de l'association
              </h2>
              
              <div className="bg-terracotta-soft dark:bg-terracotta-soft p-4 rounded-lg mb-6">
                <h3 className="font-medium text-terracotta-deep dark:text-terracotta mb-2">{associationData.name}</h3>
                <p className="text-sm text-terracotta-deep dark:text-terracotta">
                  Vous êtes super administrateur de cette association. Vous pouvez modifier le logo.
                </p>
              </div>

              {/* Logo de l'association */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-encre mb-4 flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Logo de l'association
                </h3>
                
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {associationData.logo_url ? (
                      <img
                        src={associationData.logo_url}
                        alt={`Logo ${associationData.name}`}
                        className="w-24 h-24 rounded-lg object-cover border-4 border-[var(--ds-border)] dark:border-[var(--ds-border-2)]"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-papier-3 dark:bg-slate-700 flex items-center justify-center border-4 border-[var(--ds-border)] dark:border-[var(--ds-border-2)]">
                        <Building2 className="h-8 w-8 text-encre-3 dark:text-encre-3" />
                      </div>
                    )}
                    <button
                      onClick={() => associationLogoInputRef.current?.click()}
                      disabled={associationLoading}
                      className="absolute bottom-0 right-0 bg-terracotta text-white p-2 rounded-full hover:bg-terracotta-deep dark:bg-terracotta dark:hover:bg-terracotta transition-colors shadow-lg"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-encre">Logo de l'association</h4>
                    <p className="text-sm text-encre-3 mb-2">
                      {associationData.logo_url ? 'Logo actuel' : 'Aucun logo défini'}
                    </p>
                    <button
                      onClick={() => associationLogoInputRef.current?.click()}
                      disabled={associationLoading}
                      className="text-sm bg-papier-2 dark:bg-slate-700 text-encre-3 px-4 py-2 rounded-lg hover:bg-papier-3 dark:hover:bg-slate-600 transition-colors"
                    >
                      {associationLoading ? 'Chargement...' : 'Changer le logo'}
                    </button>
                    <p className="text-xs text-encre-3 mt-1">
                      Formats acceptés: JPG, PNG (max 2MB)
                    </p>
                  </div>
                </div>
                
                <input
                  ref={associationLogoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAssociationLogoChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Section Changement de Mot de Passe */}
          <div>
            <h2 className="text-xl font-semibold text-encre mb-4 flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Changer le mot de passe
            </h2>
            
            <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium text-encre-3 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value
                  })}
                  className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-4 py-3 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  placeholder="Nouveau mot de passe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-encre-3 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value
                  })}
                  className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-4 py-3 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  placeholder="Confirmer le mot de passe"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="bg-terracotta text-white px-6 py-3 rounded-lg hover:bg-terracotta-deep dark:bg-terracotta dark:hover:bg-terracotta disabled:opacity-50 transition-colors flex items-center"
              >
                <Lock className="h-4 w-4 mr-2" />
                {loading ? 'Changement...' : 'Changer le mot de passe'}
              </button>
              
              <div className="text-sm text-encre-3">
                <p>Le mot de passe doit contenir au moins :</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>8 caractères minimum</li>
                  <li>Une combinaison de lettres et chiffres recommandée</li>
                </ul>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}