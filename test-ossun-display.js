const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function testOssunDisplay() {
  console.log('🧪 Test d\'affichage de l\'établissement Ossun\n');
  
  const etabId = 'b2d16a3e-8221-49a7-9441-1d3b2d1dc3d3';
  
  // 1. Vérifier les données brutes
  console.log('1️⃣ Données brutes de l\'établissement:');
  const { data: etab } = await supabase
    .from('etablissements')
    .select('id, nom, commune, habitat_type')
    .eq('id', etabId)
    .single();
  console.log(etab);
  
  // 2. Vérifier les liens de sous-catégories
  console.log('\n2️⃣ Liens sous-catégories:');
  const { data: links } = await supabase
    .from('etablissement_sous_categorie')
    .select(`
      etablissement_id,
      sous_categorie_id,
      sous_categories (
        id,
        libelle
      )
    `)
    .eq('etablissement_id', etabId);
  console.log(JSON.stringify(links, null, 2));
  
  // 3. Tester la vue de publication
  console.log('\n3️⃣ Vue v_liste_publication_geoloc:');
  const { data: vue, error: vueError } = await supabase
    .from('v_liste_publication_geoloc')
    .select('etab_id, nom, commune, habitat_type, sous_categories')
    .eq('etab_id', etabId)
    .single();
  
  if (vueError) {
    console.error('Erreur vue:', vueError);
  } else {
    console.log(JSON.stringify(vue, null, 2));
  }
  
  // 4. Analyse du problème
  console.log('\n4️⃣ Analyse:');
  if (links && links.length > 0) {
    console.log(`✅ ${links.length} sous-catégorie(s) trouvée(s) dans la table de jonction`);
    links.forEach(link => {
      console.log(`   - ${link.sous_categories.libelle}`);
    });
  } else {
    console.log('❌ Aucune sous-catégorie dans la table de jonction');
  }
  
  if (vue) {
    if (vue.sous_categories && vue.sous_categories.length > 0 && vue.sous_categories[0] !== null) {
      console.log(`✅ ${vue.sous_categories.length} sous-catégorie(s) dans la vue`);
      vue.sous_categories.forEach(sc => {
        console.log(`   - ${sc}`);
      });
    } else {
      console.log('⚠️ La vue retourne des sous-catégories vides ou null');
      console.log('   Cela peut indiquer un problème avec la définition de la vue SQL');
    }
  }
  
  console.log('\n✅ Test terminé');
}

testOssunDisplay()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
