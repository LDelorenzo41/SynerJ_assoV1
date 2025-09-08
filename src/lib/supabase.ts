import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      associations: {
        Row: {
          id: string;
          name: string;
          city: string | null;
          email: string;
          phone: string | null;
          description: string | null;
          association_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          city?: string | null;
          email: string;
          phone?: string | null;
          description?: string | null;
          association_code?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          city?: string | null;
          email?: string;
          phone?: string | null;
          description?: string | null;
          association_code?: string;
          created_at?: string;
        };
      };
      clubs: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          club_email: string;
          association_id: string;
          club_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          club_email: string;
          association_id: string;
          club_code?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          club_email?: string;
          association_id?: string;
          club_code?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          role: 'Super Admin' | 'Club Admin' | 'Member' | 'Supporter';
          club_id: string | null;
          association_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          role?: 'Super Admin' | 'Club Admin' | 'Member' | 'Supporter';
          club_id?: string | null;
          association_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          role?: 'Super Admin' | 'Club Admin' | 'Member' | 'Supporter';
          club_id?: string | null;
          association_id?: string | null;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          date: string;
          visibility: 'Public' | 'Members Only';
          club_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          date: string;
          visibility?: 'Public' | 'Members Only';
          club_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          date?: string;
          visibility?: 'Public' | 'Members Only';
          club_id?: string;
          created_at?: string;
        };
      };
      user_clubs: {
        Row: {
          user_id: string;
          club_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          club_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          club_id?: string;
          created_at?: string;
        };
      };
    };
  };
};