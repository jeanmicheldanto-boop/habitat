const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Mzc5MDcsImV4cCI6MjA3NDMxMzkwN30.PWbq0NaB8ZyBIR5XgSn2pD_VoiH9eMjyjUYvvLmA3ng'
);

async function checkIndre() {
  console.log('\n=== VÉRIFICATION DES DONNÉES DE L\'INDRE ===\n');

  // 1. Vérifier dans v_liste_publication_geoloc
  console.log('1. Recherche dans v_liste_publication_geoloc:');
  const { data: geolocData, error: geolocError } = await supabase
    .from('v_liste_publication_geoloc')
    .select('*')
    .or('departement.eq.36,departement.ilike.%Indre%');

  if (geolocError) {
    console.error('Erreur:', geolocError);
  } else {
    console.log(`Trouvé ${geolocData?.length || 0} établissements`);
    if (geolocData && geolocData.length > 0) {
      console.log('\nPremier établissement:');
      console.log(JSON.stringify(geolocData[0], null, 2));
    }
  }

  // 2. Vérifier dans la table etablissements
  console.log('\n2. Recherche dans la table etablissements:');
  const { data: etabData, error: etabError } = await supabase
    .from('etablissements')
    .select('id, nom, commune, departement, code_postal, statut_ouverture, statut_publication')
    .or('departement.eq.36,departement.ilike.%Indre%');

  if (etabError) {
    console.error('Erreur:', etabError);
  } else {
    console.log(`Trouvé ${etabData?.length || 0} établissements`);
    if (etabData && etabData.length > 0) {
      console.log('\nDétails:');
      etabData.forEach(e => {
        console.log(`- ${e.nom} (${e.commune}, ${e.departement})`);
        console.log(`  Statut ouverture: ${e.statut_ouverture}, Publication: ${e.statut_publication}`);
      });
    }
  }

  // 3. Vérifier tous les départements distincts
  console.log('\n3. Départements disponibles dans v_liste_publication_geoloc:');
  const { data: allDepts } = await supabase
    .from('v_liste_publication_geoloc')
    .select('departement');

  if (allDepts) {
    const uniqueDepts = [...new Set(allDepts.map(d => d.departement))].sort();
    console.log(`Total: ${uniqueDepts.length} départements`);
    console.log('Liste:', uniqueDepts.slice(0, 20).join(', '));
    
    const hasIndre = uniqueDepts.some(d => 
      d === '36' || 
      d === 'Indre' || 
      (typeof d === 'string' && d.toLowerCase().includes('indre'))
    );
    console.log(`\nL'Indre est-il présent? ${hasIndre ? 'OUI ✓' : 'NON ✗'}`);
  }
}

checkIndre().then(() => {
  console.log('\n=== FIN DE LA VÉRIFICATION ===\n');
  process.exit(0);
}).catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
