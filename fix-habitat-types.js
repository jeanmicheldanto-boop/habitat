const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://saqujdywlbhgnuwsrzrk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhcXVqZHl3bGJoZ251d3NyenJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxMjQzNDQsImV4cCI6MjA1MjcwMDM0NH0.fD6DucUNq6GkT2T0OyI2y9aHfGrqz7OPzKkQXPKKq5k' // anon key
);

// Mapping selon habitatTaxonomy.ts
const SOUS_CAT_TO_HABITAT_TYPE = {
  // Résidence
  'Résidence autonomie': 'residence',
  'Résidence services seniors': 'residence',
  'MARPA': 'residence',
  
  // Habitat partagé
  'Colocation avec services': 'habitat_partage',
  'Habitat intergénérationnel': 'habitat_partage',
  'Habitat inclusif': 'habitat_partage',
  'Habitat alternatif': 'habitat_partage',
  'Accueil familial': 'habitat_partage',
  'Maison d\'accueil familial': 'habitat_partage',
  
  // Logement indépendant
  'Béguinage': 'logement_independant',
  'Village seniors': 'logement_independant',
  'Logement adapté': 'logement_independant',
  'Habitat regroupé': 'logement_independant'
};

async function fixHabitatTypes() {
  console.log('🔍 Recherche des incohérences habitat_type...\n');
  
  // 1. Récupérer tous les établissements publiés
  const { data: etablissements, error: etabError } = await supabase
    .from('etablissements')
    .select('id, nom, habitat_type')
    .eq('statut_editorial', 'publie');
  
  if (etabError) {
    console.error('❌ Erreur récupération établissements:', etabError);
    return;
  }
  
  console.log(`📋 ${etablissements.length} établissements trouvés\n`);
  
  const incoherences = [];
  
  // 2. Pour chaque établissement, vérifier ses sous-catégories
  for (const etab of etablissements) {
    const { data: scLinks } = await supabase
      .from('etablissement_sous_categorie')
      .select(`
        sous_categorie_id,
        sous_categories (
          libelle
        )
      `)
      .eq('etablissement_id', etab.id);
    
    if (!scLinks || scLinks.length === 0) continue;
    
    // Déterminer le habitat_type correct basé sur la première sous-catégorie
    const sousCategories = scLinks.map(link => link.sous_categories.libelle);
    const premiereSc = sousCategories[0];
    const habitatTypeCorrect = SOUS_CAT_TO_HABITAT_TYPE[premiereSc];
    
    if (habitatTypeCorrect && etab.habitat_type !== habitatTypeCorrect) {
      incoherences.push({
        id: etab.id,
        nom: etab.nom,
        habitat_type_actuel: etab.habitat_type,
        habitat_type_correct: habitatTypeCorrect,
        sous_categories: sousCategories
      });
    }
  }
  
  console.log(`⚠️  ${incoherences.length} incohérences détectées:\n`);
  incoherences.forEach(inc => {
    console.log(`  📍 ${inc.nom}`);
    console.log(`     Actuel: ${inc.habitat_type_actuel}`);
    console.log(`     Correct: ${inc.habitat_type_correct}`);
    console.log(`     Sous-catégories: ${inc.sous_categories.join(', ')}`);
    console.log('');
  });
  
  // 3. Demander confirmation avant de corriger
  console.log('\n💡 Pour corriger ces incohérences, exécutez ce script avec l\'argument "fix"');
  console.log('   Exemple: node fix-habitat-types.js fix\n');
  
  if (process.argv[2] === 'fix') {
    console.log('🔧 Application des corrections...\n');
    
    for (const inc of incoherences) {
      const { error: updateError } = await supabase
        .from('etablissements')
        .update({ habitat_type: inc.habitat_type_correct })
        .eq('id', inc.id);
      
      if (updateError) {
        console.error(`  ❌ Erreur mise à jour ${inc.nom}:`, updateError);
      } else {
        console.log(`  ✅ ${inc.nom}: ${inc.habitat_type_actuel} → ${inc.habitat_type_correct}`);
      }
    }
    
    console.log('\n✅ Corrections terminées !');
  }
}

fixHabitatTypes()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
