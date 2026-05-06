// src/components/equipment/ClubReservation.tsx - Version corrigée

import React, { useState, useEffect } from 'react';
import { useAuthNew } from '../../hooks/useAuthNew';
import { useClubEquipmentManagement } from '../../hooks/useEquipment';
import { 
  Calendar, 
  Clock, 
  Package, 
  Plus, 
  Minus, 
  Send, 
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import type { 
  CreateReservationRequestForm,
  RequestItemAvailability,
  EquipmentItem
} from '../../types/equipment';
import { 
  STATUS_COLORS,
  STATUS_LABELS,
  getAvailabilityStatus,
  formatAvailabilityMessage
} from '../../types/equipment';

export default function ClubReservation() {
  const { profile } = useAuthNew();
  const [activeTab, setActiveTab] = useState<'request' | 'history' | 'calendar'>('request');

  if (!profile || !['Club Admin', 'Super Admin'].includes(profile.role)) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-ds-danger dark:text-ds-danger mx-auto mb-4" />
        <p className="text-encre-3">Accès refusé. Seuls les Club Admins peuvent faire des demandes de réservation.</p>
      </div>
    );
  }

  if (!profile.club_id && profile.role === 'Club Admin') {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-ds-warning dark:text-ds-warning mx-auto mb-4" />
        <p className="text-encre-3">Vous devez être associé à un club pour faire des demandes de réservation.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-encre mb-2">Réservation de Matériel</h1>
        <p className="text-encre-3">Demandez la réservation de matériel pour vos événements</p>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-[var(--ds-border)] dark:border-[var(--ds-border-2)] mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'request', label: 'Nouvelle demande', icon: Plus },
            { id: 'history', label: 'Mes demandes', icon: Clock },
            { id: 'calendar', label: 'Calendrier', icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-terracotta dark:border-terracotta text-terracotta dark:text-terracotta'
                  : 'border-transparent text-encre-3 hover:text-encre-2 dark:hover:text-encre-3 hover:border-[var(--ds-border-2)] dark:hover:border-[var(--ds-border-2)]'
                }
              `}
            >
              <tab.icon className={`mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-terracotta dark:text-terracotta' : 'text-encre-3 dark:text-encre-3'}`} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'request' && (
        <NewRequestTab 
          clubId={profile.club_id!} 
          requestedBy={profile.id}
          associationId={profile.association_id!}
        />
      )}

      {activeTab === 'history' && (
        <RequestHistoryTab clubId={profile.club_id!} associationId={profile.association_id!} />
      )}

      {activeTab === 'calendar' && (
        <CalendarViewTab associationId={profile.association_id!} clubId={profile.club_id!} />
      )}
    </div>
  );
}

// ============ ONGLET NOUVELLE DEMANDE avec vérification de disponibilité ============
interface NewRequestTabProps {
  clubId: string;
  requestedBy: string;
  associationId: string;
}

