const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function fixOssunWithCorrectSousCategorie() {
  console.log('🔧 Correction de la sous-catégorie Ossun avec la bonne entrée\n');
  
  const etabId = 'b2d16a3e-8221-49a7-9441-1d3b2d1dc3d3';
  
  // 1. Supprimer le lien erroné (celui avec slug NULL)
  console.log('1️⃣ Suppression du lien avec la sous-catégorie sans slug:');
  const { error: deleteError } = await supabase
    .from('etablissement_sous_categorie')
    .delete()
    .eq('etablissement_id', etabId)
    .eq('sous_categorie_id', 'cbd2dbb9-fe6d-466e-921f-a90011661dcd');
  
  if (deleteError) {
    console.error('   ❌ Erreur suppression:', deleteError);
  } else {
    console.log('   ✅ Lien supprimé');
  }
  
  // 2. Créer le lien avec la bonne sous-catégorie (celle avec slug)
  console.log('\n2️⃣ Création du lien avec la sous-catégorie correcte (avec slug):');
  const { error: insertError } = await supabase
    .from('etablissement_sous_categorie')
    .insert([{
      etablissement_id: etabId,
      sous_categorie_id: 'd436eee9-4745-4c32-83d1-eb31d234a39b' // Celle avec slug "habitat_intergenerationnel"
    }]);
  
  if (insertError) {
    console.error('   ❌ Erreur insertion:', insertError);
  } else {
    console.log('   ✅ Lien créé avec la sous-catégorie avec slug');
  }
  
  // 3. Vérifier le résultat
  console.log('\n3️⃣ Vérification:');
  const { data: links } = await supabase
    .from('etablissement_sous_categorie')
    .select('sous_categorie_id, sous_categories(libelle, slug)')
    .eq('etablissement_id', etabId);
  
  console.log('   Liens actuels:', JSON.stringify(links, null, 2));
  
  // 4. Tester la vue
  console.log('\n4️⃣ Test de la vue:');
  const { data: vue } = await supabase
    .from('v_liste_publication_geoloc')
    .select('etab_id, nom, sous_categories')
    .eq('etab_id', etabId)
    .single();
  
  console.log('   Vue sous_categories:', vue?.sous_categories);
  
  if (vue?.sous_categories && vue.sous_categories[0] !== null) {
    console.log('\n✅ SUCCESS! La sous-catégorie apparaît maintenant correctement dans la vue!');
  } else {
    console.log('\n⚠️ La vue retourne toujours null - il peut y avoir un délai de cache');
  }
  
  console.log('\n✅ Correction terminée');
}

fixOssunWithCorrectSousCategorie()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
