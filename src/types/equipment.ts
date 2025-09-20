// src/types/equipment.ts

export interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  association_id: string;
  quantity: number;
  description: string | null;
  status: 'available' | 'maintenance' | 'broken';
  created_at: string;
  updated_at: string;
}

export interface ReservationRequest {
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
  
  // Relations (quand récupérées avec join)
  club?: {
    id: string;
    name: string;
  };
  requester?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
  request_items?: RequestItem[];
}

export interface RequestItem {
  id: string;
  reservation_request_id: string;
  equipment_item_id: string;
  quantity_requested: number;
  created_at: string;
  
  // Relation
  equipment_item?: EquipmentItem;
}

export interface EquipmentReservation {
  id: string;
  club_id: string;
  event_name: string;
  start_date: string;
  end_date: string;
  approved_by: string;
  notes: string | null;
  created_at: string;
  
  // Relations
  club?: {
    id: string;
    name: string;
  };
  approver?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
  reservation_items?: ReservationItem[];
}

export interface ReservationItem {
  id: string;
  reservation_id: string;
  equipment_item_id: string;
  quantity_reserved: number;
  created_at: string;
  
  // Relation
  equipment_item?: EquipmentItem;
}

// Types pour les formulaires
export interface CreateEquipmentItemForm {
  name: string;
  category: string;
  quantity: number;
  description: string;
}

export interface CreateReservationRequestForm {
  event_name: string;
  start_date: Date;
  end_date: Date;
  notes: string;
  items: Array<{
    equipment_item_id: string;
    quantity_requested: number;
  }>;
}

export interface ApproveReservationForm {
  event_name?: string;
  start_date?: Date;
  end_date?: Date;
  notes?: string;
  items: Array<{
    equipment_item_id: string;
    quantity_reserved: number;
  }>;
}

// Types pour les vues agrégées
export interface EquipmentAvailability {
  equipment_item: EquipmentItem;
  available_quantity: number;
  reserved_quantity: number;
  upcoming_reservations: Array<{
    reservation_id: string;
    club_name: string;
    event_name: string;
    start_date: string;
    end_date: string;
    quantity: number;
  }>;
}

export interface ReservationCalendarEvent {
  id: string;
  title: string; // event_name
  start: string; // start_date
  end: string; // end_date
  club_name: string;
  items_count: number;
  status: 'confirmed'; // Toujours confirmé car c'est le calendrier officiel
  backgroundColor: string;
  borderColor: string;
}

// Constantes pour les catégories de matériel
export const EQUIPMENT_CATEGORIES = [
  'Sono',
  'Tables',
  'Chaises',
  'Éclairage',
  'Décoration',
  'Sport',
  'Cuisine',
  'Sécurité',
  'Technique',
  'Autre'
] as const;

export type EquipmentCategory = typeof EQUIPMENT_CATEGORIES[number];

// Constantes pour les statuts
export const EQUIPMENT_STATUS = {
  AVAILABLE: 'available' as const,
  MAINTENANCE: 'maintenance' as const,
  BROKEN: 'broken' as const,
};

export const REQUEST_STATUS = {
  PENDING: 'pending' as const,
  APPROVED: 'approved' as const,
  REJECTED: 'rejected' as const,
};

// Couleurs pour l'interface
export const STATUS_COLORS = {
  equipment: {
    available: 'bg-green-100 text-green-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    broken: 'bg-red-100 text-red-800',
  },
  request: {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  },
} as const;