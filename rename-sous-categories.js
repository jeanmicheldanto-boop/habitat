const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

/**
 * Mise à jour simple: Renommer les libellés existants pour qu'ils correspondent aux clés du frontend
 */

// Mapping: Libellé actuel (humain) → Clé frontend
const RENAME_MAP = {
  'Résidence autonomie': 'residence_autonomie',
  'Résidence services seniors': 'residence_services_seniors',
  'MARPA': 'marpa',
  
  'Colocation avec services': 'colocation_avec_services',
  'Habitat intergénérationnel': 'habitat_intergenerationnel',
  'habitat intergénérationnel': 'habitat_intergenerationnel',  // variante avec minuscule
  'Habitat inclusif': 'habitat_inclusif',
  'Habitat alternatif': 'habitat_alternatif',
  'Accueil familial': 'accueil_familial',
  'Maison d\'accueil familial': 'maison_accueil_familial',
  
  'Béguinage': 'beguinage',
  'Village seniors': 'village_seniors',
  'Logement adapté': 'logement_adapte',
  'Habitat regroupé': 'habitat_regroupe'
};

async function renameSousCategories() {
  console.log('🔄 Renommage des sous-catégories pour utiliser les clés du frontend\n');
  
  // Récupérer toutes les sous-catégories
  const { data: allSc } = await supabase
    .from('sous_categories')
    .select('id, libelle, slug, alias');
  
  console.log(`📋 ${allSc?.length || 0} sous-catégories trouvées\n`);
  
  let updated = 0;
  let skipped = 0;
  
  for (const sc of allSc || []) {
    const newLibelle = RENAME_MAP[sc.libelle];
    
    if (newLibelle) {
      // Mise à jour: libelle devient la clé, alias conserve le label humain
      const { error } = await supabase
        .from('sous_categories')
        .update({
          libelle: newLibelle,
          alias: sc.libelle  // Conserver l'ancien libellé comme alias
        })
        .eq('id', sc.id);
      
      if (error) {
        console.error(`❌ Erreur: ${sc.libelle} →  ${newLibelle}:`, error.message);
      } else {
        console.log(`✅ ${sc.libelle.padEnd(35)} → ${newLibelle}`);
        updated++;
      }
    } else {
      console.log(`⏭️  Ignoré: ${sc.libelle} (pas dans le mapping)`);
      skipped++;
    }
  }
  
  console.log(`\n📊 Résumé:`);
  console.log(`   ✅ ${updated} sous-catégories mises à jour`);
  console.log(`   ⏭️  ${skipped} sous-catégories ignorées`);
  
  // Afficher le résultat final
  console.log('\n📋 État final de la table:');
  const { data: finalSc } = await supabase
    .from('sous_categories')
    .select('id, libelle, slug, alias')
    .order('libelle');
  
  if (finalSc) {
    finalSc.forEach(sc => {
      const hasUnderscore = sc.libelle.includes('_');
      const symbol = hasUnderscore ? '✅' : '⚠️';
      console.log(`   ${symbol} ${sc.libelle.padEnd(40)} (${sc.alias || 'pas d\'alias'})`);
    });
  }
  
  console.log('\n✅ Terminé !');
  console.log('\n💡 Maintenant le champ `libelle` contient les clés du frontend (ex: "beguinage")');
  console.log('   Et le champ `alias` contient les labels humains (ex: "Béguinage")');
}

renameSousCategories()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
