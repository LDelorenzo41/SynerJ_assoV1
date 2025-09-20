// src/components/equipment/EquipmentManagement.tsx

import React, { useState } from 'react';
import { useAuthNew } from '../../hooks/useAuthNew';
import { useEquipmentManagement } from '../../hooks/useEquipment';
import { 
  Plus,
  Minus, 
  Edit3, 
  Trash2, 
  Package, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Calendar,
  Settings,
  Users
} from 'lucide-react';
import { EQUIPMENT_CATEGORIES, STATUS_COLORS, type EquipmentItem, type CreateEquipmentItemForm } from '../../types/equipment';


export default function EquipmentManagement() {
  const { profile } = useAuthNew();
  const {
    items,
    requests,
    reservations,
    stats,
    createItem,
    updateItem,
    deleteItem,
    approveRequest,
    updateRequestStatus,
    isLoading
  } = useEquipmentManagement(profile?.association_id);

  const [activeTab, setActiveTab] = useState<'inventory' | 'requests' | 'calendar' | 'stats'>('inventory');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);

  if (!profile || profile.role !== 'Super Admin') {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-500">Accès refusé. Seuls les Super Admins peuvent gérer le matériel.</p>
      </div>
    );
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement du matériel...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion du Matériel</h1>
        <p className="text-gray-600">Gérez l'inventaire et les réservations de votre association</p>
      </div>

      {/* Statistiques rapides */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_items}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Demandes en attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending_requests}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Réservations à venir</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcoming_reservations}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Quantité totale</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_quantity}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'inventory', label: 'Inventaire', icon: Package },
            { id: 'requests', label: 'Demandes', icon: Clock, badge: stats?.pending_requests },
            { id: 'calendar', label: 'Calendrier', icon: Calendar },
            { id: 'stats', label: 'Statistiques', icon: Settings },
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
              {tab.badge && tab.badge > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'inventory' && (
        <InventoryTab
          items={items}
          onAddItem={() => setShowAddModal(true)}
          onEditItem={setEditingItem}
          onDeleteItem={deleteItem}
        />
      )}

      {activeTab === 'requests' && (
        <RequestsTab
          requests={requests}
          items={items}
          onApproveRequest={approveRequest}
          onRejectRequest={updateRequestStatus}
          currentUserId={profile.id}
        />
      )}

      {activeTab === 'calendar' && (
        <CalendarTab reservations={reservations} />
      )}

      {activeTab === 'stats' && (
        <StatsTab stats={stats} items={items} />
      )}

      {/* Modals */}
      {showAddModal && (
        <AddEquipmentModal
          onClose={() => setShowAddModal(false)}
          onAdd={createItem}
        />
      )}

      {editingItem && (
        <EditEquipmentModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onUpdate={updateItem}
        />
      )}
    </div>
  );
}

// ============ ONGLET INVENTAIRE ============
interface InventoryTabProps {
  items: EquipmentItem[];
  onAddItem: () => void;
  onEditItem: (item: EquipmentItem) => void;
  onDeleteItem: (itemId: string) => Promise<void>;
}

