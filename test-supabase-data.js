// Test de connexion Supabase et récupération des données
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Charger manuellement les variables d'environnement depuis .env.local
const envPath = path.join(__dirname, '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔑 Configuration Supabase:');
console.log('URL:', supabaseUrl ? '✅ Définie' : '❌ Non définie');
console.log('KEY:', supabaseKey ? '✅ Définie' : '❌ Non définie');
console.log('');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes !');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testData() {
  console.log('📊 Test de récupération des données...\n');
  
  // Test 1: Services
  console.log('1️⃣ Test table SERVICES:');
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('id, libelle')
    .order('libelle')
    .limit(10);
  
  if (servicesError) {
    console.error('❌ Erreur services:', servicesError);
  } else {
    console.log(`✅ ${services?.length || 0} services trouvés`);
    if (services && services.length > 0) {
      services.slice(0, 5).forEach((s, i) => {
        console.log(`   ${i+1}. ${s.libelle} (ID: ${s.id.substring(0, 8)}...)`);
      });
    }
  }
  console.log('');
  
  // Test 2: Sous-catégories
  console.log('2️⃣ Test table SOUS_CATEGORIES:');
  const { data: sousCategories, error: scError } = await supabase
    .from('sous_categories')
    .select('id, libelle')
    .order('libelle')
    .limit(10);
  
  if (scError) {
    console.error('❌ Erreur sous-catégories:', scError);
  } else {
    console.log(`✅ ${sousCategories?.length || 0} sous-catégories trouvées`);
    if (sousCategories && sousCategories.length > 0) {
      sousCategories.slice(0, 5).forEach((sc, i) => {
        console.log(`   ${i+1}. ${sc.libelle} (ID: ${sc.id.substring(0, 8)}...)`);
      });
    }
  }
  console.log('');
  
  // Test 3: Établissements (pour voir si on peut accéder aux données)
  console.log('3️⃣ Test table ETABLISSEMENTS:');
  const { data: etablissements, count, error: etabError } = await supabase
    .from('etablissements')
    .select('id, nom', { count: 'exact' })
    .limit(3);
  
  if (etabError) {
    console.error('❌ Erreur établissements:', etabError);
  } else {
    console.log(`✅ ${count || 0} établissements au total`);
    if (etablissements && etablissements.length > 0) {
      etablissements.forEach((e, i) => {
        console.log(`   ${i+1}. ${e.nom}`);
      });
    }
  }
}

testData().catch(console.error);
