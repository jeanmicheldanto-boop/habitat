const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function fixOssunGestionnaire() {
  console.log('🔧 Correction du gestionnaire pour l\'établissement Ossun\n');
  
  const etabId = 'b2d16a3e-8221-49a7-9441-1d3b2d1dc3d3';
  
  // 1. Récupérer l'établissement
  const { data: etab, error: etabError } = await supabase
    .from('etablissements')
    .select('id, nom, gestionnaire')
    .eq('id', etabId)
    .single();
  
  if (etabError || !etab) {
    console.error('❌ Établissement non trouvé:', etabError);
    return;
  }
  
  console.log('📋 Établissement actuel:');
  console.log('  - Nom:', etab.nom);
  console.log('  - Gestionnaire:', etab.gestionnaire || 'NULL');
  
  // 2. Récupérer le created_by de la proposition
  const { data: prop, error: propError } = await supabase
    .from('propositions')
    .select('id, created_by')
    .eq('etablissement_id', etabId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (propError || !prop) {
    console.error('❌ Proposition non trouvée:', propError);
    return;
  }
  
  console.log('\n📝 Proposition:');
  console.log('  - ID:', prop.id);
  console.log('  - Created by:', prop.created_by);
  
  // 3. Mettre à jour l'établissement avec le gestionnaire
  if (prop.created_by && !etab.gestionnaire) {
    console.log('\n🔄 Mise à jour du gestionnaire...');
    
    const { error: updateError } = await supabase
      .from('etablissements')
      .update({ gestionnaire: prop.created_by })
      .eq('id', etabId);
    
    if (updateError) {
      console.error('❌ Erreur mise à jour:', updateError);
    } else {
      console.log('✅ Gestionnaire mis à jour avec succès!');
      
      // Vérifier le résultat
      const { data: updated } = await supabase
        .from('etablissements')
        .select('id, nom, gestionnaire')
        .eq('id', etabId)
        .single();
      
      console.log('\n📊 Établissement mis à jour:');
      console.log('  - Nom:', updated.nom);
      console.log('  - Gestionnaire:', updated.gestionnaire);
    }
  } else if (etab.gestionnaire) {
    console.log('\n✅ Le gestionnaire est déjà défini, pas besoin de mise à jour');
  } else {
    console.log('\n⚠️ Impossible de déterminer le gestionnaire');
  }
  
  console.log('\n✅ Correction terminée');
}

fixOssunGestionnaire()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
