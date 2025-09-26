import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
import Link from "next/link";

// Types
export type Proposition = Database["public"]["Tables"]["propositions"]["Row"];
export type PropositionItem = Database["public"]["Tables"]["proposition_items"]["Row"];

export default function PropositionModerationPage({ params }: { params: { id: string } }) {
  const [proposition, setProposition] = useState<Proposition | null>(null);
  const [items, setItems] = useState<PropositionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: prop, error: propError } = await supabase
        .from("propositions")
        .select("*")
        .eq("id", params.id)
        .single();
      if (propError || !prop) {
        setError("Proposition introuvable");
        setLoading(false);
        return;
      }
      setProposition(prop);
      const { data: itemsData, error: itemsError } = await supabase
        .from("proposition_items")
        .select("*")
        .eq("proposition_id", params.id);
      if (itemsError) {
        setError("Erreur lors du chargement des items");
        setLoading(false);
        return;
      }
      setItems(itemsData || []);
      setLoading(false);
    }
    fetchData();
  }, [params.id]);

  async function handleModerate(statut: "approuvee" | "rejetee") {
    if (!proposition) return;
    setActionLoading(true);
    setError(null);

    // Si approbation, appliquer les modifications sur la table cible
    if (statut === "approuvee" && proposition.type_cible === "etablissement" && proposition.etablissement_id) {
      // On applique le payload sur la table etablissements
      const { error: updateEtabError } = await supabase
        .from("etablissements")
        .update(proposition.payload)
        .eq("id", proposition.etablissement_id);
      if (updateEtabError) {
        setError("Erreur lors de l'application des modifications sur l'établissement.");
        setActionLoading(false);
        return;
      }
    }

    // Met à jour le statut de la proposition
    const { error: updateError } = await supabase
      .from("propositions")
      .update({ statut })
      .eq("id", proposition.id);
    setActionLoading(false);
    if (updateError) {
      setError("Erreur lors de la mise à jour du statut.");
      return;
    }
    alert("Proposition modérée avec succès.");
    // Optionnel : rediriger ou recharger
  }

  if (loading) return <div className="p-8">Chargement…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!proposition) return <div className="p-8">Aucune donnée</div>;

  return (
    <main className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Modération de la proposition</h1>
      <div className="mb-4">
        <Link href="/admin/propositions" className="text-blue-600 hover:underline">← Retour à la liste</Link>
      </div>
      <div className="border rounded p-4 bg-white shadow mb-6">
        <div><span className="font-semibold">Établissement :</span> {proposition.etablissement_id}</div>
        <div><span className="font-semibold">Type :</span> {proposition.type_cible}</div>
        <div><span className="font-semibold">Action :</span> {proposition.action}</div>
        <div><span className="font-semibold">Statut :</span> {proposition.statut}</div>
        <div><span className="font-semibold">Créée le :</span> {new Date(proposition.created_at).toLocaleString()}</div>
      </div>
      <h2 className="text-xl font-semibold mb-2">Champs modifiés</h2>
      <ul className="space-y-2 mb-6">
        {items.map((item) => (
          <li key={item.id} className="border rounded p-3 bg-gray-50">
            <div><span className="font-semibold">Champ :</span> {item.column_name}</div>
            <div><span className="font-semibold">Ancienne valeur :</span> {String(item.old_value)}</div>
            <div><span className="font-semibold">Nouvelle valeur :</span> {String(item.new_value)}</div>
            <div><span className="font-semibold">Statut :</span> {item.statut}</div>
          </li>
        ))}
      </ul>
      <div className="flex gap-4">
        <button
          onClick={() => handleModerate("approuvee")}
          className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700"
          disabled={actionLoading}
        >
          Approuver
        </button>
        <button
          onClick={() => handleModerate("rejetee")}
          className="bg-red-600 text-white px-6 py-2 rounded font-semibold hover:bg-red-700"
          disabled={actionLoading}
        >
          Rejeter
        </button>
      </div>
    </main>
  );
}
