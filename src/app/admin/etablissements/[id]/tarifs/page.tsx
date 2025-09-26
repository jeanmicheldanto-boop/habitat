import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";

type Tarif = Database["public"]["Tables"]["tarifications"]["Row"];

const emptyForm: Partial<Tarif> = {
  logements_type_id: null,
  fourchette_prix: null,
  prix_min: null,
  prix_max: null,
  etablissement_id: "",
};

const PRIX_CATEGORIES = [
  { label: "€ (< 750€)", value: "euro" },
  { label: "€€ (750€ – 1500€)", value: "deux_euros" },
  { label: "€€€ (> 1500€)", value: "trois_euros" },
];

export default function TarifsPage({ params }: { params: { id: string } }) {
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [logementsTypes, setLogementsTypes] = useState<{ id: string; libelle: string }[]>([]);
  useEffect(() => {
    async function fetchLogementsTypes() {
      const { data } = await supabase
        .from("logements_types")
        .select("id, libelle")
        .eq("etablissement_id", params.id);
      setLogementsTypes(data || []);
    }
    fetchLogementsTypes();
  }, [params.id]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<Tarif>>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTarifs() {
      setLoading(true);
      const { data, error } = await supabase
        .from("tarifications")
        .select("*")
        .eq("etablissement_id", params.id);
      if (error) {
        setError("Erreur lors du chargement des tarifs.");
        setLoading(false);
        return;
      }
      setTarifs(data || []);
      setLoading(false);
    }
    fetchTarifs();
  }, [params.id, modalOpen]);

  function openAddModal() {
    setForm({ ...emptyForm, etablissement_id: params.id });
    setEditId(null);
    setModalOpen(true);
  }

  function openEditModal(tarif: Tarif) {
    setForm({ ...tarif });
    setEditId(tarif.id);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setForm(emptyForm);
    setEditId(null);
    setError(null);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value === "" ? null : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    // Création d'une proposition pour ajout ou édition
    const action = editId ? "update" : "create";
    const payload = { ...form, etablissement_id: params.id };
    const { data: proposition, error: propError } = await supabase
      .from("propositions")
      .insert([
        {
          etablissement_id: params.id,
          type_cible: "tarifications",
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
    // Création d'un proposition_item pour chaque champ (ou tout le payload pour un ajout)
    const fields = editId ? Object.keys(form) : Object.keys(payload);
    const items = fields.map((field) => ({
      proposition_id: proposition.id,
      table_name: "tarifications",
      column_name: field,
      old_value: editId ? tarifs.find((t) => t.id === editId)?.[field as keyof Tarif] : null,
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
      <h1 className="text-2xl font-bold mb-6">Tarifs de l’établissement</h1>
      <button onClick={openAddModal} className="mb-4 bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">Ajouter un tarif</button>
      {tarifs.length === 0 ? (
        <div className="text-gray-500 mb-4">Aucun tarif enregistré pour cet établissement.</div>
      ) : (
        <ul className="space-y-4">
          {tarifs.map((t) => (
            <li key={t.id} className="border rounded p-4 bg-white shadow flex flex-col gap-2">
              <div><span className="font-semibold">Type :</span> {logementsTypes.find(lt => lt.id === t.logements_type_id)?.libelle || t.logements_type_id}</div>
              <div><span className="font-semibold">Prix min :</span> {t.prix_min} € / mois</div>
              <div><span className="font-semibold">Prix max :</span> {t.prix_max} € / mois</div>
              <div>
                <button onClick={() => openEditModal(t)} className="text-blue-600 hover:underline mr-2">Éditer</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-md relative">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-black">✕</button>
            <h2 className="text-xl font-bold mb-4">{editId ? "Éditer" : "Ajouter"} un tarif</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Type de logement</label>
                <select
                  name="logements_type_id"
                  value={form.logements_type_id || ""}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Sélectionner un type</option>
                  {logementsTypes.map((lt) => (
                    <option key={lt.id} value={lt.id}>{lt.libelle}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Catégorie de prix (€ / mois)</label>
                <select
                  name="fourchette_prix"
                  value={form.fourchette_prix || ""}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Sélectionner</option>
                  {PRIX_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Prix max (€ / mois)</label>
                <input type="number" name="prix_max" value={form.prix_max ?? ""} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
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
