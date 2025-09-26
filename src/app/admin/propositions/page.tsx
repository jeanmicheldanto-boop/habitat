"use client";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
import Link from "next/link";
import { useEffect, useState } from "react";

// Types
export type Proposition = Database["public"]["Tables"]["propositions"]["Row"];
export type PropositionItem = Database["public"]["Tables"]["proposition_items"]["Row"];

export default function PropositionsModerationPage() {
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPropositions() {
      setLoading(true);
      const { data, error } = await supabase
        .from("propositions")
        .select("*")
        .eq("statut", "en_attente")
        .order("created_at", { ascending: false });
      if (error) {
        setError("Erreur lors du chargement des propositions.");
        setLoading(false);
        return;
      }
      setPropositions(data || []);
      setLoading(false);
    }
    fetchPropositions();
  }, []);

  if (loading) return <div className="p-8">Chargement…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <main className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Propositions à modérer</h1>
      {propositions.length === 0 ? (
        <div className="text-gray-600">Aucune proposition en attente.</div>
      ) : (
        <ul className="space-y-4">
          {propositions.map((p) => (
            <li key={p.id} className="border rounded p-4 bg-white shadow flex flex-col gap-2">
              <div>
                <span className="font-semibold">Établissement :</span> {p.etablissement_id}
              </div>
              <div>
                <span className="font-semibold">Type :</span> {p.type_cible}
              </div>
              <div>
                <span className="font-semibold">Action :</span> {p.action}
              </div>
              <div>
                <span className="font-semibold">Créée le :</span> {new Date(p.created_at).toLocaleString()}
              </div>
              <div>
                <Link href={`/admin/propositions/${p.id}`}
                  className="text-blue-600 hover:underline font-semibold mt-2 inline-block">
                  Voir et modérer
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
