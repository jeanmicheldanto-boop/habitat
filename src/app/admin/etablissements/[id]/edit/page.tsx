"use client";
export const dynamic = 'force-dynamic';

import React, { useEffect, useMemo, useState } from "react";
import type { JSX } from "react";
import Link from "next/link";
import nextDynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
import UploadPhotoEtablissement from "../UploadPhotoEtablissement";

type Etablissement = Database["public"]["Tables"]["etablissements"]["Row"];

type TabKey =
  | "etablissement"
  | "presentation"
  | "logements"
  | "restauration"
  | "services"
  | "tarifs"
  | "photo";

const LogementsModal = nextDynamic(() => import("../logements/page"), { ssr: false });
const RestaurationModal = nextDynamic(() => import("../restauration/page"), { ssr: false });
const ServicesModal = nextDynamic(() => import("../services/page"), { ssr: false });
const TarifsModal = nextDynamic(() => import("../tarifs/page"), { ssr: false });

export default function EditEtablissementPage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const id = useMemo(() => (params?.id ? String(params.id) : ""), [params]);

  const TABS: ReadonlyArray<{ key: TabKey; label: string }> = [
    { key: "etablissement", label: "Établissement" },
    { key: "presentation", label: "Présentation & Public" },
    { key: "logements", label: "Logements" },
    { key: "restauration", label: "Restauration" },
    { key: "services", label: "Services" },
    { key: "tarifs", label: "Tarifs" },
    { key: "photo", label: "Photo" },
  ];

  const [etab, setEtab] = useState<Etablissement | null>(null);
  const [form, setForm] = useState<Partial<Etablissement>>({});
  const [tab, setTab] = useState<TabKey>("etablissement");

  const [presentationForm, setPresentationForm] = useState<{ presentation: string; public_cible: string }>({
    presentation: "",
    public_cible: "",
  });
  const [presentationError, setPresentationError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchEtab() {
      if (!id) return;
      const { data, error: err } = await supabase.from("etablissements").select("*").eq("id", id).single();
      if (cancelled) return;
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setEtab(data as Etablissement);
      setForm(data as Partial<Etablissement>);
      setLoading(false);
    }
    fetchEtab();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!etab) return;
    setPresentationForm({
      presentation: etab.presentation ?? "",
  // public_cible peut être string dans la base
      public_cible: (etab as unknown as { public_cible?: string }).public_cible ?? "",
    });
  }, [etab]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSelectMain(e: React.ChangeEvent<HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value as unknown }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!etab) return;

    const changedFields = Object.keys(form).filter(
      (key) => (form as Record<string, unknown>)[key] !== (etab as Record<string, unknown>)[key]
    );
    if (changedFields.length === 0) {
      // rien à proposer
      return;
    }

    const { data: proposition, error: propError } = await supabase
      .from("propositions")
      .insert([
        {
          etablissement_id: etab.id,
          type_cible: "etablissement",
          action: "update",
          statut: "en_attente",
          payload: form,
        },
      ])
      .select()
      .single();

    if (propError || !proposition) {
      setError("Erreur lors de la création de la proposition.");
      return;
    }

    const items = changedFields.map((field) => ({
      proposition_id: proposition.id,
      table_name: "etablissements",
      column_name: field,
      old_value: (etab as Record<string, unknown>)[field],
      new_value: (form as Record<string, unknown>)[field],
      statut: "pending",
    }));

    const { error: itemsError } = await supabase.from("proposition_items").insert(items);
    if (itemsError) {
      setError("Erreur lors de la création des items de proposition.");
      return;
    }

    alert("Proposition de modification soumise avec succès !");
  }

  function handlePresentationChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setPresentationForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSelectPresentation(e: React.ChangeEvent<HTMLSelectElement>) {
    const { name, value } = e.target;
    setPresentationForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handlePresentationSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPresentationError(null);
    if (!etab) return;

    const currentPublic = (etab as unknown as { public_cible?: string }).public_cible ?? "";

    if (presentationForm.presentation === (etab.presentation ?? "") && presentationForm.public_cible === currentPublic) {
      setPresentationError("Aucune modification détectée.");
      return;
    }

    const { data: proposition, error: propError } = await supabase
      .from("propositions")
      .insert([
        {
          etablissement_id: etab.id,
          type_cible: "etablissement",
          action: "update",
          statut: "en_attente",
          payload: {
            presentation: presentationForm.presentation,
            public_cible: presentationForm.public_cible,
          },
        },
      ])
      .select()
      .single();

    if (propError || !proposition) {
      setPresentationError("Erreur lors de la création de la proposition.");
      return;
    }

    const items: Array<Record<string, unknown>> = [];
    if (presentationForm.presentation !== (etab.presentation ?? "")) {
      items.push({
        proposition_id: proposition.id,
        table_name: "etablissements",
        column_name: "presentation",
        old_value: etab.presentation,
        new_value: presentationForm.presentation,
        statut: "pending",
      });
    }
    if (presentationForm.public_cible !== currentPublic) {
      items.push({
        proposition_id: proposition.id,
        table_name: "etablissements",
        column_name: "public_cible",
        old_value: currentPublic,
        new_value: presentationForm.public_cible,
        statut: "pending",
      });
    }

    if (items.length > 0) {
      const { error: itemsError } = await supabase.from("proposition_items").insert(items);
      if (itemsError) {
        setPresentationError("Erreur lors de la création des items de proposition.");
        return;
      }
    }

    alert("Proposition de modification soumise avec succès !");
  }

  const presentationTab =
    tab === "presentation" && etab ? (
      <form onSubmit={handlePresentationSubmit} className="border rounded p-6 bg-white shadow space-y-4 max-w-xl mx-auto">
        <div>
          <label className="block font-semibold mb-1">Présentation</label>
          <textarea
            name="presentation"
            value={presentationForm.presentation}
            onChange={handlePresentationChange}
            className="w-full border rounded px-3 py-2 min-h-[80px]"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Type de public accueilli</label>
          <select
            name="public_cible"
            value={presentationForm.public_cible}
            onChange={handleSelectPresentation}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Sélectionner…</option>
            <option value="familles">Familles</option>
            <option value="jeunes">Jeunes</option>
            <option value="personnes âgées">Personnes âgées</option>
            <option value="personnes en situation de handicap">Personnes en situation de handicap</option>
            <option value="adultes isolés">Adultes isolés</option>
            <option value="public mixte">Public mixte</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        {presentationError && <div className="text-red-600">{presentationError}</div>}
        <div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700">
            Enregistrer
          </button>
        </div>
      </form>
    ) : null;

  return (
    <main className="max-w-2xl mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <Link href="/admin/etablissements" className="bg-gray-200 px-4 py-2 rounded font-semibold hover:bg-gray-300">
          ← Retour établissements
        </Link>
        <Link href="/admin" className="bg-gray-200 px-4 py-2 rounded font-semibold hover:bg-gray-300">
          ← Retour admin
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Édition d&apos;un établissement</h1>

      <div className="mb-6">
        <nav className="flex flex-wrap justify-center gap-x-0.5 gap-y-0 border-b border-gray-300 w-full mx-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`px-1.5 py-1.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                tab === t.key ? "border-blue-600 text-blue-700" : "border-transparent text-gray-600 hover:text-blue-600"
              }`}
              onClick={() => setTab(t.key)}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === "etablissement" && (
        <form onSubmit={handleSubmit} className="border rounded p-6 bg-white shadow space-y-4">
          <div>
            <label className="block font-semibold mb-1">Nom</label>
            <input type="text" name="nom" value={form.nom || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>

          <div>
            <label className="block font-semibold mb-1">Adresse ligne 1</label>
            <input type="text" name="adresse_l1" value={form.adresse_l1 || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block font-semibold mb-1">Adresse ligne 2</label>
            <input type="text" name="adresse_l2" value={form.adresse_l2 || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-semibold mb-1">Code postal</label>
              <input type="text" name="code_postal" value={form.code_postal || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-1">Commune</label>
              <input type="text" name="commune" value={form.commune || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Département</label>
            <input type="text" name="departement" value={form.departement || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block font-semibold mb-1">Région</label>
            <input type="text" name="region" value={form.region || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block font-semibold mb-1">Pays</label>
            <input type="text" name="pays" value={form.pays || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block font-semibold mb-1">Type d&apos;habitat</label>
            <select name="habitat_type" value={(form.habitat_type as string) || ""} onChange={handleSelectMain} className="w-full border rounded px-3 py-2" required>
              <option value="">Sélectionner…</option>
              <option value="residence">Résidence</option>
              <option value="habitat_partage">Habitat partagé</option>
              <option value="logement_independant">Logement indépendant</option>
            </select>
            <div className="text-xs text-gray-500 mt-1">Ce champ détermine la catégorie principale de l&apos;établissement.</div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Téléphone</label>
            <input type="text" name="telephone" value={form.telephone || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input type="email" name="email" value={form.email || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block font-semibold mb-1">Site web</label>
            <input type="text" name="site_web" value={form.site_web || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block font-semibold mb-1">Présentation</label>
            <textarea name="presentation" value={form.presentation || ""} onChange={handleChange} className="w-full border rounded px-3 py-2 min-h-[80px]" />
          </div>

          <div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700">
              Enregistrer
            </button>
          </div>
        </form>
      )}

      {presentationTab}

      {tab === "logements" && etab && (
        <div>
          <LogementsModal params={{ id: String(etab.id) }} />
        </div>
      )}

      {tab === "restauration" && etab && (
        <div>
          <RestaurationModal params={{ id: String(etab.id) }} />
        </div>
      )}

      {tab === "services" && etab && (
        <div>
          <ServicesModal params={{ id: String(etab.id) }} />
        </div>
      )}

      {tab === "tarifs" && etab && (
        <div>
          <TarifsModal params={{ id: String(etab.id) }} />
        </div>
      )}

      {tab === "photo" && etab && (
        <div>
          <div className="p-6 bg-white border rounded shadow max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Photo principale</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {(etab as unknown as { image_path?: string }).image_path &&
              typeof (etab as unknown as { image_path?: string }).image_path === "string" && (
                <img
                  src={
                    supabase.storage.from("etablissements").getPublicUrl((etab as unknown as { image_path?: string }).image_path as string).data.publicUrl
                  }
                  alt="Photo actuelle"
                  className="max-w-full max-h-48 rounded border mb-4"
                />
              )}

            <UploadPhotoEtablissement
              etablissementId={String(etab.id)}
              currentPath={(etab as unknown as { image_path?: string }).image_path}
              onUploaded={async (path: string) => {
                const { data: proposition, error: propError } = await supabase
                  .from("propositions")
                  .insert([
                    {
                      etablissement_id: etab.id,
                      type_cible: "etablissement",
                      action: "update",
                      statut: "en_attente",
                      payload: { image_path: path },
                    },
                  ])
                  .select()
                  .single();
                if (!propError && proposition) {
                  alert("Proposition de modification de la photo soumise !");
                }
              }}
            />
            <div className="text-gray-500 mt-2">
              L’image sera stockée dans le bucket Supabase et le chemin mis à jour via une proposition.
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
