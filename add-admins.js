#!/usr/bin/env node

/**
 * Script pour ajouter Patrick et Loïc à la table admins
 */

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variables d'environnement manquantes");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAdmins() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║ ➕ AJOUT DES ADMINS À LA TABLE ADMINS                          ║
╚════════════════════════════════════════════════════════════════╝
`);

  try {
    // 1. Chercher les admins dans profiles
    console.log(`\n1️⃣ Recherche des admins dans profiles...`);
    const { data: adminProfiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, nom, prenom, role")
      .eq("role", "admin");

    if (profileError) {
      console.log(`   ❌ Erreur: ${profileError.message}`);
      process.exit(1);
    }

    console.log(`   ✓ Trouvé: ${adminProfiles?.length || 0} admin(s)`);
    adminProfiles?.forEach(p => {
      console.log(`     - ${p.nom || p.email} (${p.id})`);
    });

    if (!adminProfiles || adminProfiles.length === 0) {
      console.log(`   ❌ Aucun admin trouvé dans profiles!`);
      process.exit(1);
    }

    // 2. Ajouter tous les admins à la table admins
    console.log(`\n2️⃣ Ajout à la table 'admins'...`);
    
    const adminIds = adminProfiles.map(p => ({ user_id: p.id }));
    
    const { data, error } = await supabase
      .from("admins")
      .upsert(adminIds, { onConflict: "user_id" })
      .select();

    if (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
      process.exit(1);
    }

    console.log(`   ✅ ${data?.length || 0} admin(s) ajouté(s) avec succès!`);

    // 3. Vérifier que ça a marché
    console.log(`\n3️⃣ Vérification...`);
    const { data: admins } = await supabase
      .from("admins")
      .select("user_id, created_at");

    console.log(`   ✓ Admins dans la base: ${admins?.length || 0}`);
    admins?.forEach(a => {
      const admin = adminProfiles.find(p => p.id === a.user_id);
      console.log(`     - ${admin?.nom || admin?.email} (${a.user_id})`);
    });

    console.log(`\n✅ FAIT!`);
    console.log(`\nAllez à l'admin et actualisez la page.`);
    console.log(`Les réclamations devraient maintenant apparaître! 🎉\n`);

  } catch (err) {
    console.error("❌ Erreur:", err.message);
    process.exit(1);
  }
}

addAdmins();
