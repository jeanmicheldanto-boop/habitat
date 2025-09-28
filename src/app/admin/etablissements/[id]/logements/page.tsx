"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";

type LogementType = Database["public"]["Tables"]["logements_types"]["Row"];

const emptyForm: Partial<LogementType> = {
  libelle: "",
  surface_min: null,
  surface_max: null,
  meuble: false,
  pmr: false,
  domotique: false,
  nb_unites: null,

};

export default function LogementsTypesPage({ params }: { params: { id: string } }) {
  const [logements, setLogements] = useState<LogementType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<LogementType>>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchLogements() {
      setLoading(true);
      const { data, error } = await supabase
        .from("logements_types")
        .select("*")
        .eq("etablissement_id", params.id);
      if (error) {
        setError("Erreur lors du chargement des logements.");
        setLoading(false);
        return;
      }
      setLogements(data || []);
      setLoading(false);
    }
    fetchLogements();
  }, [params.id, modalOpen]);

  function openAddModal() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }

  function openEditModal(logement: LogementType) {
    setForm({ ...logement });
    setEditId(logement.id);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setForm(emptyForm);
    setEditId(null);
    setError(null);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((f) => ({ ...f, [name]: value === "" ? null : value }));
    }
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
          type_cible: "logements_types",
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
      table_name: "logements_types",
      column_name: field,
      old_value: editId ? logements.find((l) => l.id === editId)?.[field as keyof LogementType] : null,
      new_value: (payload as Partial<LogementType>)[field as keyof LogementType],
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
      <h1 className="text-2xl font-bold mb-6">Logements de l’établissement</h1>
      <button onClick={openAddModal} className="mb-4 bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">Ajouter un logement</button>
      <ul className="space-y-4">
        {logements.map((l) => (
          <li key={l.id} className="border rounded p-4 bg-white shadow flex flex-col gap-2">
            <div><span className="font-semibold">Type :</span> {l.libelle}</div>
            <div><span className="font-semibold">Surface :</span> {l.surface_min}–{l.surface_max} m²</div>
            <div><span className="font-semibold">Meublé :</span> {l.meuble ? "Oui" : "Non"}</div>
            <div><span className="font-semibold">PMR :</span> {l.pmr ? "Oui" : "Non"}</div>
            <div><span className="font-semibold">Domotique :</span> {l.domotique ? "Oui" : "Non"}</div>
            <div><span className="font-semibold">Nombre d’unités :</span> {l.nb_unites}</div>
            <div>
              <button onClick={() => openEditModal(l)} className="text-blue-600 hover:underline mr-2">Éditer</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-md relative">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-black">✕</button>
            <h2 className="text-xl font-bold mb-4">{editId ? "Éditer" : "Ajouter"} un logement</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Type</label>
                <select
                  name="libelle"
                  value={form.libelle || ""}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Sélectionner un type</option>
                  <option value="T1">T1</option>
                  <option value="T1bis">T1bis</option>
                  <option value="T2">T2</option>
                  <option value="T3">T3</option>
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Surface min</label>
                  <input type="number" name="surface_min" value={form.surface_min ?? ""} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Surface max</label>
                  <input type="number" name="surface_max" value={form.surface_max ?? ""} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2">
                  <input type="checkbox" name="meuble" checked={!!form.meuble} onChange={handleChange} />
                  <label>Meublé</label>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <input type="checkbox" name="pmr" checked={!!form.pmr} onChange={handleChange} />
                  <label>PMR</label>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <input type="checkbox" name="domotique" checked={!!form.domotique} onChange={handleChange} />
                  <label>Domotique</label>
                </div>

              </div>
              <div>
                <label className="block font-semibold mb-1">Nombre d’unités</label>
                <input type="number" name="nb_unites" value={form.nb_unites ?? ""} onChange={handleChange} className="w-full border rounded px-3 py-2" />
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
