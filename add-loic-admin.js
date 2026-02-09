#!/usr/bin/env node

/**
 * Script pour ajouter Loïc (lgenevaux@yahoo.fr) comme admin
 */

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variables d'environnement manquantes");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addLoicAsAdmin() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║ ➕ AJOUT DE LOÏC COMME ADMIN                                   ║
╚════════════════════════════════════════════════════════════════╝
`);

  try {
    // 1. Chercher Loïc par email
    console.log(`\n1️⃣ Recherche de Loïc (lgenevaux@yahoo.fr)...`);
    const { data: loic, error: searchError } = await supabase
      .from("profiles")
      .select("id, email, nom, prenom, role")
      .eq("email", "lgenevaux@yahoo.fr")
      .single();

    if (searchError || !loic) {
      console.log(`   ❌ Loïc non trouvé: ${searchError?.message || "Utilisateur inexistant"}`);
      process.exit(1);
    }

    console.log(`   ✓ Trouvé: ${loic.nom || loic.prenom || loic.email}`);
    console.log(`   ✓ ID: ${loic.id}`);
    console.log(`   ✓ Rôle actuel: ${loic.role}`);

    // 2. Ajouter Loïc à la table admins
    console.log(`\n2️⃣ Ajout de Loïc à la table 'admins'...`);
    
    const { data, error } = await supabase
      .from("admins")
      .upsert([{ user_id: loic.id }], { onConflict: "user_id" })
      .select();

    if (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
      process.exit(1);
    }

    console.log(`   ✅ Loïc ajouté avec succès!`);

    // 3. Vérifier
    console.log(`\n3️⃣ Vérification des admins...`);
    const { data: admins } = await supabase
      .from("admins")
      .select("user_id, created_at");

    console.log(`   ✓ Total admins: ${admins?.length || 0}`);
    admins?.forEach(a => {
      const isLoic = a.user_id === loic.id;
      console.log(`     ${isLoic ? '✓ Loïc' : '✓ Autre'} (${a.user_id})`);
    });

    console.log(`\n✅ FAIT!`);
    console.log(`\nPatrick (Danto) et Loïc sont maintenant admins! 🎉\n`);

  } catch (err) {
    console.error("❌ Erreur:", err.message);
    process.exit(1);
  }
}

addLoicAsAdmin();
