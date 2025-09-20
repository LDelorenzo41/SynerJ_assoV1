// src/components/equipment/ClubReservation.tsx

import React, { useState } from 'react';
import { useAuthNew } from '../../hooks/useAuthNew';
import { 
  useEquipmentItems, 
  useReservationRequests, 
  useEquipmentReservations 
} from '../../hooks/useEquipment';
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
  XCircle
} from 'lucide-react';
import type { CreateReservationRequestForm } from '../../types/equipment';
import { STATUS_COLORS } from '../../types/equipment';

export default function ClubReservation() {
  const { profile } = useAuthNew();
  const [activeTab, setActiveTab] = useState<'request' | 'history' | 'calendar'>('request');

  if (!profile || !['Club Admin', 'Super Admin'].includes(profile.role)) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-500">Accès refusé. Seuls les Club Admins peuvent faire des demandes de réservation.</p>
      </div>
    );
  }

  if (!profile.club_id && profile.role === 'Club Admin') {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-500">Vous devez être associé à un club pour faire des demandes de réservation.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Réservation de Matériel</h1>
        <p className="text-gray-600">Demandez la réservation de matériel pour vos événements</p>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200 mb-8">
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
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className={`mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'}`} />
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
        <RequestHistoryTab clubId={profile.club_id!} />
      )}

      {activeTab === 'calendar' && (
        <CalendarViewTab associationId={profile.association_id!} clubId={profile.club_id!} />
      )}
    </div>
  );
}

// ============ ONGLET NOUVELLE DEMANDE ============
interface NewRequestTabProps {
  clubId: string;
  requestedBy: string;
  associationId: string;
}

