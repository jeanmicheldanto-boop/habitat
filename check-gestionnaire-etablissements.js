const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function checkGestionnaireEtablissements() {
  console.log('\n🔍 VÉRIFICATION ÉTABLISSEMENTS GESTIONNAIRE\n');
  console.log('='.repeat(80));
  
  // 1. Lister tous les établissements publiés
  console.log('\n📋 Tous les établissements publiés:');
  const { data: allEtabs } = await supabase
    .from('etablissements')
    .select('id, nom, gestionnaire, statut_editorial')
    .eq('statut_editorial', 'publie')
    .order('created_at', { ascending: false });
  
  if (allEtabs) {
    console.log(`   ${allEtabs.length} établissement(s) publié(s):`);
    allEtabs.forEach(e => {
      console.log(`      - ${e.nom} (gestionnaire: "${e.gestionnaire || 'NULL'}")`);
    });
  }
  
  // 2. Vérifier le profil gestionnaire "Danto"
  console.log('\n\n👤 Recherche profil gestionnaire "Danto":');
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, organisation, role, email')
    .eq('role', 'gestionnaire');
  
  if (profiles) {
    console.log(`   ${profiles.length} profil(s) gestionnaire trouvé(s):`);
    profiles.forEach(p => {
      console.log(`      - ${p.email}: organisation="${p.organisation || 'NULL'}"`);
    });
  }
  
  // 3. Vérifier quels établissements correspondent à "Danto"
  console.log('\n\n🔗 Établissements avec gestionnaire "Danto":');
  const { data: dantoEtabs } = await supabase
    .from('etablissements')
    .select('id, nom, gestionnaire, statut_editorial')
    .eq('gestionnaire', 'Danto');
  
  if (dantoEtabs && dantoEtabs.length > 0) {
    console.log(`   ✅ ${dantoEtabs.length} établissement(s) trouvé(s):`);
    dantoEtabs.forEach(e => {
      console.log(`      - ${e.nom} (${e.statut_editorial})`);
    });
  } else {
    console.log('   ❌ Aucun établissement avec gestionnaire="Danto"');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n💡 DIAGNOSTIC:');
  console.log('   Le dashboard filtre probablement sur created_by (UUID utilisateur)');
  console.log('   au lieu de filtrer sur etablissements.gestionnaire (TEXT).');
  console.log('\n   SOLUTION: Modifier le dashboard pour filtrer sur le champ gestionnaire');
  console.log('   en utilisant profiles.organisation de l\'utilisateur connecté.');
}

checkGestionnaireEtablissements().catch(console.error);
