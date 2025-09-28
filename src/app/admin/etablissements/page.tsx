"use client";



import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";



// Affiche les infos logements, restauration, services, tarifs et photo pour un établissement

interface LogementType {
  type: string;
  capacite: number;
}
interface RestaurationType {
  type: string;
  description?: string;
}
interface ServiceType {
  type: string;
  description?: string;
}
interface TarifType {
  type: string;
  montant: number;
  unite?: string;
}
interface EtabInfosType {
  logements: LogementType[];
  restauration: RestaurationType[];
  services: ServiceType[];
  tarifs: TarifType[];
  image_path: string | null;
}

function EtabInfos({ etabId }: { etabId: string }) {
  const [infos, setInfos] = useState<EtabInfosType>({ logements: [], restauration: [], services: [], tarifs: [], image_path: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInfos() {
      setLoading(true);
      // On récupère les infos liées
      const [logements, restauration, services, tarifs, etab] = await Promise.all([
        supabase.from("logements_types").select("type, capacite").eq("etablissement_id", etabId),
        supabase.from("restauration").select("type, description").eq("etablissement_id", etabId),
        supabase.from("services").select("type, description").eq("etablissement_id", etabId),
        supabase.from("tarifs").select("type, montant, unite").eq("etablissement_id", etabId),
        supabase.from("etablissements").select("image_path").eq("id", etabId).single(),
      ]);
      setInfos({
        logements: logements.data || [],
        restauration: restauration.data || [],
        services: services.data || [],
        tarifs: tarifs.data || [],
        image_path: etab.data?.image_path || null,
      });
      setLoading(false);
    }
    fetchInfos();
  }, [etabId]);

  if (loading) return <div className="text-xs text-gray-400">Chargement infos…</div>;
  return (
    <div className="mt-1 text-xs text-gray-700 space-y-1">
      {infos.logements && infos.logements.length > 0 && (
        <div><span className="font-semibold">Logements:</span> {infos.logements.map((l: LogementType) => `${l.type} (${l.capacite})`).join(", ")}</div>
      )}
      {infos.restauration && infos.restauration.length > 0 && (
        <div><span className="font-semibold">Restauration:</span> {infos.restauration.map((r: RestaurationType) => r.type).join(", ")}</div>
      )}
      {infos.services && infos.services.length > 0 && (
        <div><span className="font-semibold">Services:</span> {infos.services.map((s: ServiceType) => s.type).join(", ")}</div>
      )}
      {infos.tarifs && infos.tarifs.length > 0 && (
        <div><span className="font-semibold">Tarifs:</span> {infos.tarifs.map((t: TarifType) => `${t.type}: ${t.montant}€/`+(t.unite || "nuit")).join(", ")}</div>
      )}
      {infos.image_path && (
        <div><span className="font-semibold">Photo:</span> <Image src={supabase.storage.from("etablissements").getPublicUrl(infos.image_path).data.publicUrl} alt="photo" width={32} height={32} className="inline-block h-8 align-middle ml-1 rounded border" /></div>
      )}

    </div>
  );
}



interface EtabListItem {
  id: string;
  nom: string;
  commune: string | null;
  departement: string | null;
  statut_editorial?: string;
  habitat_type?: string;
}

export default function EtablissementsAdminPage() {
  const [etabs, setEtabs] = useState<EtabListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [departement, setDepartement] = useState("");
  const [departements, setDepartements] = useState<string[]>([]);

  useEffect(() => {
    async function fetchEtabs() {
      setLoading(true);
      let query = supabase
        .from("etablissements")
        .select("id, nom, commune, departement, statut_editorial, habitat_type");
      if (departement) {
        query = query.eq("departement", departement);
      }
      if (search) {
        query = query.ilike("nom", `%${search}%`);
      }
  const { data, error }: { data: EtabListItem[] | null; error: { message: string } | null } = await query;
      if (error) {
        setError(`Erreur lors du chargement des établissements : ${error.message}`);
        setLoading(false);
        return;
      }
      setEtabs(data || []);
      setLoading(false);
    }
    fetchEtabs();
  }, [search, departement]);

  // Récupère la liste unique des départements pour l'autocomplétion
  useEffect(() => {
    async function fetchDepartements() {
  const { data }: { data: Array<{ departement: string }> | null } = await supabase
        .from("etablissements")
        .select("departement")
        .neq("departement", null);
      const unique = Array.from(new Set((data || []).map((e) => e.departement).filter(Boolean)));
      setDepartements(unique);
    }
    fetchDepartements();
  }, []);

  return (
    <main className="max-w-2xl mx-auto py-12">
  <h1 className="text-2xl font-bold mb-8">Gestion des &eacute;tablissements</h1>
    <div className="flex justify-end mb-4">
  <Link href="/admin/etablissements/create" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">+ Cr&eacute;er un &eacute;tablissement</Link>
    </div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Rechercher par nom…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="D&eacute;partement…"
            value={departement}
            onChange={e => setDepartement(e.target.value)}
            list="departements-list"
            className="border rounded px-3 py-2 w-full"
          />
          <datalist id="departements-list">
            {departements.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>
        <Link href="/admin" className="bg-gray-200 px-4 py-2 rounded font-semibold hover:bg-gray-300 whitespace-nowrap">Retour admin</Link>
      </div>
      {loading ? (
  <div>Chargement…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="space-y-4">
          {etabs.length === 0 ? (
      <div className="text-gray-600">Aucun &eacute;tablissement trouv&eacute;.</div>
          ) : (
            etabs.map((etab) => (
              <Link
                key={etab.id}
                href={`/admin/etablissements/${etab.id}/edit`}
                className="block bg-gray-100 border rounded px-6 py-3 hover:bg-gray-200"
              >
                <div className="font-semibold">{etab.nom || `&Eacute;tablissement #${etab.id}`}</div>
                <div className="text-sm text-gray-600 flex gap-4">
                  <span>{etab.commune || "Commune inconnue"}</span>
                  <span>{etab.departement || ""}</span>
                  {etab.habitat_type && <span className="bg-blue-100 px-2 py-1 rounded text-xs">{etab.habitat_type}</span>}
                  {etab.statut_editorial && <span className={`px-2 py-1 rounded text-xs ${etab.statut_editorial === 'publie' ? 'bg-green-100' : 'bg-yellow-100'}`}>{etab.statut_editorial}</span>}
                </div>

                <EtabInfos etabId={etab.id} />
              </Link>
            ))
          )}
        </div>
      )}
      <div className="mt-8 text-gray-500 text-sm">
        Cette page liste les &eacute;tablissements &agrave; g&eacute;rer. Cliquez sur un &eacute;tablissement pour acc&eacute;der &agrave; son formulaire de modification.&nbsp;
      </div>
    </main>
  );

