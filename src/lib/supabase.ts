// src/lib/supabase.ts - Version mise à jour avec les tables de réservation

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
          logo_url: string | null;
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
          logo_url?: string | null;
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
          logo_url?: string | null;
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
          website_url: string | null;
          logo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          club_email: string;
          association_id: string;
          club_code?: string;
          website_url?: string | null;
          logo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          club_email?: string;
          association_id?: string;
          club_code?: string;
          website_url?: string | null;
          logo_url?: string | null;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          role: 'Super Admin' | 'Club Admin' | 'Member' | 'Supporter';
          club_id: string | null;
          association_id: string | null;
          avatar_url: string | null;
          email_consent_clubs: boolean;
          email_consent_association: boolean;
          email_consent_municipality: boolean;
          email_consent_sponsors: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          role?: 'Super Admin' | 'Club Admin' | 'Member' | 'Supporter';
          club_id?: string | null;
          association_id?: string | null;
          avatar_url?: string | null;
          email_consent_clubs?: boolean;
          email_consent_association?: boolean;
          email_consent_municipality?: boolean;
          email_consent_sponsors?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          role?: 'Super Admin' | 'Club Admin' | 'Member' | 'Supporter';
          club_id?: string | null;
          association_id?: string | null;
          avatar_url?: string | null;
          email_consent_clubs?: boolean;
          email_consent_association?: boolean;
          email_consent_municipality?: boolean;
          email_consent_sponsors?: boolean;
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
      // ============ TABLES DE RÉSERVATION ============
      equipment_items: {
        Row: {
          id: string;
          name: string;
          category: string;
          association_id: string;
          quantity: number;
          description: string | null;
          status: 'available' | 'maintenance' | 'broken';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          association_id: string;
          quantity?: number;
          description?: string | null;
          status?: 'available' | 'maintenance' | 'broken';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          association_id?: string;
          quantity?: number;
          description?: string | null;
          status?: 'available' | 'maintenance' | 'broken';
          created_at?: string;
          updated_at?: string;
        };
      };
      reservation_requests: {
        Row: {
          id: string;
          club_id: string;
          requested_by: string;
          event_name: string;
          start_date: string;
          end_date: string;
          status: 'pending' | 'approved' | 'rejected';
          notes: string | null;
          admin_notes: string | null;
          rejected_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          requested_by: string;
          event_name: string;
          start_date: string;
          end_date: string;
          status?: 'pending' | 'approved' | 'rejected';
          notes?: string | null;
          admin_notes?: string | null;
          rejected_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          requested_by?: string;
          event_name?: string;
          start_date?: string;
          end_date?: string;
          status?: 'pending' | 'approved' | 'rejected';
          notes?: string | null;
          admin_notes?: string | null;
          rejected_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      request_items: {
        Row: {
          id: string;
          reservation_request_id: string;
          equipment_item_id: string;
          quantity_requested: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          reservation_request_id: string;
          equipment_item_id: string;
          quantity_requested: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          reservation_request_id?: string;
          equipment_item_id?: string;
          quantity_requested?: number;
          created_at?: string;
        };
      };
      equipment_reservations: {
        Row: {
          id: string;
          club_id: string;
          event_name: string;
          start_date: string;
          end_date: string;
          approved_by: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          event_name: string;
          start_date: string;
          end_date: string;
          approved_by: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          event_name?: string;
          start_date?: string;
          end_date?: string;
          approved_by?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      reservation_items: {
        Row: {
          id: string;
          reservation_id: string;
          equipment_item_id: string;
          quantity_reserved: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          reservation_id: string;
          equipment_item_id: string;
          quantity_reserved: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          reservation_id?: string;
          equipment_item_id?: string;
          quantity_reserved?: number;
          created_at?: string;
        };
      };
      // ============ NOUVELLE TABLE COMMUNICATIONS ============
      communications: {
        Row: {
          id: string;
          title: string;
          content: string;
          visibility: 'Public' | 'Private';
          priority: 'Low' | 'Normal' | 'High' | 'Urgent';
          club_id: string | null;
          association_id: string;
          author_id: string;
          target_clubs: string[] | null;
          image_url: string | null;
          expires_at: string | null;
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          visibility: 'Public' | 'Private';
          priority?: 'Low' | 'Normal' | 'High' | 'Urgent';
          club_id?: string | null;
          association_id: string;
          author_id: string;
          target_clubs?: string[] | null;
          image_url?: string | null;
          expires_at?: string | null;
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          visibility?: 'Public' | 'Private';
          priority?: 'Low' | 'Normal' | 'High' | 'Urgent';
          club_id?: string | null;
          association_id?: string;
          author_id?: string;
          target_clubs?: string[] | null;
          image_url?: string | null;
          expires_at?: string | null;
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      // ============ TABLE NOTIFICATIONS (pour la cohérence) ============
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'nouveau_club' | 'nouvel_event' | 'demande_materiel' | 'reponse_materiel' | 'nouvelle_communication';
          title: string;
          message: string;
          is_read: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'nouveau_club' | 'nouvel_event' | 'demande_materiel' | 'reponse_materiel' | 'nouvelle_communication';
          title: string;
          message: string;
          is_read?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'nouveau_club' | 'nouvel_event' | 'demande_materiel' | 'reponse_materiel' | 'nouvelle_communication';
          title?: string;
          message?: string;
          is_read?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    // À ajouter dans src/lib/supabase.ts dans l'interface Database['public']['Tables']

event_comments: {
  Row: {
    id: string;
    event_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string | null;
  };
  Insert: {
    id?: string;
    event_id: string;
    user_id: string;
    content: string;
    created_at?: string;
    updated_at?: string | null;
  };
  Update: {
    id?: string;
    event_id?: string;
    user_id?: string;
    content?: string;
    created_at?: string;
    updated_at?: string | null;
  };
};
    Enums: {
      notification_type: 
        | 'nouveau_club' 
        | 'nouvel_event' 
        | 'demande_materiel' 
        | 'reponse_materiel' 
        | 'nouvelle_communication';
      communication_visibility: 'Public' | 'Private';
      communication_priority: 'Low' | 'Normal' | 'High' | 'Urgent';
    };
    Functions: {
      check_equipment_availability: {
        Args: {
          p_equipment_item_id: string;
          p_start_date: string;
          p_end_date: string;
          p_quantity_requested: number;
          p_exclude_reservation_id?: string;
        };
        Returns: boolean;
      };
      cleanup_expired_communications: {
        Args: Record<PropertyKey, never>;
        Returns: void;
      };
    };
  };
};

// ============================================
// TYPES HELPERS SUPPLÉMENTAIRES
// ============================================

// Type pour une communication avec relations
export type CommunicationWithRelations = Database['public']['Tables']['communications']['Row'] & {
  clubs?: Database['public']['Tables']['clubs']['Row'];
  associations?: Database['public']['Tables']['associations']['Row'];
  profiles?: Database['public']['Tables']['profiles']['Row'];
  target_clubs_data?: Database['public']['Tables']['clubs']['Row'][];
};

// Type pour les requêtes de communications
export type CommunicationQuery = Database['public']['Tables']['communications']['Row'];

// Type pour l'insertion de communications
export type CommunicationInsert = Database['public']['Tables']['communications']['Insert'];

// Type pour la mise à jour de communications
export type CommunicationUpdate = Database['public']['Tables']['communications']['Update'];

// Type pour les notifications de communication
export type CommunicationNotification = Database['public']['Tables']['notifications']['Row'] & {
  type: 'nouvelle_communication';
  metadata: {
    communication_id: string;
    communication_title: string;
    communication_priority: 'Low' | 'Normal' | 'High' | 'Urgent';
    communication_visibility: 'Public' | 'Private';
    communication_author: string;
    is_association_communication: boolean;
    source_name?: string;
    [key: string]: any;
  };
};