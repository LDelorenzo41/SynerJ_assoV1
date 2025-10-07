import React, { useState, useEffect } from 'react';
import { Mail, Send, Users, AlertCircle, Calendar, UserPlus, BarChart3, Edit, TrendingUp, Eye, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthNew } from '../hooks/useAuthNew';
import MailingForm from '../components/MailingForm';

interface SponsorInfo {
  level: 'Platine' | 'Or' | 'Argent' | 'Bronze' | 'Partenaire';
  sponsor_type: 'club' | 'association';
  club_id?: string;
  association_id?: string;
}

interface CampaignQuota {
  used: number;
  limit: number;
  remaining: number;
}

interface RecipientDetails {
  total: number;
  directMembers: number;
  supporters: number;
}

interface CampaignStats {
  totalCampaigns: number;
  totalRecipients: number;
  campaignsThisMonth: number;
  averageRecipients: number;
  byRole: Record<string, number>;
  byMonth: Array<{ month: string; count: number; recipients: number }>;
}

interface Campaign {
  id: string;
  subject: string;
  message_preview: string;
  sender_role: string;
  recipient_count: number;
  sent_at: string;
  consent_type: string;
  sponsor_level?: string;
}

const Mailing: React.FC = () => {
  const { profile } = useAuthNew();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'compose' | 'dashboard'>('compose');
  const [sponsorInfo, setSponsorInfo] = useState<SponsorInfo | null>(null);
  const [campaignQuota, setCampaignQuota] = useState<CampaignQuota | null>(null);
  const [recipientDetails, setRecipientDetails] = useState<RecipientDetails>({
    total: 0,
    directMembers: 0,
    supporters: 0
  });
  
  // États pour le tableau de bord
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // Normalisation du rôle (gérer avec ou sans espace)
  const userRole = profile?.role?.replace(/\s+/g, '') as 'SuperAdmin' | 'ClubAdmin' | 'Sponsor' | string;

  // Limites de campagnes selon le niveau sponsor
  const getCampaignLimit = (level: string): number => {
    const limits: Record<string, number> = {
      'Platine': 4,
      'Or': 3,
      'Argent': 2,
      'Bronze': 1,
      'Partenaire': 1
    };
    return limits[level] || 0;
  };

  // Récupération des infos sponsor et quota
  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) return;

      try {
        setLoading(true);

        // Si l'utilisateur est un sponsor
        if (userRole === 'Sponsor') {
          // Chercher directement le sponsor créé par cet utilisateur
          const { data: sponsorData, error: sponsorError } = await supabase
  .from('sponsors')
  .select('*')
  .eq('user_id', profile.id)  // Utiliser user_id au lieu de created_by
  .single();

if (sponsorError || !sponsorData) {
  console.log('Aucun sponsor trouvé pour cet utilisateur:', sponsorError);
  setLoading(false);
  return;
}

          // Utiliser les données du sponsor trouvé
          const level = sponsorData.sponsor_type;
          const sponsorType = sponsorData.club_id ? 'club' : 'association';

          setSponsorInfo({
            level: level as any,
            sponsor_type: sponsorType,
            club_id: sponsorData.club_id,
            association_id: sponsorData.association_id
          });

          // Calculer le quota de campagnes
          const limit = getCampaignLimit(level);
          
          // Compter les campagnes envoyées ce mois
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          const { data: campaigns, error: campaignsError } = await supabase
            .from('mailing_campaigns')
            .select('id')
            .eq('sent_by', profile.id)
            .gte('sent_at', startOfMonth.toISOString());

          if (campaignsError) throw campaignsError;

          const used = campaigns?.length || 0;
          setCampaignQuota({
            used,
            limit,
            remaining: Math.max(0, limit - used)
          });
        }

        // Calculer le nombre de destinataires avec détails
        await calculateRecipientsWithDetails();

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile, userRole]);

  // Charger les statistiques du tableau de bord
  const loadDashboardData = async () => {
    if (!profile?.id) return;

    try {
      setStatsLoading(true);

      // Définir les filtres selon le rôle
      let campaignFilter: any = {};
      
      if (userRole === 'SuperAdmin') {
        campaignFilter = { association_id: profile.association_id };
      } else if (userRole === 'ClubAdmin') {
        campaignFilter = { club_id: profile.club_id };
      } else if (userRole === 'Sponsor') {
        campaignFilter = { sent_by: profile.id };
      }

      // Récupérer les campagnes
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('mailing_campaigns')
        .select('*')
        .match(campaignFilter)
        .order('sent_at', { ascending: false });

      if (campaignsError) throw campaignsError;

      setCampaigns(campaignsData || []);

      // Calculer les statistiques
      const allCampaigns = campaignsData || [];
      const thisMonthCampaigns = allCampaigns.filter(c => {
        const sentDate = new Date(c.sent_at);
        const now = new Date();
        return sentDate.getMonth() === now.getMonth() && sentDate.getFullYear() === now.getFullYear();
      });

      // Statistiques par rôle
      const byRole = allCampaigns.reduce((acc, campaign) => {
        const role = campaign.sender_role;
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Statistiques par mois (derniers 6 mois)
      const byMonth = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().substring(0, 7); // YYYY-MM
        
        const monthCampaigns = allCampaigns.filter(c => 
          c.sent_at.substring(0, 7) === monthKey
        );

        byMonth.push({
          month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
          count: monthCampaigns.length,
          recipients: monthCampaigns.reduce((sum, c) => sum + c.recipient_count, 0)
        });
      }

      const statsData: CampaignStats = {
        totalCampaigns: allCampaigns.length,
        totalRecipients: allCampaigns.reduce((sum, c) => sum + c.recipient_count, 0),
        campaignsThisMonth: thisMonthCampaigns.length,
        averageRecipients: allCampaigns.length > 0 
          ? Math.round(allCampaigns.reduce((sum, c) => sum + c.recipient_count, 0) / allCampaigns.length)
          : 0,
        byRole,
        byMonth
      };

      setStats(statsData);

    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Charger le dashboard quand on change d'onglet
  useEffect(() => {
    if (activeTab === 'dashboard' && !statsLoading && !stats) {
      loadDashboardData();
    }
  }, [activeTab, profile]);

  // Calculer le nombre de destinataires avec détails selon le rôle
  const calculateRecipientsWithDetails = async () => {
    if (!profile) return;

    try {
      let directMembers = 0;
      let supporters = 0;

      if (userRole === 'SuperAdmin') {
        // Super Admin : tous les membres ayant consenti (association)
        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('email_consent_association', true);
        
        directMembers = count || 0;
        supporters = 0;

      } else if (userRole === 'ClubAdmin') {
        const clubId = profile.club_id;
        
        // Membres directs : ceux qui ont club_id = clubId ET rôle Member/ClubAdmin
        const { count: directMembersCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('club_id', clubId)
          .in('role', ['Member', 'Club Admin'])
          .eq('email_consent_clubs', true);

        directMembers = directMembersCount || 0;

        // Supporters : ceux qui suivent le club via user_clubs ET ont le rôle Supporter
        const { data: followersData } = await supabase
          .from('user_clubs')
          .select('user_id')
          .eq('club_id', clubId);

        const followerIds = followersData?.map(f => f.user_id) || [];
        
        if (followerIds.length > 0) {
          const { count: suppCount } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .in('id', followerIds)
            .eq('role', 'Supporter')
            .eq('email_consent_clubs', true);
          
          supporters = suppCount || 0;
        }

      } else if (userRole === 'Sponsor' && sponsorInfo) {
        if (sponsorInfo.sponsor_type === 'club' && sponsorInfo.club_id) {
          const clubId = sponsorInfo.club_id;

          // Membres directs du club
          const { count: directMembersCount } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('club_id', clubId)
            .in('role', ['Member', 'Club Admin'])
            .eq('email_consent_sponsors', true);

          directMembers = directMembersCount || 0;

          // Supporters qui suivent ce club
          const { data: followersData } = await supabase
            .from('user_clubs')
            .select('user_id')
            .eq('club_id', clubId);

          const followerIds = followersData?.map(f => f.user_id) || [];
          
          if (followerIds.length > 0) {
            const { count: suppCount } = await supabase
              .from('profiles')
              .select('id', { count: 'exact', head: true })
              .in('id', followerIds)
              .eq('role', 'Supporter')
              .eq('email_consent_sponsors', true);
            
            supporters = suppCount || 0;
          }

        } else if (sponsorInfo.sponsor_type === 'association' && sponsorInfo.association_id) {
          // Pour sponsor d'association, tous sont considérés comme membres directs
          const { count } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('association_id', sponsorInfo.association_id)
            .eq('email_consent_sponsors', true);
          
          directMembers = count || 0;
          supporters = 0;
        }
      }

      setRecipientDetails({
        total: directMembers + supporters,
        directMembers,
        supporters
      });

    } catch (error) {
      console.error('Erreur lors du calcul des destinataires:', error);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) return;

    try {
      const { error } = await supabase
        .from('mailing_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      // Recharger les données
      loadDashboardData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la campagne');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est un sponsor mais qu'aucun sponsor n'a été trouvé
  if (userRole === 'Sponsor' && !sponsorInfo) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun sponsor associé
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Votre compte sponsor n'est pas encore configuré ou associé à une entreprise sponsor.
              <br />
              Contactez l'administrateur pour finaliser votre configuration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {/* Header avec navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mailing</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {userRole === 'SuperAdmin' && 'Gestion des campagnes de l\'association'}
                  {userRole === 'ClubAdmin' && 'Gestion des campagnes de votre club'}
                  {userRole === 'Sponsor' && `Campagnes sponsor ${sponsorInfo?.sponsor_type === 'club' ? 'du club' : 'de l\'association'}`}
                </p>
              </div>
            </div>

            {/* Navigation par onglets */}
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Tableau de bord
              </button>
              <button
                onClick={() => setActiveTab('compose')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'compose'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Edit className="w-4 h-4 inline mr-2" />
                Nouvelle campagne
              </button>
            </div>
          </div>
        </div>

        {/* Contenu selon l'onglet actif */}
        <div className="p-6">
          {activeTab === 'dashboard' ? (
            // TABLEAU DE BORD
            <div className="space-y-6">
              {statsLoading ? (
                <div className="animate-pulse space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-gray-200 dark:bg-gray-700 h-24 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              ) : stats ? (
                <>
                  {/* Cartes de statistiques */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center">
                        <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total campagnes</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCampaigns}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center">
                        <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total destinataires</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRecipients}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ce mois-ci</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.campaignsThisMonth}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center">
                        <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Moy. destinataires</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageRecipients}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Graphiques */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Évolution mensuelle */}
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Évolution par mois
                      </h3>
                      <div className="space-y-3">
                        {stats.byMonth.map((month, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{month.month}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {month.count} campagne{month.count > 1 ? 's' : ''}
                              </span>
                              <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ 
                                    width: `${Math.max(5, (month.count / Math.max(...stats.byMonth.map(m => m.count), 1)) * 100)}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Répartition par rôle */}
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Répartition par expéditeur
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(stats.byRole).map(([role, count]) => (
                          <div key={role} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {role === 'Club Admin' ? 'Clubs' : 
                               role === 'Super Admin' ? 'Association' : 
                               role === 'Sponsor' ? 'Sponsors' : role}
                            </span>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                              <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ 
                                    width: `${Math.max(5, (count / Math.max(...Object.values(stats.byRole), 1)) * 100)}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Historique des campagnes */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Historique des campagnes
                      </h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-600">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Sujet
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Destinataires
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                          {campaigns.map((campaign) => (
                            <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {campaign.subject}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {campaign.message_preview.substring(0, 60)}...
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  campaign.sender_role === 'Club Admin' 
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                    : campaign.sender_role === 'Super Admin'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                }`}>
                                  {campaign.sender_role === 'Club Admin' ? 'Club' :
                                   campaign.sender_role === 'Super Admin' ? 'Association' :
                                   `Sponsor ${campaign.sponsor_level || ''}`}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                {campaign.recipient_count}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {new Date(campaign.sent_at).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => alert('Fonctionnalité de vue détaillée à venir')}
                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteCampaign(campaign.id)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {campaigns.length === 0 && (
                        <div className="text-center py-8">
                          <Mail className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400">Aucune campagne envoyée pour le moment</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <button
                    onClick={loadDashboardData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Charger les statistiques
                  </button>
                </div>
              )}
            </div>
          ) : (
            // FORMULAIRE DE NOUVELLE CAMPAGNE
            <>
              {/* Quota pour sponsors */}
              {userRole === 'Sponsor' && campaignQuota && (
                <div className={`mb-6 p-4 rounded-lg border-2 ${
                  campaignQuota.remaining > 0 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className={`w-5 h-5 ${
                        campaignQuota.remaining > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`} />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Quota de campagnes ce mois
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Niveau : <span className="font-medium">{sponsorInfo?.level}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        campaignQuota.remaining > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {campaignQuota.remaining} / {campaignQuota.limit}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {campaignQuota.used} envoyée{campaignQuota.used > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {campaignQuota.remaining === 0 && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span>Vous avez atteint votre limite mensuelle de campagnes</span>
                    </div>
                  )}
                </div>
              )}

              {/* Nombre de destinataires avec détails */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">Destinataires potentiels</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span className="font-medium text-blue-600 dark:text-blue-400">{recipientDetails.total}</span> membre{recipientDetails.total > 1 ? 's' : ''} ayant consenti à recevoir des emails
                    </p>
                    
                    {/* Détail des destinataires */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {recipientDetails.directMembers > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-700 dark:text-gray-300">
                            <span className="font-medium">{recipientDetails.directMembers}</span> membre{recipientDetails.directMembers > 1 ? 's' : ''} 
                            {userRole === 'ClubAdmin' && ' du club'}
                            {userRole === 'Sponsor' && sponsorInfo?.sponsor_type === 'club' && ' du club'}
                            {userRole === 'Sponsor' && sponsorInfo?.sponsor_type === 'association' && ' de l\'association'}
                            {userRole === 'SuperAdmin' && ' de l\'association'}
                          </span>
                        </div>
                      )}
                      
                      {recipientDetails.supporters > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <UserPlus className="w-3 h-3 text-green-600 dark:text-green-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            <span className="font-medium">{recipientDetails.supporters}</span> supporter{recipientDetails.supporters > 1 ? 's' : ''} 
                            {(userRole === 'ClubAdmin' || (userRole === 'Sponsor' && sponsorInfo?.sponsor_type === 'club')) && ' du club'}
                          </span>
                        </div>
                      )}
                    </div>

                    {recipientDetails.total === 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <AlertCircle className="w-4 h-4" />
                        <span>Aucun destinataire disponible</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Formulaire d'envoi */}
              {userRole === 'Sponsor' && campaignQuota && campaignQuota.remaining === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-red-300 dark:text-red-700 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Quota mensuel épuisé
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Vous avez utilisé toutes vos campagnes pour ce mois.
                    <br />
                    Revenez le mois prochain ou contactez l'association pour augmenter votre niveau.
                  </p>
                </div>
              ) : (
                <MailingForm 
                  recipientDetails={recipientDetails}
                  userRole={userRole}
                  profile={profile}
                  sponsorInfo={sponsorInfo}
                  campaignQuota={campaignQuota}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mailing;