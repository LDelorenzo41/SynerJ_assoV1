import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useOnlineStatus } from './useOnlineStatus';
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
  first_login_completed: boolean | null;
}

const REQUEST_TIMEOUT = 5000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function useAuthNew() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user && isOnline) {
        fetchProfile(session.user.id);
      } else if (!isOnline) {
        console.log('Mode offline détecté, chargement du profil annulé');
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && isOnline) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [isOnline]);

  useEffect(() => {
    if (isOnline && user && !profile && retryCount < MAX_RETRIES) {
      console.log(`Connexion rétablie, rechargement du profil (tentative ${retryCount + 1}/${MAX_RETRIES})`);
      const timer = setTimeout(() => {
        fetchProfile(user.id);
      }, RETRY_DELAY);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, user, profile, retryCount]);

  const fetchProfile = async (userId: string) => {
    if (!isOnline) {
      console.log('Pas de connexion internet, appel annulé');
      setLoading(false);
      return;
    }

    if (retryCount >= MAX_RETRIES) {
      console.error('Nombre maximum de tentatives atteint');
      setLoading(false);
      return;
    }

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), REQUEST_TIMEOUT);
      });

      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]) as any;

      if (error) throw error;
      
      setProfile(data);
      setRetryCount(0);
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      
      if (isOnline) {
        setRetryCount(prev => prev + 1);
      }
      
      setProfile(null);
      
      if (error.message === 'Timeout') {
        console.warn('Requête timeout, nouvelle tentative dans quelques secondes...');
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRetryCount(0);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return { success: false, error: new Error('Utilisateur non authentifié') };
    if (!isOnline) return { success: false, error: new Error('Pas de connexion internet') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ ...profile, ...updates });
      
      return { success: true, error: undefined };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error };
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error('Utilisateur non authentifié');
    if (!isOnline) throw new Error('Pas de connexion internet');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`avatars/${oldPath}`]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

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
    isAuthenticated: !!user,
    isSuperAdmin: profile?.role === 'Super Admin',
    isClubAdmin: profile?.role === 'Club Admin',
    isMember: profile?.role === 'Member',
    isSupporter: profile?.role === 'Supporter',
    isOnline,
    signOut,
    updateProfile,
    uploadAvatar,
  };
}