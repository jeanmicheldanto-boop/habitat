const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function checkPropositionDetails() {
  const { data: prop } = await supabase
    .from('propositions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!prop) {
    console.log('Aucune proposition trouvée');
    return;
  }

  const payload = prop.payload;

  console.log('📋 Détails de la dernière proposition:\n');
  console.log('ID:', prop.id);
  console.log('Nom:', payload.nom);
  console.log('Créée:', new Date(prop.created_at).toLocaleString('fr-FR'));
  console.log('\n🏷️ TYPE D\'HABITAT:');
  console.log('   habitat_type:', payload.habitat_type);
  console.log('\n🏷️ SOUS-CATÉGORIES:');
  console.log('   Type:', Array.isArray(payload.sous_categories) ? 'Array' : typeof payload.sous_categories);
  console.log('   Contenu:', JSON.stringify(payload.sous_categories, null, 2));
  
  if (Array.isArray(payload.sous_categories)) {
    console.log('\n   Liste:');
    payload.sous_categories.forEach((sc, i) => {
      console.log(`   [${i}] "${sc}"`);
    });
  }

  console.log('\n📦 PAYLOAD COMPLET:');
  console.log(JSON.stringify(payload, null, 2));
}

checkPropositionDetails().catch(console.error);
