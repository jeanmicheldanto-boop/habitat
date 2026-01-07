const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSpecificProposition() {
  const propId = '21fdbf30-1236-4e80-af75-c80a1856f3ca';
  
  const { data, error } = await supabase
    .from('propositions')
    .select('*')
    .eq('id', propId)
    .single();

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log('📋 Proposition trouvée:\n');
  console.log(JSON.stringify(data, null, 2));
  
  console.log('\n🔍 Détails payload:');
  console.log(`Nom: ${data.payload?.nom}`);
  console.log(`Sous-catégories: ${JSON.stringify(data.payload?.sous_categories)}`);
  console.log(`Image: ${data.payload?.image_path}`);
}

checkSpecificProposition().catch(console.error);
