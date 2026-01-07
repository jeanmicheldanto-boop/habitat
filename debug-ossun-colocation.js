const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function debugOssunColocation() {
  console.log('🔍 Recherche des établissements à Ossun...\n');

  // 1. Chercher tous les établissements à Ossun
  const { data: allOssun, error: err1 } = await supabase
    .from('etablissements')
    .select('*')
    .ilike('commune', '%ossun%')
    .order('created_at', { ascending: false });

  if (err1) {
    console.error('❌ Erreur:', err1);
    return;
  }

  console.log(`📊 Total établissements à Ossun: ${allOssun?.length || 0}\n`);

  if (allOssun && allOssun.length > 0) {
    allOssun.forEach((etab, idx) => {
      console.log(`\n${idx + 1}. ${etab.nom}`);
      console.log(`   ID: ${etab.id}`);
      console.log(`   Statut éditorial: ${etab.statut_editorial}`);
      console.log(`   Habitat type: ${etab.habitat_type}`);
      console.log(`   Géolocalisation: ${etab.geom ? '✅ OUI' : '❌ NON'}`);
      console.log(`   Créé le: ${new Date(etab.created_at).toLocaleString('fr-FR')}`);
      console.log(`   Mis à jour: ${new Date(etab.updated_at).toLocaleString('fr-FR')}`);
    });
  }

  // 2. Chercher dans v_liste_publication_geoloc
  console.log('\n\n🗺️ Vérification dans la vue v_liste_publication_geoloc...\n');
  
  const { data: inView, error: err2 } = await supabase
    .from('v_liste_publication_geoloc')
    .select('etab_id, nom, commune, habitat_type, latitude, longitude')
    .ilike('commune', '%ossun%');

  if (err2) {
    console.error('❌ Erreur vue:', err2);
    return;
  }

  console.log(`📊 Établissements visibles dans la vue: ${inView?.length || 0}\n`);

  if (inView && inView.length > 0) {
    inView.forEach((etab, idx) => {
      console.log(`${idx + 1}. ${etab.nom} - ${etab.habitat_type} - Lat: ${etab.latitude}, Lng: ${etab.longitude}`);
    });
  }

  // 3. Chercher les sous-catégories associées
  console.log('\n\n🏷️ Vérification des sous-catégories...\n');

  for (const etab of allOssun || []) {
    const { data: sousCategories } = await supabase
      .from('etablissement_sous_categorie')
      .select('sous_categorie_id, sous_categories(libelle)')
      .eq('etablissement_id', etab.id);

    if (sousCategories && sousCategories.length > 0) {
      console.log(`\n${etab.nom}:`);
      sousCategories.forEach(sc => {
        console.log(`  - ${sc.sous_categories?.libelle || 'N/A'}`);
      });
    } else {
      console.log(`\n${etab.nom}: ❌ Aucune sous-catégorie`);
    }
  }
}

debugOssunColocation().catch(console.error);