function InventoryTab({ items, onAddItem, onEditItem, onDeleteItem }: InventoryTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredItems = items.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const statusMatch = selectedStatus === 'all' || item.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  const categories = [...new Set(items.map(item => item.category))];

  const handleDelete = async (itemId: string) => {
    try {
      await onDeleteItem(itemId);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  return (
    <div>
      {/* En-tête et filtres */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="available">Disponible</option>
            <option value="maintenance">Maintenance</option>
            <option value="broken">Cassé</option>
          </select>
        </div>

        <button
          onClick={onAddItem}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ajouter du matériel
        </button>
      </div>

      {/* Liste du matériel */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matériel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-gray-500">{item.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS.equipment[item.status]}`}>
                      {item.status === 'available' ? 'Disponible' :
                       item.status === 'maintenance' ? 'Maintenance' : 'Cassé'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => onEditItem(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun matériel trouvé</p>
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cet équipement ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ AUTRES ONGLETS (versions simplifiées pour démarrer) ============

// Remplacez la fonction RequestsTab par cette version améliorée

function RequestsTab({ requests, items, onApproveRequest, onRejectRequest, currentUserId }: any) {
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [approvingRequest, setApprovingRequest] = useState<string | null>(null);
  const [approvalItems, setApprovalItems] = useState<Record<string, number>>({});

  const filteredRequests = requests.filter((req: any) => 
    selectedStatus === 'all' || req.status === selectedStatus
  );

  const handleFullApprove = async (request: any) => {
    try {
      setProcessingRequest(request.id);
      
      const approvalData = {
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
      
      // LIGNE AJOUTÉE
      setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      alert('Erreur lors de l\'approbation de la demande');
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

      const approvalData = {
        event_name: request.event_name,
        start_date: new Date(request.start_date),
        end_date: new Date(request.end_date),
        notes: request.notes,
        items: approvedItems,
      };

      await onApproveRequest(requestId, currentUserId, approvalData);
      setApprovingRequest(null);
      setApprovalItems({});

      // LIGNE AJOUTÉE
      setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
      console.error('Erreur lors de l\'approbation partielle:', error);
      alert('Erreur lors de l\'approbation partielle');
    } finally {
      setProcessingRequest(null);
    }
  };

  const openPartialApproval = (request: any) => {
    setApprovingRequest(request.id);
    // Initialiser avec les quantités demandées
    const initialItems: Record<string, number> = {};
    request.request_items?.forEach((ri: any) => {
      const availability = getItemAvailability(ri.equipment_item_id, ri.quantity_requested);
      initialItems[ri.equipment_item_id] = availability.available && availability.status === 'available' 
        ? ri.quantity_requested 
        : 0;
    });
    setApprovalItems(initialItems);
  };

  const updateApprovalQuantity = (itemId: string, quantity: number) => {
    setApprovalItems(prev => ({
      ...prev,
      [itemId]: Math.max(0, quantity)
    }));
  };

  const handleReject = async (requestId: string) => {
    if (!rejectReason.trim()) {
      alert('Veuillez saisir une raison pour le rejet');
      return;
    }

    try {
      setProcessingRequest(requestId);
      await onRejectRequest(requestId, 'rejected', undefined, rejectReason);
      setRejectingRequest(null);
      setRejectReason('');
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      alert('Erreur lors du rejet de la demande');
    } finally {
      setProcessingRequest(null);
    }
  };

  const getItemAvailability = (equipmentItemId: string, quantityRequested: number) => {
    const item = items.find((i: any) => i.id === equipmentItemId);
    if (!item) return { available: false, total: 0, requested: quantityRequested, status: 'unknown' };
    
    return {
      available: item.quantity >= quantityRequested,
      total: item.quantity,
      requested: quantityRequested,
      status: item.status
    };
  };

  return (
    <div>
      {/* Filtres */}
      <div className="mb-6 flex items-center gap-4">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="all">Toutes les demandes</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvées</option>
          <option value="rejected">Rejetées</option>
        </select>
        
        {selectedStatus === 'pending' && (
          <span className="text-sm text-gray-600">
            {filteredRequests.length} demande(s) en attente de validation
          </span>
        )}
      </div>

      {/* Liste des demandes */}
      <div className="space-y-6">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {selectedStatus === 'pending' ? 'Aucune demande en attente' : 'Aucune demande trouvée'}
            </p>
          </div>
        ) : (
          filteredRequests.map((request: any) => (
            <div key={request.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* En-tête de la demande */}
              <div className="p-6 border-b bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{request.event_name}</h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{request.club?.name}</span>
                        <span>•</span>
                        <span>{request.requester?.first_name} {request.requester?.last_name}</span>
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Du {new Date(request.start_date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-sm text-gray-600 ml-6">
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
                  </div>
                  
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status === 'pending' ? 'En attente' :
                     request.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                  </span>
                </div>
              </div>

              {/* Matériel demandé */}
              {request.request_items && request.request_items.length > 0 && (
                <div className="p-6 border-b">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Matériel demandé
                  </h4>
                  
                  <div className="space-y-3">
                    {request.request_items.map((ri: any) => {
                      const availability = getItemAvailability(ri.equipment_item_id, ri.quantity_requested);
                      const isAvailable = availability.available && availability.status === 'available';
                      
                      return (
                        <div 
                          key={ri.id} 
                          className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                            isAvailable 
                              ? 'border-green-200 bg-green-50' 
                              : 'border-red-200 bg-red-50'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">
                                  {ri.equipment_item?.name || 'Matériel supprimé'}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  {ri.equipment_item?.category}
                                </p>
                                {ri.equipment_item?.description && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {ri.equipment_item.description}
                                  </p>
                                )}
                              </div>
                              
                              <div className="text-right">
                                <div className="text-lg font-semibold text-gray-900">
                                  {ri.quantity_requested} demandé(s)
                                </div>
                                <div className={`text-sm ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                  sur {availability.total} disponible(s)
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-3 flex items-center gap-2">
                              {isAvailable ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-sm text-green-700 font-medium">Disponible</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                  <span className="text-sm text-red-700 font-medium">
                                    {availability.status !== 'available' 
                                      ? `Indisponible (${availability.status === 'maintenance' ? 'Maintenance' : 'Cassé'})`
                                      : 'Quantité insuffisante'
                                    }
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Statut global de la demande :
                      </span>
                      {request.request_items.every((ri: any) => 
                        getItemAvailability(ri.equipment_item_id, ri.quantity_requested).available &&
                        getItemAvailability(ri.equipment_item_id, ri.quantity_requested).status === 'available'
                      ) ? (
                        <span className="text-sm text-green-700 font-medium flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Tout le matériel est disponible
                        </span>
                      ) : (
                        <span className="text-sm text-red-700 font-medium flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          Certains éléments ne sont pas disponibles
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes du club */}
              {request.notes && (
                <div className="p-6 border-b bg-blue-50">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Notes du club :</h4>
                  <p className="text-sm text-gray-700 italic">"{request.notes}"</p>
                </div>
              )}

              {/* Actions pour les demandes en attente */}
              {request.status === 'pending' && (
                <div className="p-6 bg-gray-50 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleFullApprove(request)}
                    disabled={processingRequest === request.id}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-md flex items-center gap-2 font-medium"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {processingRequest === request.id ? 'Approbation...' : 'Approuver tout'}
                  </button>
                  
                  <button
                    onClick={() => openPartialApproval(request)}
                    disabled={processingRequest === request.id}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-md flex items-center gap-2 font-medium"
                  >
                    <Edit3 className="h-4 w-4" />
                    Approbation partielle
                  </button>
                  
                  <button
                    onClick={() => setRejectingRequest(request.id)}
                    disabled={processingRequest === request.id}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-md flex items-center gap-2 font-medium"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Rejeter la demande
                  </button>
                </div>
              )}

              {/* Messages d'admin pour les demandes traitées */}
              {(request.admin_notes || request.rejected_reason) && (
                <div className="p-6 border-t bg-yellow-50">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Réponse de l'administrateur :</h4>
                  <p className="text-sm text-gray-700 italic">
                    "{request.admin_notes || request.rejected_reason}"
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal d'approbation partielle */}
      {approvingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approbation partielle</h3>
            <p className="text-gray-600 mb-4">
              Ajustez les quantités à approuver pour chaque item (0 = non approuvé) :
            </p>
            
            {(() => {
              const request = requests.find((r: any) => r.id === approvingRequest);
              return request?.request_items?.map((ri: any) => {
                const availability = getItemAvailability(ri.equipment_item_id, ri.quantity_requested);
                const maxApprovalQuantity = Math.min(availability.total, ri.quantity_requested);
                
                return (
                  <div key={ri.id} className="mb-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900">{ri.equipment_item?.name}</h5>
                        <p className="text-sm text-gray-600">{ri.equipment_item?.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          Demandé: {ri.quantity_requested} | Disponible: {availability.total}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700">Quantité à approuver:</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateApprovalQuantity(ri.equipment_item_id, (approvalItems[ri.equipment_item_id] || 0) - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          max={maxApprovalQuantity}
                          value={approvalItems[ri.equipment_item_id] || 0}
                          onChange={(e) => updateApprovalQuantity(ri.equipment_item_id, parseInt(e.target.value) || 0)}
                          className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                        />
                        <button
                          type="button"
                          onClick={() => updateApprovalQuantity(ri.equipment_item_id, (approvalItems[ri.equipment_item_id] || 0) + 1)}
                          disabled={(approvalItems[ri.equipment_item_id] || 0) >= maxApprovalQuantity}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-sm text-gray-500">max: {maxApprovalQuantity}</span>
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
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={() => handlePartialApprove(approvingRequest)}
                disabled={processingRequest === approvingRequest}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 rounded-md"
              >
                {processingRequest === approvingRequest ? 'Approbation...' : 'Approuver'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de rejet */}
      {rejectingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rejeter la demande</h3>
            <p className="text-gray-600 mb-4">
              Veuillez indiquer la raison du rejet de cette demande :
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
              placeholder="Raison du rejet..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectingRequest(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={() => handleReject(rejectingRequest)}
                disabled={!rejectReason.trim() || processingRequest === rejectingRequest}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 rounded-md"
              >
                {processingRequest === rejectingRequest ? 'Rejet...' : 'Confirmer le rejet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarTab({ reservations }: any) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendrier des réservations</h3>
      {reservations.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Aucune réservation</p>
      ) : (
        <div className="space-y-3">
          {reservations.map((reservation: any) => (
            <div key={reservation.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-medium">{reservation.event_name}</p>
              <p className="text-sm text-gray-600">
                {reservation.club?.name} • {new Date(reservation.start_date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatsTab({ stats }: any) {
  if (!stats) return <div>Chargement...</div>;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par statut</h3>
        <div className="space-y-2">
          {Object.entries(stats.items_by_status).map(([status, count]) => (
            <div key={status} className="flex justify-between">
              <span className="capitalize">{status === 'available' ? 'Disponible' : status}</span>
              <span>{count as number}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par catégorie</h3>
        <div className="space-y-2">
          {Object.entries(stats.items_by_category).map(([category, count]) => (
            <div key={category} className="flex justify-between">
              <span>{category}</span>
              <span>{count as number}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ MODALS ============

interface AddEquipmentModalProps {
  onClose: () => void;
  onAdd: (item: CreateEquipmentItemForm) => Promise<EquipmentItem>;
}

function AddEquipmentModal({ onClose, onAdd }: AddEquipmentModalProps) {
  const [form, setForm] = useState<CreateEquipmentItemForm>({
    name: '',
    category: '',
    quantity: 1,
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onAdd(form);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter du matériel</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du matériel *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Sélectionner une catégorie</option>
              {EQUIPMENT_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantité *</label>
            <input
              type="number"
              required
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 rounded-md"
            >
              {loading ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditEquipmentModalProps {
  item: EquipmentItem;
  onClose: () => void;
  onUpdate: (itemId: string, updates: Partial<EquipmentItem>) => Promise<EquipmentItem>;
}

function EditEquipmentModal({ item, onClose, onUpdate }: EditEquipmentModalProps) {
  const [form, setForm] = useState({
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    description: item.description || '',
    status: item.status,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onUpdate(item.id, form);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Modifier le matériel</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du matériel *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {EQUIPMENT_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantité *</label>
            <input
              type="number"
              required
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut *</label>
            <select
              required
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="available">Disponible</option>
              <option value="maintenance">Maintenance</option>
              <option value="broken">Cassé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 rounded-md"
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}