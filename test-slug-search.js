const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testConvertSousCategories() {
  // Récupérer toutes les sous-catégories
  const { data: allSousCategories, error } = await supabase
    .from('sous_categories')
    .select('id, slug, libelle');

  console.log('📋 Toutes les sous-catégories:\n');
  allSousCategories?.forEach(sc => {
    console.log(`ID: ${sc.id}`);
    console.log(`Slug: "${sc.slug}"`);
    console.log(`Libelle: "${sc.libelle}"`);
    console.log('---');
  });

  // Test de recherche comme dans le code
  const keyToUuidMap = new Map();
  allSousCategories?.forEach(sc => {
    if (sc.slug) {
      keyToUuidMap.set(sc.slug.toLowerCase().trim(), sc.id);
    }
  });

  console.log('\n🔍 Map des slugs:');
  keyToUuidMap.forEach((id, slug) => {
    console.log(`"${slug}" -> ${id}`);
  });

  const testKey = "marpa";
  const uuid = keyToUuidMap.get(testKey.toLowerCase().trim());
  console.log(`\n✅ Test recherche "${testKey}": ${uuid ? 'TROUVÉ' : 'NON TROUVÉ'}`);
  if (uuid) console.log(`UUID: ${uuid}`);
}

testConvertSousCategories().catch(console.error);
