'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Mail } from 'lucide-react';

export default function OptOutPage() {
  const [formData, setFormData] = useState({
    nom_etablissement: '',
    email_contact: '',
    nom_contact: '',
    telephone: '',
    demande_type: 'retrait',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/opt-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      setStatus('success');
      setFormData({
        nom_etablissement: '',
        email_contact: '',
        nom_contact: '',
        telephone: '',
        demande_type: 'retrait',
        message: '',
      });
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Exercice de vos droits RGPD
          </h1>
          <p className="text-lg text-gray-600">
            Formulaire de demande concernant votre référencement sur habitat-intermediaire.fr
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Vos droits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <p>Conformément au RGPD, vous pouvez :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Accéder</strong> aux informations concernant votre établissement</li>
              <li><strong>Rectifier</strong> ou mettre à jour vos données</li>
              <li><strong>Compléter</strong> votre fiche (description, photos, informations pratiques)</li>
              <li><strong>Vous opposer</strong> à la publication de votre établissement sur la plateforme</li>
            </ul>
            <p className="text-sm text-gray-600 mt-4">
              Ce formulaire envoie directement un email à notre équipe qui traitera votre demande sous 48h ouvrées.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formulaire de demande</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nom établissement */}
              <div>
                <label htmlFor="nom_etablissement" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'établissement <span className="text-red-500">*</span>
                </label>
                <Input
                  id="nom_etablissement"
                  type="text"
                  required
                  value={formData.nom_etablissement}
                  onChange={(e) => setFormData({ ...formData, nom_etablissement: e.target.value })}
                  placeholder="Ex: Résidence Les Jardins"
                  className="w-full"
                />
              </div>

              {/* Nom contact */}
              <div>
                <label htmlFor="nom_contact" className="block text-sm font-medium text-gray-700 mb-2">
                  Votre nom et prénom <span className="text-red-500">*</span>
                </label>
                <Input
                  id="nom_contact"
                  type="text"
                  required
                  value={formData.nom_contact}
                  onChange={(e) => setFormData({ ...formData, nom_contact: e.target.value })}
                  placeholder="Ex: Marie Dupont"
                  className="w-full"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email_contact" className="block text-sm font-medium text-gray-700 mb-2">
                  Email de contact <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email_contact"
                  type="email"
                  required
                  value={formData.email_contact}
                  onChange={(e) => setFormData({ ...formData, email_contact: e.target.value })}
                  placeholder="contact@exemple.fr"
                  className="w-full"
                />
              </div>

              {/* Téléphone */}
              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone (optionnel)
                </label>
                <Input
                  id="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="06 12 34 56 78"
                  className="w-full"
                />
              </div>

              {/* Type de demande */}
              <div>
                <label htmlFor="demande_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type de demande <span className="text-red-500">*</span>
                </label>
                <select
                  id="demande_type"
                  required
                  value={formData.demande_type}
                  onChange={(e) => setFormData({ ...formData, demande_type: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="retrait">Retrait de mon établissement de la plateforme</option>
                  <option value="acces">Accès à mes données</option>
                  <option value="rectification">Rectification de données</option>
                  <option value="completion">Compléter ma fiche établissement</option>
                  <option value="autre">Autre demande</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Détails de votre demande <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="message"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Décrivez votre demande en détail..."
                  rows={6}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Pour une demande de retrait, merci d'indiquer votre qualité (gestionnaire, directeur, etc.) et de joindre 
                  un justificatif si possible dans votre message de suivi.
                </p>
              </div>

              {/* Messages de statut */}
              {status === 'success' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Votre demande a été envoyée avec succès. Nous vous répondrons sous 48h ouvrées par email.
                  </AlertDescription>
                </Alert>
              )}

              {status === 'error' && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Erreur : {errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* Bouton */}
              <Button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
              >
                {status === 'loading' ? 'Envoi en cours...' : 'Envoyer ma demande'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact direct */}
        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            Vous pouvez également nous contacter directement par email :{' '}
            <a href="mailto:patrick.danto@confidensia.fr" className="text-blue-600 hover:underline font-medium">
              patrick.danto@confidensia.fr
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
