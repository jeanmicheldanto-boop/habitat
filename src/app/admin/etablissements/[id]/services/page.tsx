
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";

type EtablissementService = Database["public"]["Tables"]["etablissement_service"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"];

export default function ServicesPage({ params }: { params: { id: string } }) {
  const [services, setServices] = useState<Service[]>([]);
  const [liens, setLiens] = useState<EtablissementService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      const { data: allServices, error: err1 } = await supabase
        .from("services")
        .select("*");
      const { data: etabServices, error: err2 } = await supabase
        .from("etablissement_service")
        .select("*")
        .eq("etablissement_id", params.id);
      if (err1 || err2) {
        setError("Erreur lors du chargement des services.");
        setLoading(false);
        return;
      }
      setServices(allServices || []);
      setLiens(etabServices || []);
      setLoading(false);
    }
    fetchServices();
  }, [params.id, submitting]);

  async function handleToggle(service: Service, isLinked: boolean) {
    setSubmitting(true);
    setError(null);
    // Création d'une proposition pour ajout ou suppression de lien
    const action = isLinked ? "delete" : "create";
    const payload = { etablissement_id: params.id, service_id: service.id };
    const { data: proposition, error: propError } = await supabase
      .from("propositions")
      .insert([
        {
          etablissement_id: params.id,
          type_cible: "etablissement_service",
          action,
          statut: "en_attente",
          payload,
        },
      ])
      .select()
      .single();
    if (propError || !proposition) {
      setError("Erreur lors de la création de la proposition.");
      setSubmitting(false);
      return;
    }
    // Un seul proposition_item
    const { error: itemsError } = await supabase
      .from("proposition_items")
      .insert([
        {
          proposition_id: proposition.id,
          table_name: "etablissement_service",
          column_name: "service_id",
          old_value: isLinked ? service.id : null,
          new_value: isLinked ? null : service.id,
          statut: "pending",
        },
      ]);
    if (itemsError) {
      setError("Erreur lors de la création de l'item de proposition.");
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    alert("Proposition soumise avec succès !");
  }

  if (loading) return <div className="p-8">Chargement…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <main className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Services liés</h1>
      <ul className="space-y-2">
        {services.map((s) => {
          const isLinked = liens.some((l) => l.service_id === s.id);
          return (
            <li key={s.id} className="border rounded p-3 bg-white shadow flex items-center gap-2">
              <span>{s.libelle}</span>
              {isLinked && <span className="ml-2 text-green-600">(lié)</span>}
              <button
                onClick={() => handleToggle(s, isLinked)}
                className={
                  isLinked
                    ? "ml-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    : "ml-4 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                }
                disabled={submitting}
              >
                {isLinked ? "Retirer" : "Lier"}
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
