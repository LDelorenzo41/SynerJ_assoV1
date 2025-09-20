// src/components/equipment/EquipmentManagement.tsx

import React, { useState, useEffect } from 'react';
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
  Users,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { EQUIPMENT_CATEGORIES, STATUS_COLORS, type EquipmentItem, type CreateEquipmentItemForm } from '../../types/equipment';
// 1. AJOUTER ces imports au début du fichier (après les imports existants)
import { 
  STATUS_LABELS,
  getAvailabilityStatus,
  formatAvailabilityMessage,
  type RequestItemAvailability
} from '../../types/equipment';


export default function EquipmentManagement() {
  const { profile } = useAuthNew();
  // 2. MODIFIER la destructuration du hook useEquipmentManagement pour ajouter les nouvelles méthodes
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
    checkRequestAvailability, // ← AJOUTER
    refresh, // ← AJOUTER (remplace le window.location.reload)
    isLoading
  } = useEquipmentManagement(profile?.association_id);

  const [activeTab, setActiveTab] = useState<'inventory' | 'requests' | 'calendar' | 'stats'>('inventory');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);
  
  // 3. AJOUTER ces états dans le composant principal (après les états existants)
  const [availabilityChecks, setAvailabilityChecks] = useState<Record<string, RequestItemAvailability[]>>({});
  const [loadingAvailability, setLoadingAvailability] = useState<Record<string, boolean>>({});

  // 4. AJOUTER cette fonction de vérification de disponibilité
  const checkRequestAvailabilityHandler = async (request: any) => {
    if (availabilityChecks[request.id] || loadingAvailability[request.id]) return;

    setLoadingAvailability(prev => ({ ...prev, [request.id]: true }));

    try {
      const items = request.request_items?.map((ri: any) => ({
        equipment_item_id: ri.equipment_item_id,
        quantity_requested: ri.quantity_requested,
      })) || [];

      const availability = await checkRequestAvailability(
        items,
        new Date(request.start_date),
        new Date(request.end_date)
      );

      setAvailabilityChecks(prev => ({ ...prev, [request.id]: availability }));
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
    } finally {
      setLoadingAvailability(prev => ({ ...prev, [request.id]: false }));
    }
  };

  // 5. AJOUTER cet useEffect pour vérifier automatiquement les demandes en attente
  useEffect(() => {
    const pendingRequests = requests.filter(r => r.status === 'pending');
    pendingRequests.forEach(request => {
      checkRequestAvailabilityHandler(request);
    });
  }, [requests]);


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
          // Props ajoutées pour les nouvelles fonctionnalités
          availabilityChecks={availabilityChecks}
          loadingAvailability={loadingAvailability}
          refresh={refresh}
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
          refresh={refresh}
        />
      )}

      {editingItem && (
        <EditEquipmentModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onUpdate={updateItem}
          refresh={refresh}
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

function RequestsTab({ requests, onApproveRequest, onRejectRequest, currentUserId, availabilityChecks, loadingAvailability, refresh }: any) {
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

      refresh();

    } catch (error: any) {
      console.error('Erreur lors de l\'approbation partielle:', error);
      alert('Erreur lors de l\'approbation partielle: ' + error.message);
    } finally {
      setProcessingRequest(null);
    }
  };
  
  const openPartialApproval = (request: any) => {
    setApprovingRequest(request.id);
    const initialItems: Record<string, number> = {};
    const availability = availabilityChecks[request.id] || [];
    
    request.request_items?.forEach((ri: any) => {
      const itemAvailability = availability.find((a: any) => a.equipment_item_id === ri.equipment_item_id);
      if (itemAvailability) {
        const maxAvailable = Math.min(ri.quantity_requested, itemAvailability.available_quantity);
        initialItems[ri.equipment_item_id] = itemAvailability.is_available ? maxAvailable : 0;
      } else {
        initialItems[ri.equipment_item_id] = 0;
      }
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
      refresh();
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      alert('Erreur lors du rejet de la demande');
    } finally {
      setProcessingRequest(null);
    }
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
                      const availability = availabilityChecks[request.id]?.find((a: any) => a.equipment_item_id === ri.equipment_item_id);
                      const isLoadingThisItem = loadingAvailability[request.id];
                      
                      return (
                        <div 
                          key={ri.id} 
                          className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                            availability?.is_available 
                              ? 'border-green-200 bg-green-50' 
                              : availability ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
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
                                {availability && (
                                  <div className={`text-sm ${availability.is_available ? 'text-green-600' : 'text-red-600'}`}>
                                    {availability.available_quantity}/{availability.total_quantity} disponible(s)
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-3 flex items-center gap-2">
                              {isLoadingThisItem ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                  <span className="text-sm text-gray-600">Vérification...</span>
                                </>
                              ) : availability ? (
                                availability.is_available ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-green-700 font-medium">Disponible</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm text-red-700 font-medium">
                                      {availability.equipment_status !== 'available' 
                                        ? `Indisponible (${STATUS_LABELS.equipment[availability.equipment_status as keyof typeof STATUS_LABELS.equipment]})`
                                        : 'Quantité insuffisante'
                                      }
                                    </span>
                                    {availability.conflicts.length > 0 && (
                                      <span className="text-xs text-red-600 ml-2">
                                        (Conflit avec {availability.conflicts.length} réservation(s))
                                      </span>
                                    )}
                                  </>
                                )
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {request.status === 'pending' && availabilityChecks[request.id] && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {availabilityChecks[request.id].every((item: any) => item.is_available) ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium text-green-700">
                              Tous les équipements sont disponibles
                            </span>
                          </>
                        ) : availabilityChecks[request.id].some((item: any) => item.is_available) ? (
                          <>
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-700">
                              Certains équipements sont disponibles (approbation partielle possible)
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-red-600" />
                            <span className="text-sm font-medium text-red-700">
                              Aucun équipement disponible sur cette période
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {request.notes && (
                <div className="p-6 border-b bg-blue-50">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Notes du club :</h4>
                  <p className="text-sm text-gray-700 italic">"{request.notes}"</p>
                </div>
              )}

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

      {approvingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approbation partielle</h3>
            <p className="text-gray-600 mb-4">
              Ajustez les quantités à approuver pour chaque item (0 = non approuvé) :
            </p>
            
            {(() => {
              const request = requests.find((r: any) => r.id === approvingRequest);
              const availability = availabilityChecks[request.id] || [];

              return request?.request_items?.map((ri: any) => {
                const itemAvailability = availability.find((a: any) => a.equipment_item_id === ri.equipment_item_id);
                const maxApprovalQuantity = itemAvailability ? Math.min(ri.quantity_requested, itemAvailability.available_quantity) : 0;
                
                return (
                  <div key={ri.id} className="mb-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900">{ri.equipment_item?.name}</h5>
                        <p className="text-sm text-gray-600">{ri.equipment_item?.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          Demandé: {ri.quantity_requested} | Disponible: {itemAvailability?.available_quantity || 0}
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

// Remplacez la fonction CalendarTab existante par cette version améliorée
function CalendarTab({ reservations }: any) {
  const [expandedReservations, setExpandedReservations] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'ongoing' | 'past'>('all');

  // Fonction pour déterminer le statut d'une réservation
  const getReservationStatus = (reservation: any) => {
    const now = new Date();
    const startDate = new Date(reservation.start_date);
    const endDate = new Date(reservation.end_date);
    
    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'ongoing';
    return 'past';
  };

  // Filtrer les réservations selon le statut sélectionné
  const filteredReservations = reservations.filter((reservation: any) => {
    if (filterStatus === 'all') return true;
    return getReservationStatus(reservation) === filterStatus;
  });

  // Trier les réservations par date de début (plus récentes en premier)
  const sortedReservations = [...filteredReservations].sort((a, b) => 
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  const toggleExpand = (reservationId: string) => {
    setExpandedReservations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reservationId)) {
        newSet.delete(reservationId);
      } else {
        newSet.add(reservationId);
      }
      return newSet;
    });
  };

  // Fonction pour formater la durée
  const formatDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Même jour';
    } else if (diffDays === 1) {
      return '1 jour';
    } else {
      return `${diffDays} jours`;
    }
  };

  // Fonction pour obtenir la couleur selon le statut
  const getStatusColor = (reservation: any) => {
    const status = getReservationStatus(reservation);
    switch (status) {
      case 'ongoing':
        return 'border-green-500 bg-green-50';
      case 'upcoming':
        return 'border-blue-500 bg-blue-50';
      case 'past':
        return 'border-gray-400 bg-gray-50';
      default:
        return 'border-gray-400 bg-white';
    }
  };

  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (reservation: any) => {
    const status = getReservationStatus(reservation);
    switch (status) {
      case 'ongoing':
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            En cours
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            À venir
          </span>
        );
      case 'past':
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            Terminée
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Calendrier des réservations</h3>
          
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filterStatus === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes ({reservations.length})
            </button>
            <button
              onClick={() => setFilterStatus('upcoming')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filterStatus === 'upcoming' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              À venir ({reservations.filter((r: any) => getReservationStatus(r) === 'upcoming').length})
            </button>
            <button
              onClick={() => setFilterStatus('ongoing')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filterStatus === 'ongoing' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              En cours ({reservations.filter((r: any) => getReservationStatus(r) === 'ongoing').length})
            </button>
            <button
              onClick={() => setFilterStatus('past')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filterStatus === 'past' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Passées ({reservations.filter((r: any) => getReservationStatus(r) === 'past').length})
            </button>
          </div>
        </div>
      </div>

      {/* Liste des réservations */}
      {sortedReservations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-center">
            {filterStatus === 'all' ? 'Aucune réservation' : `Aucune réservation ${
              filterStatus === 'upcoming' ? 'à venir' : 
              filterStatus === 'ongoing' ? 'en cours' : 
              'passée'
            }`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReservations.map((reservation: any) => {
            const isExpanded = expandedReservations.has(reservation.id);
            const statusColor = getStatusColor(reservation);
            
            return (
              <div 
                key={reservation.id} 
                className={`border-l-4 rounded-lg shadow-sm overflow-hidden transition-all duration-200 ${statusColor}`}
              >
                {/* En-tête de la réservation (toujours visible) */}
                <div 
                  className="p-4 cursor-pointer hover:bg-opacity-75 transition-colors"
                  onClick={() => toggleExpand(reservation.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {reservation.event_name}
                        </h4>
                        {getStatusBadge(reservation)}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{reservation.club?.name || 'Club non spécifié'}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(reservation.start_date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                            {' - '}
                            {new Date(reservation.end_date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="text-gray-500">
                            ({formatDuration(reservation.start_date, reservation.end_date)})
                          </span>
                        </div>
                      </div>

                      {/* Aperçu du matériel réservé */}
                      {reservation.reservation_items && reservation.reservation_items.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Matériel : </span>
                          {!isExpanded && (
                            <span>
                              {reservation.reservation_items.slice(0, 2).map((item: any, index: number) => (
                                <span key={item.id}>
                                  {item.equipment_item?.name} ({item.quantity_reserved})
                                  {index < Math.min(1, reservation.reservation_items.length - 1) && ', '}
                                </span>
                              ))}
                              {reservation.reservation_items.length > 2 && (
                                <span> et {reservation.reservation_items.length - 2} autre(s)...</span>
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <svg 
                        className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Détails expansibles */}
                {isExpanded && (
                  <div className="border-t bg-white p-4 space-y-4">
                    {/* Informations temporelles détaillées */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Date de début</h5>
                        <p className="text-sm text-gray-900">
                          {new Date(reservation.start_date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                          {' à '}
                          {new Date(reservation.start_date).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Date de fin</h5>
                        <p className="text-sm text-gray-900">
                          {new Date(reservation.end_date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                          {' à '}
                          {new Date(reservation.end_date).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Détails du matériel réservé */}
                    {reservation.reservation_items && reservation.reservation_items.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Matériel réservé</h5>
                        <div className="bg-gray-50 rounded-md p-3">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-gray-600">
                                <th className="pb-2">Équipement</th>
                                <th className="pb-2">Catégorie</th>
                                <th className="pb-2 text-right">Quantité</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {reservation.reservation_items.map((item: any) => (
                                <tr key={item.id}>
                                  <td className="py-2 font-medium text-gray-900">
                                    {item.equipment_item?.name || 'Équipement supprimé'}
                                  </td>
                                  <td className="py-2 text-gray-600">
                                    {item.equipment_item?.category || '-'}
                                  </td>
                                  <td className="py-2 text-right text-gray-900">
                                    {item.quantity_reserved}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {reservation.notes && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Notes</h5>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-md p-3">
                          {reservation.notes}
                        </p>
                      </div>
                    )}

                    {/* Informations sur l'approbation */}
                    {reservation.approved_by && (
                      <div className="text-xs text-gray-500 pt-2 border-t">
                        Approuvée le {new Date(reservation.approved_at).toLocaleDateString('fr-FR')}
                        {reservation.admin_notes && (
                          <p className="mt-1 italic">Note admin : {reservation.admin_notes}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
  refresh: () => void;
}

function AddEquipmentModal({ onClose, onAdd, refresh }: AddEquipmentModalProps) {
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
      refresh();
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
  refresh: () => void;
}

function EditEquipmentModal({ item, onClose, onUpdate, refresh }: EditEquipmentModalProps) {
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
      refresh();
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