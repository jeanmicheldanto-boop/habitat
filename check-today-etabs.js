const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function checkTodayEtablissements() {
  console.log('🔍 Recherche de TOUS les établissements créés AUJOURD\'HUI (7 janvier 2026)...\n');

  // Date du début de la journée
  const today = new Date('2026-01-07T00:00:00Z');

  const { data: todayEtabs, error } = await supabase
    .from('etablissements')
    .select('*')
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log(`📊 Total établissements créés aujourd'hui: ${todayEtabs?.length || 0}\n`);

  if (todayEtabs && todayEtabs.length > 0) {
    for (const etab of todayEtabs) {
      console.log(`\n🏠 ${etab.nom}`);
      console.log(`   ID: ${etab.id}`);
      console.log(`   Commune: ${etab.commune || 'N/A'}`);
      console.log(`   Statut éditorial: ${etab.statut_editorial}`);
      console.log(`   Habitat type: ${etab.habitat_type || 'N/A'}`);
      console.log(`   Géolocalisation: ${etab.geom ? '✅ OUI' : '❌ NON'}`);
      console.log(`   Créé à: ${new Date(etab.created_at).toLocaleString('fr-FR')}`);
      console.log(`   Mis à jour: ${new Date(etab.updated_at).toLocaleString('fr-FR')}`);

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
      const { data: inView } = await supabase
        .from('v_liste_publication_geoloc')
        .select('etab_id')
        .eq('etab_id', etab.id)
        .single();

      console.log(`   Dans v_liste_publication_geoloc: ${inView ? '✅ OUI' : '❌ NON'}`);
    }
  } else {
    console.log('❌ Aucun établissement créé aujourd\'hui (7 janvier 2026)');
  }

  // Vérifier aussi les propositions en attente
  console.log('\n\n📋 Vérification des PROPOSITIONS en attente...\n');

  const { data: propositions } = await supabase
    .from('propositions')
    .select('*')
    .eq('statut', 'en_attente')
    .order('created_at', { ascending: false })
    .limit(10);

  if (propositions && propositions.length > 0) {
    console.log(`📊 ${propositions.length} proposition(s) en attente:\n`);
    
    for (const prop of propositions) {
      console.log(`\n📝 Proposition ID: ${prop.id}`);
      console.log(`   Type: ${prop.type_proposition}`);
      console.log(`   Établissement ID: ${prop.etablissement_id || 'N/A'}`);
      console.log(`   Créée le: ${new Date(prop.created_at).toLocaleString('fr-FR')}`);
      
      if (prop.donnees_proposition) {
        const donneesStr = JSON.stringify(prop.donnees_proposition, null, 2);
        console.log(`   Données: ${donneesStr.substring(0, 500)}...`);
      } else {
        console.log(`   Données: N/A`);
      }
    }
  } else {
    console.log('✅ Aucune proposition en attente');
  }
}

checkTodayEtablissements().catch(console.error);
