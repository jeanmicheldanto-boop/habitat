"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function PropositionDetailSimple({ params }: { params: { id: string } }) {
  const [data, setData] = useState<{
    id?: string;
    type_cible?: string;
    action?: string;
    statut?: string;
    payload?: Record<string, unknown>;
    review_note?: string;
    created_at?: string;
    reviewed_at?: string;
    created_by?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function loadProposition() {
      try {
        console.log("🔍 Chargement proposition ID:", params.id);
        
        const { data: prop, error: propError } = await supabase
          .from("propositions")
          .select("*")
          .eq("id", params.id)
          .single();

        console.log("📋 Résultat:", prop, "Erreur:", propError);

        if (propError) {
          setError(`Erreur: ${propError.message}`);
        } else {
          setData(prop);
        }
      } catch (err) {
        console.error("❌ Erreur catch:", err);
        setError(`Erreur catch: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    }

    loadProposition();
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-8">
        <h1>Chargement...</h1>
        <div>ID: {params.id}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1>Erreur</h1>
        <p>{error}</p>
        <Link href="/admin/propositions" className="text-blue-600">
          ← Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1>Proposition: {params.id}</h1>
      
      <Link href="/admin/propositions" className="text-blue-600 mb-4 block">
        ← Retour à la liste
      </Link>

      {data ? (
        <div className="bg-white p-6 border rounded">
          <h2>Données de la proposition</h2>
          <pre className="bg-gray-100 p-4 mt-4 text-sm overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      ) : (
        <div>Aucune donnée</div>
      )}
    </div>
  );
}