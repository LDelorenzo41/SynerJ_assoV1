// src/components/equipment/RequestsTabPaginated.tsx

import React, { useState } from 'react';
import { 
  Package, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  XCircle,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { 
  STATUS_LABELS,
  type ApproveReservationForm,
  type EquipmentReservation,
  type ReservationRequest,
  type RequestItemAvailability
} from '../../types/equipment';

// ✅ Interface corrigée avec les bons types TypeScript
interface RequestsTabPaginatedProps {
  requests: any[];
  items: any[];
  onApproveRequest: (
    requestId: string, 
    approvedBy: string, 
    approvalData: ApproveReservationForm
  ) => Promise<EquipmentReservation>;  // ✅ Retourne EquipmentReservation
  onRejectRequest: (
    requestId: string, 
    status: 'approved' | 'rejected' | 'partially_approved',  // ✅ Type strict
    adminNotes?: string, 
    rejectedReason?: string
  ) => Promise<ReservationRequest>;  // ✅ Retourne ReservationRequest
  currentUserId: string;
  availabilityChecks: Record<string, RequestItemAvailability[]>;
  loadingAvailability: Record<string, boolean>;
  refresh: () => void;
}

export function RequestsTabPaginated({
  requests,
  onApproveRequest,
  onRejectRequest,
  currentUserId,
  availabilityChecks,
  loadingAvailability,
  refresh
}: RequestsTabPaginatedProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [approvingRequest, setApprovingRequest] = useState<string | null>(null);
  const [approvalItems, setApprovalItems] = useState<Record<string, number>>({});
  const [deletingRequest, setDeletingRequest] = useState<string | null>(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrer les demandes
  const filteredRequests = requests.filter((req: any) => 
    selectedStatus === 'all' || req.status === selectedStatus
  );

  // Calculer la pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // Réinitialiser à la page 1 quand on change de filtre
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus]);

  // Fonction pour déterminer le statut temporel d'une demande
  const getTimeStatus = (request: any) => {
    const now = new Date();
    const startDate = new Date(request.start_date);
    const endDate = new Date(request.end_date);
    
    if (now < startDate) return 'upcoming'; // À venir
    if (now >= startDate && now <= endDate) return 'ongoing'; // En cours
    return 'past'; // Passée
  };

  // Supprimer une demande
  const handleDeleteRequest = async (requestId: string) => {
    try {
      setProcessingRequest(requestId);
      
      // Supprimer d'abord les items de la demande
      const { error: itemsError } = await supabase
        .from('request_items')
        .delete()
        .eq('reservation_request_id', requestId);

      if (itemsError) throw itemsError;

      // Ensuite supprimer la demande
      const { error: requestError } = await supabase
        .from('reservation_requests')
        .delete()
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Rafraîchir les données
      refresh();
      setDeletingRequest(null);

    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la demande: ' + error.message);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleFullApprove = async (request: any) => {
    try {
      setProcessingRequest(request.id);
      
      const availability = availabilityChecks[request.id];
      if (!availability) {
        alert('Vérification de disponibilité en cours, veuillez patienter...');
        return;
      }

      const unavailableItems = availability.filter((item: any) => !item.is_available);
      if (unavailableItems.length > 0) {
        const itemNames = unavailableItems.map((item: any) => 
          `${item.equipment_name} (${item.requested_quantity} demandés, ${item.available_quantity} disponibles)`
        );
        alert(`Impossible d'approuver entièrement : équipements non disponibles :\n${itemNames.join('\n')}\n\nUtilisez l'approbation partielle pour approuver les équipements disponibles.`);
        return;
      }
      
      const approvalData: ApproveReservationForm = {
        event_name: request.event_name,
        start_date: new Date(request.start_date),
        end_date: new Date(request.end_date),
        notes: request.notes,
        items: request.request_items?.map((ri: any) => ({
          equipment_item_id: ri.equipment_item_id,
          quantity_reserved: ri.quantity_requested,
        })) || [],
      };

      await onApproveRequest(request.id, currentUserId, approvalData);
      
      refresh();

    } catch (error: any) {
      console.error('Erreur lors de l\'approbation:', error);
      alert('Erreur lors de l\'approbation de la demande: ' + error.message);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handlePartialApprove = async (requestId: string) => {
    const request = requests.find((r: any) => r.id === requestId);
    if (!request) return;

    try {
      setProcessingRequest(requestId);
      
      const approvedItems = Object.entries(approvalItems)
        .filter(([_, quantity]) => quantity > 0)
        .map(([itemId, quantity]) => ({
          equipment_item_id: itemId,
          quantity_reserved: quantity,
        }));

      if (approvedItems.length === 0) {
        alert('Veuillez sélectionner au moins un item à approuver');
        return;
      }

      const approvalData: ApproveReservationForm = {
        event_name: request.event_name,
        start_date: new Date(request.start_date),
        end_date: new Date(request.end_date),
        notes: request.notes,
        items: approvedItems,
      };

      await onApproveRequest(requestId, currentUserId, approvalData);
      setApprovingRequest(null);
      setApprovalItems({});

      refresh();

    } catch (error: any) {
      console.error('Erreur lors de l\'approbation partielle:', error);
      alert('Erreur lors de l\'approbation partielle: ' + error.message);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setProcessingRequest(requestId);
      await onRejectRequest(requestId, 'rejected', undefined, rejectReason);
      setRejectingRequest(null);
      setRejectReason('');
      refresh();
    } catch (error: any) {
      console.error('Erreur lors du rejet:', error);
      alert('Erreur lors du rejet de la demande: ' + error.message);
    } finally {
      setProcessingRequest(null);
    }
  };

  const updateApprovalQuantity = (itemId: string, newQuantity: number) => {
    const request = requests.find((r: any) => r.id === approvingRequest);
    if (!request) return;

    const requestItem = request.request_items?.find((ri: any) => ri.equipment_item_id === itemId);
    const availability = availabilityChecks[request.id]?.find((a: any) => a.equipment_item_id === itemId);
    
    if (!requestItem || !availability) return;

    const maxQuantity = Math.min(requestItem.quantity_requested, availability.available_quantity);
    const finalQuantity = Math.max(0, Math.min(newQuantity, maxQuantity));

    setApprovalItems(prev => ({
      ...prev,
      [itemId]: finalQuantity
    }));
  };

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: 'pending', label: 'En attente', color: 'yellow' },
          { value: 'approved', label: 'Approuvées', color: 'green' },
          { value: 'partially_approved', label: 'Partiellement approuvées', color: 'blue' },
          { value: 'rejected', label: 'Rejetées', color: 'red' },
          { value: 'all', label: 'Toutes', color: 'gray' },
        ].map(status => (
          <button
            key={status.value}
            onClick={() => setSelectedStatus(status.value)}
            className={`
              px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors
              ${selectedStatus === status.value
                ? `bg-${status.color}-100 dark:bg-${status.color}-900/30 text-${status.color}-700 dark:text-${status.color}-300 border-2 border-${status.color}-500`
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-500'
              }
            `}
          >
            {status.label}
            <span className="ml-2 text-xs opacity-75">
              ({requests.filter((r: any) => status.value === 'all' || r.status === status.value).length})
            </span>
          </button>
        ))}
      </div>

      {/* Liste des demandes paginée */}
      {paginatedRequests.length === 0 ? (
        <div className="text-center py-12 dark-card rounded-lg border border-gray-200 dark:border-gray-600">
          <Package className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="dark-text-muted">Aucune demande dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedRequests.map((request: any) => {
            const availability = availabilityChecks[request.id];
            const isLoading = loadingAvailability[request.id];
            const allAvailable = availability?.every((item: any) => item.is_available);
            const someAvailable = availability?.some((item: any) => item.is_available && !item.is_available);
            const timeStatus = getTimeStatus(request);

            return (
              <div
                key={request.id}
                className="dark-card rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-600"
              >
                {/* En-tête de la demande */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold dark-text">{request.event_name}</h3>
                      
                      {/* Badge de statut */}
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${request.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' : ''}
                        ${request.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : ''}
                        ${request.status === 'partially_approved' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : ''}
                        ${request.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : ''}
                      `}>
                        {STATUS_LABELS.request[request.status as keyof typeof STATUS_LABELS.request]}
                      </span>

                      {/* Badge temporel */}
                      {timeStatus === 'upcoming' && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                          À venir
                        </span>
                      )}
                      {timeStatus === 'ongoing' && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                          En cours
                        </span>
                      )}
                      {timeStatus === 'past' && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          Passée
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm dark-text-muted">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{request.club?.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(request.start_date).toLocaleDateString('fr-FR')} - {new Date(request.end_date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Demandé le {new Date(request.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bouton de suppression */}
                  <button
                    onClick={() => setDeletingRequest(request.id)}
                    className="ml-4 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Supprimer la demande"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Notes de la demande */}
                {request.notes && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-md">
                    <p className="text-sm dark-text-muted italic">"{request.notes}"</p>
                  </div>
                )}

                {/* Notes admin (rejet) */}
                {request.rejected_reason && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">Raison du rejet :</p>
                    <p className="text-sm text-red-600 dark:text-red-300">{request.rejected_reason}</p>
                  </div>
                )}

                {/* Liste des items demandés */}
                <div className="space-y-2 mb-4">
                  {request.request_items?.map((item: any) => {
                    const itemAvailability = availability?.find((a: any) => a.equipment_item_id === item.equipment_item_id);
                    
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                          <div>
                            <p className="font-medium dark-text">{item.equipment_item?.name}</p>
                            <p className="text-sm dark-text-muted">{item.equipment_item?.category}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium dark-text">
                              Quantité: {item.quantity_requested}
                            </p>
                            {itemAvailability && request.status === 'pending' && (
                              <p className={`text-xs ${itemAvailability.is_available ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {itemAvailability.is_available 
                                  ? `✓ ${itemAvailability.available_quantity} disponibles`
                                  : `✗ Seulement ${itemAvailability.available_quantity} disponibles`
                                }
                              </p>
                            )}
                          </div>
                          
                          {itemAvailability && request.status === 'pending' && (
                            itemAvailability.is_available 
                              ? <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                              : <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions pour les demandes en attente */}
                {request.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                    {isLoading ? (
                      <div className="flex items-center gap-2 text-sm dark-text-muted">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
                        Vérification de disponibilité...
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleFullApprove(request)}
                          disabled={processingRequest === request.id || !allAvailable}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                        >
                          <CheckCircle className="h-4 w-4" />
                          {processingRequest === request.id ? 'Approbation...' : 'Approuver'}
                        </button>

                        <button
                          onClick={() => {
                            const items: Record<string, number> = {};
                            request.request_items?.forEach((ri: any) => {
                              const avail = availability?.find((a: any) => a.equipment_item_id === ri.equipment_item_id);
                              items[ri.equipment_item_id] = avail 
                                ? Math.min(ri.quantity_requested, avail.available_quantity)
                                : 0;
                            });
                            setApprovalItems(items);
                            setApprovingRequest(request.id);
                          }}
                          disabled={processingRequest === request.id}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 rounded-md"
                        >
                          <Edit3 className="h-4 w-4" />
                          Approbation partielle
                        </button>

                        <button
                          onClick={() => setRejectingRequest(request.id)}
                          disabled={processingRequest === request.id}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 disabled:opacity-50 rounded-md"
                        >
                          <XCircle className="h-4 w-4" />
                          Rejeter
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-md font-medium ${
                  currentPage === page
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Modal d'approbation partielle */}
      {approvingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="dark-card rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold dark-text mb-4">Approbation partielle</h3>
            <p className="dark-text-muted mb-4">
              Ajustez les quantités à approuver pour chaque item (0 = non approuvé) :
            </p>
            
            {(() => {
              const request = requests.find((r: any) => r.id === approvingRequest);
              const availability = availabilityChecks[request.id] || [];

              return request?.request_items?.map((ri: any) => {
                const itemAvailability = availability.find((a: any) => a.equipment_item_id === ri.equipment_item_id);
                const maxApprovalQuantity = itemAvailability ? Math.min(ri.quantity_requested, itemAvailability.available_quantity) : 0;
                
                return (
                  <div key={ri.id} className="mb-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-medium dark-text">{ri.equipment_item?.name}</h5>
                        <p className="text-sm dark-text-muted">{ri.equipment_item?.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm dark-text-muted">
                          Demandé: {ri.quantity_requested} | Disponible: {itemAvailability?.available_quantity || 0}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium dark-text-muted">Quantité à approuver:</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateApprovalQuantity(ri.equipment_item_id, (approvalItems[ri.equipment_item_id] || 0) - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 flex items-center justify-center"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          max={maxApprovalQuantity}
                          value={approvalItems[ri.equipment_item_id] || 0}
                          onChange={(e) => updateApprovalQuantity(ri.equipment_item_id, parseInt(e.target.value) || 0)}
                          className="dark-input w-16 text-center border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                        />
                        <button
                          type="button"
                          onClick={() => updateApprovalQuantity(ri.equipment_item_id, (approvalItems[ri.equipment_item_id] || 0) + 1)}
                          disabled={(approvalItems[ri.equipment_item_id] || 0) >= maxApprovalQuantity}
                          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 disabled:opacity-50 flex items-center justify-center"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-sm dark-text-muted">max: {maxApprovalQuantity}</span>
                    </div>
                  </div>
                );
              });
            })()}
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setApprovingRequest(null);
                  setApprovalItems({});
                }}
                className="px-4 py-2 dark-text-muted hover:bg-gray-50 dark:hover:bg-slate-600 border border-gray-300 dark:border-gray-600 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={() => handlePartialApprove(approvingRequest)}
                disabled={processingRequest === approvingRequest}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 rounded-md"
              >
                {processingRequest === approvingRequest ? 'Approbation...' : 'Approuver'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de rejet */}
      {rejectingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="dark-card rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold dark-text mb-4">Rejeter la demande</h3>
            <p className="dark-text-muted mb-4">
              Veuillez indiquer la raison du rejet de cette demande :
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="dark-input w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 mb-4"
              placeholder="Raison du rejet..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectingRequest(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 dark-text-muted hover:bg-gray-50 dark:hover:bg-slate-600 border border-gray-300 dark:border-gray-600 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={() => handleReject(rejectingRequest)}
                disabled={!rejectReason.trim() || processingRequest === rejectingRequest}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 disabled:opacity-50 rounded-md"
              >
                {processingRequest === rejectingRequest ? 'Rejet...' : 'Confirmer le rejet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {deletingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="dark-card rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold dark-text mb-4 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              Confirmer la suppression
            </h3>
            <p className="dark-text-muted mb-6">
              Êtes-vous sûr de vouloir supprimer cette demande de matériel ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingRequest(null)}
                className="px-4 py-2 dark-text-muted hover:bg-gray-50 dark:hover:bg-slate-600 border border-gray-300 dark:border-gray-600 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteRequest(deletingRequest)}
                disabled={processingRequest === deletingRequest}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 disabled:opacity-50 rounded-md flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {processingRequest === deletingRequest ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}