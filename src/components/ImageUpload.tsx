
'use client';
import { useState } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  onImageSelected: (imageUrl: string, imageFile: File) => void;
  maxSizeMB?: number;
  className?: string;
}

interface ImagePreview {
  url: string;
  file: File;
  name: string;
  size: number;
}

export default function ImageUpload({ 
  onImageSelected, 
  maxSizeMB = 5,
  className = ''
}: ImageUploadProps) {
  const [image, setImage] = useState<ImagePreview | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const validateImage = (file: File): string | null => {
    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      return 'Le fichier doit être une image (JPG, PNG, WebP)';
    }

    // Vérifier la taille
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `L'image est trop volumineuse (maximum ${maxSizeMB}MB)`;
    }

    // Vérifier les formats supportés
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Format non supporté. Utilisez JPG, PNG ou WebP';
    }

    return null;
  };

  const handleFile = (file: File) => {
    setError('');
    
    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Créer une URL temporaire pour l'aperçu
    const imageUrl = URL.createObjectURL(file);
    
    const imagePreview: ImagePreview = {
      url: imageUrl,
      file: file,
      name: file.name,
      size: file.size
    };

    setImage(imagePreview);
    onImageSelected(imageUrl, file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    if (image?.url) {
      URL.revokeObjectURL(image.url);
    }
    setImage(null);
    setError('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {!image ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m14 4l4.586-4.586a2 2 0 012.828 0L46 18m-10-2l1.586-1.586a2 2 0 012.828 0L42 16m-26 12h28a2 2 0 002-2V10a2 2 0 00-2-2H16a2 2 0 00-2 2v16a2 2 0 002 2zM22 26a2 2 0 11-4 0 2 2 0 014 0z"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-4">
              <label className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-500 font-medium">
                  Cliquez pour sélectionner
                </span>
                <span className="text-gray-600"> ou glissez-déposez</span>
              </label>
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG, WebP jusqu&apos;à {maxSizeMB}MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <Image 
              src={image.url} 
              alt="Aperçu"
              width={400}
              height={192}
              style={{objectFit:'cover',borderRadius:'0.5rem',border:'1px solid #e5e7eb'}}
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">{image.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(image.size)}</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={removeImage}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}