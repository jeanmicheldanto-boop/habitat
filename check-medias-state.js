const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

const ETAB_ID = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';

async function checkMediasState() {
  console.log('\n🔍 Vérification complète...\n');
  
  // 1. Toutes les entrées medias pour cet établissement
  console.log('📊 Table medias:');
  const { data: medias } = await supabase
    .from('medias')
    .select('*')
    .eq('etablissement_id', ETAB_ID)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });
  
  if (medias && medias.length > 0) {
    console.log(`✅ ${medias.length} entrée(s):`);
    medias.forEach((m, i) => {
      console.log(`\n   ${i + 1}. ID: ${m.id}`);
      console.log(`      Path: ${m.storage_path}`);
      console.log(`      Priority: ${m.priority}`);
      console.log(`      Created: ${m.created_at}`);
    });
  } else {
    console.log('❌ Aucune entrée');
  }
  
  // 2. Vue v_liste_publication
  console.log('\n\n📋 Vue v_liste_publication:');
  const { data: vue } = await supabase
    .from('v_liste_publication')
    .select('nom, image_path')
    .eq('etab_id', ETAB_ID)
    .single();
  
  if (vue) {
    console.log(`   Nom: ${vue.nom}`);
    console.log(`   Image path: ${vue.image_path || 'NULL'}`);
  }
  
  // 3. Table etablissements (legacy image_path)
  console.log('\n\n📊 Table etablissements:');
  const { data: etab } = await supabase
    .from('etablissements')
    .select('nom, image_path')
    .eq('id', ETAB_ID)
    .single();
  
  if (etab) {
    console.log(`   Nom: ${etab.nom}`);
    console.log(`   Image path (legacy): ${etab.image_path || 'NULL'}`);
  }
}

checkMediasState().catch(console.error);
