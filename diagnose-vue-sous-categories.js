const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function diagnoseSousCategoriesView() {
  console.log('🔍 Diagnostic de la vue sous-catégories\n');
  
  const etabId = 'b2d16a3e-8221-49a7-9441-1d3b2d1dc3d3';
  
  // Tester différentes requêtes pour comprendre le problème
  
  // 1. Requête simple de la table de jonction
  console.log('1️⃣ Requête simple table de jonction:');
  const { data: links, error: err1 } = await supabase
    .from('etablissement_sous_categorie')
    .select('sous_categorie_id')
    .eq('etablissement_id', etabId);
  console.log('   Résultat:', links?.map(l => l.sous_categorie_id));
  
  // 2. Avec JOIN
  console.log('\n2️⃣ Avec JOIN:');
  const { data: withJoin, error: err2 } = await supabase
    .from('etablissement_sous_categorie')
    .select('sous_categorie_id, sous_categories(libelle)')
    .eq('etablissement_id', etabId);
  console.log('   Résultat:', JSON.stringify(withJoin, null, 2));
  
  // 3. Tester sur un autre établissement qui fonctionne
  console.log('\n3️⃣ Test sur un autre établissement:');
  const { data: autreEtab } = await supabase
    .from('v_liste_publication_geoloc')
    .select('etab_id, nom, sous_categories')
    .not('sous_categories', 'is', null)
    .limit(3);
  
  if (autreEtab && autreEtab.length > 0) {
    autreEtab.forEach(e => {
      console.log(`   ${e.nom}: ${e.sous_categories}`);
    });
  }
  
  // 4. Compter les établissements avec des sous-catégories
  console.log('\n4️⃣ Statistiques:');
  const { data: stats } = await supabase
    .from('v_liste_publication_geoloc')
    .select('etab_id, sous_categories');
  
  if (stats) {
    const avecSC = stats.filter(s => s.sous_categories && s.sous_categories.length > 0 && s.sous_categories[0] !== null);
    const sansSC = stats.filter(s => !s.sous_categories || s.sous_categories.length === 0 || s.sous_categories[0] === null);
    console.log(`   Total établissements: ${stats.length}`);
    console.log(`   Avec sous-catégories: ${avecSC.length}`);
    console.log(`   Sans/null sous-catégories: ${sansSC.length}`);
  }
  
  // 5. Vérifier s'il y a un problème de timing/cache
  console.log('\n5️⃣ Re-vérification Ossun après 1 seconde:');
  await new Promise(resolve => setTimeout(resolve, 1000));
  const { data: ossunRetry } = await supabase
    .from('v_liste_publication_geoloc')
    .select('etab_id, nom, sous_categories')
    .eq('etab_id', etabId)
    .single();
  console.log('   Sous-catégories:', ossunRetry?.sous_categories);
  
  console.log('\n✅ Diagnostic terminé');
}

diagnoseSousCategoriesView()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
