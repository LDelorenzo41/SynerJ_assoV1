import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Building, 
  Users, 
  UserPlus, 
  ArrowRight, 
  Check,
  AlertCircle,
  Crown,
  Star,
  Building2,
  Zap
} from 'lucide-react';
import ProfilePictureUpload from './ProfilePictureUpload';
import { NotificationService } from '../services/notificationService';

type FormType = 'association' | 'club' | 'user' | null;
type SubscriptionPlan = '1-4' | '5-10' | '11-15' | '16-25' | '25+';

interface AssociationForm {
  name: string;
  city: string;
  email: string;
  phone: string;
  description: string;
  subscription_plan: SubscriptionPlan;
  logo_url: string;
  password: string;
}

interface ClubForm {
  name: string;
  description: string;
  club_email: string;
  contact_email: string;
  website_url?: string; // Ajout du champ website_url
  association_code: string;
  logo_url: string;
  password: string;
}

interface UserForm {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  club_code: string;
  avatar_url: string;
  email_consents: {
    clubs: boolean;
    association: boolean;
    municipality: boolean;
    sponsors: boolean;
  };
}

const SUBSCRIPTION_PLANS = [
  {
    id: '1-4' as SubscriptionPlan,
    name: 'Starter',
    description: '1 à 4 clubs',
    price: '29€',
    period: '/mois',
    features: ['Jusqu\'à 4 clubs', 'Gestion des événements', 'Support email', 'Tableau de bord basique'],
    icon: Building2,
    color: 'from-green-400 to-green-600',
    popular: false
  },
  {
    id: '5-10' as SubscriptionPlan,
    name: 'Growth',
    description: '5 à 10 clubs',
    price: '59€',
    period: '/mois',
    features: ['Jusqu\'à 10 clubs', 'Analytics avancées', 'Support prioritaire', 'Personnalisation'],
    icon: Star,
    color: 'from-blue-400 to-blue-600',
    popular: true
  },
  {
    id: '11-15' as SubscriptionPlan,
    name: 'Professional',
    description: '11 à 15 clubs',
    price: '89€',
    period: '/mois',
    features: ['Jusqu\'à 15 clubs', 'API complète', 'Support dédié', 'Intégrations avancées'],
    icon: Crown,
    color: 'from-purple-400 to-purple-600',
    popular: false
  },
  {
    id: '16-25' as SubscriptionPlan,
    name: 'Enterprise',
    description: '16 à 25 clubs',
    price: '149€',
    period: '/mois',
    features: ['Jusqu\'à 25 clubs', 'Support 24/7', 'Formation personnalisée', 'SLA garanti'],
    icon: Building,
    color: 'from-orange-400 to-orange-600',
    popular: false
  },
  {
    id: '25+' as SubscriptionPlan,
    name: 'Ultimate',
    description: 'Plus de 25 clubs',
    price: 'Sur mesure',
    period: '',
    features: ['Clubs illimités', 'Solutions sur mesure', 'Account manager dédié', 'Infrastructure dédiée'],
    icon: Zap,
    color: 'from-red-400 to-red-600',
    popular: false
  }
];

