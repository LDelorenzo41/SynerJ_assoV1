import React, { useState, useEffect } from 'react';
import { useAuthNew } from '../hooks/useAuthNew';
import { supabase } from '../lib/supabase';
import { Building2, ExternalLink, Mail, Phone, MapPin, Award, Users, Heart, AlertCircle, Plus } from 'lucide-react';

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  sponsor_type: 'Platine' | 'Or' | 'Argent' | 'Bronze' | 'Partenaire';
  association_id: string | null;
  club_id: string | null;
  created_at: string;
}

export default function Sponsors() {
  const { profile, isAuthenticated, isSuperAdmin } = useAuthNew();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'association' | 'club'>('association');

  useEffect(() => {
    if (profile) {
      loadSponsors();
    }
  }, [profile]);

  const loadSponsors = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('sponsors')
        .select('*')
        .order('sponsor_type', { ascending: false })
        .order('created_at', { ascending: false });

      // Filtrage selon le rôle et les permissions
      if (profile.role === 'Super Admin' && profile.association_id) {
        // Super Admin voit les sponsors de son association
        query = query.eq('association_id', profile.association_id);
      } else if (profile.role === 'Club Admin' && profile.club_id) {
        // Club Admin voit les sponsors de son club + sponsors de l'association
        query = query.or(`club_id.eq.${profile.club_id},association_id.eq.${profile.association_id}`);
      } else if (profile.role === 'Member' && profile.club_id) {
        // Member voit les sponsors de son club + sponsors de l'association
        query = query.or(`club_id.eq.${profile.club_id},association_id.eq.${profile.association_id}`);
      } else if (profile.role === 'Supporter' && profile.association_id) {
        // Supporter voit uniquement les sponsors publics de l'association
        query = query.eq('association_id', profile.association_id);
      } else {
        // Pas d'association = aucun sponsor
        setSponsors([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching sponsors:', fetchError);
        throw fetchError;
      }

      setSponsors(data || []);
    } catch (err: any) {
      console.error('Error loading sponsors:', err);
      setError(err.message || 'Erreur lors du chargement des sponsors');
    } finally {
      setLoading(false);
    }
  };

  const getSponsorTypeIcon = (type: string) => {
    switch (type) {
      case 'Platine': return <Award className="h-5 w-5 text-gray-600" />;
      case 'Or': return <Award className="h-5 w-5 text-yellow-500" />;
      case 'Argent': return <Award className="h-5 w-5 text-gray-400" />;
      case 'Bronze': return <Award className="h-5 w-5 text-orange-600" />;
      case 'Partenaire': return <Heart className="h-5 w-5 text-red-500" />;
      default: return <Building2 className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSponsorTypeColor = (type: string) => {
    switch (type) {
      case 'Platine': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'Or': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Argent': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'Bronze': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Partenaire': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const filteredSponsors = sponsors.filter(sponsor => {
    switch (filter) {
      case 'association':
        return sponsor.association_id === profile?.association_id;
      case 'club':
        return sponsor.club_id === profile?.club_id;
      default:
        return true;
    }
  });

  const groupedSponsors = filteredSponsors.reduce((acc, sponsor) => {
    const type = sponsor.sponsor_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(sponsor);
    return acc;
  }, {} as Record<string, Sponsor[]>);

  const typeOrder = ['Platine', 'Or', 'Argent', 'Bronze', 'Partenaire'];

  // Vérifier les permissions AVANT le loading
  if (profile?.role === 'Supporter' && !profile?.association_id) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Nos Sponsors</h1>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-yellow-900 mb-2">Association requise</h2>
              <p className="text-yellow-800 mb-4">
                Pour voir les sponsors, vous devez d'abord rejoindre une association. 
                Rendez-vous sur votre tableau de bord pour choisir une association à suivre.
              </p>
              <a
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Users className="h-4 w-4 mr-2" />
                Aller au tableau de bord
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Nos Sponsors</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-red-600 mr-3 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-red-900 mb-2">Erreur de chargement</h2>
              <p className="text-red-800 mb-4">{error}</p>
              <button
                onClick={loadSponsors}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Nos Sponsors</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {filteredSponsors.length} sponsor{filteredSponsors.length > 1 ? 's' : ''}
          </div>
          {isSuperAdmin && (
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un sponsor
            </button>
          )}
        </div>
      </div>

      {sponsors.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <Heart className="h-6 w-6 text-blue-600 mr-3 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Un grand merci à nos partenaires !</h2>
              <p className="text-blue-800">
                Grâce au soutien de nos sponsors et partenaires, nous pouvons développer nos activités, 
                organiser des événements de qualité et offrir des services à nos membres. 
                Leur confiance et leur engagement sont essentiels à notre réussite.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      {sponsors.length > 0 && (
        <div className="flex space-x-4 border-b border-gray-200">
          {profile?.association_id && (
            <button
              onClick={() => setFilter('association')}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                filter === 'association'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sponsors de l'association
            </button>
          )}
          {profile?.club_id && (
            <button
              onClick={() => setFilter('club')}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                filter === 'club'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sponsors de mon club
            </button>
          )}
          <button
            onClick={() => setFilter('all')}
            className={`pb-2 px-1 text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Tous mes sponsors
          </button>
        </div>
      )}

      {/* Liste des sponsors groupés par type */}
      {sponsors.length > 0 ? (
        <div className="space-y-8">
          {typeOrder.map(type => {
            const sponsorsOfType = groupedSponsors[type];
            if (!sponsorsOfType || sponsorsOfType.length === 0) return null;

            return (
              <div key={type} className="space-y-4">
                <div className="flex items-center space-x-2">
                  {getSponsorTypeIcon(type)}
                  <h2 className="text-xl font-bold text-gray-900">{type}</h2>
                  <span className="text-sm text-gray-500">({sponsorsOfType.length})</span>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sponsorsOfType.map((sponsor) => (
                    <div key={sponsor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      {/* Header avec logo/nom */}
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            {sponsor.logo_url ? (
                              <img 
                                src={sponsor.logo_url} 
                                alt={`Logo ${sponsor.name}`}
                                className="h-12 w-12 object-contain rounded"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{sponsor.name}</h3>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSponsorTypeColor(sponsor.sponsor_type)}`}>
                                {getSponsorTypeIcon(sponsor.sponsor_type)}
                                <span className="ml-1">{sponsor.sponsor_type}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className="p-6 space-y-4">
                        {sponsor.description && (
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {sponsor.description}
                          </p>
                        )}

                        {/* Informations de contact */}
                        <div className="space-y-2">
                          {sponsor.website && (
                            <a
                              href={sponsor.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-600 hover:text-blue-700 text-sm transition-colors"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Site web
                            </a>
                          )}
                          
                          {sponsor.contact_email && (
                            <a
                              href={`mailto:${sponsor.contact_email}`}
                              className="flex items-center text-gray-600 hover:text-gray-800 text-sm transition-colors"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              {sponsor.contact_email}
                            </a>
                          )}
                          
                          {sponsor.contact_phone && (
                            <a
                              href={`tel:${sponsor.contact_phone}`}
                              className="flex items-center text-gray-600 hover:text-gray-800 text-sm transition-colors"
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              {sponsor.contact_phone}
                            </a>
                          )}
                          
                          {sponsor.address && (
                            <div className="flex items-center text-gray-600 text-sm">
                              <MapPin className="h-4 w-4 mr-2" />
                              {sponsor.address}
                            </div>
                          )}
                        </div>

                        {/* Niveau de partenariat */}
                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {sponsor.club_id ? 'Sponsor de club' : 'Sponsor d\'association'}
                            </span>
                            <span>Depuis {new Date(sponsor.created_at).getFullYear()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Aucun sponsor pour le moment</h2>
          <p className="text-gray-500 mb-6">
            {isSuperAdmin 
              ? 'Commencez par ajouter vos premiers sponsors et partenaires.'
              : 'Aucun sponsor n\'est encore référencé pour votre association.'
            }
          </p>
          {isSuperAdmin && (
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter le premier sponsor
            </button>
          )}
        </div>
      )}
    </div>
  );
}