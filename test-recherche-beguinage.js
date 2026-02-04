require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testRechercheBeguinage() {
  console.log('🔍 Test recherche Béguinage dans le Pas-de-Calais...\n');

  // Test 1 : avec departement exact
  console.log('Test 1: Recherche avec "Pas-de-Calais"');
  const { data: data1, error: error1 } = await supabase
    .from('v_liste_publication')
    .select('nom, commune, departement, sous_categories')
    .ilike('departement', '%Pas-de-Calais%')
    .contains('sous_categories', ['Béguinage'])
    .limit(10);

  if (error1) {
    console.error('❌ Erreur:', error1);
  } else {
    console.log(`✅ Trouvé ${data1.length} résultat(s)`);
    data1.forEach(etab => {
      console.log(`  - ${etab.nom} à ${etab.commune} (${etab.departement})`);
    });
  }

  // Test 2 : avec numero departement
  console.log('\nTest 2: Recherche avec "62"');
  const { data: data2, error: error2 } = await supabase
    .from('v_liste_publication')
    .select('nom, commune, departement, sous_categories')
    .ilike('departement', '%62%')
    .contains('sous_categories', ['Béguinage'])
    .limit(10);

  if (error2) {
    console.error('❌ Erreur:', error2);
  } else {
    console.log(`✅ Trouvé ${data2.length} résultat(s)`);
    data2.forEach(etab => {
      console.log(`  - ${etab.nom} à ${etab.commune} (${etab.departement})`);
    });
  }

  // Test 3 : tous les béguinages
  console.log('\nTest 3: Tous les béguinages en France');
  const { data: data3, error: error3 } = await supabase
    .from('v_liste_publication')
    .select('nom, commune, departement, sous_categories')
    .contains('sous_categories', ['Béguinage'])
    .limit(20);

  if (error3) {
    console.error('❌ Erreur:', error3);
  } else {
    console.log(`✅ Trouvé ${data3.length} résultat(s)`);
    data3.forEach(etab => {
      console.log(`  - ${etab.nom} à ${etab.commune} (${etab.departement})`);
    });
  }
}

testRechercheBeguinage();
