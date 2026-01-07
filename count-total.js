const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Mzc5MDcsImV4cCI6MjA3NDMxMzkwN30.PWbq0NaB8ZyBIR5XgSn2pD_VoiH9eMjyjUYvvLmA3ng'
);

async function countTotal() {
  // Compter le total sans limite
  const { count } = await supabase
    .from('v_liste_publication_geoloc')
    .select('*', { count: 'exact', head: true });

  console.log(`\nTotal établissements dans v_liste_publication_geoloc: ${count}`);

  // Vérifier si l'Indre est accessible sans limite
  const { data: allData } = await supabase
    .from('v_liste_publication_geoloc')
    .select('departement, nom');

  const indre = allData?.filter(e => e.departement?.includes('Indre'));
  console.log(`Établissements Indre trouvés: ${indre?.length || 0}`);
  
  if (indre && indre.length > 0) {
    console.log('\nExemples Indre:');
    indre.slice(0, 3).forEach(e => console.log(`- ${e.nom} (${e.departement})`));
  }
}

countTotal().then(() => process.exit(0)).catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
