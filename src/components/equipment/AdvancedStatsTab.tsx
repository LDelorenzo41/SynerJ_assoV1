// src/components/equipment/AdvancedStatsTab.tsx
// Nouveau composant pour remplacer le StatsTab basique

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Users,
  Package,
  Download,
  RefreshCcw,
  Award,
  Clock,
  Zap
} from 'lucide-react';
import { EquipmentService } from '../../services/equipmentService';

interface AdvancedStatsTabProps {
  associationId: string;
}

export function AdvancedStatsTab({ associationId }: AdvancedStatsTabProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Charger les statistiques avancées
  const loadAdvancedStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await EquipmentService.getAdvancedStats(associationId);
      setStats(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Erreur lors du chargement des statistiques:', err);
    } finally {
      setLoading(false);
    }
  };

  // Exporter en CSV
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const exportData = await EquipmentService.exportStatsToCSV(associationId);
      
      // Créer et télécharger le fichier
      const blob = new Blob([exportData.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', exportData.filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Export réussi:', exportData.summary);
    } catch (err: any) {
      console.error('Erreur lors de l\'export:', err);
      alert('Erreur lors de l\'export : ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (associationId) {
      loadAdvancedStats();
    }
  }, [associationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        <span className="ml-2 dark-text-muted">Chargement des statistiques avancées...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Erreur : {error}</div>
        <button 
          onClick={loadAdvancedStats}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-12">Aucune donnée disponible</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header avec actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold dark-text">Statistiques Avancées</h2>
          <p className="dark-text-muted">Analyse complète de l'utilisation du matériel</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadAdvancedStats}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 dark-text"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Actualiser
          </button>
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex items-center px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50"
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Export...' : 'Exporter CSV'}
          </button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Taux d'approbation"
          value={`${stats.performance.overall_approval_rate}%`}
          icon={Award}
          color="green"
          subtitle="Demandes approuvées"
        />
        <MetricCard
          title="Temps de réponse moyen"
          value={`${stats.performance.average_response_time_hours}h`}
          icon={Clock}
          color="blue"
          subtitle="Traitement des demandes"
        />
        <MetricCard
          title="Durée moyenne de réservation"
          value={`${stats.trends.average_reservation_duration}h`}
          icon={Calendar}
          color="purple"
          subtitle="Utilisation du matériel"
        />
        <MetricCard
          title="Total équipements"
          value={stats.basic.total_items}
          icon={Package}
          color="orange"
          subtitle={`${stats.basic.total_quantity} unités`}
        />
      </div>

      {/* Statistiques de base (conservées) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatsCard title="Répartition par statut" data={stats.basic.items_by_status} />
        <StatsCard title="Répartition par catégorie" data={stats.basic.items_by_category} />
      </div>

      {/* Clubs les plus actifs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dark-card rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold dark-text">Clubs les plus actifs</h3>
          </div>
          <div className="space-y-3">
            {stats.clubs.most_active.slice(0, 5).map((club: any, index: number) => (
              <div key={club.club_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium dark-text">{club.club_name}</div>
                    <div className="text-sm dark-text-muted">{club.total_requests} demandes</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600 dark:text-green-400">{club.approval_rate}%</div>
                  <div className="text-xs dark-text-muted">approuvées</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Équipements les plus populaires */}
        <div className="dark-card rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <h3 className="text-lg font-semibold dark-text">Équipements populaires</h3>
          </div>
          <div className="space-y-3">
            {stats.equipment.most_popular.slice(0, 5).map((equipment: any, index: number) => (
              <div key={equipment.equipment_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <div className="font-medium dark-text">{equipment.equipment_name}</div>
                  <div className="text-sm dark-text-muted">{equipment.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400">{equipment.times_requested}</div>
                  <div className="text-xs dark-text-muted">{equipment.utilization_rate}% utilisé</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tendances mensuelles */}
      <div className="dark-card rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
        <div className="flex items-center mb-4">
          <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
          <h3 className="text-lg font-semibold dark-text">Tendances mensuelles</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.trends.monthly_requests.slice(0, 6).map((month: any) => (
            <div key={`${month.year}-${month.month}`} className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-xs dark-text-muted uppercase tracking-wide">{month.month} {month.year}</div>
              <div className="text-2xl font-bold dark-text mt-1">{month.total_requests}</div>
              <div className="text-xs dark-text-muted">demandes</div>
              <div className="mt-2 flex justify-center space-x-2">
                <span className="text-xs text-green-600 dark:text-green-400">{month.approved} ✓</span>
                <span className="text-xs text-red-600 dark:text-red-400">{month.rejected} ✗</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Catégories les plus demandées */}
      <div className="dark-card rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
        <div className="flex items-center mb-4">
          <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2" />
          <h3 className="text-lg font-semibold dark-text">Catégories les plus demandées</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.performance.busiest_equipment_categories)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 8)
            .map(([category, count]) => (
              <div key={category} className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold dark-text">{count as number}</div>
                <div className="text-sm dark-text-muted">{category}</div>
              </div>
            ))}
        </div>
      </div>

      {/* Équipements inutilisés */}
      {stats.equipment.least_used.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Package className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">Équipements jamais demandés</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.equipment.least_used.slice(0, 6).map((equipment: any) => (
              <div key={equipment.equipment_id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-yellow-200 dark:border-yellow-600">
                <div className="font-medium dark-text">{equipment.equipment_name}</div>
                <div className="text-sm dark-text-muted">{equipment.category}</div>
              </div>
            ))}
          </div>
          {stats.equipment.least_used.length > 6 && (
            <div className="mt-3 text-sm text-yellow-700 dark:text-yellow-300">
              ... et {stats.equipment.least_used.length - 6} autres équipements
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Composant pour les métriques principales
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'green' | 'blue' | 'purple' | 'orange';
  subtitle?: string;
}

function MetricCard({ title, value, icon: Icon, color, subtitle }: MetricCardProps) {
  const colorClasses: Record<string, string> = {
    green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
    orange: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
  };

  return (
    <div className="dark-card rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium dark-text-muted">{title}</p>
          <p className="text-2xl font-bold dark-text">{value}</p>
          {subtitle && <p className="text-xs dark-text-muted">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

// Composant pour les statistiques de base (réutilisé)
function StatsCard({ title, data }: { title: string; data: Record<string, number> }) {
  return (
    <div className="dark-card rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
      <h3 className="text-lg font-semibold dark-text mb-4">{title}</h3>
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="dark-text-muted capitalize">
              {key === 'available' ? 'Disponible' : 
               key === 'maintenance' ? 'En maintenance' : 
               key === 'broken' ? 'Cassé' : key}
            </span>
            <span className="font-medium dark-text">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}