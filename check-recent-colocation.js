const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function checkRecentEtablissements() {
  console.log('🔍 Recherche des établissements récents (dernières 24h)...\n');

  // Date il y a 24h
  const yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - 24);

  // 1. Tous les établissements créés récemment
  const { data: recent, error: err1 } = await supabase
    .from('etablissements')
    .select('*')
    .gte('created_at', yesterday.toISOString())
    .order('created_at', { ascending: false });

  if (err1) {
    console.error('❌ Erreur:', err1);
    return;
  }

  console.log(`📊 Total établissements créés dans les dernières 24h: ${recent?.length || 0}\n`);

  if (recent && recent.length > 0) {
    for (const etab of recent) {
      console.log(`\n🏠 ${etab.nom}`);
      console.log(`   ID: ${etab.id}`);
      console.log(`   Commune: ${etab.commune}`);
      console.log(`   Statut éditorial: ${etab.statut_editorial}`);
      console.log(`   Habitat type: ${etab.habitat_type}`);
      console.log(`   Géolocalisation: ${etab.geom ? '✅ OUI' : '❌ NON'}`);
      console.log(`   Créé le: ${new Date(etab.created_at).toLocaleString('fr-FR')}`);

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
        console.log(`   ❌ Aucune sous-catégorie`);
      }
    }
  }

  // 2. Chercher spécifiquement une colocation
  console.log('\n\n🔍 Recherche spécifique "colocation"...\n');
  
  const { data: colocation, error: err2 } = await supabase
    .from('etablissements')
    .select('*')
    .ilike('nom', '%colocation%')
    .order('created_at', { ascending: false });

  if (colocation && colocation.length > 0) {
    console.log(`📊 ${colocation.length} établissement(s) avec "colocation" dans le nom:\n`);
    
    for (const etab of colocation) {
      console.log(`\n🏠 ${etab.nom}`);
      console.log(`   ID: ${etab.id}`);
      console.log(`   Statut éditorial: ${etab.statut_editorial}`);
      console.log(`   Géolocalisation: ${etab.geom ? '✅ OUI' : '❌ NON'}`);
      console.log(`   Créé le: ${new Date(etab.created_at).toLocaleString('fr-FR')}`);
    }
  } else {
    console.log('❌ Aucun établissement avec "colocation" dans le nom');
  }

  // 3. Vérifier dans sous_categories
  console.log('\n\n🏷️ Vérification de la sous-catégorie "colocation_avec_services"...\n');
  
  const { data: scColoc } = await supabase
    .from('sous_categories')
    .select('*')
    .ilike('libelle', '%colocation%');

  if (scColoc && scColoc.length > 0) {
    console.log('Sous-catégories trouvées:');
    scColoc.forEach(sc => {
      console.log(`  - ${sc.libelle} (ID: ${sc.id})`);
    });

    // Chercher les établissements avec cette sous-catégorie
    for (const sc of scColoc) {
      const { data: etabs } = await supabase
        .from('etablissement_sous_categorie')
        .select('etablissement_id, etablissements(nom, statut_editorial, commune)')
        .eq('sous_categorie_id', sc.id);

      if (etabs && etabs.length > 0) {
        console.log(`\n  Établissements avec "${sc.libelle}":`);
        etabs.forEach(e => {
          console.log(`    - ${e.etablissements?.nom} (${e.etablissements?.commune}) - ${e.etablissements?.statut_editorial}`);
        });
      }
    }
  }
}

checkRecentEtablissements().catch(console.error);
