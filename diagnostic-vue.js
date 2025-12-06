// Diagnostic de la vue v_liste_publication_geoloc
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function diagnostic() {
  console.log('🔍 DIAGNOSTIC VUE v_liste_publication_geoloc\n');

  // 1. Compter dans la vue
  const { count: vueCount } = await supabase
    .from('v_liste_publication_geoloc')
    .select('*', { count: 'exact', head: true });
  console.log(`📊 Total dans la vue: ${vueCount}`);

  // 2. Comparer avec la table
  const { count: tableCount } = await supabase
    .from('etablissements')
    .select('*', { count: 'exact', head: true });
  console.log(`📊 Total dans la table: ${tableCount}`);
  console.log(`⚠️  Différence: ${tableCount - vueCount} établissements filtrés par la vue\n`);

  // 3. Départements dans la vue
  console.log('🗺️ Départements dans la vue:');
  const { data: vueDepts } = await supabase
    .from('v_liste_publication_geoloc')
    .select('departement');

  if (vueDepts) {
    const deptCounts = {};
    vueDepts.forEach(e => {
      const dept = e.departement || 'NULL';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });
    
    const sorted = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);
    sorted.slice(0, 10).forEach(([dept, count]) => {
      console.log(`  - ${dept}: ${count}`);
    });
  }

  // 4. Vérifier Finistère et Côtes-d'Armor
  console.log('\n🔍 Finistère et Côtes-d\'Armor dans la vue:');
  const { count: finVue } = await supabase
    .from('v_liste_publication_geoloc')
    .select('*', { count: 'exact', head: true })
    .ilike('departement', '%finistère%');
  console.log(`  - Finistère: ${finVue}`);

  const { count: cotesVue } = await supabase
    .from('v_liste_publication_geoloc')
    .select('*', { count: 'exact', head: true })
    .ilike('departement', '%côtes%');
  console.log(`  - Côtes-d'Armor: ${cotesVue}`);

  // 5. Vérifier les statuts éditoriaux dans la table
  console.log('\n📋 Statuts éditoriaux dans la table etablissements:');
  const { data: allStatuts } = await supabase
    .from('etablissements')
    .select('statut_editorial');

  if (allStatuts) {
    const statutCounts = {};
    allStatuts.forEach(e => {
      const s = e.statut_editorial || 'NULL';
      statutCounts[s] = (statutCounts[s] || 0) + 1;
    });
    
    Object.entries(statutCounts).sort((a, b) => b[1] - a[1]).forEach(([statut, count]) => {
      console.log(`  - "${statut}": ${count}`);
    });
  }

  // 6. Exemples d'établissements du Finistère dans la TABLE
  console.log('\n📄 Finistère dans la TABLE (3 exemples):');
  const { data: finTable } = await supabase
    .from('etablissements')
    .select('nom, commune, departement, statut_editorial')
    .ilike('departement', '%finistère%')
    .limit(3);

  finTable?.forEach((e, i) => {
    console.log(`  ${i + 1}. ${e.nom} - ${e.commune} - Statut: ${e.statut_editorial || 'NULL'}`);
  });

  // 7. Exemples d'établissements du Finistère dans la VUE
  console.log('\n📄 Finistère dans la VUE (3 exemples):');
  const { data: finVueEx } = await supabase
    .from('v_liste_publication_geoloc')
    .select('nom, commune, departement')
    .ilike('departement', '%finistère%')
    .limit(3);

  if (finVueEx && finVueEx.length > 0) {
    finVueEx.forEach((e, i) => {
      console.log(`  ${i + 1}. ${e.nom} - ${e.commune}`);
    });
  } else {
    console.log('  ❌ Aucun établissement du Finistère dans la vue !');
  }
}

diagnostic().catch(console.error);
