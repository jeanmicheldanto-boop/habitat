const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

/**
 * Script pour synchroniser la table sous_categories avec habitatTaxonomy.ts
 * Résout définitivement les problèmes de normalisation
 */

// Table sous_categories a: id, categorie_id, libelle, alias, slug
const SOUS_CATEGORIES_TAXONOMY = [
  // RÉSIDENCE
  { cle: 'residence_autonomie', label: 'Résidence autonomie', slug: 'residence-autonomie' },
  { cle: 'residence_services_seniors', label: 'Résidence services seniors', slug: 'residence-services-seniors' },
  { cle: 'marpa', label: 'MARPA', slug: 'marpa' },
  
  // HABITAT PARTAGÉ
  { cle: 'colocation_avec_services', label: 'Colocation avec services', slug: 'colocation-avec-services' },
  { cle: 'habitat_intergenerationnel', label: 'Habitat intergénérationnel', slug: 'habitat-intergenerationnel' },
  { cle: 'habitat_inclusif', label: 'Habitat inclusif', slug: 'habitat-inclusif' },
  { cle: 'habitat_alternatif', label: 'Habitat alternatif', slug: 'habitat-alternatif' },
  { cle: 'accueil_familial', label: 'Accueil familial', slug: 'accueil-familial' },
  { cle: 'maison_accueil_familial', label: 'Maison d\'accueil familial', slug: 'maison-accueil-familial' },
  
  // LOGEMENT INDÉPENDANT
  { cle: 'beguinage', label: 'Béguinage', slug: 'beguinage' },
  { cle: 'village_seniors', label: 'Village seniors', slug: 'village-seniors' },
  { cle: 'logement_adapte', label: 'Logement adapté', slug: 'logement-adapte' },
  { cle: 'habitat_regroupe', label: 'Habitat regroupé', slug: 'habitat-regroupe' }
];

async function syncSousCategories() {
  console.log('🔄 Synchronisation des sous-catégories avec habitatTaxonomy.ts\n');
  
  // 1. Récupérer les sous-catégories existantes
  console.log('1️⃣ Récupération des sous-catégories existantes...');
  const { data: existingSc } = await supabase
    .from('sous_categories')
    .select('id, libelle, slug');
  
  console.log(`   ${existingSc?.length || 0} sous-catégories dans la base`);
  
  // Créer un map des sous-catégories existantes par clé (libelle)
  const existingMap = new Map(
    (existingSc || []).map(sc => [sc.libelle, sc])
  );
  
  // 2. Mettre à jour ou créer chaque sous-catégorie
  console.log('\n2️⃣ Mise à jour/création des sous-catégories...');
  
  for (const sc of SOUS_CATEGORIES_TAXONOMY) {
    const existing = existingMap.get(sc.cle);
    
    if (existing) {
      // Mise à jour du slug et alias
      const { error } = await supabase
        .from('sous_categories')
        .update({
          slug: sc.slug,
          alias: sc.label  // Le label humain va dans alias
        })
        .eq('id', existing.id);
      
      if (error) {
        console.error(`   ❌ Erreur mise à jour ${sc.cle}:`, error);
      } else {
        console.log(`   ✅ Mis à jour: ${sc.cle} (${sc.label})`);
      }
    } else {
      // Création
      const { error } = await supabase
        .from('sous_categories')
        .insert([{
          libelle: sc.cle,  // Important: on utilise la clé comme libellé !
          slug: sc.slug,
          alias: sc.label   // Le label humain va dans alias
        }]);
      
      if (error) {
        console.error(`   ❌ Erreur création ${sc.cle}:`, error);
      } else {
        console.log(`   ✅ Créé: ${sc.cle} (${sc.label})`);
      }
    }
  }
  
  // 3. Vérifier les sous-catégories obsolètes
  console.log('\n3️⃣ Vérification des sous-catégories obsolètes...');
  const currentKeys = new Set(SOUS_CATEGORIES_TAXONOMY.map(sc => sc.cle));
  const obsoletes = (existingSc || []).filter(sc => !currentKeys.has(sc.libelle));
  
  if (obsoletes.length > 0) {
    console.log(`   ⚠️ ${obsoletes.length} sous-catégorie(s) obsolète(s):`);
    obsoletes.forEach(sc => {
      console.log(`      - ${sc.libelle} (${sc.id})`);
    });
    console.log('   💡 Ces sous-catégories ne sont plus dans habitatTaxonomy.ts');
  } else {
    console.log('   ✅ Aucune sous-catégorie obsolète');
  }
  
  // 4. Afficher le mapping final
  console.log('\n4️⃣ Mapping final (clé frontend → UUID):');
  const { data: finalSc } = await supabase
    .from('sous_categories')
    .select('id, libelle, slug, alias')
    .order('libelle');
  
  if (finalSc) {
    console.log('\n   📋 Table sous_categories:');
    finalSc.forEach(sc => {
      const isInTaxonomy = currentKeys.has(sc.libelle);
      const symbol = isInTaxonomy ? '✅' : '⚠️';
      const displayLabel = sc.alias || sc.libelle;
      console.log(`   ${symbol} ${sc.libelle.padEnd(35)} → ${sc.id.substring(0, 8)}... (${displayLabel})`);
    });
  }
  
  console.log('\n✅ Synchronisation terminée !');
  console.log('\n💡 Le champ `libelle` contient les clés exactes du frontend');
  console.log('   (ex: "beguinage" au lieu de "Béguinage")');
  console.log('   Le champ `alias` contient le label humain pour l\'affichage.');
}

syncSousCategories()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
