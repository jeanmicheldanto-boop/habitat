const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function testPatgenAfterFix() {
  const ETAB_ID = '76a5f008-7f5c-44e6-a405-2c54f9cb2fa7';
  
  console.log('\n🧪 TEST POST-CORRECTION - Maison Patgen\n');
  console.log('='.repeat(80));
  
  // 1. Table medias
  console.log('\n📷 Table medias:');
  const { data: medias } = await supabase
    .from('medias')
    .select('storage_path, priority')
    .eq('etablissement_id', ETAB_ID);
  
  if (medias && medias.length > 0) {
    medias.forEach(m => {
      console.log(`   storage_path: ${m.storage_path}`);
      console.log(`   priority: ${m.priority}`);
      
      // Vérifier le préfixe
      if (m.storage_path.startsWith('etablissements/') || m.storage_path.startsWith('medias/')) {
        console.log('   ✅ Préfixe correct');
      } else {
        console.log('   ❌ Préfixe manquant');
      }
      
      // Construire l'URL
      const url = `https://minwoumfgutampcgrcbr.supabase.co/storage/v1/object/public/${m.storage_path}`;
      console.log(`   🔗 URL: ${url}`);
    });
  }
  
  // 2. Vue v_liste_publication
  console.log('\n\n📊 Vue v_liste_publication:');
  const { data: vue } = await supabase
    .from('v_liste_publication')
    .select('nom, image_path')
    .eq('etab_id', ETAB_ID)
    .single();
  
  if (vue) {
    console.log(`   Nom: ${vue.nom}`);
    console.log(`   image_path: ${vue.image_path || '❌ NULL'}`);
    
    if (vue.image_path) {
      const url = `https://minwoumfgutampcgrcbr.supabase.co/storage/v1/object/public/${vue.image_path}`;
      console.log(`   🔗 URL finale: ${url}`);
      
      // Test rapide de l'URL
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          console.log('   ✅ Image accessible (200 OK)');
        } else {
          console.log(`   ❌ Image non accessible (${response.status})`);
        }
      } catch (error) {
        console.log(`   ❌ Erreur réseau: ${error.message}`);
      }
    } else {
      console.log('   ⚠️  La vue retourne NULL - vérifier la requête SQL de la vue');
    }
  }
  
  // 3. Table etablissements
  console.log('\n\n🏠 Table etablissements:');
  const { data: etab } = await supabase
    .from('etablissements')
    .select('nom, image_path, gestionnaire')
    .eq('id', ETAB_ID)
    .single();
  
  if (etab) {
    console.log(`   Nom: ${etab.nom}`);
    console.log(`   image_path: ${etab.image_path || '✅ NULL (correct)'}`);
    console.log(`   gestionnaire: ${etab.gestionnaire || '❌ NULL'}`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n💡 RÉSULTAT:');
  
  if (vue && vue.image_path && (vue.image_path.startsWith('etablissements/') || vue.image_path.startsWith('medias/'))) {
    console.log('   ✅ L\'image devrait maintenant s\'afficher sur la carte et la fiche !');
  } else if (!vue || !vue.image_path) {
    console.log('   ❌ La vue retourne toujours NULL');
    console.log('   → Il faut peut-être rafraîchir la vue ou corriger le storage_path');
  } else {
    console.log('   ⚠️  Le chemin n\'a toujours pas de préfixe');
    console.log('   → Exécuter le script SQL fix-patgen-storage-path.sql');
  }
}

testPatgenAfterFix().catch(console.error);
