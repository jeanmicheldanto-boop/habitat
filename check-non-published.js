const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function checkNonPublishedEtablissements() {
  console.log('🔍 Recherche des établissements NON PUBLIÉS...\n');

  // Tous les établissements qui ne sont pas publiés
  const { data: nonPublished, error } = await supabase
    .from('etablissements')
    .select('*')
    .neq('statut_editorial', 'publie')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log(`📊 Total établissements NON PUBLIÉS (20 derniers): ${nonPublished?.length || 0}\n`);

  if (nonPublished && nonPublished.length > 0) {
    for (const etab of nonPublished) {
      console.log(`\n🏠 ${etab.nom}`);
      console.log(`   ID: ${etab.id}`);
      console.log(`   Commune: ${etab.commune || 'N/A'}`);
      console.log(`   Statut éditorial: ${etab.statut_editorial}`);
      console.log(`   Habitat type: ${etab.habitat_type || 'N/A'}`);
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
        console.log(`   ⚠️  Aucune sous-catégorie`);
      }
    }
  }

  // Vérifier spécifiquement les établissements à Ossun non publiés
  console.log('\n\n🔍 Établissements à Ossun NON PUBLIÉS...\n');
  
  const { data: ossunNonPublished } = await supabase
    .from('etablissements')
    .select('*')
    .ilike('commune', '%ossun%')
    .neq('statut_editorial', 'publie')
    .order('created_at', { ascending: false });

  if (ossunNonPublished && ossunNonPublished.length > 0) {
    console.log(`📊 ${ossunNonPublished.length} établissement(s) à Ossun non publié(s):\n`);
    
    for (const etab of ossunNonPublished) {
      console.log(`\n🏠 ${etab.nom}`);
      console.log(`   ID: ${etab.id}`);
      console.log(`   Statut: ${etab.statut_editorial}`);
      console.log(`   Habitat type: ${etab.habitat_type}`);
      console.log(`   Géolocalisation: ${etab.geom ? '✅ OUI' : '❌ NON'}`);
      console.log(`   Créé le: ${new Date(etab.created_at).toLocaleString('fr-FR')}`);
    }
  } else {
    console.log('✅ Aucun établissement à Ossun non publié');
  }
}

checkNonPublishedEtablissements().catch(console.error);