function NewRequestTab({ clubId, requestedBy, associationId }: NewRequestTabProps) {
  const { 
    items, 
    createRequest, 
    checkRequestAvailability 
  } = useClubEquipmentManagement(clubId, associationId);
  
  const [form, setForm] = useState<{
    event_name: string;
    start_date: string;
    end_date: string;
    notes: string;
    selectedItems: Array<{ equipment_item_id: string; quantity_requested: number }>;
  }>({
    event_name: '',
    start_date: '',
    end_date: '',
    notes: '',
    selectedItems: [],
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // États pour la vérification de disponibilité
  const [availabilityChecks, setAvailabilityChecks] = useState<Record<string, RequestItemAvailability>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [hasValidPeriod, setHasValidPeriod] = useState(false);

  // Vérifier la disponibilité quand les dates ou les items changent
  useEffect(() => {
    if (form.start_date && form.end_date && form.selectedItems.length > 0) {
      const startDate = new Date(form.start_date);
      const endDate = new Date(form.end_date);
      
      if (startDate < endDate) {
        setHasValidPeriod(true);
        checkAvailabilityForSelectedItems();
      } else {
        setHasValidPeriod(false);
        setAvailabilityChecks({});
      }
    } else {
      setHasValidPeriod(false);
      setAvailabilityChecks({});
    }
  }, [form.start_date, form.end_date, form.selectedItems]);

  const checkAvailabilityForSelectedItems = async () => {
    if (!hasValidPeriod) return;

    setLoadingAvailability(true);
    try {
      const results = await checkRequestAvailability(
        form.selectedItems,
        new Date(form.start_date),
        new Date(form.end_date)
      );

      const availabilityMap: Record<string, RequestItemAvailability> = {};
      results.forEach(result => {
        availabilityMap[result.equipment_item_id] = result;
      });
      
      setAvailabilityChecks(availabilityMap);
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Filtrer les items disponibles selon le statut et la période sélectionnée
  const getFilteredItems = () => {
    const availableItems = items.filter(item => item.status === 'available');
    
    if (!hasValidPeriod) {
      return availableItems;
    }

    // Séparer les items selon leur disponibilité
    const fullyAvailable: EquipmentItem[] = [];
    const partiallyAvailable: EquipmentItem[] = [];
    const unavailable: EquipmentItem[] = [];

    availableItems.forEach(item => {
      // Vérifier si cet item est sélectionné
      const selectedItem = form.selectedItems.find(si => si.equipment_item_id === item.id);
      if (selectedItem) {
        const availability = availabilityChecks[item.id];
        if (availability) {
          if (availability.is_available) {
            fullyAvailable.push(item);
          } else if (availability.available_quantity > 0) {
            partiallyAvailable.push(item);
          } else {
            unavailable.push(item);
          }
        } else {
          fullyAvailable.push(item); // Par défaut, si pas de vérification encore
        }
      } else {
        fullyAvailable.push(item); // Items non sélectionnés, disponibles par défaut
      }
    });

    return [...fullyAvailable, ...partiallyAvailable, ...unavailable];
  };

  const categorizedItems = getFilteredItems().reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, EquipmentItem[]>);

  const addItem = (itemId: string) => {
    const existing = form.selectedItems.find(si => si.equipment_item_id === itemId);
    if (existing) return;

    setForm(prev => ({
      ...prev,
      selectedItems: [...prev.selectedItems, { equipment_item_id: itemId, quantity_requested: 1 }]
    }));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    const item = items.find(i => i.id === itemId);
    const maxQuantity = item?.quantity || 1;
    const finalQuantity = Math.min(quantity, maxQuantity);

    setForm(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.map(si =>
        si.equipment_item_id === itemId ? { ...si, quantity_requested: finalQuantity } : si
      )
    }));
  };

  const removeItem = (itemId: string) => {
    setForm(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.filter(si => si.equipment_item_id !== itemId)
    }));
  };

  const canSubmit = () => {
    if (!form.event_name || !form.start_date || !form.end_date || form.selectedItems.length === 0) {
      return false;
    }

    if (!hasValidPeriod) {
      return false;
    }

    // Vérifier qu'au moins un item est disponible
    return form.selectedItems.some(si => {
      const availability = availabilityChecks[si.equipment_item_id];
      return !availability || availability.is_available;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit()) {
      alert('Veuillez vérifier votre demande. Certains équipements ne sont pas disponibles sur cette période.');
      return;
    }

    try {
      setLoading(true);
      
      const requestData: CreateReservationRequestForm = {
        event_name: form.event_name,
        start_date: new Date(form.start_date),
        end_date: new Date(form.end_date),
        notes: form.notes,
        items: form.selectedItems,
      };

      await createRequest(clubId, requestedBy, requestData);
      
      setSuccess(true);
      setForm({
        event_name: '',
        start_date: '',
        end_date: '',
        notes: '',
        selectedItems: [],
      });
      setAvailabilityChecks({});

      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      console.error('Erreur lors de la création de la demande:', error);
      alert('Erreur lors de la création de la demande: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {success && (
        <div className="mb-6 bg-ds-success-soft dark:bg-ds-success-soft/20 border border-ds-success dark:border-ds-success rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-ds-success dark:text-ds-success mr-2" />
            <p className="text-ds-success dark:text-ds-success">
              Votre demande de réservation a été envoyée avec succès ! Elle sera examinée par l'administrateur de l'association.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations de l'événement */}
        <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)] p-6">
          <h3 className="text-lg font-medium text-encre mb-4">Informations de l'événement</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-encre-3 mb-2">
                Nom de l'événement *
              </label>
              <input
                type="text"
                required
                value={form.event_name}
                onChange={(e) => setForm({ ...form, event_name: e.target.value })}
                className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                placeholder="Ex: Soirée dansante, Assemblée générale..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-encre-3 mb-2">
                Notes (optionnel)
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                placeholder="Informations complémentaires..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-encre-3 mb-2">
                Date et heure de début *
              </label>
              <input
                type="datetime-local"
                required
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-encre-3 mb-2">
                Date et heure de fin *
              </label>
              <input
                type="datetime-local"
                required
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="bg-papier border border-[var(--ds-border-2)] text-encre placeholder:text-encre-3 w-full px-3 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Validation des dates */}
          {form.start_date && form.end_date && (
            <div className="mt-4">
              {new Date(form.start_date) >= new Date(form.end_date) ? (
                <div className="flex items-center text-ds-danger dark:text-ds-danger text-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  La date de fin doit être postérieure à la date de début
                </div>
              ) : (
                <div className="flex items-center text-ds-success dark:text-ds-success text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Période valide : {Math.ceil((new Date(form.end_date).getTime() - new Date(form.start_date).getTime()) / (1000 * 60 * 60 * 24))} jour(s)
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sélection du matériel */}
        <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)] p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-encre">Sélection du matériel</h3>
            {loadingAvailability && (
              <div className="flex items-center text-sm text-terracotta dark:text-terracotta">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-terracotta dark:border-terracotta mr-2"></div>
                Vérification de la disponibilité...
              </div>
            )}
          </div>

          {!hasValidPeriod && form.start_date && form.end_date && (
            <div className="mb-6 p-4 bg-ds-warning-soft dark:bg-ds-warning-soft/20 border border-ds-warning dark:border-ds-warning rounded-lg">
              <div className="flex items-center text-ds-warning dark:text-ds-warning">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Veuillez sélectionner une période valide pour voir la disponibilité du matériel
              </div>
            </div>
          )}

          <div className="space-y-6">
            {Object.entries(categorizedItems).map(([category, categoryItems]) => (
              <div key={category} className="border border-[var(--ds-border)] dark:border-[var(--ds-border-2)] rounded-lg p-4">
                <h4 className="font-medium text-encre mb-3">{category}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryItems.map((item) => {
                    const selectedItem = form.selectedItems.find(si => si.equipment_item_id === item.id);
                    const isSelected = !!selectedItem;
                    const availability = availabilityChecks[item.id];
                    
                    // Déterminer le statut de disponibilité
                    let availabilityStatus = 'available';
                    let availabilityMessage = '';
                    
                    if (hasValidPeriod && availability) {
                      if (!availability.is_available) {
                        if (availability.available_quantity === 0) {
                          availabilityStatus = 'unavailable';
                          availabilityMessage = `Indisponible (${availability.conflicts.length} conflit(s))`;
                        } else {
                          availabilityStatus = 'partially_available';
                          availabilityMessage = `${availability.available_quantity}/${availability.total_quantity} disponible(s)`;
                        }
                      } else {
                        availabilityMessage = `${availability.available_quantity}/${availability.total_quantity} disponible(s)`;
                      }
                    }

                    return (
                      <div 
                        key={item.id} 
                        className={`border rounded-lg p-4 transition-all ${
                          isSelected 
                            ? availabilityStatus === 'unavailable' 
                              ? 'border-ds-danger dark:border-ds-danger bg-ds-danger-soft dark:bg-ds-danger-soft' 
                              : availabilityStatus === 'partially_available'
                              ? 'border-ds-warning dark:border-ds-warning bg-ds-warning-soft dark:bg-ds-warning-soft/20'
                              : 'border-terracotta dark:border-terracotta bg-terracotta-soft dark:bg-terracotta-soft'
                            : 'border-[var(--ds-border)] dark:border-[var(--ds-border-2)] hover:border-[var(--ds-border-2)] dark:hover:border-[var(--ds-border-2)]'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h5 className="font-medium text-encre">{item.name}</h5>
                            {item.description && (
                              <p className="text-sm text-encre-3 mt-1">{item.description}</p>
                            )}
                            <p className="text-sm text-encre-3 mt-1">
                              Quantité totale : {item.quantity}
                            </p>
                          </div>
                        </div>

                        {/* Statut de disponibilité */}
                        {hasValidPeriod && availability && (
                          <div className="mb-3">
                            <div className={`flex items-center text-xs px-2 py-1 rounded ${
                              availabilityStatus === 'available' ? 'bg-ds-success-soft dark:bg-ds-success-soft/30 text-ds-success dark:text-ds-success' :
                              availabilityStatus === 'partially_available' ? 'bg-ds-warning-soft dark:bg-ds-warning-soft/30 text-ds-warning dark:text-ds-warning' :
                              'bg-ds-danger-soft dark:bg-ds-danger-soft/30 text-ds-danger dark:text-ds-danger'
                            }`}>
                              {availabilityStatus === 'available' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {availabilityStatus === 'partially_available' && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {availabilityStatus === 'unavailable' && <XCircle className="h-3 w-3 mr-1" />}
                              {availabilityMessage}
                            </div>
                          </div>
                        )}

                        {/* Contrôles de sélection */}
                        {isSelected ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-encre-3">Quantité :</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(item.id, selectedItem.quantity_requested - 1)}
                                  className="w-8 h-8 rounded-full bg-papier-3 dark:bg-slate-600 hover:bg-papier-3 dark:hover:bg-slate-500 flex items-center justify-center"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-8 text-center font-medium text-encre">
                                  {selectedItem.quantity_requested}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(item.id, selectedItem.quantity_requested + 1)}
                                  disabled={selectedItem.quantity_requested >= (availability?.available_quantity || item.quantity)}
                                  className="w-8 h-8 rounded-full bg-papier-3 dark:bg-slate-600 hover:bg-papier-3 dark:hover:bg-slate-500 disabled:opacity-50 flex items-center justify-center"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="w-full py-2 px-3 bg-ds-danger-soft dark:bg-ds-danger-soft/30 text-ds-danger dark:text-ds-danger rounded-md hover:bg-ds-danger-soft dark:hover:bg-ds-danger-soft/50 text-sm"
                            >
                              Retirer de la sélection
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addItem(item.id)}
                            disabled={hasValidPeriod && availability && !availability.is_available && availability.available_quantity === 0}
                            className="w-full py-2 px-3 bg-terracotta text-white rounded-md hover:bg-terracotta-deep dark:bg-terracotta dark:hover:bg-terracotta disabled:bg-papier-3 dark:disabled:bg-papier-3 disabled:text-encre-3 dark:disabled:text-encre-3 text-sm"
                          >
                            {hasValidPeriod && availability && !availability.is_available && availability.available_quantity === 0 
                              ? 'Non disponible' 
                              : 'Ajouter à la sélection'
                            }
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Résumé de la sélection */}
          {form.selectedItems.length > 0 && (
            <div className="mt-6 p-4 bg-papier-2 dark:bg-slate-800 rounded-lg">
              <h4 className="font-medium text-encre mb-3">Résumé de votre sélection</h4>
              <div className="space-y-2">
                {form.selectedItems.map((si) => {
                  const item = items.find(i => i.id === si.equipment_item_id);
                  const availability = availabilityChecks[si.equipment_item_id];
                  
                  return (
                    <div key={si.equipment_item_id} className="flex justify-between items-center text-sm">
                      <span className="text-encre">{item?.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-encre-3">Quantité: {si.quantity_requested}</span>
                        {hasValidPeriod && availability && (
                          <span className={`px-2 py-1 rounded text-xs ${
                            availability.is_available ? 'bg-ds-success-soft dark:bg-ds-success-soft/30 text-ds-success dark:text-ds-success' : 'bg-ds-danger-soft dark:bg-ds-danger-soft/30 text-ds-danger dark:text-ds-danger'
                          }`}>
                            {availability.is_available ? 'Disponible' : 'Conflit'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bouton de soumission */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !canSubmit()}
            className="px-6 py-3 bg-terracotta text-white rounded-md hover:bg-terracotta-deep dark:bg-terracotta dark:hover:bg-terracotta disabled:bg-papier-3 dark:disabled:bg-papier-3 disabled:text-encre-3 dark:disabled:text-encre-3 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Envoyer la demande
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============ ONGLET HISTORIQUE DES DEMANDES ============
function RequestHistoryTab({ clubId, associationId }: { clubId: string; associationId: string }) {
  const { requests, isLoading } = useClubEquipmentManagement(clubId, associationId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta dark:border-terracotta"></div>
        <span className="ml-2 text-encre-3">Chargement de vos demandes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-encre">Mes demandes de réservation</h3>
        <span className="text-sm text-encre-3">{requests.length} demande(s) au total</span>
      </div>

      {requests.length === 0 ? (
        <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)] p-8 text-center">
          <Clock className="h-12 w-12 text-encre-3 dark:text-encre-3 mx-auto mb-4" />
          <p className="text-encre-3">Aucune demande de réservation envoyée</p>
        </div>
      ) : (
        requests.map((request: any) => (
          <div key={request.id} className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)] p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-semibold text-encre">{request.event_name}</h4>
                <p className="text-sm text-encre-3">
                  Du {new Date(request.start_date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} au {new Date(request.end_date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-xs text-encre-3 mt-1">
                  Demandé le {new Date(request.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${
              request.status === 'pending' ? 'bg-ds-warning-soft dark:bg-ds-warning-soft/30 text-ds-warning dark:text-ds-warning border-ds-warning dark:border-ds-warning' :
              request.status === 'approved' ? 'bg-ds-success-soft dark:bg-ds-success-soft/30 text-ds-success dark:text-ds-success border-ds-success dark:border-ds-success' :
              request.status === 'partially_approved' ? 'bg-terracotta-soft dark:bg-terracotta-soft/30 text-terracotta-deep dark:text-terracotta border-terracotta dark:border-terracotta' :
              'bg-ds-danger-soft dark:bg-ds-danger-soft/30 text-ds-danger dark:text-ds-danger border-ds-danger dark:border-ds-danger'
            }`}>
                {request.status === 'pending' ? 'En attente' :
                request.status === 'approved' ? 'Approuvée' :
                request.status === 'partially_approved' ? 'Partiellement approuvée' :
                'Rejetée'}
              </span>
            </div>

            {/* Matériel demandé */}
            {request.request_items && request.request_items.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-encre mb-2">Matériel demandé :</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {request.request_items.map((ri: any) => (
                    <div key={ri.id} className="bg-papier-2 dark:bg-slate-800 rounded p-3 text-sm">
                      <div className="font-medium text-encre">{ri.equipment_item?.name}</div>
                      <div className="text-encre-3">Quantité : {ri.quantity_requested}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {request.notes && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-encre mb-1">Notes :</h4>
                <p className="text-sm text-encre-3 bg-papier-2 dark:bg-slate-800 rounded p-3">{request.notes}</p>
              </div>
            )}

            {/* Réponse de l'admin */}
            {(request.admin_notes || request.rejected_reason) && (
              <div className="border-t border-[var(--ds-border)] dark:border-[var(--ds-border-2)] pt-4">
                <h4 className="text-sm font-medium text-encre mb-2">Réponse de l'administrateur :</h4>
                <div className={`p-3 rounded-lg ${
                  request.status === 'approved' ? 'bg-ds-success-soft dark:bg-ds-success-soft/20 border border-ds-success dark:border-ds-success' : 
                  request.status === 'rejected' ? 'bg-ds-danger-soft dark:bg-ds-danger-soft border border-ds-danger dark:border-ds-danger' : 
                  request.status === 'partially_approved' ? 'bg-terracotta-soft dark:bg-terracotta-soft border border-terracotta dark:border-terracotta' :
                  'bg-papier-2 dark:bg-slate-800'
                }`}>
                  <p className="text-sm text-encre-3">
                    {request.admin_notes || request.rejected_reason}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ============ ONGLET VUE CALENDRIER ============
function CalendarViewTab({ associationId, clubId }: { associationId: string; clubId: string }) {
  const { reservations, isLoading } = useClubEquipmentManagement(clubId, associationId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta dark:border-terracotta"></div>
        <span className="ml-2 text-encre-3">Chargement du calendrier...</span>
      </div>
    );
  }

  const myClubReservations = reservations.filter(res => res.club_id === clubId);
  const otherReservations = reservations.filter(res => res.club_id !== clubId);

  return (
    <div className="space-y-8">
      {/* Mes réservations approuvées */}
      <div>
        <h3 className="text-lg font-semibold text-encre mb-4">Mes réservations approuvées</h3>
        {myClubReservations.length === 0 ? (
          <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)] p-8 text-center">
            <Calendar className="h-12 w-12 text-encre-3 dark:text-encre-3 mx-auto mb-4" />
            <p className="text-encre-3">Aucune réservation approuvée</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myClubReservations.map((reservation) => (
              <div key={reservation.id} className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)] p-6 border-l-4 border-l-blue-500 dark:border-l-blue-400">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-encre">{reservation.event_name}</h4>
                    <p className="text-sm text-encre-3 mt-1">
                      Du {new Date(reservation.start_date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} au {new Date(reservation.end_date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className="bg-terracotta-soft dark:bg-terracotta-soft/30 text-terracotta-deep dark:text-terracotta text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Mon club
                  </span>
                </div>

                {/* Matériel réservé */}
                {reservation.reservation_items && reservation.reservation_items.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-encre mb-2">Matériel réservé :</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {reservation.reservation_items.map((ri: any) => (
                        <div key={ri.id} className="bg-terracotta-soft dark:bg-terracotta-soft rounded p-2 text-sm">
                          <div className="font-medium text-encre">{ri.equipment_item?.name}</div>
                          <div className="text-encre-3">Quantité : {ri.quantity_reserved}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {reservation.notes && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-encre mb-1">Notes :</h5>
                    <p className="text-sm text-encre-3">{reservation.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Autres réservations dans l'association */}
      <div>
        <h3 className="text-lg font-semibold text-encre mb-4">Autres réservations dans l'association</h3>
        {otherReservations.length === 0 ? (
          <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)] p-8 text-center">
            <Eye className="h-12 w-12 text-encre-3 dark:text-encre-3 mx-auto mb-4" />
            <p className="text-encre-3">Aucune autre réservation dans l'association</p>
          </div>
        ) : (
          <div className="space-y-4">
            {otherReservations.map((reservation) => (
              <div key={reservation.id} className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)] p-6 border-l-4 border-l-gray-300 dark:border-l-gray-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-encre">{reservation.event_name}</h4>
                    <p className="text-sm text-encre-3">Par {reservation.club?.name}</p>
                    <p className="text-sm text-encre-3 mt-1">
                      Du {new Date(reservation.start_date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} au {new Date(reservation.end_date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className="bg-papier-2 dark:bg-papier-3 text-encre dark:text-encre-3 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Autre club
                  </span>
                </div>

                {/* Matériel réservé (résumé) */}
                {reservation.reservation_items && reservation.reservation_items.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-encre-3">
                      {reservation.reservation_items.length} type(s) de matériel réservé : {
                        reservation.reservation_items.map((ri: any) => ri.equipment_item?.name).join(', ')
                      }
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}