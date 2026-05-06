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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta dark:border-terracotta"></div>
        <span className="ml-2 text-encre-3">Chargement des statistiques avancées...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-ds-danger mb-4">Erreur : {error}</div>
        <button 
          onClick={loadAdvancedStats}
          className="bg-terracotta text-white px-4 py-2 rounded-lg hover:bg-terracotta-deep"
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
          <h2 className="text-2xl font-bold text-encre">Statistiques Avancées</h2>
          <p className="text-encre-3">Analyse complète de l'utilisation du matériel</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadAdvancedStats}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-[var(--ds-border-2)] dark:border-[var(--ds-border-2)] rounded-lg hover:bg-papier-2 dark:hover:bg-papier-3 disabled:opacity-50 text-encre"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Actualiser
          </button>
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex items-center px-4 py-2 bg-ds-success dark:bg-ds-success text-white rounded-lg hover:bg-ds-success dark:hover:bg-ds-success disabled:opacity-50"
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
        <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)] p-6">
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-terracotta dark:text-terracotta mr-2" />
            <h3 className="text-lg font-semibold text-encre">Clubs les plus actifs</h3>
          </div>
          <div className="space-y-3">
            {stats.clubs.most_active.slice(0, 5).map((club: any, index: number) => (
              <div key={club.club_id} className="flex items-center justify-between p-3 bg-papier-2 dark:bg-papier-3/50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
                    index === 0 ? 'bg-ds-warning' : index === 1 ? 'bg-papier-3' : index === 2 ? 'bg-ds-warning' : 'bg-terracotta'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-encre">{club.club_name}</div>
                    <div className="text-sm text-encre-3">{club.total_requests} demandes</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-ds-success dark:text-ds-success">{club.approval_rate}%</div>
                  <div className="text-xs text-encre-3">approuvées</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Équipements les plus populaires */}
        <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)] p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-ds-success dark:text-ds-success mr-2" />
            <h3 className="text-lg font-semibold text-encre">Équipements populaires</h3>
          </div>
          <div className="space-y-3">
            {stats.equipment.most_popular.slice(0, 5).map((equipment: any, index: number) => (
              <div key={equipment.equipment_id} className="flex items-center justify-between p-3 bg-papier-2 dark:bg-papier-3/50 rounded-lg">
                <div>
                  <div className="font-medium text-encre">{equipment.equipment_name}</div>
                  <div className="text-sm text-encre-3">{equipment.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-terracotta dark:text-terracotta">{equipment.times_requested}</div>
                  <div className="text-xs text-encre-3">{equipment.utilization_rate}% utilisé</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tendances mensuelles */}
      <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)] p-6">
        <div className="flex items-center mb-4">
          <BarChart3 className="h-5 w-5 text-ds-info dark:text-ds-info mr-2" />
          <h3 className="text-lg font-semibold text-encre">Tendances mensuelles</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.trends.monthly_requests.slice(0, 6).map((month: any) => (
            <div key={`${month.year}-${month.month}`} className="text-center p-4 bg-papier-2 dark:bg-papier-3/50 rounded-lg">
              <div className="text-xs text-encre-3 uppercase tracking-wide">{month.month} {month.year}</div>
              <div className="text-2xl font-bold text-encre mt-1">{month.total_requests}</div>
              <div className="text-xs text-encre-3">demandes</div>
              <div className="mt-2 flex justify-center space-x-2">
                <span className="text-xs text-ds-success dark:text-ds-success">{month.approved} ✓</span>
                <span className="text-xs text-ds-danger dark:text-ds-danger">{month.rejected} ✗</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Catégories les plus demandées */}
      <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)] p-6">
        <div className="flex items-center mb-4">
          <Zap className="h-5 w-5 text-ds-warning dark:text-ds-warning mr-2" />
          <h3 className="text-lg font-semibold text-encre">Catégories les plus demandées</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.performance.busiest_equipment_categories)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 8)
            .map(([category, count]) => (
              <div key={category} className="text-center p-4 bg-papier-2 dark:bg-papier-3/50 rounded-lg">
                <div className="text-2xl font-bold text-encre">{count as number}</div>
                <div className="text-sm text-encre-3">{category}</div>
              </div>
            ))}
        </div>
      </div>

      {/* Équipements inutilisés */}
      {stats.equipment.least_used.length > 0 && (
        <div className="bg-ds-warning-soft dark:bg-ds-warning-soft/30 border border-ds-warning dark:border-ds-warning rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Package className="h-5 w-5 text-ds-warning dark:text-ds-warning mr-2" />
            <h3 className="text-lg font-semibold text-ds-warning dark:text-ds-warning">Équipements jamais demandés</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.equipment.least_used.slice(0, 6).map((equipment: any) => (
              <div key={equipment.equipment_id} className="bg-white dark:bg-papier-2 p-3 rounded-lg border border-ds-warning dark:border-ds-warning">
                <div className="font-medium text-encre">{equipment.equipment_name}</div>
                <div className="text-sm text-encre-3">{equipment.category}</div>
              </div>
            ))}
          </div>
          {stats.equipment.least_used.length > 6 && (
            <div className="mt-3 text-sm text-ds-warning dark:text-ds-warning">
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
    green: 'text-ds-success dark:text-ds-success bg-ds-success-soft dark:bg-ds-success-soft/30',
    blue: 'text-terracotta dark:text-terracotta bg-terracotta-soft dark:bg-terracotta-soft/30',
    purple: 'text-ds-info dark:text-ds-info bg-ds-info-soft dark:bg-ds-info-soft/30',
    orange: 'text-ds-warning dark:text-ds-warning bg-ds-warning-soft dark:bg-ds-warning-soft/30',
  };

  return (
    <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)] p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-encre-3">{title}</p>
          <p className="text-2xl font-bold text-encre">{value}</p>
          {subtitle && <p className="text-xs text-encre-3">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

// Composant pour les statistiques de base (réutilisé)
function StatsCard({ title, data }: { title: string; data: Record<string, number> }) {
  return (
    <div className="bg-papier rounded-ds-md border border-[var(--ds-border)] shadow-ds-sm rounded-lg shadow-sm border border-[var(--ds-border)] dark:border-[var(--ds-border-2)] p-6">
      <h3 className="text-lg font-semibold text-encre mb-4">{title}</h3>
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-encre-3 capitalize">
              {key === 'available' ? 'Disponible' : 
               key === 'maintenance' ? 'En maintenance' : 
               key === 'broken' ? 'Cassé' : key}
            </span>
            <span className="font-medium text-encre">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}