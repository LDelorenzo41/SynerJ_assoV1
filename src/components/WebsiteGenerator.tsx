// src/components/WebsiteGenerator.tsx

import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Globe, Upload, Palette, Loader, ExternalLink, Check, Copy, ChevronDown, ChevronUp, Plus, X, FileText } from 'lucide-react';

interface WebsiteGeneratorProps {
  clubId: string;
  clubName: string;
  currentWebsiteUrl?: string | null;
  onSuccess?: (websiteUrl: string) => void;
}

export default function WebsiteGenerator({ 
  clubId, 
  clubName, 
  currentWebsiteUrl,
  onSuccess 
}: WebsiteGeneratorProps) {
  const [formData, setFormData] = useState({
    tagline: '',
    description: '',
    phone: '',
    themeColor: '#10b981',
  });

  const [schedules, setSchedules] = useState<string[]>(['']);
  const [locations, setLocations] = useState<string[]>(['']);
  const [pricings, setPricings] = useState<string[]>(['']);
  const [documents, setDocuments] = useState<{name: string, url: string}[]>([{name: '', url: ''}]);

  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [illustrationImage, setIllustrationImage] = useState<File | null>(null);
  const [illustrationImagePreview, setIllustrationImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingIllustration, setUploadingIllustration] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(currentWebsiteUrl || null);
  const [isExpanded, setIsExpanded] = useState(!currentWebsiteUrl);

  const heroInputRef = useRef<HTMLInputElement>(null);
  const illustrationInputRef = useRef<HTMLInputElement>(null);

  const addSchedule = () => setSchedules([...schedules, '']);
  const removeSchedule = (index: number) => {
    if (schedules.length > 1) setSchedules(schedules.filter((_, i) => i !== index));
  };
  const updateSchedule = (index: number, value: string) => {
    const newSchedules = [...schedules];
    newSchedules[index] = value;
    setSchedules(newSchedules);
  };

  const addLocation = () => setLocations([...locations, '']);
  const removeLocation = (index: number) => {
    if (locations.length > 1) setLocations(locations.filter((_, i) => i !== index));
  };
  const updateLocation = (index: number, value: string) => {
    const newLocations = [...locations];
    newLocations[index] = value;
    setLocations(newLocations);
  };

  const addPricing = () => setPricings([...pricings, '']);
  const removePricing = (index: number) => {
    if (pricings.length > 1) setPricings(pricings.filter((_, i) => i !== index));
  };
  const updatePricing = (index: number, value: string) => {
    const newPricings = [...pricings];
    newPricings[index] = value;
    setPricings(newPricings);
  };

  const addDocument = () => setDocuments([...documents, {name: '', url: ''}]);
  const removeDocument = (index: number) => {
    if (documents.length > 1) setDocuments(documents.filter((_, i) => i !== index));
  };
  const updateDocument = (index: number, field: 'name' | 'url', value: string) => {
    const newDocuments = [...documents];
    newDocuments[index][field] = value;
    setDocuments(newDocuments);
  };

  const uploadImage = async (file: File, type: 'hero' | 'illustration'): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${clubId}/${type}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('club-websites')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Erreur d'upload: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('club-websites')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'L\'image hero doit faire moins de 5MB' });
        return;
      }
      setHeroImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIllustrationImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'L\'image illustration doit faire moins de 5MB' });
        return;
      }
      setIllustrationImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIllustrationImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!formData.tagline.trim()) {
        throw new Error('La phrase d\'accroche est requise');
      }

      if (!formData.description.trim()) {
        throw new Error('La description est requise');
      }

      if (!heroImage && !heroImagePreview) {
        throw new Error('L\'image hero est requise');
      }

      let heroImageUrl = heroImagePreview;
      let illustrationImageUrl = illustrationImagePreview;

      if (heroImage) {
        setUploadingHero(true);
        heroImageUrl = await uploadImage(heroImage, 'hero');
        setUploadingHero(false);
      }

      if (illustrationImage) {
        setUploadingIllustration(true);
        illustrationImageUrl = await uploadImage(illustrationImage, 'illustration');
        setUploadingIllustration(false);
      }

      const filteredSchedules = schedules.filter(s => s.trim());
      const filteredLocations = locations.filter(l => l.trim());
      const filteredPricings = pricings.filter(p => p.trim());
      const filteredDocuments = documents.filter(d => d.name.trim() && d.url.trim());

      const { data, error } = await supabase.functions.invoke('generate-club-website', {
        body: {
          clubId,
          clubName,
          tagline: formData.tagline,
          description: formData.description,
          phone: formData.phone || null,
          heroImageUrl,
          illustrationImageUrl,
          schedules: filteredSchedules.length > 0 ? filteredSchedules : undefined,
          locations: filteredLocations.length > 0 ? filteredLocations : undefined,
          pricings: filteredPricings.length > 0 ? filteredPricings : undefined,
          documents: filteredDocuments.length > 0 ? filteredDocuments : undefined,
          themeColor: formData.themeColor,
        },
      });

      if (error) {
        throw new Error(error.message || 'Erreur lors de la génération du site');
      }

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la génération du site');
      }

      setGeneratedUrl(data.url);
      setMessage({
        type: 'success',
        text: '🎉 Site web généré avec succès ! Cliquez sur le lien pour le voir.',
      });

      setIsExpanded(false);

      if (onSuccess) {
        onSuccess(data.url);
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
      setUploadingHero(false);
      setUploadingIllustration(false);
    }
  };

  return (
    <div className="dark-card rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Globe className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
          <div>
            <h2 className="text-xl font-semibold dark-text">Générateur de Site Web</h2>
            <p className="text-sm dark-text-muted mt-1">
              Créez automatiquement un site web moderne pour votre club
            </p>
          </div>
        </div>
      </div>

      {generatedUrl && (
        <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-800">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                Site web généré avec succès ! 🎉
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                Votre site web est maintenant accessible en ligne.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={window.location.origin + generatedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Voir le site
                </a>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + generatedUrl);
                    alert('URL copiée dans le presse-papier !');
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 font-medium rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copier l'URL
                </button>
              </div>

              <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">URL de votre site :</p>
                <code className="text-sm text-green-700 dark:text-green-300 break-all">
                  {window.location.origin + generatedUrl}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mb-6 flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
      >
        <span className="font-medium dark-text">
          {generatedUrl ? 'Modifier / Regénérer le site' : 'Créer votre site web'}
        </span>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 dark-text-muted" />
        ) : (
          <ChevronDown className="h-5 w-5 dark-text-muted" />
        )}
      </button>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium dark-text-muted mb-2">
              Phrase d'accroche * <span className="text-xs text-gray-500">(Affichée dans le hero)</span>
            </label>
            <input
              type="text"
              required
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="dark-input w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all"
              placeholder="Ex: La passion de la marche et des rencontres"
              maxLength={100}
            />
            <p className="text-xs dark-text-muted mt-1">
              Une phrase courte et percutante (max 100 caractères)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium dark-text-muted mb-2">
              Image de couverture * <span className="text-xs text-gray-500">(Paysage 16:9)</span>
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => heroInputRef.current?.click()}
                disabled={loading}
                className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadingHero ? 'Upload...' : 'Choisir une image'}
              </button>
              {heroImagePreview && (
                <img
                  src={heroImagePreview}
                  alt="Preview hero"
                  className="h-16 w-28 object-cover rounded border border-gray-300 dark:border-gray-600"
                />
              )}
            </div>
            <input
              ref={heroInputRef}
              type="file"
              accept="image/*"
              onChange={handleHeroImageChange}
              className="hidden"
            />
            <p className="text-xs dark-text-muted mt-1">
              Format recommandé : 1920x1080px. Max 5MB.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium dark-text-muted mb-2">
              Image d'illustration <span className="text-xs text-gray-500">(Optionnel)</span>
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => illustrationInputRef.current?.click()}
                disabled={loading}
                className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadingIllustration ? 'Upload...' : 'Choisir une image'}
              </button>
              {illustrationImagePreview && (
                <img
                  src={illustrationImagePreview}
                  alt="Preview illustration"
                  className="h-16 w-16 object-cover rounded border border-gray-300 dark:border-gray-600"
                />
              )}
            </div>
            <input
              ref={illustrationInputRef}
              type="file"
              accept="image/*"
              onChange={handleIllustrationImageChange}
              className="hidden"
            />
          </div>

          <div>
            <label className="block text-sm font-medium dark-text-muted mb-2">
              Description complète du club * <span className="text-xs text-gray-500">(Affichée dans la section "À propos")</span>
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="dark-input w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all"
              placeholder="Décrivez votre club, vos activités, votre philosophie en détail..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium dark-text-muted mb-2">
              Numéro de téléphone <span className="text-xs text-gray-500">(Optionnel)</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="dark-input w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all"
              placeholder="Ex: 06 12 34 56 78"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium dark-text-muted">
                Horaires <span className="text-xs text-gray-500">(Optionnel)</span>
              </label>
              <button
                type="button"
                onClick={addSchedule}
                className="flex items-center text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter un horaire
              </button>
            </div>
            <div className="space-y-2">
              {schedules.map((schedule, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={schedule}
                    onChange={(e) => updateSchedule(index, e.target.value)}
                    className="dark-input flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all"
                    placeholder={`Ex: ${index === 0 ? 'Lundi et Mercredi 18h-20h' : 'Samedi 10h-12h'}`}
                  />
                  {schedules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSchedule(index)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium dark-text-muted">
                Lieux / Adresses <span className="text-xs text-gray-500">(Optionnel)</span>
              </label>
              <button
                type="button"
                onClick={addLocation}
                className="flex items-center text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter un lieu
              </button>
            </div>
            <div className="space-y-2">
              {locations.map((location, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => updateLocation(index, e.target.value)}
                    className="dark-input flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all"
                    placeholder={`Ex: ${index === 0 ? 'Gymnase municipal, 123 rue du Sport' : 'Salle annexe, 45 avenue des Loisirs'}`}
                  />
                  {locations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLocation(index)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium dark-text-muted">
                Tarifs <span className="text-xs text-gray-500">(Optionnel)</span>
              </label>
              <button
                type="button"
                onClick={addPricing}
                className="flex items-center text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter un tarif
              </button>
            </div>
            <div className="space-y-2">
              {pricings.map((pricing, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pricing}
                    onChange={(e) => updatePricing(index, e.target.value)}
                    className="dark-input flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all"
                    placeholder={`Ex: ${index === 0 ? 'Adultes : 150€/an' : 'Enfants (-12 ans) : 80€/an'}`}
                  />
                  {pricings.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePricing(index)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ✅ NOUVELLE SECTION : Documents */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <div className="flex items-start gap-3 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  📄 Comment ajouter des documents à télécharger ?
                </h3>
                <div className="text-xs text-blue-800 dark:text-blue-200 space-y-2">
                  <p>
                    Vous pouvez proposer des documents (formulaires, fiches médicales, règlement, etc.) en téléchargement sur votre site.
                  </p>
                  <p className="font-medium">📤 Étapes :</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Uploadez votre document sur <strong>Google Drive</strong>, <strong>Dropbox</strong> ou <strong>OneDrive</strong></li>
                    <li>Cliquez sur "Partager" et configurez en <strong>"Tous les utilisateurs avec le lien"</strong></li>
                    <li>Copiez le lien partagé et collez-le ci-dessous</li>
                  </ol>
                  <p className="text-blue-700 dark:text-blue-300 font-medium mt-2">
                    💡 Nous n'hébergeons pas vos fichiers - ils restent sur votre espace cloud !
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium dark-text-muted">
                Documents à télécharger <span className="text-xs text-gray-500">(Optionnel)</span>
              </label>
              <button
                type="button"
                onClick={addDocument}
                className="flex items-center text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter un document
              </button>
            </div>
            
            <div className="space-y-3">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-start gap-2 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={doc.name}
                      onChange={(e) => updateDocument(index, 'name', e.target.value)}
                      className="dark-input w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                      placeholder="Nom du document (ex: Formulaire d'inscription 2025)"
                    />
                    <input
                      type="url"
                      value={doc.url}
                      onChange={(e) => updateDocument(index, 'url', e.target.value)}
                      className="dark-input w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                      placeholder="Lien du document (ex: https://drive.google.com/file/d/.../view)"
                    />
                  </div>
                  {documents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium dark-text-muted mb-2">
              Couleur du thème
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                value={formData.themeColor}
                onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <span className="text-sm dark-text-muted">{formData.themeColor}</span>
              <Palette className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Globe className="h-5 w-5 mr-2" />
                  {generatedUrl ? 'Regénérer le site' : 'Générer mon site web'}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}