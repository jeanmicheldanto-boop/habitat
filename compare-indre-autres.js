const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Mzc5MDcsImV4cCI6MjA3NDMxMzkwN30.PWbq0NaB8ZyBIR5XgSn2pD_VoiH9eMjyjUYvvLmA3ng'
);

async function compareDepartements() {
  console.log('\n=== COMPARAISON INDRE VS AUTRES DÉPARTEMENTS ===\n');

  // 1. Récupérer un établissement de l'Indre
  const { data: indreData } = await supabase
    .from('v_liste_publication_geoloc')
    .select('*')
    .ilike('departement', '%Indre%')
    .limit(1);

  // 2. Récupérer un établissement d'un autre département qui fonctionne
  const { data: autreData } = await supabase
    .from('v_liste_publication_geoloc')
    .select('*')
    .ilike('departement', '%Aude%')
    .limit(1);

  if (indreData && indreData.length > 0 && autreData && autreData.length > 0) {
    const indre = indreData[0];
    const autre = autreData[0];

    console.log('🔍 ÉTABLISSEMENT INDRE:');
    console.log('Nom:', indre.nom);
    console.log('Département:', JSON.stringify(indre.departement));
    console.log('Type département:', typeof indre.departement);
    console.log('Longueur:', indre.departement?.length);
    console.log('Hex:', indre.departement ? Buffer.from(indre.departement).toString('hex') : 'null');
    
    console.log('\n🔍 ÉTABLISSEMENT AUDE (qui fonctionne):');
    console.log('Nom:', autre.nom);
    console.log('Département:', JSON.stringify(autre.departement));
    console.log('Type département:', typeof autre.departement);
    console.log('Longueur:', autre.departement?.length);
    console.log('Hex:', autre.departement ? Buffer.from(autre.departement).toString('hex') : 'null');

    console.log('\n⚖️  DIFFÉRENCES:');
    console.log('Départements identiques?', indre.departement === autre.departement);
    console.log('Format similaire?', /^[^(]+\s*\(\d+\)$/.test(indre.departement) && /^[^(]+\s*\(\d+\)$/.test(autre.departement));
    
    // Vérifier les champs qui pourraient affecter l'affichage
    console.log('\n📊 AUTRES CHAMPS CRITIQUES:');
    console.log('\nINDRE:');
    console.log('- statut_publication:', indre.statut_publication);
    console.log('- habitat_type:', indre.habitat_type);
    console.log('- sous_categories:', indre.sous_categories);
    console.log('- eligibilite_statut:', indre.eligibilite_statut);
    console.log('- geom:', indre.geom ? 'OUI' : 'NON');
    console.log('- latitude:', indre.latitude);
    console.log('- longitude:', indre.longitude);

    console.log('\nAUDE:');
    console.log('- statut_publication:', autre.statut_publication);
    console.log('- habitat_type:', autre.habitat_type);
    console.log('- sous_categories:', autre.sous_categories);
    console.log('- eligibilite_statut:', autre.eligibilite_statut);
    console.log('- geom:', autre.geom ? 'OUI' : 'NON');
    console.log('- latitude:', autre.latitude);
    console.log('- longitude:', autre.longitude);
  }

  // 3. Compter les établissements par département
  console.log('\n\n📈 NOMBRE D\'ÉTABLISSEMENTS PAR DÉPARTEMENT:\n');
  
  const { data: allData } = await supabase
    .from('v_liste_publication_geoloc')
    .select('departement');

  if (allData) {
    const counts = {};
    allData.forEach(row => {
      const dept = row.departement;
      counts[dept] = (counts[dept] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    
    console.log('Top 10:');
    sorted.slice(0, 10).forEach(([dept, count]) => {
      console.log(`  ${dept}: ${count} établissement(s)`);
    });

    const indreCount = Object.entries(counts).find(([dept]) => dept.includes('Indre'));
    if (indreCount) {
      console.log(`\n⭐ Indre: ${indreCount[1]} établissement(s)`);
    }
  }
}

compareDepartements().then(() => {
  console.log('\n=== FIN DE LA COMPARAISON ===\n');
  process.exit(0);
}).catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
