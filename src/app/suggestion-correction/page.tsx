'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function SuggestionCorrectionPage() {
  const searchParams = useSearchParams();
  const etablissementId = searchParams.get('etablissement');
  
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    typeCorrection: '',
    description: '',
    valeurActuelle: '',
    valeurCorrigee: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const typesCorrection = [
    'Informations de contact (téléphone, email, site web)',
    'Adresse ou localisation',
    'Description de l\'établissement',
    'Services proposés',
    'Tarifs',
    'Disponibilités',
    'Photos',
    'Autre'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Envoyer la suggestion à une table de suggestions/corrections
      const { error: submitError } = await supabase
        .from('suggestions_corrections')
        .insert([{
          etablissement_id: etablissementId,
          nom_suggesteur: formData.nom,
          email_suggesteur: formData.email,
          telephone_suggesteur: formData.telephone,
          type_correction: formData.typeCorrection,
          description: formData.description,
          valeur_actuelle: formData.valeurActuelle,
          valeur_corrigee: formData.valeurCorrigee,
          statut: 'en_attente',
          created_at: new Date().toISOString()
        }]);

      if (submitError) {
        throw submitError;
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Erreur lors de l\'envoi:', err);
      setError('Une erreur est survenue lors de l\'envoi de votre suggestion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Merci pour votre suggestion !
            </h1>
            <p className="text-gray-600 mb-6">
              Votre suggestion de correction a été envoyée avec succès. Notre équipe va l'examiner et prendre les mesures nécessaires pour améliorer les informations de l'établissement.
            </p>
            <Link 
              href="/plateforme"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Retour à la recherche
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Suggérer une correction
            </h1>
            <p className="text-gray-600">
              Vous avez remarqué une information incorrecte ou obsolète ? Aidez-nous à améliorer la qualité des données en nous signalant les corrections nécessaires.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations du suggesteur */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                  Votre nom *
                </label>
                <input
                  type="text"
                  id="nom"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Votre email *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                Votre téléphone (optionnel)
              </label>
              <input
                type="tel"
                id="telephone"
                value={formData.telephone}
                onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Type de correction */}
            <div>
              <label htmlFor="typeCorrection" className="block text-sm font-medium text-gray-700 mb-1">
                Type d'information à corriger *
              </label>
              <select
                id="typeCorrection"
                required
                value={formData.typeCorrection}
                onChange={(e) => setFormData(prev => ({ ...prev, typeCorrection: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionnez le type</option>
                {typesCorrection.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description du problème *
              </label>
              <textarea
                id="description"
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez précisément le problème que vous avez identifié"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Valeurs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="valeurActuelle" className="block text-sm font-medium text-gray-700 mb-1">
                  Information actuelle (incorrecte)
                </label>
                <textarea
                  id="valeurActuelle"
                  rows={2}
                  value={formData.valeurActuelle}
                  onChange={(e) => setFormData(prev => ({ ...prev, valeurActuelle: e.target.value }))}
                  placeholder="Copiez l'information actuelle qui est incorrecte"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="valeurCorrigee" className="block text-sm font-medium text-gray-700 mb-1">
                  Information corrigée
                </label>
                <textarea
                  id="valeurCorrigee"
                  rows={2}
                  value={formData.valeurCorrigee}
                  onChange={(e) => setFormData(prev => ({ ...prev, valeurCorrigee: e.target.value }))}
                  placeholder="Proposez la correction (si vous la connaissez)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer la suggestion'}
              </button>
              <Link
                href={`/plateforme/fiche?id=${etablissementId}`}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}