require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testRechercheColocation() {
  console.log('🔍 Test recherche Colocation avec services...\n');

  // Test 1 : Haute-Saône
  console.log('Test 1: Recherche en Haute-Saône');
  const { data: data1, error: error1 } = await supabase
    .from('v_liste_publication')
    .select('nom, commune, departement, sous_categories')
    .ilike('departement', '%Haute-Saône%')
    .contains('sous_categories', ['Colocation avec services'])
    .limit(10);

  if (error1) {
    console.error('❌ Erreur:', error1);
  } else {
    console.log(`✅ Trouvé ${data1.length} résultat(s)`);
    data1.forEach(etab => {
      console.log(`  - ${etab.nom} à ${etab.commune} (${etab.departement})`);
      console.log(`    Sous-catégories: ${etab.sous_categories.join(', ')}`);
    });
  }

  // Test 2 : avec numero departement 70
  console.log('\nTest 2: Recherche avec "70"');
  const { data: data2, error: error2 } = await supabase
    .from('v_liste_publication')
    .select('nom, commune, departement, sous_categories')
    .ilike('departement', '%70%')
    .contains('sous_categories', ['Colocation avec services'])
    .limit(10);

  if (error2) {
    console.error('❌ Erreur:', error2);
  } else {
    console.log(`✅ Trouvé ${data2.length} résultat(s)`);
    data2.forEach(etab => {
      console.log(`  - ${etab.nom} à ${etab.commune} (${etab.departement})`);
    });
  }

  // Test 3 : toutes les colocations en France (échantillon)
  console.log('\nTest 3: Toutes les Colocation avec services en France (20 premiers)');
  const { data: data3, error: error3 } = await supabase
    .from('v_liste_publication')
    .select('nom, commune, departement, sous_categories')
    .contains('sous_categories', ['Colocation avec services'])
    .limit(20);

  if (error3) {
    console.error('❌ Erreur:', error3);
  } else {
    console.log(`✅ Trouvé ${data3.length} résultat(s)`);
    data3.forEach(etab => {
      console.log(`  - ${etab.nom} à ${etab.commune} (${etab.departement})`);
    });
  }

  // Test 4 : Compter le total
  console.log('\nTest 4: Compter toutes les Colocation avec services');
  const { count, error: error4 } = await supabase
    .from('v_liste_publication')
    .select('*', { count: 'exact', head: true })
    .contains('sous_categories', ['Colocation avec services']);

  if (error4) {
    console.error('❌ Erreur:', error4);
  } else {
    console.log(`✅ Total en France: ${count} établissements`);
  }
}

testRechercheColocation();
