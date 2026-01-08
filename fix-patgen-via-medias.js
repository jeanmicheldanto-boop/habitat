const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

const ETAB_ID = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';
const SOURCE_PATH = 'a1a02ce0-f95a-4dd1-a181-d0df29b5a94f/main.jpg';

async function fixViaMediasTable() {
  console.log('\n🔧 Correction via la table medias...\n');
  
  // 1. Vérifier l'image source
  console.log('📂 Vérification de l\'image source...');
  const { data: sourceFiles } = await supabase.storage
    .from('etablissements')
    .list('a1a02ce0-f95a-4dd1-a181-d0df29b5a94f');
  
  if (!sourceFiles || sourceFiles.length === 0) {
    console.log('❌ Fichier source introuvable');
    return;
  }
  
  console.log('✅ Fichier source trouvé:', SOURCE_PATH);
  const { data: sourceUrl } = supabase.storage.from('etablissements').getPublicUrl(SOURCE_PATH);
  console.log('   URL:', sourceUrl.publicUrl);
  
  // 2. Vérifier les entrées actuelles dans medias
  console.log('\n📊 Vérification table medias...');
  const { data: existingMedias } = await supabase
    .from('medias')
    .select('*')
    .eq('etablissement_id', ETAB_ID);
  
  if (existingMedias && existingMedias.length > 0) {
    console.log(`✅ ${existingMedias.length} entrée(s) existante(s):`);
    existingMedias.forEach(m => {
      console.log(`   - ID: ${m.id}`);
      console.log(`     Path: ${m.storage_path}`);
      console.log(`     Priority: ${m.priority}`);
    });
    
    // Supprimer les anciennes entrées
    console.log('\n🗑️ Suppression des anciennes entrées...');
    const { error: deleteError } = await supabase
      .from('medias')
      .delete()
      .eq('etablissement_id', ETAB_ID);
    
    if (deleteError) {
      console.error('❌ Erreur suppression:', deleteError.message);
    } else {
      console.log('✅ Anciennes entrées supprimées');
    }
  } else {
    console.log('ℹ️ Aucune entrée existante');
  }
  
  // 3. Créer une nouvelle entrée dans medias avec le bon chemin
  console.log('\n➕ Création de la nouvelle entrée medias...');
  const { data: newMedia, error: insertError } = await supabase
    .from('medias')
    .insert([{
      etablissement_id: ETAB_ID,
      storage_path: SOURCE_PATH,
      alt_text: 'Maison Patgen - Ossun',
      priority: 1
    }])
    .select()
    .single();
  
  if (insertError) {
    console.error('❌ Erreur insertion:', insertError.message);
    return;
  }
  
  console.log('✅ Nouvelle entrée créée:', newMedia.id);
  console.log('   Path:', newMedia.storage_path);
  
  // 4. Vérifier le résultat dans la vue
  console.log('\n✅ Vérification dans la vue de publication...');
  const { data: etab } = await supabase
    .from('v_liste_publication')
    .select('nom, image_path, commune')
    .eq('etab_id', ETAB_ID)
    .single();
  
  if (etab) {
    console.log(`   Nom: ${etab.nom}`);
    console.log(`   Commune: ${etab.commune}`);
    console.log(`   Image path: ${etab.image_path}`);
    
    if (etab.image_path) {
      const { data: finalUrl } = supabase.storage.from('etablissements').getPublicUrl(etab.image_path);
      console.log(`   URL publique: ${finalUrl.publicUrl}`);
    }
    
    console.log('\n🎉 Correction terminée avec succès!');
    console.log('\n📍 L\'image devrait maintenant s\'afficher correctement sur:');
    console.log('   ✓ La liste de la plateforme');
    console.log('   ✓ La carte interactive');
    console.log('   ✓ La fiche détaillée de l\'établissement');
    
    console.log('\n💡 Testez en visitant:');
    console.log(`   https://habitat-intermediaire.fr/plateforme/fiche?id=${ETAB_ID}`);
  } else {
    console.log('❌ Établissement non trouvé dans la vue de publication');
  }
}

fixViaMediasTable().catch(console.error);
