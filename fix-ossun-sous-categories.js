const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function fixOssunSousCategories() {
  console.log('🔧 Correction des sous-catégories pour l\'établissement Ossun\n');
  
  // 1. Trouver l'établissement Ossun
  const { data: etab, error: etabError } = await supabase
    .from('etablissements')
    .select('id, nom, commune, habitat_type')
    .ilike('commune', '%ossun%')
    .single();
  
  if (etabError || !etab) {
    console.error('❌ Établissement Ossun non trouvé:', etabError);
    return;
  }
  
  console.log('✅ Établissement trouvé:');
  console.log('  - ID:', etab.id);
  console.log('  - Nom:', etab.nom);
  console.log('  - Commune:', etab.commune);
  console.log('  - Habitat type:', etab.habitat_type);
  
  // 2. Vérifier les sous-catégories actuelles
  const { data: currentSc, error: scError } = await supabase
    .from('etablissement_sous_categorie')
    .select('sous_categorie_id, sous_categories(libelle)')
    .eq('etablissement_id', etab.id);
  
  console.log('\n📋 Sous-catégories actuellement liées:', currentSc?.length || 0);
  if (currentSc && currentSc.length > 0) {
    currentSc.forEach(sc => {
      console.log(`  - ${sc.sous_categories.libelle}`);
    });
  }
  
  // 3. Récupérer la proposition d'origine pour voir ce qui était demandé
  const { data: prop } = await supabase
    .from('propositions')
    .select('id, payload')
    .eq('etablissement_id', etab.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (prop) {
    console.log('\n📝 Proposition d\'origine:');
    console.log('  - Sous-catégories demandées:', prop.payload?.sous_categories);
    
    // 4. Si la proposition contenait "habitat_intergenerationnel", le corriger
    if (prop.payload?.sous_categories?.includes('habitat_intergenerationnel')) {
      console.log('\n🔧 Correction nécessaire: ajout de la sous-catégorie "Habitat intergénérationnel"');
      
      // Trouver l'UUID de la sous-catégorie "Habitat intergénérationnel" dans la base
      const { data: scIntergen } = await supabase
        .from('sous_categories')
        .select('id, libelle')
        .ilike('libelle', '%intergénérationnel%')
        .limit(1)
        .single();
      
      if (scIntergen) {
        console.log(`  - Sous-catégorie trouvée: "${scIntergen.libelle}" (${scIntergen.id})`);
        
        // Vérifier si le lien existe déjà
        const { data: existingLink } = await supabase
          .from('etablissement_sous_categorie')
          .select('id')
          .eq('etablissement_id', etab.id)
          .eq('sous_categorie_id', scIntergen.id)
          .maybeSingle();
        
        if (existingLink) {
          console.log('  ✅ Le lien existe déjà, pas besoin de correction');
        } else {
          // Créer le lien
          const { error: insertError } = await supabase
            .from('etablissement_sous_categorie')
            .insert([{
              etablissement_id: etab.id,
              sous_categorie_id: scIntergen.id
            }]);
          
          if (insertError) {
            console.error('  ❌ Erreur lors de la création du lien:', insertError);
          } else {
            console.log('  ✅ Lien créé avec succès!');
          }
        }
      } else {
        console.log('  ⚠️ Sous-catégorie "Habitat intergénérationnel" non trouvée en base');
      }
    }
  }
  
  // 5. Vérifier le résultat final
  console.log('\n📊 Vérification finale:');
  const { data: finalSc } = await supabase
    .from('etablissement_sous_categorie')
    .select('sous_categorie_id, sous_categories(libelle)')
    .eq('etablissement_id', etab.id);
  
  console.log(`  - Nombre de sous-catégories: ${finalSc?.length || 0}`);
  if (finalSc && finalSc.length > 0) {
    finalSc.forEach(sc => {
      console.log(`    • ${sc.sous_categories.libelle}`);
    });
  }
  
  console.log('\n✅ Correction terminée!');
}

fixOssunSousCategories()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
