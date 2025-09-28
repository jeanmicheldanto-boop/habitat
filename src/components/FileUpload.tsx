'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface FileUploadProps {
  onFilesUploaded: (urls: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
}

interface UploadedFile {
  name: string;
  url: string;
  size: number;
}

export default function FileUpload({ 
  onFilesUploaded, 
  maxFiles = 5, 
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx'],
  className = ''
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFileName = (originalName: string, userId: string) => {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
    return `${userId}/${timestamp}_${baseName}.${extension}`;
  };

  const uploadFile = async (file: File) => {
  const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const fileName = generateFileName(file.name, user.id);
    
    const { error } = await supabase.storage
      .from('justificatifs')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('justificatifs')
      .getPublicUrl(fileName);

    return {
      name: file.name,
      url: publicUrl,
      size: file.size
    };
  };

  const handleFiles = async (selectedFiles: FileList) => {
    const fileArray = Array.from(selectedFiles);
    
    // Vérifier le nombre max de fichiers
    if (files.length + fileArray.length > maxFiles) {
      alert(`Vous ne pouvez uploader que ${maxFiles} fichiers maximum`);
      return;
    }

    // Vérifier les types de fichiers
    for (const file of fileArray) {
      const isValidType = acceptedTypes.some(type => {
        if (type.includes('*')) {
          return file.type.startsWith(type.replace('*', ''));
        } else if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type === type;
      });

      if (!isValidType) {
        alert(`Le fichier ${file.name} n'est pas d'un type accepté`);
        return;
      }

      // Vérifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert(`Le fichier ${file.name} est trop volumineux (5MB max)`);
        return;
      }
    }

    setUploading(true);
    
    try {
      const uploadPromises = fileArray.map(file => uploadFile(file));
      const uploadedFiles = await Promise.all(uploadPromises);
      
      const newFiles = [...files, ...uploadedFiles];
      setFiles(newFiles);
      onFilesUploaded(newFiles.map(f => f.url));
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload des fichiers');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async (index: number) => {
    const fileToRemove = files[index];
    
    try {
      // Supprimer le fichier du storage
      const fileName = fileToRemove.url.split('/').pop();
      if (fileName) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.storage
            .from('justificatifs')
            .remove([`${user.id}/${fileName}`]);
        }
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }

    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesUploaded(newFiles.map(f => f.url));
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
      handleFiles(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      {/* Zone de drop */}
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
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-500 font-medium">
                Cliquez pour uploader
              </span>
              <span className="text-gray-600"> ou glissez-déposez</span>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              PDF, DOC, DOCX, PNG, JPG jusqu&apos;à 5MB ({maxFiles} fichiers max)
            </p>
          </div>
        </div>
      </div>

      {/* Liste des fichiers uploadés */}
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Fichiers uploadés ({files.length}/{maxFiles})
          </h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-gray-400 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {uploading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Upload en cours...</span>
        </div>
      )}
    </div>
  );
}