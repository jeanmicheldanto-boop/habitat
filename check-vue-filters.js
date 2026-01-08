const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function checkVueFilters() {
  const ETAB_ID = 'ce3dadfd-d021-48f5-80a4-73a092c7a81a';
  
  console.log('\n🔍 VÉRIFICATION FILTRES VUE\n');
  console.log('='.repeat(80));
  
  // 1. Vérifier directement dans etablissements
  console.log('\n📋 Table etablissements (sans filtre):');
  const { data: etab } = await supabase
    .from('etablissements')
    .select('*')
    .eq('id', ETAB_ID)
    .single();
  
  if (etab) {
    console.log(`   ✅ Établissement existe`);
    console.log(`   Nom: ${etab.nom}`);
    console.log(`   statut_editorial: ${etab.statut_editorial}`);
    console.log(`   geom: ${etab.geom || '❌ NULL'}`);
    console.log(`   habitat_type: ${etab.habitat_type || '❌ NULL'}`);
    console.log(`   departement: ${etab.departement || '❌ NULL'}`);
    console.log(`   region: ${etab.region || '❌ NULL'}`);
    console.log(`   pays: ${etab.pays || '❌ NULL - peut-être requis ?'}`);
  }
  
  // 2. Vérifier dans la vue
  console.log('\n\n📊 Vue v_liste_publication:');
  const { data: vue, error: vueError } = await supabase
    .from('v_liste_publication')
    .select('*')
    .eq('etab_id', ETAB_ID);
  
  if (vueError) {
    console.log(`   ❌ Erreur: ${vueError.message}`);
  } else if (!vue || vue.length === 0) {
    console.log('   ❌ Aucune donnée retournée');
    console.log('\n   Causes possibles:');
    console.log('   1. La vue filtre sur statut_editorial = "publie" ✅ (OK)');
    console.log('   2. La vue filtre sur pays non NULL ?');
    console.log('   3. La vue filtre sur geom non NULL (coordonnées) ?');
    console.log('   4. Problème de JOIN avec sous_categories/services ?');
  } else {
    console.log(`   ✅ ${vue.length} résultat(s) trouvé(s)`);
    console.log(`   image_path: ${vue[0].image_path}`);
  }
  
  // 3. Vérifier les liaisons sous-catégories
  console.log('\n\n🏷️  Liaisons sous-catégories:');
  const { data: liaisons } = await supabase
    .from('etablissement_sous_categorie')
    .select('sous_categorie_id')
    .eq('etablissement_id', ETAB_ID);
  
  if (liaisons && liaisons.length > 0) {
    console.log(`   ✅ ${liaisons.length} liaison(s) trouvée(s)`);
  } else {
    console.log('   ❌ Aucune liaison - peut-être requis par la vue ?');
  }
  
  // 4. Tester avec tous les établissements publiés
  console.log('\n\n📊 Tous les établissements publiés dans la vue:');
  const { data: allVue } = await supabase
    .from('v_liste_publication')
    .select('etab_id, nom')
    .limit(5);
  
  if (allVue) {
    console.log(`   ${allVue.length} établissement(s) visibles dans la vue`);
    allVue.forEach(e => console.log(`      - ${e.nom}`));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n💡 SOLUTION:');
  console.log('   Il faut identifier quel champ manquant empêche l\'établissement');
  console.log('   d\'apparaître dans la vue. Vérifier la définition SQL de la vue.');
}

checkVueFilters().catch(console.error);