export default function RegistrationForms() {
  const [activeForm, setActiveForm] = useState<FormType>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  // États pour l'inscription utilisateur multi-étapes
  const [userStep, setUserStep] = useState(1);
  const [clubValidation, setClubValidation] = useState<{loading: boolean, valid: boolean | null, clubName: string}>({
    loading: false,
    valid: null,
    clubName: ''
  });

  // États pour les logos
  const [associationLogo, setAssociationLogo] = useState<File | null>(null);
  const [clubLogo, setClubLogo] = useState<File | null>(null);

  const [associationForm, setAssociationForm] = useState<AssociationForm>({
    name: '',
    city: '',
    email: '',
    phone: '',
    description: '',
    subscription_plan: '5-10',
    logo_url: '',
    password: '',
  });

  const [clubForm, setClubForm] = useState<ClubForm>({
    name: '',
    description: '',
    club_email: '',
    contact_email: '',
    website_url: '', // Ajout du champ website_url dans l'état initial
    association_code: '',
    logo_url: '',
    password: '',
  });

  const [userForm, setUserForm] = useState<UserForm>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    club_code: '',
    avatar_url: '',
    email_consents: {
      clubs: false,
      association: false,
      municipality: false,
      sponsors: false
    }
  });

  // Upload de logo vers Supabase Storage
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

      // Essayer directement l'upload sans vérifier l'existence du bucket
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
      
      // Vérifier que l'URL est valide
      if (!publicUrl || !publicUrl.includes(fileName)) {
        throw new Error('URL publique invalide générée');
      }
      
      return publicUrl;
    } catch (error: any) {
      console.error('Erreur lors de l\'upload:', error);
      setMessage({ 
        type: 'error', 
        text: `Erreur upload logo: ${error.message}` 
      });
      return null;
    }
  };

  // Validation en temps réel du code de club
  const validateClubCode = async (code: string) => {
    if (!code || code.length < 8) {
      setClubValidation({ loading: false, valid: null, clubName: '' });
      return;
    }

    setClubValidation({ loading: true, valid: null, clubName: '' });

    try {
      const cleanClubCode = code.trim().toUpperCase();
      
      const { data, error } = await supabase
        .from('clubs')
        .select('name')
        .eq('club_code', cleanClubCode)
        .single();

      if (error || !data) {
        setClubValidation({ loading: false, valid: false, clubName: '' });
      } else {
        setClubValidation({ loading: false, valid: true, clubName: data.name });
      }
    } catch (err) {
      setClubValidation({ loading: false, valid: false, clubName: '' });
    }
  };

  const handleClubCodeChange = (code: string) => {
    setUserForm({ ...userForm, club_code: code });
    
    const timeoutId = setTimeout(() => {
      validateClubCode(code);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleAvatarSelect = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserForm({ ...userForm, avatar_url: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      setUserForm({ ...userForm, avatar_url: '' });
    }
  };

  const handleAssociationLogoSelect = (file: File | null) => {
    setAssociationLogo(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAssociationForm({ ...associationForm, logo_url: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      setAssociationForm({ ...associationForm, logo_url: '' });
    }
  };

  const handleClubLogoSelect = (file: File | null) => {
    setClubLogo(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setClubForm({ ...clubForm, logo_url: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      setClubForm({ ...clubForm, logo_url: '' });
    }
  };

  const handleCreateAssociation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: associationForm.email,
        password: associationForm.password, // Utilise le mot de passe saisi
        options: {
          data: {
            first_name: 'Super',
            last_name: 'Admin'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Impossible de créer l\'utilisateur Super Admin.');

      const userId = authData.user.id;

      const { data: association, error: assocError } = await supabase
        .from('associations')
        .insert([{
          name: associationForm.name,
          city: associationForm.city,
          email: associationForm.email,
          phone: associationForm.phone,
          description: associationForm.description,
          subscription_plan: associationForm.subscription_plan,
          logo_url: null
        }])
        .select()
        .single();

      if (assocError) throw assocError;

      if (associationLogo) {
        const logoUrl = await uploadLogo(associationLogo, 'association', association.id);
        if (logoUrl) {
          const { error: updateError } = await supabase
            .from('associations')
            .update({ logo_url: logoUrl })
            .eq('id', association.id);
            
          if (updateError) console.error('Erreur mise à jour logo URL:', updateError);
        }
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: 'Super',
          last_name: 'Admin',
          role: 'Super Admin',
          association_id: association.id,
        })
        .eq('id', userId);

      if (profileError) throw profileError;
      
      setMessage({
        type: 'success',
        text: `Association créée avec succès ! Un e-mail de confirmation a été envoyé à ${associationForm.email}. Veuillez valider votre compte avant de vous connecter.`,
      });

      setAssociationForm({
        name: '', city: '', email: '', phone: '', description: '',
        subscription_plan: '5-10', logo_url: '', password: '',
      });
      setAssociationLogo(null);
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error: any) {
      console.error('Erreur création association:', error);
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
      console.log('=== DÉBUT CRÉATION CLUB ===');
      console.log('Formulaire club:', clubForm);
      console.log('Logo sélectionné:', clubLogo);

      const cleanAssociationCode = clubForm.association_code.trim().toUpperCase();
      
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

      console.log('Association trouvée:', association);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: clubForm.club_email,
        password: clubForm.password,
        options: {
          data: {
            first_name: 'Club',
            last_name: 'Admin'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Impossible de créer l'utilisateur Admin du club.");

      console.log('Utilisateur créé:', authData.user.id);

      const { data: club, error: clubError } = await supabase
        .from('clubs')
        .insert([{
          name: clubForm.name,
          description: clubForm.description,
          club_email: clubForm.club_email,
          contact_email: clubForm.contact_email || null,
          website_url: clubForm.website_url || null, // Ajout de website_url
          association_id: association.id,
          logo_url: null
        }])
        .select()
        .single();

      if (clubError) throw clubError;

      console.log('Club créé:', club);

      // Upload du logo si un fichier a été sélectionné
      if (clubLogo) {
        console.log('=== DÉBUT UPLOAD LOGO ===');
        console.log('Fichier logo:', {
          name: clubLogo.name,
          size: clubLogo.size,
          type: clubLogo.type
        });
        
        try {
          const logoUrl = await uploadLogo(clubLogo, 'club', club.id);
          console.log('Résultat upload:', logoUrl);
          
          if (logoUrl) {
            console.log('=== MISE À JOUR BDD AVEC LOGO ===');
            const { data: updateData, error: updateError } = await supabase
              .from('clubs')
              .update({ logo_url: logoUrl })
              .eq('id', club.id)
              .select();
              
            if (updateError) {
              console.error('Erreur mise à jour logo URL:', updateError);
              throw new Error(`Erreur lors de la sauvegarde de l'URL du logo: ${updateError.message}`);
            } else {
              console.log('URL du logo sauvegardée avec succès:', updateData);
            }
          } else {
            console.warn('Upload du logo échoué, le club sera créé sans logo');
          }
        } catch (logoError) {
          console.error('Erreur lors de l\'upload du logo:', logoError);
          // Ne pas faire échouer la création du club si seul le logo pose problème
        }
      } else {
        console.log('Aucun logo sélectionné');
      }

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

      console.log('=== CRÉATION CLUB TERMINÉE ===');

      // NOUVEAU : Notifier le Super Admin ET tous les followers/supporters de l'association
      try {
        console.log('=== DÉBUT NOTIFICATIONS CRÉATION CLUB ===');
        
        // 1. Récupérer le Super Admin de l'association
        const { data: superAdmin, error: superAdminError } = await supabase
          .from('profiles')
          .select('id')
          .eq('association_id', association.id)
          .eq('role', 'Super Admin')
          .single();

        // 2. Récupérer tous les supporters et members de l'association (peu importe leur club)
        const { data: followers, error: followersError } = await supabase
          .from('profiles')
          .select('id')
          .eq('association_id', association.id)
          .in('role', ['Supporter', 'Member']); // TOUS les Supporters et Members de l'association

        console.log('Super Admin trouvé:', superAdmin?.id);
        console.log('Followers trouvés:', followers?.length || 0);

        // 3. Préparer la liste des destinataires
        const recipients = [];
        
        if (superAdmin && !superAdminError) {
          recipients.push(superAdmin.id);
        } else {
          console.warn('⚠️ Aucun Super Admin trouvé pour l\'association:', association.id);
        }

        if (followers && !followersError) {
          recipients.push(...followers.map(f => f.id));
        } else if (followersError) {
          console.warn('⚠️ Erreur lors de la récupération des followers:', followersError);
        }

        console.log('Total destinataires:', recipients.length);

        // 4. Envoyer les notifications à tous les destinataires
        if (recipients.length > 0) {
          // Créer les notifications pour tous en une seule fois
          const notifications = recipients.map(userId => ({
            user_id: userId,
            type: 'nouveau_club' as const,
            title: 'Nouveau club créé',
            message: `Le club "${club.name}" vient d'être créé dans votre association.`,
            metadata: {
              club_id: club.id,
              club_name: club.name,
              association_id: association.id
            }
          }));

          await NotificationService.createBulkNotifications(notifications);
          console.log(`✅ ${notifications.length} notifications envoyées pour le club "${club.name}"`);
        } else {
          console.warn('⚠️ Aucun destinataire trouvé pour les notifications');
        }
        
      } catch (notificationError) {
        console.error('Erreur lors de l\'envoi des notifications:', notificationError);
        // Ne pas faire échouer la création du club si les notifications échouent
      }

      console.log('=== FIN NOTIFICATIONS CRÉATION CLUB ===');

      setMessage({
        type: 'success',
        text: `Club créé ! Code: ${club.club_code}. Un email de confirmation a été envoyé à ${clubForm.club_email}. Veuillez valider votre compte avant de vous connecter.`,
      });
      
      // Réinitialisation du formulaire et redirection avec le nouveau champ
      setClubForm({ 
        name: '', 
        description: '', 
        club_email: '', 
        contact_email: '',
        website_url: '', // Ajout dans la réinitialisation
        association_code: '', 
        logo_url: '', 
        password: '' 
      });
      setClubLogo(null);

      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error: any) {
      console.error('=== ERREUR CRÉATION CLUB ===', error);
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

      if (userForm.club_code.trim()) {
        const cleanClubCode = userForm.club_code.trim().toUpperCase();
        
        const { data: club, error: clubError } = await supabase
          .from('clubs')
          .select('id, association_id, name')
          .eq('club_code', cleanClubCode)
          .single();

        if (clubError || !club) {
          console.error('Club code validation error:', clubError);
          throw new Error(`Code de club invalide: ${cleanClubCode}`);
        }

        clubId = club.id;
        associationId = club.association_id;
        role = 'Member';
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userForm.email,
        password: userForm.password,
        options: {
          data: {
            first_name: userForm.first_name,
            last_name: userForm.last_name,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Impossible de créer l'utilisateur.");

      let avatarUrl = null;

      if (userForm.avatar_url && userForm.avatar_url.startsWith('data:')) {
        try {
          const response = await fetch(userForm.avatar_url);
          const blob = await response.blob();
          const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

          const fileExt = file.type.split('/')[1];
          const fileName = `${authData.user.id}-${Date.now()}.${fileExt}`;
          const filePath = `avatars/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath);
            avatarUrl = publicUrl;
          }
        } catch (uploadError) {
          console.error('Erreur upload avatar:', uploadError);
        }
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: userForm.first_name,
          last_name: userForm.last_name,
          role,
          club_id: clubId,
          association_id: associationId,
          avatar_url: avatarUrl,
          email_consent_clubs: userForm.email_consents.clubs,
          email_consent_association: userForm.email_consents.association,
          email_consent_municipality: userForm.email_consents.municipality,
          email_consent_sponsors: userForm.email_consents.sponsors,
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      if (clubId) {
        const { error: userClubError } = await supabase
          .from('user_clubs')
          .insert([{ user_id: authData.user.id, club_id: clubId }]);

        if (userClubError) console.error('Error adding to user_clubs:', userClubError);
      }
      
      setMessage({
        type: 'success',
        text: 'Inscription réussie ! Veuillez vérifier vos e-mails pour confirmer votre compte.',
      });

      setUserForm({
        first_name: '', last_name: '', email: '', password: '', club_code: '', avatar_url: '',
        email_consents: { clubs: false, association: false, municipality: false, sponsors: false }
      });
      setUserStep(1);

      // Redirection avec rechargement de la page pour mettre à jour le statut dans le header
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const renderUserFormStep = () => {
    switch (userStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Inscription Utilisateur</h2>
              <p className="text-gray-600">Étape 1/3 - Informations personnelles</p>
              <div className="flex justify-center mt-4">
                <div className="flex space-x-2">
                  <div className="w-8 h-2 bg-purple-600 rounded"></div>
                  <div className="w-8 h-2 bg-gray-200 rounded"></div>
                  <div className="w-8 h-2 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

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

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setActiveForm(null)}
                className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Retour
              </button>
              <button
                type="button"
                onClick={() => setUserStep(2)}
                disabled={!userForm.first_name || !userForm.last_name || !userForm.email || !userForm.password}
                className="flex-1 py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Photo et Club</h2>
              <p className="text-gray-600">Étape 2/3 - Photo de profil et club (optionnel)</p>
              <div className="flex justify-center mt-4">
                <div className="flex space-x-2">
                  <div className="w-8 h-2 bg-gray-300 rounded"></div>
                  <div className="w-8 h-2 bg-purple-600 rounded"></div>
                  <div className="w-8 h-2 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-6">
              <ProfilePictureUpload
                onImageSelect={handleAvatarSelect}
                currentImage={userForm.avatar_url}
              />
              
              <p className="text-sm text-gray-500 text-center max-w-md">
                Ajoutez une photo de profil pour personnaliser votre compte. 
                Vous pourrez la modifier plus tard dans vos paramètres.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code de Club (Optionnel)
              </label>
              <input
                type="text"
                value={userForm.club_code}
                onChange={(e) => handleClubCodeChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  clubValidation.valid === true ? 'border-green-500' :
                  clubValidation.valid === false ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="CLUB-12345678"
              />
              
              {clubValidation.loading && (
                <p className="mt-2 text-sm text-blue-600 flex items-center">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                  Vérification du code...
                </p>
              )}
              
              {clubValidation.valid === true && (
                <p className="mt-2 text-sm text-green-600 flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  Club trouvé : {clubValidation.clubName}
                </p>
              )}
              
              {clubValidation.valid === false && userForm.club_code && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 w-4 mr-2" />
                  Code de club invalide
                </p>
              )}
              
              <p className="mt-2 text-sm text-gray-500">
                Laissez vide pour vous inscrire en tant que supporter avec accès aux événements publics uniquement.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setUserStep(1)}
                className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Précédent
              </button>
              <button
                type="button"
                onClick={() => setUserStep(3)}
                className="flex-1 py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Préférences email</h2>
              <p className="text-gray-600">Étape 3/3 - Choisissez vos notifications</p>
              <div className="flex justify-center mt-4">
                <div className="flex space-x-2">
                  <div className="w-8 h-2 bg-gray-300 rounded"></div>
                  <div className="w-8 h-2 bg-gray-300 rounded"></div>
                  <div className="w-8 h-2 bg-purple-600 rounded"></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Consentements pour recevoir des emails</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Vous pouvez modifier ces préférences à tout moment dans vos paramètres.
                </p>
                
                <div className="space-y-3">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={userForm.email_consents.clubs}
                      onChange={(e) => setUserForm({
                        ...userForm,
                        email_consents: { ...userForm.email_consents, clubs: e.target.checked }
                      })}
                      className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Clubs affiliés</span>
                      <div className="text-xs text-gray-500">Événements, actualités et communications des clubs que vous suivez</div>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={userForm.email_consents.association}
                      onChange={(e) => setUserForm({
                        ...userForm,
                        email_consents: { ...userForm.email_consents, association: e.target.checked }
                      })}
                      className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Association multiclub</span>
                      <div className="text-xs text-gray-500">Actualités générales, événements inter-clubs et communications officielles</div>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={userForm.email_consents.municipality}
                      onChange={(e) => setUserForm({
                        ...userForm,
                        email_consents: { ...userForm.email_consents, municipality: e.target.checked }
                      })}
                      className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Instance communale</span>
                      <div className="text-xs text-gray-500">Événements municipaux, subventions et informations locales</div>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={userForm.email_consents.sponsors}
                      onChange={(e) => setUserForm({
                        ...userForm,
                        email_consents: { ...userForm.email_consents, sponsors: e.target.checked }
                      })}
                      className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Sponsors des clubs</span>
                      <div className="text-xs text-gray-500">Offres spéciales, promotions et communications des partenaires</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setUserStep(2)}
                className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Précédent
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Inscription...' : 'Finaliser l\'inscription'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
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
              onClick={() => {
                setActiveForm('user');
                setUserStep(1);
              }}
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
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl border">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Créer une Association</h2>
            
            <form onSubmit={handleCreateAssociation} className="space-y-8">
              {/* Informations générales */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Informations générales</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
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
                </div>

                <div className="grid md:grid-cols-2 gap-6">
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
                  <div/>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Courriel de connexion *
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={associationForm.password}
                      onChange={(e) => setAssociationForm({ ...associationForm, password: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Minimum 6 caractères"
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

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo de l'association</label>
                  <ProfilePictureUpload
                    onImageSelect={handleAssociationLogoSelect}
                    currentImage={associationForm.logo_url}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Formats acceptés : PNG, JPG, SVG. Taille max : 2MB. Dimension recommandée : 200x200px
                  </p>
                </div>
              </div>

              {/* Plan d'abonnement */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Choisissez votre plan</h3>
                
                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {SUBSCRIPTION_PLANS.map((plan) => {
                    const Icon = plan.icon;
                    return (
                      <div
                        key={plan.id}
                        className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 ${
                          associationForm.subscription_plan === plan.id
                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        } ${plan.popular ? 'ring-2 ring-blue-200' : ''}`}
                        onClick={() => setAssociationForm({ ...associationForm, subscription_plan: plan.id })}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                              Populaire
                            </span>
                          </div>
                        )}
                        
                        <div className="text-center">
                          <div className={`mx-auto w-12 h-12 bg-gradient-to-r ${plan.color} rounded-xl flex items-center justify-center mb-4`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">{plan.name}</h4>
                          <p className="text-sm text-gray-500 mb-3">{plan.description}</p>
                          
                          <div className="mb-4">
                            <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                            <span className="text-sm text-gray-500">{plan.period}</span>
                          </div>
                          
                          <ul className="space-y-2 text-sm text-gray-600">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center">
                                <Check className="h-4 w-4 text-green-500 mr-2" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <input
                          type="radio"
                          name="subscription_plan"
                          value={plan.id}
                          checked={associationForm.subscription_plan === plan.id}
                          onChange={() => setAssociationForm({ ...associationForm, subscription_plan: plan.id })}
                          className="sr-only"
                        />
                      </div>
                    );
                  })}
                </div>
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
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Courriel de connexion *
                  </label>
                  <input
                    type="email"
                    required
                    value={clubForm.club_email}
                    onChange={(e) => setClubForm({ ...clubForm, club_email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="admin@club.com"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email pour se connecter au club
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de contact
                  </label>
                  <input
                    type="email"
                    value={clubForm.contact_email}
                    onChange={(e) => setClubForm({ ...clubForm, contact_email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="contact@club.com"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email affiché aux membres (optionnel)
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={clubForm.password}
                  onChange={(e) => setClubForm({ ...clubForm, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Minimum 6 caractères"
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

              {/* CHAMP AJOUTÉ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site web du club
                </label>
                <input
                  type="url"
                  value={clubForm.website_url || ''}
                  onChange={(e) => setClubForm({ ...clubForm, website_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="https://www.monclub.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  URL complète du site web (optionnel)
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

              {/* Logo Upload pour club */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo du club</label>
                <ProfilePictureUpload
                  onImageSelect={handleClubLogoSelect}
                  currentImage={clubForm.logo_url}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Formats acceptés : PNG, JPG, SVG. Taille max : 2MB. Dimension recommandée : 200x200px
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
                  className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Création...' : 'Créer le Club'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* User Registration Form - Multi-step */}
        {activeForm === 'user' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border">
            <form onSubmit={handleUserRegistration}>
              {renderUserFormStep()}
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
            <div className="flex items-start">
              {message.type === 'success' ? (
                <Check className="h-5 w-5 mr-3 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              )}
              <p className="flex-1">{message.text}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}