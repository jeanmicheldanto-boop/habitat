#!/usr/bin/env node

/**
 * Script pour créer un établissement fictif à Ossun
 * pour tester la fonctionnalité de réclamation de propriété
 */

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variables d'environnement manquantes");
  console.error("  NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error("  SUPABASE_SECRET_KEY:", supabaseKey ? "✓" : "✗");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestEtablissement() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║ 🏘️  CRÉATION D'ÉTABLISSEMENT TEST - OSSUN                     ║
╚════════════════════════════════════════════════════════════════╝
`);

  try {
    console.log("📍 Création d'un établissement fictif à Ossun (65)...\n");

    const { data: etab, error } = await supabase
      .from("etablissements")
      .insert({
        nom: "La Maison Ossunaise",
        commune: "Ossun",
        code_postal: "65380",
        departement: "65 - Hautes-Pyrénées",
        adresse_l1: "42 rue de Gavarnie",
        adresse_l2: "",
        presentation:
          "Charmante maison d'accueil pour seniors en montagne. Accès facile, proximité des commerces et services. Cadre naturel paisible avec vue sur les Pyrénées.",
        email: "contact@maissonossunaise.fr",
        telephone: "+33 5 62 XX XX XX",
        site_web: "https://www.maissonossunaise.fr",
        habitat_type: "residence",
        public_cible: "seniors,retraites",
        gestionnaire: "Admin Test",
        statut_editorial: "publie",
        eligibilite_statut: "avp_eligible",
        geom: "POINT(0.071 43.082)",
      })
      .select();

    if (error) {
      console.error("❌ Erreur lors de la création:");
      console.error(error);
      process.exit(1);
    }

    if (!etab || etab.length === 0) {
      console.error("❌ Aucun établissement créé");
      process.exit(1);
    }

    const etablissement = etab[0];

    console.log("✅ Établissement créé avec succès!\n");
    console.log("╔════ DÉTAILS ════════════════════════════════════════╗");
    console.log(`║ ID:          ${etablissement.id}`);
    console.log(`║ Nom:         ${etablissement.nom}`);
    console.log(`║ Commune:     ${etablissement.commune}`);
    console.log(`║ Code Postal: ${etablissement.code_postal}`);
    console.log(`║ Gestionnaire:${etablissement.gestionnaire}`);
    console.log("╚═════════════════════════════════════════════════════╝\n");

    console.log("🎯 ÉTAPES SUIVANTES:\n");
    console.log(
      "1. Connectez-vous à l'interface gestionnaire: https://habitat-intermediaire.fr/gestionnaire/login"
    );
    console.log(
      "2. Allez sur: Dashboard → Actions Rapides → 🔐 Réclamer une propriété"
    );
    console.log(`3. Cherchez: "${etablissement.nom}"`);
    console.log("4. Cliquez sur 'Réclamer' et remplissez le formulaire");
    console.log("5. L'admin doit approuver la réclamation");
    console.log("6. Vérifiez que vous pouvez modifier l'établissement\n");

    console.log("📋 ID À UTILISER POUR LES TESTS:");
    console.log(`   ${etablissement.id}\n`);
  } catch (err) {
    console.error("❌ Erreur:", err.message);
    process.exit(1);
  }
}

createTestEtablissement();
