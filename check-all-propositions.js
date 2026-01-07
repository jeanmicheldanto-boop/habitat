const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkAllPropositions() {
  // TOUTES les propositions sans filtre
  const { data, error } = await supabase
    .from('propositions')
    .select('id, created_at, statut, action, type_cible, source, payload')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log(`📋 Total propositions trouvées: ${data?.length || 0}\n`);
  
  data?.forEach((prop, index) => {
    console.log(`${index + 1}. ${prop.payload?.nom || 'Sans nom'}`);
    console.log(`   Statut: ${prop.statut}`);
    console.log(`   Source: ${prop.source}`);
    console.log(`   Type: ${prop.type_cible}`);
    console.log(`   Créé: ${prop.created_at}`);
    console.log('');
  });
}

checkAllPropositions().catch(console.error);
