export const dynamic = 'force-dynamic';
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import DepartmentAutocomplete from "@/components/DepartmentAutocomplete";
import Link from "next/link";

// Type d&#39;établissement

const regions = [
  { code: "ARA", nom: "Auvergne-Rhône-Alpes" },
  { code: "BFC", nom: "Bourgogne-Franche-Comté" },
  { code: "BRE", nom: "Bretagne" },
  { code: "CVL", nom: "Centre-Val de Loire" },
  { code: "COR", nom: "Corse" },
  { code: "GES", nom: "Grand Est" },
  { code: "HDF", nom: "Hauts-de-France" },
  { code: "IDF", nom: "Île-de-France" },
  { code: "NOR", nom: "Normandie" },
  { code: "NAQ", nom: "Nouvelle-Aquitaine" },
  { code: "OCC", nom: "Occitanie" },
  { code: "PDL", nom: "Pays de la Loire" },
  { code: "PAC", nom: "Provence-Alpes-Côte d&apos;Azur" },
  { code: "GUA", nom: "Guadeloupe" },
  { code: "GUY", nom: "Guyane" },
  { code: "LRE", nom: "La Réunion" },
  { code: "MAY", nom: "Mayotte" },
  { code: "MQE", nom: "Martinique" },
  { code: "SPM", nom: "Saint-Pierre-et-Miquelon" },
  { code: "WLF", nom: "Wallis-et-Futuna" },
  { code: "PYF", nom: "Polynésie française" },
  { code: "NCL", nom: "Nouvelle-Calédonie" },
  { code: "BLM", nom: "Saint-Barthélemy" },
  { code: "MAF", nom: "Saint-Martin" },
  { code: "SXM", nom: "Saint-Martin (partie néerlandaise)" },
  { code: "ATF", nom: "Terres australes françaises" },
  { code: "CPV", nom: "Clipperton" },
];

const initialForm = {
  nom: "",
  adresse_l1: "",
  adresse_l2: "",
  code_postal: "",
  commune: "",
  departement: "",
  region: "",
  pays: "FR", // Par défaut sur France
  telephone: "",
  email: "",
  site_web: "",
  presentation: "",
  public_cible: "",
  habitat_type: "residence", // valeur par défaut
};

const publics = [
  "familles",
  "jeunes",
  "personnes âgées",
  "personnes en situation de handicap",
  "adultes isolés",
  "public mixte",
  "autre",
];

const tabs: { key: string; label: string }[] = [
  { key: "etablissement", label: "Établissement" },
  { key: "presentation", label: "Présentation &amp; Public" },
  { key: "logements", label: "Logements" },
  { key: "restauration", label: "Restauration" },
  { key: "services", label: "Services" },
  { key: "tarifs", label: "Tarifs" },
  { key: "photo", label: "Photo" },
];

export default function AdminCreateEtablissement() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleAddressChange(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Validation simple
    if (!form.nom || !form.commune || !form.departement) {
      setError("Nom, commune et département sont obligatoires.");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from("etablissements").insert([
      { ...form },
    ]).select().single();
    setLoading(false);
    if (error) {
      setError("Erreur lors de la création : " + error.message);
    } else if (data && data.id) {
      // Redirige vers la page d&#39;édition de l&#39;établissement créé
      router.push(`/admin/etablissements/${data.id}/edit`);
    }
  }

  return (
    <main className="max-w-2xl mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <Link href="/admin/etablissements" className="bg-gray-200 px-4 py-2 rounded font-semibold hover:bg-gray-300">← Retour établissements</Link>
        <Link href="/admin" className="bg-gray-200 px-4 py-2 rounded font-semibold hover:bg-gray-300">← Retour admin</Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">Créer un établissement</h1>
      {/* Onglets en haut, seul le premier actif */}
      <div className="mb-6">
        <nav className="flex flex-wrap justify-center gap-x-0.5 gap-y-0 border-b border-gray-300 w-full mx-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`px-1.5 py-1.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${t.key === "etablissement" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-600 hover:text-blue-600"}`}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
      <form onSubmit={handleSubmit} className="border rounded p-6 bg-white shadow space-y-4">
        <div>
          <label className="block font-semibold mb-1">Nom *</label>
          <input type="text" name="nom" value={form.nom} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        
        {/* Section adresse avec autocomplétion */}
        <div className="border-t border-gray-200 pt-4 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Adresse</h3>
          <AddressAutocomplete
            value={form.adresse_l1}
            onChange={handleAddressChange}
            codePostal={form.code_postal}
            ville={form.commune}
            required={true}
            placeholder="Commencez à taper l&#39;adresse..."
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Adresse ligne 2</label>
          <input type="text" name="adresse_l2" value={form.adresse_l2} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Département *</label>
          <DepartmentAutocomplete
            value={form.departement}
            onChange={(value) => setForm(prev => ({ ...prev, departement: value }))}
            placeholder="Rechercher un département..."
            required={true}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Région</label>
          <select name="region" value={form.region} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="">Sélectionner…</option>
            {regions.map((r) => (
              <option key={r.code} value={r.code}>{r.nom}</option>
            ))}
          </select>
          <div className="text-xs text-gray-500 mt-1">Le code officiel (ex : OCC pour Occitanie) est attendu.</div>
        </div>
        <div>
          <label className="block font-semibold mb-1">Pays</label>
          <select name="pays" value={form.pays} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="FR">France</option>
            <option value="BE">Belgique</option>
            <option value="CH">Suisse</option>
            <option value="LU">Luxembourg</option>
            <option value="">Autre</option>
          </select>
          <div className="text-xs text-gray-500 mt-1">Le code ISO2 (FR, BE, etc.) est attendu.</div>
        </div>
        <div>
          {/* ...existing code... */}
          <label className="block font-semibold mb-1">Type d&#39;habitat *</label>
          <select name="habitat_type" value={form.habitat_type} onChange={handleChange} className="w-full border rounded px-3 py-2" required>
            <option value="residence">Résidence</option>
            <option value="habitat_partage">Habitat partagé</option>
            <option value="logement_independant">Logement indépendant</option>
          </select>
          <div className="text-xs text-gray-500 mt-1">Ce champ détermine la catégorie principale de l&#39;établissement.</div>
        </div>
        <div>
          <label className="block font-semibold mb-1">Téléphone</label>
          <input type="text" name="telephone" value={form.telephone} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Site web</label>
          <input type="text" name="site_web" value={form.site_web} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Présentation</label>
          <textarea name="presentation" value={form.presentation} onChange={handleChange} className="w-full border rounded px-3 py-2 min-h-[80px]" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Type de public accueilli</label>
          <select name="public_cible" value={form.public_cible} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="">Sélectionner…</option>
            {publics.map((p) => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>
  {error && <div className="text-red-600">{error}</div>}
        <div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700" disabled={loading}>
            {loading ? "Création en cours..." : "Créer"}
          </button>
        </div>
      </form>
    </main>
  );
}
