const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkTestEtab() {
  // Chercher "test" dans les noms récents
  const { data } = await supabase
    .from('v_liste_publication_geoloc')
    .select('*')
    .ilike('nom', '%test%')
    .order('etab_id', { ascending: false })
    .limit(5);
  
  console.log('🔍 Établissements de test récents:');
  data?.forEach(etab => {
    console.log(`\nID: ${etab.etab_id}`);
    console.log(`Nom: ${etab.nom}`);
    console.log(`Sous-catégories: ${JSON.stringify(etab.sous_categories)}`);
    console.log(`Image: ${etab.image_path}`);
  });
}

checkTestEtab().catch(console.error);
