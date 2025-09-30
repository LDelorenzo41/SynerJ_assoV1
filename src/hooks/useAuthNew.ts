import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: 'Super Admin' | 'Club Admin' | 'Member' | 'Supporter';
  club_id: string | null;
  association_id: string | null;
  avatar_url: string | null;
  created_at: string;
  first_login_completed: boolean | null; // Ligne ajoutée
}

export function useAuthNew() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      setProfile(data);
    } catch (error) {
      console.error('Profile fetch error:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
  if (!user || !profile) return { success: false, error: new Error('Utilisateur non authentifié') };

  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    // Mettre à jour le state local
    setProfile({ ...profile, ...updates });
    
    return { success: true, error: undefined };
  } catch (error) {
    console.error('Profile update error:', error);
    return { success: false, error };
  }
};

  const uploadAvatar = async (file: File): Promise<string> => {
  if (!user) throw new Error('Utilisateur non authentifié');

  try {
    // Créer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Supprimer l'ancienne photo s'il y en a une
    if (profile?.avatar_url) {
      const oldPath = profile.avatar_url.split('/').pop();
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

    // Mettre à jour le profil avec la nouvelle URL
    const updateResult = await updateProfile({ avatar_url: publicUrl });
    
    if (!updateResult.success) {
      throw updateResult.error;
    }

    return publicUrl;
  } catch (error) {
    console.error('Avatar upload error:', error);
    throw error;
  }
};

  return {
    user,
    profile,
    loading,
    signOut,
    updateProfile,
    uploadAvatar,
    isAuthenticated: !!user,
    isSuperAdmin: profile?.role === 'Super Admin',
    isClubAdmin: profile?.role === 'Club Admin',
    isMember: profile?.role === 'Member',
    isSupporter: profile?.role === 'Supporter',
  };
}