const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://minwoumfgutampcgrcbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbndvdW1mZ3V0YW1wY2dyY2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODczNzkwNywiZXhwIjoyMDc0MzEzOTA3fQ.mbgtSNOMqYrAnOnvyUsUb3ru9GRwdjb0ZetbCSoDbwA'
);

async function getPropositionDetails() {
  // ID de la proposition problématique
  const propositionId = '97dd51d8-c3f3-4e98-957f-42e901183e53';

  const { data: prop, error } = await supabase
    .from('propositions')
    .select('*')
    .eq('id', propositionId)
    .single();

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  if (!prop) {
    console.log('❌ Proposition non trouvée');
    return;
  }

  console.log('📋 Détails complets de la proposition "maison habitat intermediaire ossun":\n');
  console.log('ID:', prop.id);
  console.log('Statut:', prop.statut);
  console.log('Créée le:', new Date(prop.created_at).toLocaleString('fr-FR'));
  console.log('\n📦 PAYLOAD COMPLET:\n');
  console.log(JSON.stringify(prop.payload, null, 2));

  const payload = prop.payload;
  
  console.log('\n\n🔍 ANALYSE DES CHAMPS D\'ADRESSE:\n');
  console.log('adresse:', payload.adresse || '❌ NON DÉFINI');
  console.log('adresse_l1:', payload.adresse_l1 || '❌ NON DÉFINI');
  console.log('ville:', payload.ville || '❌ NON DÉFINI');
  console.log('commune:', payload.commune || '❌ NON DÉFINI');
  console.log('code_postal:', payload.code_postal || '❌ NON DÉFINI');
  console.log('departement:', payload.departement || '❌ NON DÉFINI');
  
  console.log('\n📍 GÉOLOCALISATION:\n');
  console.log('latitude:', payload.latitude || '❌ NON DÉFINI');
  console.log('longitude:', payload.longitude || '❌ NON DÉFINI');
  
  console.log('\n🏠 AUTRES INFOS:\n');
  console.log('nom:', payload.nom || '❌ NON DÉFINI');
  console.log('habitat_type:', payload.habitat_type || '❌ NON DÉFINI');
  console.log('sous_categories:', payload.sous_categories || '❌ NON DÉFINI');
  console.log('gestionnaire:', payload.gestionnaire || '❌ NON DÉFINI');
}

getPropositionDetails().catch(console.error);
