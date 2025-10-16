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
  Zap,
  Sparkles,
  Loader2 
} from 'lucide-react';
import ProfilePictureUpload from './ProfilePictureUpload';
import { NotificationService } from '../services/notificationService';
import { useCheckout } from '@/hooks/useCheckout';
import { type PlanId } from '@/config/stripe';

type FormType = 'association' | 'club' | 'user' | 'custom-plan' | null;
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

interface CustomPlanRequest {
  name: string;
  city: string;
  email: string;
  phone: string;
  description: string;
  estimated_clubs: string;
  specific_needs: string;
}

// Fonctionnalités communes à tous les plans
const COMMON_FEATURES = [
  'Gestion des événements (IA disponible)',
  'Gestion des communications (IA disponible)',
  'Accès sponsors et campagne de mailing',
  'Système de réservation de matériel mutualisé',
  'Support 7/7',
  'Création page web de club'
];

const SUBSCRIPTION_PLANS = [
  {
    id: '1-4' as SubscriptionPlan,
    name: 'Essentiel',
    description: '1 à 4 clubs',
    price: '29€',
    period: '/mois',
    features: ['1 à 4 clubs', ...COMMON_FEATURES],
    icon: Building2,
    color: 'from-blue-400 to-blue-600',
    popular: false
  },
  {
    id: '5-10' as SubscriptionPlan,
    name: 'Standard',
    description: '5 à 10 clubs',
    price: '59€',
    period: '/mois',
    features: ['5 à 10 clubs', ...COMMON_FEATURES],
    icon: Star,
    color: 'from-green-400 to-green-600',
    popular: false
  },
  {
    id: '11-15' as SubscriptionPlan,
    name: 'Avancé',
    description: '11 à 15 clubs',
    price: '89€',
    period: '/mois',
    features: ['11 à 15 clubs', ...COMMON_FEATURES],
    icon: Crown,
    color: 'from-purple-400 to-purple-600',
    popular: false
  },
  {
    id: '16-25' as SubscriptionPlan,
    name: 'Premium',
    description: '16 à 25 clubs',
    price: '129€',
    period: '/mois',
    features: ['16 à 25 clubs', ...COMMON_FEATURES],
    icon: Zap,
    color: 'from-orange-400 to-orange-600',
    popular: false
  },
  {
    id: '25+' as SubscriptionPlan,
    name: 'Sur mesure',
    description: 'Plus de 25 clubs',
    price: 'Contact',
    period: '',
    features: ['Plus de 25 clubs', ...COMMON_FEATURES, 'Account manager dédié', 'Solutions personnalisées'],
    icon: Sparkles,
    color: 'from-pink-400 to-pink-600',
    popular: false,
    isCustom: true
  }
];

