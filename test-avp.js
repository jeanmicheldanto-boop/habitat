const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAvpData() {
  console.log('🔍 Test des données AVP...\n');
  
  // Test 1: Combien d'établissements ont un eligibilite_statut ?
  const { data: all, error: allError } = await supabase
    .from('v_liste_publication_geoloc')
    .select('etab_id, nom, eligibilite_statut')
    .not('eligibilite_statut', 'is', null)
    .limit(10);
  
  if (allError) {
    console.error('❌ Erreur:', allError);
    return;
  }
  
  console.log(`✅ Trouvé ${all.length} établissements avec eligibilite_statut`);
  
  if (all.length > 0) {
    console.log('\n📋 Exemples de données:');
    all.forEach((etab, idx) => {
      console.log(`${idx + 1}. ${etab.nom} - Status: "${etab.eligibilite_statut}"`);
    });
    
    // Test 2: Compter par type
    const statuts = all.reduce((acc, etab) => {
      acc[etab.eligibilite_statut] = (acc[etab.eligibilite_statut] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 Répartition des statuts:');
    Object.entries(statuts).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count}`);
    });
  } else {
    console.log('⚠️ Aucun établissement avec eligibilite_statut trouvé');
  }
}

testAvpData().catch(console.error);