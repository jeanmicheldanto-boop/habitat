const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

const ETAB_ID = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';

async function forceRefresh() {
  console.log('\n🔧 Tentative de forcer le rafraîchissement...\n');
  
  // 1. Supprimer toutes les entrées medias
  console.log('🗑️ Suppression toutes entrées...');
  await supabase
    .from('medias')
    .delete()
    .eq('etablissement_id', ETAB_ID);
  
  console.log('✅ Supprimées');
  
  // 2. Vérifier que la vue est vide
  console.log('\n📊 Vérification vue vide...');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const { data: check1 } = await supabase
    .from('v_liste_publication')
    .select('image_path')
    .eq('etab_id', ETAB_ID)
    .single();
  
  console.log(`   Image path: ${check1?.image_path || 'NULL'}`);
  
  // 3. Réinsérer avec un nouveau path
  console.log('\n➕ Réinsertion...');
  const CORRECT_PATH = 'a1a02ce0-f95a-4dd1-a181-d0df29b5a94f/main.jpg';
  
  const { data: newMedia } = await supabase
    .from('medias')
    .insert([{
      etablissement_id: ETAB_ID,
      storage_path: CORRECT_PATH,
      alt_text: 'Maison Patgen',
      priority: 2000 // Très haute priorité
    }])
    .select()
    .single();
  
  console.log(`✅ Créé: ${newMedia.id}`);
  
  // 4. Attendre et re-vérifier
  console.log('\n⏳ Attente 2 secondes...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\n📊 Vérification finale...');
  const { data: check2 } = await supabase
    .from('v_liste_publication')
    .select('nom, image_path')
    .eq('etab_id', ETAB_ID)
    .single();
  
  console.log(`   Nom: ${check2.nom}`);
  console.log(`   Image path: ${check2.image_path || 'NULL'}`);
  
  if (check2.image_path === CORRECT_PATH) {
    console.log('\n🎉 ✅ SUCCESS! L\'image est maintenant corrigée!');
    
    const { data: url } = supabase.storage.from('etablissements').getPublicUrl(check2.image_path);
    console.log(`\n🌐 URL: ${url.publicUrl}`);
  } else if (check2.image_path === null) {
    console.log('\n⚠️ Image NULL - cache pas encore rafraîchi');
    console.log('💡 Réessayez dans quelques secondes');
  } else {
    console.log('\n⚠️ Toujours l\'ancien chemin');
    console.log(`   Attendu: ${CORRECT_PATH}`);
    console.log(`   Trouvé: ${check2.image_path}`);
    console.log('\n🔍 Vérification table medias:');
    
    const { data: allMedias } = await supabase
      .from('medias')
      .select('*')
      .eq('etablissement_id', ETAB_ID);
    
    console.log(`   ${allMedias?.length || 0} entrée(s)`);
    allMedias?.forEach(m => {
      console.log(`     - ${m.storage_path} (priority: ${m.priority})`);
    });
  }
}

forceRefresh().catch(console.error);
