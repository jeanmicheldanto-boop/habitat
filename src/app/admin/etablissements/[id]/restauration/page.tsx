
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";

type Restauration = Database["public"]["Tables"]["restaurations"]["Row"];

const emptyForm: Partial<Restauration> = {
  resto_collectif: false,
  resto_collectif_midi: false,
  portage_repas: false,
  kitchenette: false,
};

export default function RestaurationPage({ params }: { params: { id: string } }) {
  const [restauration, setRestauration] = useState<Restauration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<Restauration>>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchRestauration() {
      setLoading(true);
      const { data, error } = await supabase
        .from("restaurations")
        .select("*")
        .eq("etablissement_id", params.id)
        .single();
      if (error) {
        setError("Erreur lors du chargement de la restauration.");
        setLoading(false);
        return;
      }
      setRestauration(data);
      setLoading(false);
    }
    fetchRestauration();
  }, [params.id, modalOpen]);

  function openModal() {
    setForm(restauration ? { ...restauration } : { ...emptyForm });
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setForm(emptyForm);
    setError(null);
  }
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, checked } = e.target;
    setForm((f) => ({ ...f, [name]: checked }));
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    // Création d'une proposition pour ajout ou édition
    const action = restauration ? "update" : "create";
    const payload = { ...form, etablissement_id: params.id };
    const { data: proposition, error: propError } = await supabase
      .from("propositions")
      .insert([
        {
          etablissement_id: params.id,
          type_cible: "restaurations",
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
    // Création d'un proposition_item pour chaque champ
    const fields = Object.keys(form);
    const items = fields.map((field) => ({
      proposition_id: proposition.id,
      table_name: "restaurations",
      column_name: field,
      old_value: restauration ? restauration[field as keyof Restauration] : null,
      new_value: (payload as any)[field],
      statut: "pending",
    }));
    const { error: itemsError } = await supabase
      .from("proposition_items")
      .insert(items);
    if (itemsError) {
      setError("Erreur lors de la création des items de proposition.");
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    closeModal();
    alert("Proposition soumise avec succès !");
  }

  if (loading) return <div className="p-8">Chargement…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <main className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Restauration</h1>
      <button onClick={openModal} className="mb-4 bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">{restauration ? "Éditer" : "Ajouter"} la restauration</button>
      {restauration ? (
        <div className="border rounded p-4 bg-white shadow">
          <div><span className="font-semibold">Resto collectif :</span> {restauration.resto_collectif ? "Oui" : "Non"}</div>
          <div><span className="font-semibold">Resto midi :</span> {restauration.resto_collectif_midi ? "Oui" : "Non"}</div>
          <div><span className="font-semibold">Portage repas :</span> {restauration.portage_repas ? "Oui" : "Non"}</div>
          <div><span className="font-semibold">Kitchenette :</span> {restauration.kitchenette ? "Oui" : "Non"}</div>
        </div>
      ) : (
        <div className="text-gray-600">Aucune information de restauration.</div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-md relative">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-black">✕</button>
            <h2 className="text-xl font-bold mb-4">{restauration ? "Éditer" : "Ajouter"} la restauration</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="resto_collectif" checked={!!form.resto_collectif} onChange={handleChange} />
                  Resto collectif
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="resto_collectif_midi" checked={!!form.resto_collectif_midi} onChange={handleChange} />
                  Resto midi
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="portage_repas" checked={!!form.portage_repas} onChange={handleChange} />
                  Portage repas
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="kitchenette" checked={!!form.kitchenette} onChange={handleChange} />
                  Kitchenette
                </label>
              </div>
              {error && <div className="text-red-600">{error}</div>}
              <div>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700" disabled={submitting}>{submitting ? "Envoi…" : "Soumettre la proposition"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
