// src/types/equipment.ts - Mise à jour incrémentale

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
  status: 'pending' | 'approved' | 'rejected' | 'partially_approved'; // ✅ Ajout du nouveau statut
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

// ============ NOUVEAUX TYPES POUR LA DISPONIBILITÉ ============

export interface EquipmentAvailabilityCheck {
  available: boolean;
  available_quantity: number;
  total_quantity: number;
  reserved_quantity: number;
  equipment_status?: string;
  conflicting_reservations: ConflictingReservation[];
  reason?: string; // Pour les cas d'indisponibilité (maintenance, cassé)
}

export interface ConflictingReservation {
  reservation_id: string;
  club_name: string;
  event_name: string;
  start_date: string;
  end_date: string;
  quantity_reserved: number;
  overlap_start: string;
  overlap_end: string;
}

export interface RequestItemAvailability {
  item_id: string;
  equipment_item_id: string;
  equipment_name: string;
  equipment_category: string;
  equipment_status: string;
  requested_quantity: number;
  available_quantity: number;
  total_quantity: number;
  reserved_quantity: number;
  is_available: boolean;
  conflicts: ConflictingReservation[];
}

export interface PeriodAvailability {
  equipment_id: string;
  equipment_name: string;
  category: string;
  equipment_status: string;
  total_quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  conflicting_reservations: ConflictingReservation[];
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
  items_details: Array<{ // ✅ Nouveau : détails des équipements
    equipment_name: string;
    quantity: number;
    category: string;
  }>;
  status: 'confirmed'; // Toujours confirmé car c'est le calendrier officiel
  backgroundColor: string;
  borderColor: string;
  extendedProps: { // ✅ Nouveau : propriétés étendues
    club_id: string;
    notes: string | null;
    approver_name: string;
  };
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
  'Salle/installation',
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
  PARTIALLY_APPROVED: 'partially_approved' as const, // ✅ Nouveau statut
};

export const AVAILABILITY_STATUS = { // ✅ Nouveaux statuts de disponibilité
  AVAILABLE: 'available' as const,
  PARTIALLY_AVAILABLE: 'partially_available' as const,
  UNAVAILABLE: 'unavailable' as const,
  CONFLICTED: 'conflicted' as const,
  EQUIPMENT_ISSUE: 'equipment_issue' as const, // maintenance ou cassé
};

// Couleurs pour l'interface
export const STATUS_COLORS = {
  equipment: {
    available: 'bg-green-100 text-green-800 border-green-200',
    maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    broken: 'bg-red-100 text-red-800 border-red-200',
  },
  request: {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    partially_approved: 'bg-blue-100 text-blue-800 border-blue-200', // ✅ Nouveau
  },
  availability: { // ✅ Nouvelles couleurs pour la disponibilité
    available: 'bg-green-100 text-green-800 border-green-200',
    partially_available: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    unavailable: 'bg-red-100 text-red-800 border-red-200',
    conflicted: 'bg-orange-100 text-orange-800 border-orange-200',
    equipment_issue: 'bg-gray-100 text-gray-800 border-gray-200',
  },
} as const;

// ✅ Nouveaux labels lisibles pour l'interface
export const STATUS_LABELS = {
  equipment: {
    available: 'Disponible',
    maintenance: 'En maintenance',
    broken: 'Cassé',
  },
  request: {
    pending: 'En attente',
    approved: 'Approuvée',
    rejected: 'Rejetée',
    partially_approved: 'Partiellement approuvée',
  },
  availability: {
    available: 'Disponible',
    partially_available: 'Partiellement disponible',
    unavailable: 'Indisponible',
    conflicted: 'Conflit de réservation',
    equipment_issue: 'Problème matériel',
  },
} as const;

// ✅ Nouvelles fonctions utilitaires
export function getAvailabilityStatus(
  available: boolean,
  availableQuantity: number,
  requestedQuantity: number,
  equipmentStatus: string,
  hasConflicts: boolean
): 'available' | 'partially_available' | 'unavailable' | 'conflicted' | 'equipment_issue' {
  if (equipmentStatus !== 'available') {
    return 'equipment_issue';
  }
  
  if (hasConflicts) {
    return 'conflicted';
  }
  
  if (available && availableQuantity >= requestedQuantity) {
    return 'available';
  }
  
  if (availableQuantity > 0 && availableQuantity < requestedQuantity) {
    return 'partially_available';
  }
  
  return 'unavailable';
}

export function formatAvailabilityMessage(
  availableQuantity: number,
  requestedQuantity: number,
  totalQuantity: number,
  equipmentName: string,
  equipmentStatus: string,
  conflicts: ConflictingReservation[]
): string {
  if (equipmentStatus !== 'available') {
    const statusLabel = STATUS_LABELS.equipment[equipmentStatus as keyof typeof STATUS_LABELS.equipment];
    return `${equipmentName} : ${statusLabel}`;
  }

  if (conflicts.length > 0) {
    const conflictInfo = conflicts.map(c => `${c.club_name} (${c.event_name})`).join(', ');
    return `${equipmentName} : Conflit avec ${conflictInfo}`;
  }

  if (availableQuantity >= requestedQuantity) {
    return `${equipmentName} : ${availableQuantity}/${totalQuantity} disponible(s)`;
  }

  return `${equipmentName} : Seulement ${availableQuantity}/${totalQuantity} disponible(s), ${requestedQuantity} demandé(s)`;
}