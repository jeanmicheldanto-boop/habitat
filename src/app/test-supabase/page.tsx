'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestSupabasePage() {
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testConnection() {
      console.log('🧪 Test de connexion Supabase...');
      
      try {
        // Test 1: Connexion basique avec count
        console.log('1️⃣ Test de count établissements...');
        const { count, error: countError } = await supabase
          .from('etablissements')
          .select('*', { count: 'exact', head: true });
        console.log('Count result:', { count, countError });

        // Test 2: Récupération des données SANS RLS (via service_role si possible)
        console.log('2️⃣ Test de récupération des données...');
        const { data: etablissements, error: errorEtab } = await supabase
          .from('etablissements')
          .select('*')
          .limit(10);
        console.log('Établissements:', { etablissements, errorEtab, count: etablissements?.length });

        // Test 3: Test des autres tables
        console.log('3️⃣ Test des autres tables...');
        const { data: sousCategories, error: scError } = await supabase
          .from('sous_categories_habitat')
          .select('*')
          .limit(5);
        console.log('Sous-catégories:', { sousCategories, scError });

        // Test 4: Vérification de l'authentification
        console.log('4️⃣ Test d\'authentification...');
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('Utilisateur connecté:', { user: user?.id, email: user?.email, userError });

        // Test 5: Test avec une requête SQL directe
        console.log('5️⃣ Test avec requête RPC...');
        const { data: rpcResult, error: rpcError } = await supabase.rpc('get_etablissements_count');
        console.log('RPC Result:', { rpcResult, rpcError });

        setResults({
          count: { count, error: countError },
          etablissements: { data: etablissements, error: errorEtab, count: etablissements?.length },
          sousCategories: { data: sousCategories, error: scError },
          user: { data: user, error: userError },
          rpc: { data: rpcResult, error: rpcError }
        });
      } catch (err) {
        console.error('❌ Erreur générale:', err);
        setResults({ error: err });
      } finally {
        setLoading(false);
      }
    }

    testConnection();
  }, []);

  if (loading) {
    return <div className="p-8">🔄 Test en cours...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Diagnostic Supabase</h1>
      
      <div className="grid gap-6">
        {/* Résultats Count */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="font-bold text-blue-800">📊 Count des établissements</h2>
          <pre className="text-sm mt-2 text-blue-700">
            Count: {results?.count?.count ?? 'null'}
            {results?.count?.error && `\nErreur: ${JSON.stringify(results.count.error, null, 2)}`}
          </pre>
        </div>

        {/* Résultats Établissements */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="font-bold text-green-800">🏢 Établissements récupérés</h2>
          <pre className="text-sm mt-2 text-green-700">
            Nombre: {results?.etablissements?.count ?? 0}
            {results?.etablissements?.error && `\nErreur: ${JSON.stringify(results.etablissements.error, null, 2)}`}
          </pre>
          {results?.etablissements?.data && results.etablissements.data.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold">Premiers établissements :</p>
              {results.etablissements.data.slice(0, 3).map((etab: { id: string; nom: string; ville?: string }, idx: number) => (
                <div key={idx} className="text-xs bg-white p-2 mt-1 rounded">
                  ID: {etab.id} | Nom: {etab.nom} | Ville: {etab.ville}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* État d'authentification */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="font-bold text-yellow-800">👤 Authentification</h2>
          <p className="text-sm text-yellow-700">
            {results?.user?.data ? 
              `Connecté: ${results.user.data.email}` : 
              'Non connecté (mode anonyme)'
            }
          </p>
        </div>

        {/* Résultats complets */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-bold">🔍 Résultats complets</h2>
          <pre className="text-xs overflow-x-auto max-h-96">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mt-6 p-4 bg-orange-50 rounded-lg">
        <h2 className="font-bold text-orange-800">🔧 Actions à vérifier</h2>
        <ol className="list-decimal ml-4 mt-2 text-sm text-orange-700">
          <li>Ouvre la console développeur (F12) pour voir les logs détaillés</li>
          <li>Si Count = 0 : Pas de données dans la table</li>
          <li>Si Count &gt; 0 mais données = [] : Problème de permissions RLS</li>
          <li>Vérifie les politiques RLS dans Supabase Dashboard → Authentication → Policies</li>
        </ol>
      </div>
    </div>
  );
}