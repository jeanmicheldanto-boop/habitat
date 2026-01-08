const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function checkPatgenMedias() {
  const ETAB_ID = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';
  
  console.log('\n🔍 ANALYSE TABLE MEDIAS POUR PATGEN\n');
  console.log('='.repeat(80));
  
  // 1. Vérifier la table medias
  console.log('\n📷 Entrées dans la table medias:');
  const { data: medias } = await supabase
    .from('medias')
    .select('*')
    .eq('etablissement_id', ETAB_ID);
  
  if (medias && medias.length > 0) {
    console.log(`   Trouvé ${medias.length} entrée(s):`);
    medias.forEach((m, i) => {
      console.log(`\n   ${i + 1}. Media ID: ${m.id}`);
      console.log(`      storage_path: ${m.storage_path}`);
      console.log(`      priority: ${m.priority}`);
      console.log(`      created_at: ${m.created_at}`);
      
      // Tester l'URL
      const url = `https://minwoumfgutampcgrcbr.supabase.co/storage/v1/object/public/${m.storage_path}`;
      console.log(`      URL complète: ${url}`);
    });
  } else {
    console.log('   ❌ Aucune entrée trouvée');
  }
  
  // 2. Vérifier la vue
  console.log('\n\n📊 Données de la vue v_liste_publication:');
  const { data: vueData } = await supabase
    .from('v_liste_publication')
    .select('nom, image_path, latitude, longitude')
    .eq('id', ETAB_ID)
    .single();
  
  if (vueData) {
    console.log(`   Nom: ${vueData.nom}`);
    console.log(`   image_path: ${vueData.image_path}`);
    console.log(`   Coordonnées: ${vueData.latitude}, ${vueData.longitude}`);
  }
  
  // 3. Vérifier la table etablissements
  console.log('\n\n🏠 Données de la table etablissements:');
  const { data: etab } = await supabase
    .from('etablissements')
    .select('nom, image_path, gestionnaire')
    .eq('id', ETAB_ID)
    .single();
  
  if (etab) {
    console.log(`   Nom: ${etab.nom}`);
    console.log(`   image_path: ${etab.image_path}`);
    console.log(`   gestionnaire: ${etab.gestionnaire || '❌ NULL'}`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n💡 DIAGNOSTIC:');
  
  if (!etab.gestionnaire) {
    console.log('   ⚠️  Le gestionnaire est vide - impossible de publier avec la contrainte');
  }
  
  if (etab.image_path === null && medias && medias.length > 0) {
    console.log('   ✅ Bonne configuration: image_path=null, medias table utilisée');
    console.log('   → La vue devrait utiliser medias.storage_path');
  } else if (etab.image_path) {
    console.log(`   ⚠️  image_path="${etab.image_path}" - la vue utilisera ça au lieu de medias`);
  }
  
  if (vueData && vueData.image_path) {
    console.log(`\n   La vue retourne: "${vueData.image_path}"`);
    
    // Déterminer le bucket
    if (vueData.image_path.startsWith('etablissements/')) {
      console.log('   ✅ Le chemin commence par "etablissements/" - URL correcte');
    } else if (vueData.image_path.startsWith('medias/')) {
      console.log('   ✅ Le chemin commence par "medias/" - URL correcte');
    } else {
      console.log('   ❌ Le chemin ne commence ni par "etablissements/" ni par "medias/"');
      console.log('   → Les fonctions d\'URL frontend ne pourront pas construire l\'URL correcte');
    }
  } else if (!vueData || !vueData.image_path) {
    console.log('\n   ⚠️  La vue retourne NULL pour image_path - fallback sera utilisé');
  }
}

checkPatgenMedias().catch(console.error);
