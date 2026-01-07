const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Mzc5MDcsImV4cCI6MjA3NDMxMzkwN30.PWbq0NaB8ZyBIR5XgSn2pD_VoiH9eMjyjUYvvLmA3ng'
);

async function debugIndre() {
  console.log('\n=== DEBUG INDRE ===\n');

  // Récupérer TOUS les établissements sans limite
  const { data: allData } = await supabase
    .from('v_liste_publication_geoloc')
    .select('etab_id, nom, departement');

  console.log(`Total établissements récupérés: ${allData?.length || 0}`);

  // Chercher l'Indre
  const indreEtabs = allData?.filter(e => 
    e.departement && e.departement.includes('Indre')
  );

  console.log(`\nÉtablissements avec "Indre" dans le département: ${indreEtabs?.length || 0}`);
  
  if (indreEtabs && indreEtabs.length > 0) {
    console.log('\nExemples:');
    indreEtabs.slice(0, 3).forEach(e => {
      console.log(`- ${e.nom}`);
      console.log(`  Département: "${e.departement}"`);
      
      // Tester l'extraction du code
      const match = e.departement.match(/\((\d{1,3}[AB]?)\)/);
      console.log(`  Code extrait: "${match?.[1] || 'AUCUN'}"`);
      console.log(`  Match avec "36"? ${match?.[1] === "36"}`);
    });
  }

  // Compter combien d'établissements on a par département
  console.log('\n\n=== COMPTAGE PAR DÉPARTEMENT (top 10) ===\n');
  const counts = {};
  allData?.forEach(e => {
    if (e.departement) {
      counts[e.departement] = (counts[e.departement] || 0) + 1;
    }
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  sorted.slice(0, 10).forEach(([dept, count]) => {
    console.log(`${dept}: ${count}`);
  });

  const indreEntry = sorted.find(([dept]) => dept.includes('Indre'));
  if (indreEntry) {
    console.log(`\n⭐ ${indreEntry[0]}: ${indreEntry[1]}`);
  }
}

debugIndre().then(() => {
  console.log('\n=== FIN DEBUG ===\n');
  process.exit(0);
}).catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
