const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Mzc5MDcsImV4cCI6MjA3NDMxMzkwN30.PWbq0NaB8ZyBIR5XgSn2pD_VoiH9eMjyjUYvvLmA3ng'
);

async function testLimits() {
  console.log('\n=== TEST DES LIMITES SUPABASE ===\n');

  // Test 1: Sans limite
  console.log('Test 1: Sans .limit()');
  const { data: noLimit } = await supabase
    .from('v_liste_publication_geoloc')
    .select('departement');
  console.log(`Résultat: ${noLimit?.length || 0} lignes`);
  const hasIndreNoLimit = noLimit?.some(e => e.departement?.includes('Indre'));
  console.log(`Indre présent? ${hasIndreNoLimit ? 'OUI ✅' : 'NON ❌'}\n`);

  // Test 2: Avec limit(1000)
  console.log('Test 2: Avec .limit(1000)');
  const { data: limit1000 } = await supabase
    .from('v_liste_publication_geoloc')
    .select('departement')
    .limit(1000);
  console.log(`Résultat: ${limit1000?.length || 0} lignes`);
  const hasIndre1000 = limit1000?.some(e => e.departement?.includes('Indre'));
  console.log(`Indre présent? ${hasIndre1000 ? 'OUI ✅' : 'NON ❌'}\n`);

  // Test 3: Avec limit(2000)
  console.log('Test 3: Avec .limit(2000)');
  const { data: limit2000 } = await supabase
    .from('v_liste_publication_geoloc')
    .select('departement')
    .limit(2000);
  console.log(`Résultat: ${limit2000?.length || 0} lignes`);
  const hasIndre2000 = limit2000?.some(e => e.departement?.includes('Indre'));
  console.log(`Indre présent? ${hasIndre2000 ? 'OUI ✅' : 'NON ❌'}\n`);

  // Test 4: Avec limit(5000)
  console.log('Test 4: Avec .limit(5000)');
  const { data: limit5000 } = await supabase
    .from('v_liste_publication_geoloc')
    .select('departement')
    .limit(5000);
  console.log(`Résultat: ${limit5000?.length || 0} lignes`);
  const hasIndre5000 = limit5000?.some(e => e.departement?.includes('Indre'));
  console.log(`Indre présent? ${hasIndre5000 ? 'OUI ✅' : 'NON ❌'}\n`);

  // Test 5: Chercher directement l'Indre avec un filtre
  console.log('Test 5: Avec filtre direct .ilike(\'departement\', \'%Indre%\')');
  const { data: filtered } = await supabase
    .from('v_liste_publication_geoloc')
    .select('nom, departement')
    .ilike('departement', '%Indre%');
  console.log(`Résultat: ${filtered?.length || 0} lignes`);
  if (filtered && filtered.length > 0) {
    console.log('Exemples:');
    filtered.slice(0, 3).forEach(e => console.log(`  - ${e.nom} (${e.departement})`));
  }

  // Test 6: Vérifier l'ordre de tri par défaut
  console.log('\n\nTest 6: Vérifier l\'ordre par défaut (premiers 10)');
  const { data: first10 } = await supabase
    .from('v_liste_publication_geoloc')
    .select('nom, departement')
    .limit(10);
  console.log('Premiers établissements:');
  first10?.forEach((e, i) => console.log(`  ${i+1}. ${e.nom} (${e.departement})`));

  // Test 7: Vérifier les derniers
  console.log('\n\nTest 7: Vérifier les derniers (avec order by id desc)');
  const { data: last10 } = await supabase
    .from('v_liste_publication_geoloc')
    .select('nom, departement')
    .order('etab_id', { ascending: false })
    .limit(10);
  console.log('Derniers établissements:');
  last10?.forEach((e, i) => console.log(`  ${i+1}. ${e.nom} (${e.departement})`));
}

testLimits().then(() => {
  console.log('\n=== FIN DES TESTS ===\n');
  process.exit(0);
}).catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
