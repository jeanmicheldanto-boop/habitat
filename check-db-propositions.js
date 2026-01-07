const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

// Utiliser la service_role key pour bypasser RLS
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAllPropositionsInDB() {
  const { data, error } = await supabase
    .from('propositions')
    .select('id, created_at, statut, action, type_cible, payload')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log(`📊 Total propositions trouvées: ${data?.length || 0}\n`);
  
  const parStatut = {};
  data?.forEach(prop => {
    parStatut[prop.statut] = (parStatut[prop.statut] || 0) + 1;
  });

  console.log('Répartition par statut:');
  Object.entries(parStatut).forEach(([statut, count]) => {
    console.log(`  ${statut}: ${count}`);
  });

  console.log('\n📋 Liste détaillée:\n');
  data?.forEach((prop, index) => {
    console.log(`${index + 1}. ${prop.payload?.nom || 'Sans nom'}`);
    console.log(`   ID: ${prop.id}`);
    console.log(`   Statut: ${prop.statut}`);
    console.log(`   Type: ${prop.type_cible} - ${prop.action}`);
    console.log(`   Créé: ${prop.created_at}`);
    console.log('');
  });
}

checkAllPropositionsInDB().catch(console.error);