export default function RegistrationForms() {
  const [activeForm, setActiveForm] = useState<FormType>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  // ✅ HOOK AJOUTÉ
  const { createCheckoutSession, loading: checkoutLoading } = useCheckout();

  const [userStep, setUserStep] = useState(1);
  const [clubValidation, setClubValidation] = useState<{loading: boolean, valid: boolean | null, clubName: string}>({
    loading: false,
    valid: null,
    clubName: ''
  });
  
  const [associationValidation, setAssociationValidation] = useState<{
    loading: boolean, 
    valid: boolean | null, 
    associationName: string,
    currentClubs: number,
    maxClubs: number,
    canAddClub: boolean
  }>({
    loading: false,
    valid: null,
    associationName: '',
    currentClubs: 0,
    maxClubs: 0,
    canAddClub: true
  });

  const [pseudoAvailable, setPseudoAvailable] = useState<boolean | null>(null);
  const [checkingPseudo, setCheckingPseudo] = useState(false);

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

  const [customPlanForm, setCustomPlanForm] = useState<CustomPlanRequest>({
    name: '',
    city: '',
    email: '',
    phone: '',
    description: '',
    estimated_clubs: '',
    specific_needs: ''
  });

  const [clubForm, setClubForm] = useState({
    name: '',
    description: '',
    club_email: '',
    contact_email: '',
    website_url: '',
    association_code: '',
    logo_url: '',
    password: '',
  });

  const [userForm, setUserForm] = useState({
    first_name: '',
    last_name: '',
    pseudo: '',
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

  // Gérer le clic sur un plan
  const handlePlanSelect = (planId: SubscriptionPlan) => {
    const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    
    if (selectedPlan?.isCustom) {
      // Pour le plan Sur mesure, afficher le formulaire de demande de devis
      setActiveForm('custom-plan');
    } else {
      // Pour les autres plans, sélectionner normalement
      setAssociationForm({ ...associationForm, subscription_plan: planId });
    }
  };

  // Soumettre une demande de plan sur mesure
  const handleCustomPlanRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 1. Enregistrer dans Supabase
      const { error } = await supabase
        .from('custom_plan_requests')
        .insert([{
          name: customPlanForm.name,
          city: customPlanForm.city,
          email: customPlanForm.email,
          phone: customPlanForm.phone,
          estimated_clubs: customPlanForm.estimated_clubs,
          description: customPlanForm.description,
          specific_needs: customPlanForm.specific_needs,
          status: 'pending'
        }]);

      if (error) throw error;
      
      // 2. Préparer l'email avec les infos du formulaire
      const subject = encodeURIComponent('Demande de plan sur mesure - SynerJ');
      const body = encodeURIComponent(`Bonjour,

Je souhaite obtenir un devis pour un plan sur mesure pour ma structure.

=== INFORMATIONS DE LA STRUCTURE ===

Nom de la structure : ${customPlanForm.name}
Ville : ${customPlanForm.city || 'Non renseignée'}
Email : ${customPlanForm.email}
Téléphone : ${customPlanForm.phone}

=== BESSOIN ===

Nombre de clubs estimé : ${customPlanForm.estimated_clubs}

Description de la structure :
${customPlanForm.description || 'Non renseignée'}

Besoins spécifiques :
${customPlanForm.specific_needs || 'Non renseignés'}

---
Merci de me recontacter pour établir un devis personnalisé.

Cordialement,
${customPlanForm.name}`);
      
      // 3. Ouvrir le client mail du prospect
      window.location.href = `mailto:contact-synerj@teachtech.fr?subject=${subject}&body=${body}`;
      
      setMessage({
        type: 'success',
        text: 'Votre demande a été enregistrée ! Votre client mail s\'est ouvert avec les informations pré-remplies. Cliquez sur "Envoyer" pour finaliser votre demande.',
      });

      setCustomPlanForm({
        name: '',
        city: '',
        email: '',
        phone: '',
        description: '',
        estimated_clubs: '',
        specific_needs: ''
      });

      setTimeout(() => {
        setActiveForm(null);
      }, 8000);

    } catch (error: any) {
      console.error('Erreur:', error);
      setMessage({ 
        type: 'error', 
        text: 'Erreur lors de l\'enregistrement. Veuillez réessayer ou nous contacter directement à contact-synerj@teachtech.fr' 
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = async (file: File, type: 'association' | 'club', entityId: string): Promise<string | null> => {
    try {
      console.log(`Début upload ${type} logo pour l'entité ${entityId}`);

      if (!file || file.size === 0) {
        throw new Error('Fichier invalide');
      }

      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Le fichier ne doit pas dépasser 2MB');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('Seuls les fichiers image sont acceptés');
      }

      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${entityId}-${Date.now()}.${fileExt}`;
      
      const bucketName = 'logos';
      const folderName = type === 'association' ? 'association-logos' : 'club-logos';
      const filePath = `${folderName}/${fileName}`;
      
      console.log(`Tentative upload vers le bucket "${bucketName}", chemin: ${filePath}`);

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

  const checkPseudoAvailability = async (pseudo: string) => {
    if (pseudo.length < 3) {
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

  const validateAssociationCode = async (code: string) => {
    if (!code || code.length < 8) {
      setAssociationValidation({ 
        loading: false, 
        valid: null, 
        associationName: '',
        currentClubs: 0,
        maxClubs: 0,
        canAddClub: true
      });
      return;
    }
  
    setAssociationValidation({ 
      loading: true, 
      valid: null, 
      associationName: '',
      currentClubs: 0,
      maxClubs: 0,
      canAddClub: true
    });
  
    try {
      const cleanCode = code.trim().toUpperCase();
      
      // Récupérer l'association
      const { data: association, error: assocError } = await supabase
        .from('associations')
        .select('id, name, subscription_plan')
        .eq('association_code', cleanCode)
        .single();
  
      if (assocError || !association) {
        setAssociationValidation({ 
          loading: false, 
          valid: false, 
          associationName: '',
          currentClubs: 0,
          maxClubs: 0,
          canAddClub: false
        });
        return;
      }
  
      // Compter le nombre de clubs
      const { count, error: countError } = await supabase
        .from('clubs')
        .select('*', { count: 'exact', head: true })
        .eq('association_id', association.id);
  
      if (countError) throw countError;
  
      // Déterminer la limite selon le plan
      const planLimits: Record<string, number> = {
        '1-4': 4,
        '5-10': 10,
        '11-15': 15,
        '16-25': 25,
        '25+': 999
      };
  
      const currentClubs = count || 0;
      const maxClubs = planLimits[association.subscription_plan] || 0;
      const canAddClub = currentClubs < maxClubs;
  
      setAssociationValidation({
        loading: false,
        valid: true,
        associationName: association.name,
        currentClubs,
        maxClubs,
        canAddClub
      });
  
    } catch (err) {
      console.error('Erreur validation association:', err);
      setAssociationValidation({ 
        loading: false, 
        valid: false, 
        associationName: '',
        currentClubs: 0,
        maxClubs: 0,
        canAddClub: false
      });
    }
  };

  const handleAssociationCodeChange = (code: string) => {
    setClubForm({ ...clubForm, association_code: code });
    
    const timeoutId = setTimeout(() => {
      validateAssociationCode(code);
    }, 500);
  
    return () => clearTimeout(timeoutId);
  };

  const handleClubCodeChange = (code: string) => {
    setUserForm({ ...userForm, club_code: code });
    
    const timeoutId = setTimeout(() => {
      validateClubCode(code);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handlePseudoChange = (pseudo: string) => {
    setUserForm({ ...userForm, pseudo });
    
    const timeoutId = setTimeout(() => {
      checkPseudoAvailability(pseudo);
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

  // 🎯 FONCTION MODIFIÉE
  const handleCreateAssociation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!associationForm.name || !associationForm.email || !associationForm.password || !associationForm.city || !associationForm.subscription_plan) {
        setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires.' });
        return;
    }

    setLoading(true);
    setMessage(null);

    try {
        // 1. Créer le compte utilisateur
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: associationForm.email,
            password: associationForm.password,
            options: {
                data: {
                    first_name: 'Super',
                    last_name: 'Admin'
                }
            }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Erreur lors de la création du compte');
        const userId = authData.user.id;

        // 2. Créer l'association dans la base de données
        const { data: association, error: dbError } = await supabase
            .from('associations')
            .insert({
                name: associationForm.name,
                city: associationForm.city,
                email: associationForm.email,
                phone: associationForm.phone,
                description: associationForm.description,
                subscription_plan: associationForm.subscription_plan,
            })
            .select()
            .single();

        if (dbError) throw dbError;
        if (!association) throw new Error("Erreur lors de la création de l'association");

        // 3. Gérer l'upload du logo (fonctionnalité conservée)
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

        // 4. Mettre à jour le profil utilisateur (fonctionnalité conservée)
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

        // 5. Si c'est le plan "Sur mesure", pas de paiement
        if (associationForm.subscription_plan === '25+') {
            setMessage({ type: 'success', text: 'Demande envoyée ! Nous vous contacterons rapidement.' });
            navigate('/dashboard');
            return;
        }

        // 6. Rediriger vers le paiement Stripe pour les autres plans
        setMessage({ type: 'success', text: 'Compte créé ! Redirection vers le paiement...' });

        await createCheckoutSession({
            planId: associationForm.subscription_plan as PlanId,
            associationId: association.id,
            associationEmail: associationForm.email,
        });
        // La redirection vers Stripe Checkout est automatique

    } catch (error: any) {
        console.error('Registration error:', error);
        setMessage({
            type: 'error',
            text: error instanceof Error ? error.message : "Erreur lors de l'inscription"
        });
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
          throw new Error(`Code de structure invalide: ${cleanAssociationCode}`);
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
          website_url: clubForm.website_url || null,
          association_id: association.id,
          logo_url: null
        }])
        .select()
        .single();

      if (clubError) throw clubError;

      console.log('Club créé:', club);

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

      try {
        console.log('=== DÉBUT NOTIFICATIONS CRÉATION CLUB ===');
        
        const { data: superAdmin, error: superAdminError } = await supabase
          .from('profiles')
          .select('id')
          .eq('association_id', association.id)
          .eq('role', 'Super Admin')
          .single();

        const { data: followers, error: followersError } = await supabase
          .from('profiles')
          .select('id')
          .eq('association_id', association.id)
          .in('role', ['Supporter', 'Member']);

        console.log('Super Admin trouvé:', superAdmin?.id);
        console.log('Followers trouvés:', followers?.length || 0);

        const recipients = [];
        
        if (superAdmin && !superAdminError) {
          recipients.push(superAdmin.id);
        } else {
          console.warn('⚠️ Aucun Super Admin trouvé pour la structure:', association.id);
        }

        if (followers && !followersError) {
          recipients.push(...followers.map(f => f.id));
        } else if (followersError) {
          console.warn('⚠️ Erreur lors de la récupération des followers:', followersError);
        }

        console.log('Total destinataires:', recipients.length);

        if (recipients.length > 0) {
          const notifications = recipients.map(userId => ({
            user_id: userId,
            type: 'nouveau_club' as const,
            title: 'Nouveau club créé',
            message: `Le club "${club.name}" vient d'être créé dans votre structure.`,
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
      }

      console.log('=== FIN NOTIFICATIONS CRÉATION CLUB ===');

      setMessage({
        type: 'success',
        text: `Club créé ! Code: ${club.club_code}. Un email de confirmation a été envoyé à ${clubForm.club_email}. Veuillez valider votre compte avant de vous connecter.`,
      });
      
      setClubForm({ 
        name: '', 
        description: '', 
        club_email: '', 
        contact_email: '',
        website_url: '',
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
          pseudo: userForm.pseudo.trim().toLowerCase(),
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
        first_name: '', 
        last_name: '', 
        pseudo: '',
        email: '', 
        password: '', 
        club_code: '', 
        avatar_url: '',
        email_consents: { clubs: false, association: false, municipality: false, sponsors: false }
      });
      setUserStep(1);
      setPseudoAvailable(null);

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
                Pseudo * <span className="text-xs text-gray-500">(visible publiquement)</span>
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={30}
                
                value={userForm.pseudo}
                onChange={(e) => handlePseudoChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  pseudoAvailable === true ? 'border-green-500' :
                  pseudoAvailable === false ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="jean_dupont"
              />
              <p className="text-xs text-gray-500 mt-1">
                3-30 caractères : lettres, chiffres, tirets (-) et underscores (_)
              </p>
              
              {checkingPseudo && (
                <p className="mt-2 text-sm text-blue-600 flex items-center">
                  <span className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></span>
                  Vérification du pseudo...
                </p>
              )}
              
              {pseudoAvailable === true && (
                <p className="mt-2 text-sm text-green-600 flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  Pseudo disponible
                </p>
              )}
              
              {pseudoAvailable === false && userForm.pseudo && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Pseudo déjà pris
                </p>
              )}
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
                disabled={!userForm.first_name || !userForm.last_name || !userForm.pseudo || !userForm.email || !userForm.password || pseudoAvailable === false}
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
                  <span className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></span>
                  Vérification du code...
                </p>
              )}
              
              {clubValidation.valid === true && (
                <p className="mt-2 text-sm text-green-600 flex items-center">
                  <Check className="w-4 w-4 mr-2" />
                  Club trouvé : {clubValidation.clubName}
                </p>
              )}
              
              {clubValidation.valid === false && userForm.club_code && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
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
                      <span className="text-sm font-medium text-gray-900">Structure multiclub</span>
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
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div 
              onClick={() => setActiveForm('association')}
              className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-3 border-2 border-transparent hover:border-blue-200"
            >
              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Building className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Créer une Structure</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Démarrez votre organisation et gérez plusieurs clubs sous une structure commune. 
                  Parfait pour les associations ou services municipaux.
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
                  Rejoignez une structure existante et créez votre club pour organiser 
                  des événements et gérer vos membres.
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Créer une Structure</h2>
            
            <form onSubmit={handleCreateAssociation} className="space-y-8">
              {/* Informations générales */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Informations générales</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la Structure *
                  </label>
                  <input
                    type="text"
                    required
                    value={associationForm.name}
                    onChange={(e) => setAssociationForm({ ...associationForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Association Sportive de [Commune]"
                  />
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    <p className="font-medium">Exemples :</p>
                    <p>• Association Sportive de [Commune]</p>
                    <p>• Ville de [Commune] - Service des Sports</p>
                    <p>• Office Municipal des Sports de [Commune]</p>
                  </div>
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
                      placeholder="contact@structure.com"
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
                    placeholder="Décrivez brièvement votre structure..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo de la structure</label>
                  <ProfilePictureUpload
                    onImageSelect={handleAssociationLogoSelect}
                    currentImage={associationForm.logo_url}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Formats acceptés : PNG, JPG, SVG. Taille max : 2MB. Dimension recommandée : 200x200px
                  </p>
                </div>
              </div>

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
                        }`}
                        onClick={() => handlePlanSelect(plan.id)}
                      >
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
                          
                          <ul className="space-y-2 text-sm text-gray-600 text-left">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {!plan.isCustom && (
                          <input
                            type="radio"
                            name="subscription_plan"
                            value={plan.id}
                            checked={associationForm.subscription_plan === plan.id}
                            onChange={() => setAssociationForm({ ...associationForm, subscription_plan: plan.id })}
                            className="sr-only"
                          />
                        )}
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
                {/* 🔘 BOUTON MODIFIÉ */}
                <button
                  type="submit"
                  disabled={loading || checkoutLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkoutLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Redirection vers le paiement...
                    </span>
                  ) : loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Création du compte...
                    </span>
                  ) : (
                    'Créer la Structure et payer'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Custom Plan Request Form */}
        {activeForm === 'custom-plan' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-pink-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Plan Sur Mesure</h2>
              <p className="text-gray-600">Recevez une offre personnalisée adaptée à vos besoins</p>
            </div>
            
            <form onSubmit={handleCustomPlanRequest} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la Structure *
                </label>
                <input
                  type="text"
                  required
                  value={customPlanForm.name}
                  onChange={(e) => setCustomPlanForm({ ...customPlanForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="Nom de votre structure"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={customPlanForm.city}
                    onChange={(e) => setCustomPlanForm({ ...customPlanForm, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    placeholder="Votre ville"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customPlanForm.phone}
                    onChange={(e) => setCustomPlanForm({ ...customPlanForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    placeholder="01 23 45 67 89"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de contact *
                </label>
                <input
                  type="email"
                  required
                  value={customPlanForm.email}
                  onChange={(e) => setCustomPlanForm({ ...customPlanForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="contact@structure.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de clubs estimé *
                </label>
                <input
                  type="text"
                  required
                  value={customPlanForm.estimated_clubs}
                  onChange={(e) => setCustomPlanForm({ ...customPlanForm, estimated_clubs: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="Ex: 30 clubs, 50+ clubs, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description de votre structure
                </label>
                <textarea
                  rows={3}
                  value={customPlanForm.description}
                  onChange={(e) => setCustomPlanForm({ ...customPlanForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="Décrivez brièvement votre structure..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Besoins spécifiques
                </label>
                <textarea
                  rows={4}
                  value={customPlanForm.specific_needs}
                  onChange={(e) => setCustomPlanForm({ ...customPlanForm, specific_needs: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="Décrivez vos besoins particuliers : intégrations spécifiques, volumes de données, fonctionnalités personnalisées, etc."
                />
              </div>

              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-pink-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-pink-800">
                    <p className="font-medium mb-1">Engagement personnalisé</p>
                    <p>Notre équipe vous contactera sous 24-48h pour comprendre vos besoins et établir une offre sur mesure adaptée à votre structure.</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setActiveForm('association')}
                  className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Retour aux plans
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Envoi...' : 'Demander un devis'}
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
                  Code de Structure *
                </label>
                <input
                  type="text"
                  required
                  value={clubForm.association_code}
                  onChange={(e) => handleAssociationCodeChange(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    associationValidation.valid === true && associationValidation.canAddClub ? 'border-green-500' :
                    associationValidation.valid === true && !associationValidation.canAddClub ? 'border-red-500' :
                    associationValidation.valid === false ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="ASSOC-12345678"
                />
                  {/* Messages de validation */}
                {associationValidation.loading && (
                  <p className="mt-2 text-sm text-blue-600 flex items-center">
                    <span className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></span>
                    Vérification du code...
                  </p>
                )}
                
                {associationValidation.valid === true && associationValidation.canAddClub && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600 flex items-center">
                      <Check className="w-4 h-4 mr-2" />
                      Structure trouvée : {associationValidation.associationName}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      📊 {associationValidation.currentClubs}/{associationValidation.maxClubs} clubs utilisés
                    </p>
                  </div>
                )}
                
                {associationValidation.valid === true && !associationValidation.canAddClub && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700 flex items-center font-semibold">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Limite atteinte !
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Cette structure a atteint sa limite de {associationValidation.maxClubs} clubs ({associationValidation.currentClubs}/{associationValidation.maxClubs}).
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Le Super Admin doit upgrader son plan pour ajouter plus de clubs.
                    </p>
                  </div>
                )}
                
                {associationValidation.valid === false && clubForm.association_code && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Code de structure invalide
                  </p>
                )}

                <p className="mt-2 text-sm text-gray-500">
                  Demandez le code de structure au super admin de votre organisation
                </p>
              </div>

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
                  disabled={loading || (associationValidation.valid === true && !associationValidation.canAddClub)}
                  className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Création...' : 
                  associationValidation.valid && !associationValidation.canAddClub ? '🚫 Limite atteinte' : 
                  'Créer le Club'}
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