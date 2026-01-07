const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function checkRecentUpdates() {
  console.log('🔍 Recherche des établissements MIS À JOUR récemment (dernières 2h)...\n');

  // Date il y a 2 heures
  const twoHoursAgo = new Date();
  twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

  const { data: recentUpdates, error } = await supabase
    .from('etablissements')
    .select('*')
    .gte('updated_at', twoHoursAgo.toISOString())
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log(`📊 Total établissements mis à jour dans les 2 dernières heures: ${recentUpdates?.length || 0}\n`);

  if (recentUpdates && recentUpdates.length > 0) {
    for (const etab of recentUpdates) {
      console.log(`\n🏠 ${etab.nom}`);
      console.log(`   ID: ${etab.id}`);
      console.log(`   Commune: ${etab.commune || 'N/A'}`);
      console.log(`   Statut éditorial: ${etab.statut_editorial}`);
      console.log(`   Habitat type: ${etab.habitat_type || 'N/A'}`);
      console.log(`   Géolocalisation: ${etab.geom ? '✅ OUI' : '❌ NON'}`);
      console.log(`   Créé le: ${new Date(etab.created_at).toLocaleString('fr-FR')}`);
      console.log(`   ⭐ Mis à jour: ${new Date(etab.updated_at).toLocaleString('fr-FR')}`);

      // Vérifier les sous-catégories
      const { data: sousCategories } = await supabase
        .from('etablissement_sous_categorie')
        .select('sous_categorie_id, sous_categories(libelle)')
        .eq('etablissement_id', etab.id);

      if (sousCategories && sousCategories.length > 0) {
        console.log(`   Sous-catégories:`);
        sousCategories.forEach(sc => {
          console.log(`     - ${sc.sous_categories?.libelle || 'N/A'}`);
        });
      } else {
        console.log(`   ⚠️  Aucune sous-catégorie`);
      }

      // Vérifier si dans la vue
      const { data: inView, error: viewError } = await supabase
        .from('v_liste_publication_geoloc')
        .select('etab_id, latitude, longitude')
        .eq('etab_id', etab.id)
        .maybeSingle();

      if (viewError) {
        console.log(`   ❌ Erreur vue: ${viewError.message}`);
      } else if (inView) {
        console.log(`   ✅ Dans v_liste_publication_geoloc (Lat: ${inView.latitude}, Lng: ${inView.longitude})`);
      } else {
        console.log(`   ❌ PAS dans v_liste_publication_geoloc`);
        
        // Diagnostiquer pourquoi
        if (!etab.geom) {
          console.log(`      → Raison: Pas de géolocalisation`);
        } else if (etab.statut_editorial !== 'publie') {
          console.log(`      → Raison: Statut != 'publie' (actuel: ${etab.statut_editorial})`);
        }
      }
    }
  } else {
    console.log('❌ Aucun établissement mis à jour dans les 2 dernières heures');
  }

  // Chercher spécifiquement à Ossun
  console.log('\n\n🔍 Tous les établissements à Ossun (peu importe la date)...\n');
  
  const { data: ossun } = await supabase
    .from('etablissements')
    .select('id, nom, statut_editorial, geom, created_at, updated_at')
    .ilike('commune', '%ossun%')
    .order('updated_at', { ascending: false });

  if (ossun && ossun.length > 0) {
    console.log(`📊 ${ossun.length} établissement(s) à Ossun:\n`);
    
    for (const etab of ossun) {
      const inView = await supabase
        .from('v_liste_publication_geoloc')
        .select('etab_id')
        .eq('etab_id', etab.id)
        .maybeSingle();

      console.log(`${inView.data ? '✅' : '❌'} ${etab.nom}`);
      console.log(`   Statut: ${etab.statut_editorial}, Géo: ${etab.geom ? 'OUI' : 'NON'}`);
      console.log(`   Mis à jour: ${new Date(etab.updated_at).toLocaleString('fr-FR')}`);
    }
  }
}

checkRecentUpdates().catch(console.error);
