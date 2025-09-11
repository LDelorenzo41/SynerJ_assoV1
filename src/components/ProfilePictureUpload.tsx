import React, { useState, useRef } from 'react';
import { Camera, User, X } from 'lucide-react';

interface ProfilePictureUploadProps {
  onImageSelect: (file: File | null) => void;
  currentImage?: string | null;
  disabled?: boolean;
  required?: boolean;
}

export default function ProfilePictureUpload({
  onImageSelect,
  currentImage,
  disabled = false,
  required = false
}: ProfilePictureUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) {
      setPreview(null);
      onImageSelect(null);
      return;
    }

    // Vérifications
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 2MB');
      return;
    }

    // Créer un aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    onImageSelect(file);
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setError(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Photo de profil {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="flex items-center space-x-6">
        {/* Aperçu de l'image */}
        <div className="relative">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Aperçu"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  title="Supprimer l'image"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
              <User className="h-8 w-8 text-gray-400" />
            </div>
          )}
          
          {!disabled && (
            <button
              type="button"
              onClick={triggerFileInput}
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
              title="Choisir une image"
            >
              <Camera className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Informations et boutons */}
        <div className="flex-1">
          <div className="space-y-2">
            {!disabled && (
              <button
                type="button"
                onClick={triggerFileInput}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                {preview ? 'Changer la photo' : 'Ajouter une photo'}
              </button>
            )}
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>Formats acceptés: JPG, PNG, GIF</p>
              <p>Taille maximum: 2MB</p>
              {required && <p className="text-red-500">* Champ obligatoire</p>}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Input caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}