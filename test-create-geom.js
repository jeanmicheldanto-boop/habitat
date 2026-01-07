const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function testCreateWithGeom() {
  console.log('🧪 Test de création d\'établissement avec géolocalisation\n');

  const testData = {
    nom: 'TEST Colocation Ossun ' + Date.now(),
    commune: 'Ossun',
    code_postal: '65380',
    departement: 'Hautes-Pyrénées',
    habitat_type: 'habitat_partage',
    statut_editorial: 'publie',
    geom: `POINT(-0.022804 43.185971)` // Format PostGIS: POINT(longitude latitude)
  };

  console.log('📦 Données de test:', testData);

  // Essai 1: Insertion avec geom en string
  const { data: test1, error: error1 } = await supabase
    .from('etablissements')
    .insert([testData])
    .select()
    .single();

  if (error1) {
    console.log('\n❌ Erreur avec geom en string:');
    console.log('   Message:', error1.message);
    console.log('   Code:', error1.code);
    console.log('   Details:', error1.details);
  } else {
    console.log('\n✅ Succès avec geom en string!');
    console.log('   ID:', test1.id);
    console.log('   Nom:', test1.nom);
    console.log('   Geom:', test1.geom);
    
    // Vérifier si dans la vue
    const { data: inView } = await supabase
      .from('v_liste_publication_geoloc')
      .select('etab_id, nom, latitude, longitude')
      .eq('etab_id', test1.id)
      .single();
    
    if (inView) {
      console.log('   ✅ Dans v_liste_publication_geoloc!');
      console.log('      Lat:', inView.latitude, 'Lng:', inView.longitude);
    } else {
      console.log('   ❌ PAS dans v_liste_publication_geoloc');
    }
    
    // Supprimer le test
    await supabase
      .from('etablissements')
      .delete()
      .eq('id', test1.id);
    
    console.log('   🗑️ Établissement de test supprimé');
  }
}

testCreateWithGeom().catch(console.error);
