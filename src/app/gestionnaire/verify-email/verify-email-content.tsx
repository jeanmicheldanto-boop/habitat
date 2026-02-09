"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token manquant');
      return;
    }

    const confirmEmail = async () => {
      try {
        const response = await fetch(
          'https://minwoumfgutampcgrcbr.supabase.co/functions/v1/confirm-email',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setStatus('error');
          setMessage(data.error || 'Erreur lors de la vérification de l\'email');
          return;
        }

        setStatus('success');
        setMessage('Email vérifié avec succès !');

        // Rediriger vers la connexion après 3 secondes
        setTimeout(() => {
          router.push('/gestionnaire/login');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage((error as Error).message || 'Erreur lors de la vérification');
      }
    };

    confirmEmail();
  }, [token, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          ✅ Email vérifié !
        </h3>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <p className="mt-4 text-sm text-gray-500">
          Redirection vers la connexion...
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
        <svg
          className="h-6 w-6 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        ❌ Erreur de vérification
      </h3>
      <p className="mt-2 text-sm text-gray-600">{message}</p>
      <div className="mt-6">
        <button
          onClick={() => router.push('/gestionnaire/register')}
          className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          Retourner à l'inscription
        </button>
      </div>
    </div>
  );
}
