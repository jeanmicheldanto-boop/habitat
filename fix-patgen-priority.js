const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

const ETAB_ID = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';
const CORRECT_PATH = 'a1a02ce0-f95a-4dd1-a181-d0df29b5a94f/main.jpg';

async function updatePriority() {
  console.log('\n🔧 Mise à jour de la priorité...\n');
  
  // 1. Supprimer toutes les anciennes entrées
  console.log('🗑️ Suppression de toutes les entrées medias...');
  const { error: deleteError } = await supabase
    .from('medias')
    .delete()
    .eq('etablissement_id', ETAB_ID);
  
  if (deleteError) {
    console.error('❌ Erreur:', deleteError.message);
    return;
  }
  
  console.log('✅ Toutes les entrées supprimées');
  
  // 2. Créer une nouvelle entrée avec priorité élevée
  console.log('\n➕ Création nouvelle entrée avec priorité 1000...');
  const { data: newMedia, error: insertError } = await supabase
    .from('medias')
    .insert([{
      etablissement_id: ETAB_ID,
      storage_path: CORRECT_PATH,
      alt_text: 'Maison Patgen - Habitat inclusif à Ossun',
      priority: 1000
    }])
    .select()
    .single();
  
  if (insertError) {
    console.error('❌ Erreur insertion:', insertError.message);
    return;
  }
  
  console.log('✅ Nouvelle entrée créée:');
  console.log(`   ID: ${newMedia.id}`);
  console.log(`   Path: ${newMedia.storage_path}`);
  console.log(`   Priority: ${newMedia.priority}`);
  
  // 3. Vérifier le résultat
  console.log('\n✅ Vérification...');
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde pour le cache
  
  const { data: vue } = await supabase
    .from('v_liste_publication')
    .select('nom, image_path')
    .eq('etab_id', ETAB_ID)
    .single();
  
  console.log(`   Nom: ${vue.nom}`);
  console.log(`   Image path dans la vue: ${vue.image_path}`);
  
  if (vue.image_path === CORRECT_PATH) {
    console.log('\n🎉 ✅ SUCCESS ! L\'image est maintenant correcte !');
    
    const { data: url } = supabase.storage.from('etablissements').getPublicUrl(vue.image_path);
    console.log(`\n🌐 URL publique:`);
    console.log(`   ${url.publicUrl}`);
    
    console.log('\n📍 L\'image devrait maintenant s\'afficher sur:');
    console.log('   ✓ La liste de la plateforme');
    console.log('   ✓ La carte interactive');
    console.log('   ✓ La fiche détaillée');
    
    console.log('\n💡 Testez maintenant:');
    console.log(`   https://habitat-intermediaire.fr/plateforme/fiche?id=${ETAB_ID}`);
    console.log(`   https://habitat-intermediaire.fr/plateforme`);
  } else {
    console.log('\n⚠️ L\'image n\'est pas encore mise à jour dans la vue');
    console.log(`   Attendu: ${CORRECT_PATH}`);
    console.log(`   Trouvé: ${vue.image_path}`);
  }
}

updatePriority().catch(console.error);
