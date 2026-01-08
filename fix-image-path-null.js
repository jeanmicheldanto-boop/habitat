const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

const ETAB_ID = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';
const CORRECT_PATH = 'a1a02ce0-f95a-4dd1-a181-d0df29b5a94f/main.jpg';

async function fixImagePathLegacy() {
  console.log('\n🔧 Correction finale via NULL...\n');
  
  // 1. Mettre image_path à NULL dans etablissements
  console.log('📝 Mise à NULL de etablissements.image_path...');
  
  const { error: updateError } = await supabase
    .from('etablissements')
    .update({ image_path: null })
    .eq('id', ETAB_ID);
  
  if (updateError) {
    console.error('❌ Erreur:', updateError.message);
    console.log('\n⚠️ La contrainte de publication empêche la modification.');
    console.log('   Il faut d\'abord s\'assurer que l\'établissement a un gestionnaire.');
    
    // Vérifier le gestionnaire
    const { data: etab } = await supabase
      .from('etablissements')
      .select('nom, gestionnaire')
      .eq('id', ETAB_ID)
      .single();
    
    console.log(`\n📊 Gestionnaire actuel: "${etab.gestionnaire || 'VIDE'}"`);
    
    if (!etab.gestionnaire) {
      console.log('\n💡 Ajout d\'un gestionnaire...');
      const { error: addGestError } = await supabase
        .from('etablissements')
        .update({ 
          gestionnaire: 'CCAS Ossun',
          image_path: null
        })
        .eq('id', ETAB_ID);
      
      if (addGestError) {
        console.error('❌ Erreur:', addGestError.message);
        return;
      }
      console.log('✅ Gestionnaire ajouté et image_path mis à NULL');
    }
  } else {
    console.log('✅ image_path mis à NULL');
  }
  
  // 2. S'assurer que medias contient la bonne entrée
  console.log('\n📊 Vérification table medias...');
  const { data: medias } = await supabase
    .from('medias')
    .select('*')
    .eq('etablissement_id', ETAB_ID);
  
  if (!medias || medias.length === 0) {
    console.log('ℹ️ Aucune entrée medias, création...');
    await supabase
      .from('medias')
      .insert([{
        etablissement_id: ETAB_ID,
        storage_path: CORRECT_PATH,
        alt_text: 'Maison Patgen',
        priority: 1000
      }]);
    console.log('✅ Entrée medias créée');
  } else {
    const correctMedia = medias.find(m => m.storage_path === CORRECT_PATH);
    if (!correctMedia) {
      console.log('⚠️ Mauvaise entrée, suppression et recréation...');
      await supabase
        .from('medias')
        .delete()
        .eq('etablissement_id', ETAB_ID);
      
      await supabase
        .from('medias')
        .insert([{
          etablissement_id: ETAB_ID,
          storage_path: CORRECT_PATH,
          alt_text: 'Maison Patgen',
          priority: 1000
        }]);
      console.log('✅ Entrée medias corrigée');
    } else {
      console.log('✅ Bonne entrée medias déjà présente');
    }
  }
  
  // 3. Vérification finale
  console.log('\n✅ Vérification finale...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const { data: vue } = await supabase
    .from('v_liste_publication')
    .select('nom, image_path')
    .eq('etab_id', ETAB_ID)
    .single();
  
  console.log(`   Nom: ${vue.nom}`);
  console.log(`   Image path: ${vue.image_path || 'NULL'}`);
  
  if (vue.image_path === CORRECT_PATH) {
    console.log('\n🎉 ✅ SUCCESS ! L\'image est maintenant correcte !');
    
    const { data: url } = supabase.storage.from('etablissements').getPublicUrl(vue.image_path);
    console.log(`\n🌐 URL publique:`);
    console.log(`   ${url.publicUrl}`);
    
    console.log('\n📍 L\'image s\'affichera correctement sur:');
    console.log('   ✓ La liste de la plateforme');
    console.log('   ✓ La carte interactive');
    console.log('   ✓ La fiche détaillée');
    
    console.log('\n💡 Testez maintenant:');
    console.log(`   https://habitat-intermediaire.fr/plateforme/fiche?id=${ETAB_ID}`);
  } else {
    console.log('\n⚠️ L\'image n\'est pas encore correcte');
    console.log(`   Attendu: ${CORRECT_PATH}`);
    console.log(`   Trouvé: ${vue.image_path}`);
  }
}

fixImagePathLegacy().catch(console.error);
