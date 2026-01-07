const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function fix3rdOssunSousCategorie() {
  const etabId = '3a14a492-bfef-42b7-aa55-4ea8171be34e';
  
  console.log('🔧 Ajout de la sous-catégorie béguinage au 3e établissement Ossun\n');
  
  // Chercher la sous-catégorie "beguinage"
  const { data: sc } = await supabase
    .from('sous_categories')
    .select('id, libelle, alias')
    .eq('libelle', 'beguinage')
    .single();
  
  if (!sc) {
    console.log('❌ Sous-catégorie "beguinage" non trouvée');
    return;
  }
  
  console.log(`✅ Sous-catégorie trouvée: ${sc.libelle} (${sc.alias}) → ${sc.id}`);
  
  // Ajouter la liaison
  const { error } = await supabase
    .from('etablissement_sous_categorie')
    .insert([{
      etablissement_id: etabId,
      sous_categorie_id: sc.id
    }]);
  
  if (error) {
    console.error('❌ Erreur ajout liaison:', error.message);
    if (error.code === '23505') {
      console.log('   (La liaison existe déjà)');
    }
  } else {
    console.log('✅ Liaison créée avec succès');
  }
  
  // Vérifier le résultat
  console.log('\n📋 Tous les établissements à Ossun:');
  const { data: ossunEtabs } = await supabase
    .from('v_liste_publication_geoloc')
    .select('nom, habitat_type, sous_categories')
    .ilike('commune', '%ossun%')
    .order('nom');
  
  if (ossunEtabs) {
    ossunEtabs.forEach((etab, idx) => {
      console.log(`\n${idx + 1}. ${etab.nom}`);
      console.log(`   Type: ${etab.habitat_type}`);
      console.log(`   Sous-catégories: ${etab.sous_categories?.join(', ') || 'aucune'}`);
    });
  }
  
  console.log('\n✅ Terminé !');
}

fix3rdOssunSousCategorie()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
