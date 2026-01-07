const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function checkEtabInView() {
  const etabId = 'ea60155a-e86e-4a1b-bb8c-4d81960c0a1d';

  console.log('🔍 Vérification établissement dans les vues\n');

  // 1. Table etablissements
  const { data: etab } = await supabase
    .from('etablissements')
    .select('id, nom, habitat_type, statut_editorial')
    .eq('id', etabId)
    .single();

  if (etab) {
    console.log('📊 Table etablissements:');
    console.log('   ID:', etab.id);
    console.log('   Nom:', etab.nom);
    console.log('   habitat_type:', etab.habitat_type);
    console.log('   statut_editorial:', etab.statut_editorial);
  }

  // 2. Sous-catégories liées
  const { data: links } = await supabase
    .from('etablissement_sous_categorie')
    .select('sous_categories(libelle, slug)')
    .eq('etablissement_id', etabId);

  if (links && links.length > 0) {
    console.log('\n🏷️ Sous-catégories liées:');
    links.forEach(link => {
      console.log(`   - ${link.sous_categories.libelle} [${link.sous_categories.slug}]`);
    });
  }

  // 3. Vue v_liste_publication
  const { data: inView } = await supabase
    .from('v_liste_publication')
    .select('etab_id, nom, habitat_type, sous_categories')
    .eq('etab_id', etabId)
    .single();

  if (inView) {
    console.log('\n📋 Vue v_liste_publication:');
    console.log('   habitat_type:', inView.habitat_type);
    console.log('   sous_categories:', inView.sous_categories);
  } else {
    console.log('\n❌ Pas dans v_liste_publication');
  }

  // 4. Vue v_liste_publication_geoloc
  const { data: inGeoView } = await supabase
    .from('v_liste_publication_geoloc')
    .select('etab_id, nom, habitat_type, sous_categories, latitude, longitude')
    .eq('etab_id', etabId)
    .single();

  if (inGeoView) {
    console.log('\n🗺️ Vue v_liste_publication_geoloc:');
    console.log('   habitat_type:', inGeoView.habitat_type);
    console.log('   sous_categories:', inGeoView.sous_categories);
    console.log('   Coords:', inGeoView.latitude, inGeoView.longitude);
  } else {
    console.log('\n❌ Pas dans v_liste_publication_geoloc');
  }
}

checkEtabInView().catch(console.error);
