const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Mzc5MDcsImV4cCI6MjA3NDMxMzkwN30.PWbq0NaB8ZyBIR5XgSn2pD_VoiH9eMjyjUYvvLmA3ng'
);

async function checkIndrePublication() {
  console.log('\n=== VÉRIFICATION INDRE DANS ETABLISSEMENTS ===\n');

  // Dans la table etablissements
  const { data: etabData } = await supabase
    .from('etablissements')
    .select('id, nom, commune, departement')
    .ilike('departement', '%Indre%');

  console.log(`Établissements Indre dans table etablissements: ${etabData?.length || 0}`);
  
  if (etabData && etabData.length > 0) {
    console.log('\nListe:');
    etabData.forEach(e => {
      console.log(`- ${e.nom} (${e.commune}, ${e.departement})`);
    });

    // Vérifier si ces établissements sont dans la vue de publication
    console.log('\n\n=== VÉRIFICATION DANS v_liste_publication_geoloc ===\n');
    
    for (const etab of etabData) {
      const { data: inView } = await supabase
        .from('v_liste_publication_geoloc')
        .select('etab_id, nom, departement')
        .eq('etab_id', etab.id);

      if (inView && inView.length > 0) {
        console.log(`✅ ${etab.nom}: PRÉSENT dans la vue`);
        console.log(`   Département dans la vue: "${inView[0].departement}"`);
      } else {
        console.log(`❌ ${etab.nom}: ABSENT de la vue`);
      }
    }
  }

  // Vérifier la définition de la vue (voir quels critères filtrent)
  console.log('\n\n=== HYPOTHÈSES SUR L\'ABSENCE ===\n');
  console.log('La vue v_liste_publication_geoloc filtre probablement sur:');
  console.log('- statut_publication (doit être publié)');
  console.log('- ou autres critères de validation');
  console.log('\nVérifiez le fichier supabase/schema.sql pour voir la définition de la vue.');
}

checkIndrePublication().then(() => process.exit(0)).catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
