const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Mzc5MDcsImV4cCI6MjA3NDMxMzkwN30.PWbq0NaB8ZyBIR5XgSn2pD_VoiH9eMjyjUYvvLmA3ng'
);

async function testFiltering() {
  console.log('\n=== TEST DU FILTRAGE ACTUEL ===\n');

  // Récupérer tous les établissements
  const { data: allData } = await supabase
    .from('v_liste_publication_geoloc')
    .select('etab_id, nom, departement');

  if (!allData) {
    console.log('Aucune donnée récupérée');
    return;
  }

  console.log(`Total établissements: ${allData.length}\n`);

  // Simuler le filtre ANCIEN CODE
  function oldFilter(selectedDepartement, etabDepartement) {
    if (selectedDepartement && etabDepartement) {
      const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
      const isCode = /^[\d]{1,3}[AB]?$/.test(selectedDepartement);
      if (isCode) {
        if (etabDepartement !== selectedDepartement) return false;
      } else {
        if (!normalize(etabDepartement).includes(normalize(selectedDepartement))) return false;
      }
    }
    return true;
  }

  // Test avec le code "36" (Indre)
  console.log('🧪 TEST 1: Filtre avec code "36" (ANCIEN CODE)\n');
  const filtered36Old = allData.filter(e => oldFilter("36", e.departement));
  console.log(`Résultat: ${filtered36Old.length} établissements`);
  if (filtered36Old.length > 0) {
    console.log('✅ L\'ancien code fonctionne pour l\'Indre !');
  } else {
    console.log('❌ L\'ancien code NE fonctionne PAS pour l\'Indre');
    console.log('Exemple de département en base:', allData.find(e => e.departement?.includes('Indre'))?.departement);
  }

  // Test avec le code "11" (Aude)
  console.log('\n🧪 TEST 2: Filtre avec code "11" (ANCIEN CODE)\n');
  const filtered11Old = allData.filter(e => oldFilter("11", e.departement));
  console.log(`Résultat: ${filtered11Old.length} établissements`);
  if (filtered11Old.length > 0) {
    console.log('✅ L\'ancien code fonctionne pour l\'Aude !');
  } else {
    console.log('❌ L\'ancien code NE fonctionne PAS pour l\'Aude');
  }

  // Test avec le code "33" (Gironde)
  console.log('\n🧪 TEST 3: Filtre avec code "33" (ANCIEN CODE)\n');
  const filtered33Old = allData.filter(e => oldFilter("33", e.departement));
  console.log(`Résultat: ${filtered33Old.length} établissements`);
  
  // Simuler le filtre NOUVEAU CODE
  function newFilter(selectedDepartement, etabDepartement) {
    if (selectedDepartement && etabDepartement) {
      const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
      const isCode = /^[\d]{1,3}[AB]?$/.test(selectedDepartement);
      
      if (isCode) {
        const etabDeptCode = etabDepartement.match(/\((\d{1,3}[AB]?)\)/)?.[1] || etabDepartement;
        if (etabDeptCode !== selectedDepartement) return false;
      } else {
        const etabDeptName = etabDepartement.replace(/\s*\(\d{1,3}[AB]?\)\s*$/, '').trim();
        if (!normalize(etabDeptName).includes(normalize(selectedDepartement))) return false;
      }
    }
    return true;
  }

  console.log('\n\n🧪 TEST 4: Filtre avec code "36" (NOUVEAU CODE)\n');
  const filtered36New = allData.filter(e => newFilter("36", e.departement));
  console.log(`Résultat: ${filtered36New.length} établissements`);

  console.log('\n🧪 TEST 5: Filtre avec code "11" (NOUVEAU CODE)\n');
  const filtered11New = allData.filter(e => newFilter("11", e.departement));
  console.log(`Résultat: ${filtered11New.length} établissements`);

  console.log('\n\n=== COMPARAISON ===\n');
  console.log(`Indre (36)  - Ancien: ${filtered36Old.length} | Nouveau: ${filtered36New.length}`);
  console.log(`Aude (11)   - Ancien: ${filtered11Old.length} | Nouveau: ${filtered11New.length}`);
  console.log(`Gironde (33)- Ancien: ${filtered33Old.length} | Nouveau: ${filtered33Old.length} (pas testé nouveau)`);
}

testFiltering().then(() => {
  console.log('\n=== FIN DES TESTS ===\n');
  process.exit(0);
}).catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
