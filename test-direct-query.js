const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

const ETAB_ID = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';

async function testDirectQuery() {
  console.log('\n🔍 Test requête directe...\n');
  
  // 1. Requête directe sur medias
  console.log('📊 Table medias (requête directe):');
  const { data: medias } = await supabase
    .from('medias')
    .select('id, storage_path, priority, created_at')
    .eq('etablissement_id', ETAB_ID)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (medias && medias.length > 0) {
    const media = medias[0];
    console.log(`   ID: ${media.id}`);
    console.log(`   Path: ${media.storage_path}`);
    console.log(`   Priority: ${media.priority}`);
    console.log(`   Created: ${media.created_at}`);
  }
  
  // 2. Vue v_liste_publication
  console.log('\n📋 Vue v_liste_publication:');
  const { data: vue1 } = await supabase
    .from('v_liste_publication')
    .select('nom, image_path')
    .eq('etab_id', ETAB_ID)
    .single();
  
  if (vue1) {
    console.log(`   Image path: ${vue1.image_path || 'NULL'}`);
  }
  
  // 3. Vue v_liste_publication_geoloc
  console.log('\n🗺️ Vue v_liste_publication_geoloc:');
  const { data: vue2 } = await supabase
    .from('v_liste_publication_geoloc')
    .select('nom, image_path')
    .eq('etab_id', ETAB_ID)
    .single();
  
  if (vue2) {
    console.log(`   Image path: ${vue2.image_path || 'NULL'}`);
  }
  
  // 4. Résumé
  console.log('\n📊 Résumé:');
  if (medias && medias.length > 0) {
    const mediaPath = medias[0].storage_path;
    const vue1Path = vue1?.image_path || 'NULL';
    const vue2Path = vue2?.image_path || 'NULL';
    
    console.log(`   Medias: ${mediaPath}`);
    console.log(`   Vue 1:  ${vue1Path}`);
    console.log(`   Vue 2:  ${vue2Path}`);
    
    if (mediaPath === vue1Path && vue1Path === vue2Path) {
      console.log('\n✅ Toutes les sources concordent!');
      
      const { data: url } = supabase.storage.from('etablissements').getPublicUrl(mediaPath);
      console.log(`\n🌐 URL image:`);
      console.log(`   ${url.publicUrl}`);
      
      console.log('\n🎉 L\'image devrait maintenant s\'afficher correctement!');
    } else {
      console.log('\n⚠️ Incohérence détectée - possible cache de vue');
      console.log('\n💡 Solution: Attendre quelques minutes pour que le cache se rafraîchisse');
      console.log('   ou rafraîchir les vues via l\'interface admin');
    }
  }
}

testDirectQuery().catch(console.error);
