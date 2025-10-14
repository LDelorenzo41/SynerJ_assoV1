// src/pages/ClubWebsite.tsx
// ✅ Affichage du site web avec iframe (SANS bandeau de navigation)

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertCircle, Loader } from 'lucide-react';

export function ClubWebsite() {
  const { clubId } = useParams();
  const [websiteHtml, setWebsiteHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWebsite() {
      if (!clubId) {
        setError('ID de club manquant');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Fetching website for clubId:', clubId);
        
        const { data, error: fetchError } = await supabase
          .from('clubs')
          .select('website_html')
          .eq('id', clubId)
          .single();

        console.log('📦 Data received:', data);

        if (fetchError) {
          console.error('❌ Error fetching website:', fetchError);
          throw fetchError;
        }

        if (!data?.website_html) {
          console.warn('⚠️ No website HTML found');
          setError('Ce club n\'a pas encore de site web généré.');
          setLoading(false);
          return;
        }

        console.log('✅ HTML found! Length:', data.website_html.length, 'characters');
        setWebsiteHtml(data.website_html);
        setLoading(false);

      } catch (err) {
        console.error('💥 Error in fetchWebsite:', err);
        setError('Erreur lors du chargement du site web');
        setLoading(false);
      }
    }

    fetchWebsite();
  }, [clubId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du site web...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Display website in iframe
  if (websiteHtml) {
    console.log('🎨 Rendering website with HTML length:', websiteHtml.length);
    return (
      <iframe
        srcDoc={websiteHtml}
        className="w-full h-screen border-0"
        title="Site web du club"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
        style={{ 
          display: 'block', 
          width: '100vw', 
          height: '100vh', 
          margin: 0, 
          padding: 0,
          border: 'none'
        }}
      />
    );
  }

  return null;
}

export default ClubWebsite;