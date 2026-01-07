const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkProposition() {
  // Chercher les propositions récentes approuvées
  const { data } = await supabase
    .from('propositions')
    .select('*')
    .eq('statut', 'approuve')
    .order('created_at', { ascending: false })
    .limit(3);
  
  console.log('📋 Dernières propositions approuvées:\n');
  data?.forEach(prop => {
    console.log(`ID: ${prop.id}`);
    console.log(`Nom: ${prop.payload?.nom || 'N/A'}`);
    console.log(`Sous-catégories dans payload: ${JSON.stringify(prop.payload?.sous_categories)}`);
    console.log(`Créé: ${prop.created_at}`);
    console.log('---\n');
  });
}

checkProposition().catch(console.error);
