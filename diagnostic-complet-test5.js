const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function diagnosticComplet() {
  console.log('=== DIAGNOSTIC COMPLET ÉTABLISSEMENT TEST 5 ===\n');

  // 1. Chercher l'établissement
  const { data: etabs } = await supabase
    .from('etablissements')
    .select('*')
    .ilike('nom', '%etablissement test 5%');

  if (!etabs || etabs.length === 0) {
    console.log('❌ Établissement non trouvé');
    return;
  }

  const etab = etabs[0];
  console.log('1️⃣ ÉTABLISSEMENT DANS LA BASE:');
  console.log(`   ID: ${etab.id}`);
  console.log(`   Nom: ${etab.nom}`);
  console.log(`   Image path: ${etab.image_path}`);
  console.log('');

  // 2. Vérifier les liaisons sous-catégories
  const { data: liaisons } = await supabase
    .from('etablissement_sous_categorie')
    .select('sous_categorie_id')
    .eq('etablissement_id', etab.id);

  console.log('2️⃣ LIAISONS SOUS-CATÉGORIES:');
  console.log(`   Nombre: ${liaisons?.length || 0}`);
  
  if (liaisons && liaisons.length > 0) {
    for (const liaison of liaisons) {
      const { data: sousCat } = await supabase
        .from('sous_categories')
        .select('*')
        .eq('id', liaison.sous_categorie_id)
        .single();
      
      console.log(`   → ID: ${sousCat.id}`);
      console.log(`     Libelle: ${sousCat.libelle}`);
      console.log(`     Slug: ${sousCat.slug}`);
      console.log(`     Alias: ${sousCat.alias}`);
    }
  } else {
    console.log('   ❌ Aucune liaison trouvée');
  }
  console.log('');

  // 3. Vérifier dans la vue
  const { data: vueData } = await supabase
    .from('v_liste_publication_geoloc')
    .select('*')
    .eq('etab_id', etab.id)
    .single();

  console.log('3️⃣ VUE v_liste_publication_geoloc:');
  console.log(`   sous_categories: ${JSON.stringify(vueData?.sous_categories)}`);
  console.log(`   image_path: ${vueData?.image_path}`);
  console.log('');

  // 4. Vérifier si l'image existe dans le bucket
  if (vueData?.image_path) {
    const { data: files } = await supabase.storage
      .from('medias')
      .list(vueData.image_path.split('/')[0]);
    
    console.log('4️⃣ FICHIERS DANS LE BUCKET medias:');
    if (files) {
      files.forEach(f => console.log(`   - ${f.name}`));
    } else {
      console.log('   ❌ Dossier non trouvé');
    }
  }
  console.log('');

  // 5. Test de la fonction de recherche
  console.log('5️⃣ TEST RECHERCHE DANS habitatTaxonomy.ts:');
  const testKey = vueData?.sous_categories?.[0];
  console.log(`   Clé à chercher: "${testKey}"`);
  
  // Simuler la recherche
  const { data: allSousCat } = await supabase
    .from('sous_categories')
    .select('*');
  
  const found = allSousCat?.find(sc => sc.slug === testKey || sc.libelle === testKey);
  console.log(`   Trouvé: ${found ? `OUI (${found.libelle})` : 'NON'}`);
}

diagnosticComplet().catch(console.error);