function NewRequestTab({ clubId, requestedBy, associationId }: NewRequestTabProps) {
  const { items } = useEquipmentItems(associationId);
  const { createRequest } = useReservationRequests({ clubId });
  
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

  const availableItems = items.filter(item => item.status === 'available');
  const categorizedItems = availableItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

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

    setForm(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.map(si =>
        si.equipment_item_id === itemId ? { ...si, quantity_requested: quantity } : si
      )
    }));
  };

  const removeItem = (itemId: string) => {
    setForm(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.filter(si => si.equipment_item_id !== itemId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.selectedItems.length === 0) {
      alert('Veuillez sélectionner au moins un élément de matériel');
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

      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      console.error('Erreur lors de la création de la demande:', error);
      alert('Erreur lors de la création de la demande: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-800">
              Votre demande de réservation a été envoyée avec succès ! Elle sera examinée par l'administrateur de l'association.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations de l'événement */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de l'événement</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'événement *
              </label>
              <input
                type="text"
                required
                value={form.event_name}
                onChange={(e) => setForm({ ...form, event_name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Ex: Tournoi de football, Concert de fin d'année..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début *
              </label>
              <input
                type="datetime-local"
                required
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin *
              </label>
              <input
                type="datetime-local"
                required
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes / Besoins spécifiques
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Décrivez vos besoins spécifiques, contraintes de livraison, etc."
              />
            </div>
          </div>
        </div>

        {/* Sélection du matériel */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Matériel demandé</h3>
          
          {/* Matériel sélectionné */}
          {form.selectedItems.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Matériel sélectionné :</h4>
              <div className="space-y-3">
                {form.selectedItems.map((selectedItem) => {
                  const item = items.find(i => i.id === selectedItem.equipment_item_id);
                  if (!item) return null;
                  
                  return (
                    <div key={selectedItem.equipment_item_id} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.category}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(selectedItem.equipment_item_id, selectedItem.quantity_requested - 1)}
                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-12 text-center font-medium">{selectedItem.quantity_requested}</span>
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(selectedItem.equipment_item_id, selectedItem.quantity_requested + 1)}
                            disabled={selectedItem.quantity_requested >= item.quantity}
                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="text-sm text-gray-500">/ {item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(selectedItem.equipment_item_id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Catalogue de matériel */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Matériel disponible :</h4>
            
            {Object.keys(categorizedItems).length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun matériel disponible</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(categorizedItems).map(([category, categoryItems]) => (
                  <div key={category}>
                    <h5 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">{category}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryItems.map((item) => {
                        const isSelected = form.selectedItems.some(si => si.equipment_item_id === item.id);
                        
                        return (
                          <div
                            key={item.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                            onClick={() => !isSelected && addItem(item.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h6 className="font-medium text-gray-900">{item.name}</h6>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                )}
                                <div className="flex items-center mt-2">
                                  <span className="text-sm text-gray-500">Quantité disponible: </span>
                                  <span className="text-sm font-medium text-gray-900 ml-1">{item.quantity}</span>
                                </div>
                              </div>
                              
                              {isSelected && (
                                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 ml-2" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bouton de soumission */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || form.selectedItems.length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-md flex items-center gap-2 text-sm font-medium"
          >
            <Send className="h-4 w-4" />
            {loading ? 'Envoi en cours...' : 'Envoyer la demande'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============ ONGLET HISTORIQUE DES DEMANDES ============
function RequestHistoryTab({ clubId }: { clubId: string }) {
  const { requests, loading } = useReservationRequests({ clubId });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement des demandes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {requests.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucune demande de réservation</p>
        </div>
      ) : (
        requests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{request.event_name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Du {new Date(request.start_date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-sm text-gray-600">
                  Au {new Date(request.end_date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Demandé le {new Date(request.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${STATUS_COLORS.request[request.status]}`}>
                {request.status === 'pending' ? 'En attente' :
                 request.status === 'approved' ? 'Approuvée' : 'Rejetée'}
              </span>
            </div>

            {/* Matériel demandé */}
            {request.request_items && request.request_items.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Matériel demandé :</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {request.request_items.map((ri: any) => (
                    <div key={ri.id} className="bg-gray-50 rounded p-3 text-sm">
                      <div className="font-medium text-gray-900">{ri.equipment_item?.name}</div>
                      <div className="text-gray-600">Quantité : {ri.quantity_requested}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {request.notes && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-1">Notes :</h4>
                <p className="text-sm text-gray-600 bg-gray-50 rounded p-3">{request.notes}</p>
              </div>
            )}

            {/* Réponse de l'admin */}
            {(request.admin_notes || request.rejected_reason) && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Réponse de l'administrateur :</h4>
                <div className={`p-3 rounded-lg ${
                  request.status === 'approved' ? 'bg-green-50 border border-green-200' : 
                  request.status === 'rejected' ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                }`}>
                  <p className="text-sm text-gray-700">
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
  const { reservations, loading } = useEquipmentReservations(associationId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement du calendrier...</span>
      </div>
    );
  }

  const myClubReservations = reservations.filter(res => res.club_id === clubId);
  const otherReservations = reservations.filter(res => res.club_id !== clubId);

  return (
    <div className="space-y-8">
      {/* Mes réservations approuvées */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mes réservations approuvées</h3>
        {myClubReservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune réservation approuvée pour votre club</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myClubReservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-lg shadow-sm border p-6 border-l-4 border-l-blue-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{reservation.event_name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Du {new Date(reservation.start_date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      Au {new Date(reservation.end_date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Mon club
                  </span>
                </div>

                {/* Matériel réservé */}
                {reservation.reservation_items && reservation.reservation_items.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Matériel réservé :</h5>
                    <div className="flex flex-wrap gap-2">
                      {reservation.reservation_items.map((ri: any) => (
                        <span key={ri.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {ri.equipment_item?.name} (x{ri.quantity_reserved})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {reservation.notes && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">{reservation.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Autres réservations */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Autres réservations de l'association</h3>
        {otherReservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune autre réservation dans l'association</p>
          </div>
        ) : (
          <div className="space-y-4">
            {otherReservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-lg shadow-sm border p-6 border-l-4 border-l-gray-300">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{reservation.event_name}</h4>
                    <p className="text-sm text-gray-600">Par {reservation.club?.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
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
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Autre club
                  </span>
                </div>

                {/* Matériel réservé (résumé) */}
                {reservation.reservation_items && reservation.reservation_items.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      {reservation.reservation_items.length} type(s) de matériel réservé
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