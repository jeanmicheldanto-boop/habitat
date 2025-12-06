// Script de diagnostic pour les établissements
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Lire .env.local manuellement
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
  console.log('🔍 DIAGNOSTIC ÉTABLISSEMENTS\n');

  // 0. Vérifier la structure de la table
  console.log('📋 Structure de la table:');
  const { data: sampleData } = await supabase
    .from('etablissements')
    .select('*')
    .limit(1);
  
  if (sampleData && sampleData.length > 0) {
    const cols = Object.keys(sampleData[0]);
    console.log('  Colonnes disponibles:', cols.join(', '));
    console.log('  Colonnes avec "stat" ou "ouvert":', cols.filter(k => k.includes('stat') || k.includes('ouvert')));
    console.log();
  }

  // 1. Compter tous les établissements
  const { count: total } = await supabase
    .from('etablissements')
    .select('*', { count: 'exact', head: true });
  console.log(`📊 Total établissements: ${total}`);

  // 2. Par département - Compter tous les départements
  console.log('\n🗺️ Départements présents:');
  const { data: allDepts } = await supabase
    .from('etablissements')
    .select('departement');

  if (allDepts) {
    const deptCounts = {};
    allDepts.forEach(e => {
      const dept = e.departement || 'NULL';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });
    
    // Trier par nombre décroissant
    const sorted = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);
    sorted.slice(0, 15).forEach(([dept, count]) => {
      console.log(`  - ${dept}: ${count}`);
    });
    
    if (sorted.length > 15) {
      console.log(`  ... et ${sorted.length - 15} autres départements`);
    }
  }

  // Vérifier spécifiquement Finistère et Côtes-d'Armor
  console.log('\n🔍 Recherche Finistère et Côtes-d\'Armor:');
  const { count: finistere29 } = await supabase
    .from('etablissements')
    .select('*', { count: 'exact', head: true })
    .eq('departement', '29');
  console.log(`  - Avec departement='29': ${finistere29}`);

  const { count: finistereNom } = await supabase
    .from('etablissements')
    .select('*', { count: 'exact', head: true })
    .ilike('departement', '%finistère%');
  console.log(`  - Avec departement contient 'finistère': ${finistereNom}`);

  const { count: cotes22 } = await supabase
    .from('etablissements')
    .select('*', { count: 'exact', head: true })
    .eq('departement', '22');
  console.log(`  - Avec departement='22': ${cotes22}`);

  const { count: cotesNom } = await supabase
    .from('etablissements')
    .select('*', { count: 'exact', head: true })
    .ilike('departement', '%côtes%');
  console.log(`  - Avec departement contient 'côtes': ${cotesNom}`);

  // 3. Exemples d'établissements
  console.log('\n📄 Exemples (5 premiers):');
  const { data: examples } = await supabase
    .from('etablissements')
    .select('*')
    .limit(5);

  if (examples) {
    examples.forEach((e, i) => {
      console.log(`\n  ${i + 1}. ${e.nom || '[SANS NOM]'}`);
      console.log(`     Commune: ${e.commune || '?'}`);
      console.log(`     Département: ${e.departement || e.code_postal?.substring(0, 2) || '?'}`);
      console.log(`     Statut ouverture: ${e.statut_ouverture || 'N/A'}`);
      console.log(`     Coords: ${e.latitude ? 'Oui' : 'Non'}`);
    });
  }
}

diagnostic().catch(console.error);
