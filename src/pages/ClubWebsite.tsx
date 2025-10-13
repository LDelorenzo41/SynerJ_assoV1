// src/pages/ClubWebsite.tsx
// ✅ Page dédiée pour afficher le site web d'un club

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';

export default function ClubWebsite() {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [clubName, setClubName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWebsite();
  }, [clubId]);

  const fetchWebsite = async () => {
    if (!clubId) {
      console.log('❌ Pas de clubId dans l\'URL');
      setError('ID du club manquant');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Fetching website for clubId:', clubId);

      const { data, error: fetchError } = await supabase
        .from('clubs')
        .select('website_html, name')
        .eq('id', clubId)
        .single();

      console.log('📦 Data received:', data);
      console.log('❌ Error:', fetchError);

      if (fetchError) throw fetchError;

      if (!data.website_html) {
        console.log('⚠️ No HTML in database for this club');
        setError('Ce club n\'a pas encore généré de site web');
        setLoading(false);
        return;
      }

      console.log('✅ HTML found! Length:', data.website_html.length, 'characters');
      console.log('✅ Club name:', data.name);
      console.log('📄 HTML preview (first 200 chars):', data.website_html.substring(0, 200));

      setHtmlContent(data.website_html);
      setClubName(data.name);
      setLoading(false);

      // Log après le setState pour vérifier
      setTimeout(() => {
        console.log('🎯 State updated - htmlContent length:', data.website_html.length);
      }, 100);

    } catch (err: any) {
      console.error('💥 Error fetching website:', err);
      setError(err.message || 'Erreur lors du chargement du site');
      setLoading(false);
    }
  };

  if (loading) {
    console.log('⏳ Loading state...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du site web...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('⚠️ Error state:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
            Erreur
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </button>
        </div>
      </div>
    );
  }

  console.log('🎨 Rendering website with HTML length:', htmlContent.length);
  console.log('🏷️ Club name:', clubName);

  return (
    <div className="min-h-screen bg-white">
      {/* Barre de navigation discrète */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </button>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">Site web de</span>
            <span className="font-medium text-gray-900 dark:text-white">{clubName}</span>
          </div>
        </div>
      </div>

      {/* Contenu du site (avec marge pour la barre de nav) */}
      <div className="pt-16">
        <div 
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          className="club-website-content"
          onLoad={() => console.log('📺 HTML content loaded')}
        />
      </div>

      <style>{`
  /* Isolation du contenu du site */
  .club-website-content {
    width: 100%;
    min-height: 100vh;
    background: white;
  }
  
  /* Empêcher les styles de l'app React de fuiter */
  .club-website-content {
    font-family: inherit;
    font-size: 16px;
    line-height: 1.5;
    color: inherit;
  }
`}</style>
    </div>
  );
}