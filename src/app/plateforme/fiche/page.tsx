import { supabase } from "../../../lib/supabaseClient";
import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getHabitatImage } from "../../../lib/habitatImages";
import Image from "next/image";

export default async function FichePage({ searchParams }: { searchParams: { id?: string } }) {
  const etabId = searchParams.id;
  if (!etabId) return notFound();

  const { data, error } = await supabase
    .from("v_liste_publication")
    .select("*")
    .eq("etab_id", etabId)
    .single();

  if (error || !data) return notFound();

  // Organisation élégante des infos (exemple, à adapter selon besoins)
  return (
    <main style={{ maxWidth: 900, margin: "2rem auto", background: "#fff", borderRadius: 18, boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)", padding: "2.5rem 2.5rem" }}>
      <h1 style={{ fontSize: "2rem", color: "#a85b2b", marginBottom: 8 }}>{data.nom}</h1>
      <div style={{ color: "#888", fontSize: "1.1rem", marginBottom: 18 }}>{data.commune} ({data.departement}, {data.region}) {data.code_postal}</div>
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 24 }}>
        <Image
          src={data.image_path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data.image_path}` : getHabitatImage(data.sous_categories)}
          alt={data.nom}
          width={260}
          height={180}
          style={{ objectFit: "cover", borderRadius: 12, boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)" }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 12, color: "#444", fontSize: "1.1rem" }}>{data.presentation}</div>
          <div style={{ marginBottom: 8 }}><b>Type d&#39;habitat :</b> {Array.isArray(data.sous_categories) ? data.sous_categories.join(", ") : "-"}</div>
          <div style={{ marginBottom: 8 }}><b>Public cible :</b> {Array.isArray(data.public_cible) ? data.public_cible.join(", ") : "-"}</div>
          <div style={{ marginBottom: 8 }}><b>Services :</b> {Array.isArray(data.services) ? data.services.join(", ") : "-"}</div>
          <div style={{ marginBottom: 8 }}><b>Tarif :</b> {data.fourchette_prix === 'euro' ? '€' : data.fourchette_prix === 'deux_euros' ? '€€' : data.fourchette_prix === 'trois_euros' ? '€€€' : '-'} ({data.prix_min || "-"}€ - {data.prix_max || "-"}€)</div>
          <div style={{ marginBottom: 8 }}><b>Disponibilité :</b> {data.statut_disponibilite || "-"} ({data.nb_unites_dispo || "-"} unités)</div>
          {/* Informations de contact */}
          {(data.telephone || data.email || data.site_web) && (
            <div style={{ marginTop: 18, marginBottom: 8, background: "#f6f6f6", borderRadius: 8, padding: "0.7em 1em" }}>
              <div style={{ fontWeight: 600, color: "#a85b2b", marginBottom: 6 }}>Contact</div>
              {data.telephone && <div><b>Téléphone :</b> {data.telephone}</div>}
              {data.email && <div><b>Email :</b> <a href={`mailto:${data.email}`} style={{ color: "#2b7fa8" }}>{data.email}</a></div>}
              {data.site_web && <div><b>Site web :</b> <a href={data.site_web} target="_blank" rel="noopener noreferrer" style={{ color: "#2b7fa8" }}>{data.site_web}</a></div>}
            </div>
          )}
        </div>
      </div>
      <h2 style={{ fontSize: "1.3rem", color: "#a85b2b", marginTop: 24 }}>Logements</h2>
      {Array.isArray(data.logements_types) && data.logements_types.length > 0 ? (
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {data.logements_types.map((lt: {
            libelle: string;
            surface_min?: number;
            surface_max?: number;
            meuble?: boolean;
            pmr?: boolean;
            domotique?: boolean;
            plain_pied?: boolean;
            nb_unites?: number;
          }, idx: number) => (
            <li key={idx} style={{ marginBottom: 8, background: "#f6f6f6", borderRadius: 8, padding: "0.5em 1em", display: "flex", gap: 16, alignItems: "center" }}>
              <span style={{ fontWeight: 500 }}>{lt.libelle}</span>
              <span>Surface: {lt.surface_min || "-"} - {lt.surface_max || "-"} m²</span>
              {lt.meuble && <span>Meublé</span>}
              {lt.pmr && <span>PMR</span>}
              {lt.domotique && <span>Domotique</span>}
              {lt.plain_pied && <span style={{ color: '#a85b2b', fontWeight: 600, fontSize: '0.95em', marginLeft: 2 }}>Plein pied</span>}
              <span>Unités: {lt.nb_unites || "-"}</span>
            </li>
          ))}
        </ul>
      ) : <div style={{ color: "#888" }}>Aucun logement renseigné</div>}
      <h2 style={{ fontSize: "1.3rem", color: "#a85b2b", marginTop: 24 }}>Restauration</h2>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", gap: 16 }}>
        {data.kitchenette && <li>Kitchenette</li>}
        {data.resto_collectif_midi && <li>Resto midi</li>}
        {data.resto_collectif && <li>Resto collectif</li>}
        {data.portage_repas && <li>Portage repas</li>}
      </ul>
      {/* Source supprimée */}
      
      {/* Section Gestionnaire */}
      <div style={{ marginTop: 48, paddingTop: 32, borderTop: "2px solid #f0f0f0" }}>
        <h2 style={{ fontSize: "1.2rem", color: "#a85b2b", marginBottom: 20, textAlign: "center" }}>Vous êtes concerné par cet établissement ?</h2>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          
          {/* Bouton Correction */}
          <div style={{ 
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)", 
            borderRadius: 12, 
            padding: "24px", 
            textAlign: "center", 
            border: "1px solid #dee2e6",
            minWidth: 280,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#495057", marginBottom: 8 }}>
              Une information à corriger ?
            </div>
            <div style={{ fontSize: "0.95rem", color: "#6c757d", marginBottom: 16, lineHeight: 1.4 }}>
              Aidez-nous à maintenir des informations à jour
            </div>
            <Link 
              href={`/suggestion-correction/modifier?etablissement=${etabId}`}
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #6c757d 0%, #495057 100%)",
                color: "white",
                textDecoration: "none",
                borderRadius: 8,
                padding: "12px 24px",
                fontSize: "0.95rem",
                fontWeight: 500,
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              Proposer une correction
            </Link>
          </div>

          {/* Bouton Gestionnaire */}
          <div style={{ 
            background: "linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)", 
            borderRadius: 12, 
            padding: "24px", 
            textAlign: "center", 
            border: "1px solid #f1c40f",
            minWidth: 280,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#856404", marginBottom: 8 }}>
              Vous êtes le gestionnaire ?
            </div>
            <div style={{ fontSize: "0.95rem", color: "#856404", marginBottom: 16, lineHeight: 1.4 }}>
              Accédez à votre espace de gestion dédié
            </div>
            <Link 
              href="/gestionnaire/login"
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
                color: "white",
                textDecoration: "none",
                borderRadius: 8,
                padding: "12px 24px",
                fontSize: "0.95rem",
                fontWeight: 500,
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              Espace gestionnaire
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
